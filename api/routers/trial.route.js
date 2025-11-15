// C:\Users\n0502\OneDrive\שולחן העבודה\final_project-main\final_project-main\api\routers\trial.route.js
const express = require('express');
const router = express.Router();
const Trial = require('../models/Trial');
const Scenario = require('../models/Scenario'); // ⭐ NEW: נטען את מודל הסנריו
const claudeService = require('../services/claudeService');
const { analyzeStudentResponse } = require('../services/studentAnalysisService');

// כמה תוים מקס' לצירוף JSON גולמי להקשר (∞ = לצרף הכל)
const MAX_JSON_CHARS = Number.POSITIVE_INFINITY;

// ========= Utilities =========
function toNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}
function toString(s) {
  return (s ?? '').toString();
}
function toStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(toString).filter(Boolean);
}
function safeSlice(str, n) {
  try { return (str || '').toString().slice(0, n); } catch { return ''; }
}
function keysLen(obj) {
  return (obj && typeof obj === 'object') ? Object.keys(obj).length : 0;
}

// ========= REST: סימולציה =========

// 🚀 התחלת סימולציה: עדכון startedAt
router.patch('/trial/start', async (req, res) => {
  try {
    const { anonId } = req.body;
    if (!anonId) return res.status(400).json({ error: 'anonId_required' });

    const updated = await Trial.findOneAndUpdate(
      { anonId },
      { startedAt: new Date() },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'trial_not_found' });

    console.log('[TRIAL/START] anonId=', anonId, 'startedAt=', updated.startedAt);
    res.json({ ok: true, startedAt: updated.startedAt });
  } catch (err) {
    console.error('[TRIAL/START] error:', err);
    res.status(500).json({ error: 'start_failed', details: err.message });
  }
});
router.patch('/trial/finish', async (req, res) => {
  try {
    const { anonId, answers = [] } = req.body || {};
    if (!anonId) return res.status(400).json({ ok: false, error: 'anonId_required' });

    const trial = await Trial.findOne({ anonId });
    if (!trial) return res.status(404).json({ ok: false, error: 'trial_not_found' });

    // נרמל תשובות (מחרוזות trimmed)
    const newAnswers = Array.isArray(answers) ? answers.map(a => (a ?? '').toString().trim()) : [];
    const oldAnswers = Array.isArray(trial.answers) ? trial.answers.map(a => (a ?? '').toString().trim()) : [];

    // נבדוק שינוי אמיתי (אורך או תוכן)
    const changed =
      newAnswers.length !== oldAnswers.length ||
      newAnswers.some((a, i) => a !== (oldAnswers[i] ?? ''));

    const update = {
      answers: newAnswers,
      endedAt: new Date(),
    };

    if (changed) {
      // איפוס צ'אט וסיכומים כי הוגש פתרון חדש
      update.chatLog = [];
      update.aiConversationSummary = '';
      update.aiRecommendations = [];
      update.chatStats = undefined; // יוסר ב-$unset כדי לנקות בבסיס הנתונים
    }

    // בניה דינמית של $set / $unset
    const $set = update;
    const $unset = changed ? { chatStats: '' } : undefined;

    await Trial.updateOne({ anonId }, { $set, ...( $unset ? { $unset } : {} ) });

    return res.json({ ok: true, changed });
  } catch (err) {
    console.error('finish error', err);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// 🔼 הגשת תשובה + יצירת ניתוח ושמירה ל-DB
router.post('/submit-answer', async (req, res) => {
  console.log('>>> TRIAL /submit-answer HIT', req.body.anonId);
  try {
    const { anonId, situation, question, answerText } = req.body;

    if (!anonId || !answerText) {
      return res.status(400).json({ message: 'Missing anonId or answerText.' });
    }

    const trial = await Trial.findOne({ anonId });
    if (!trial) {
      return res.status(404).json({ message: 'Trial not found.' });
    }

    const analysisResult = await analyzeStudentResponse({
      situation,
      question,
      studentResponse: answerText,
      studentName: `Anonymous-${anonId.slice(-4)}`
    });

    trial.answers.push(answerText);
    trial.aiAnalysisJson = analysisResult;
    trial.aiAnalysis = analysisResult?.fullText || '';
    trial.endedAt = new Date();

    await trial.save();

    console.log('[SUBMIT-ANSWER] anonId=', anonId,
      'answer.len=', answerText.length,
      'analysis.keys=', keysLen(analysisResult));

    res.status(200).json({
      message: 'Answer submitted successfully (anonymous)',
      analysisResult
    });

  } catch (error) {
    console.error('❌ [SUBMIT-ANSWER] error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// שליפת המסמך העדכני ללקוח
router.get('/latest/:anonId', async (req, res) => {
  try {
    const { anonId } = req.params;
    const doc = await Trial.findOne({ anonId }).lean();
    if (!doc) return res.status(404).json({ message: 'trial_not_found' });
    return res.json(doc);
  } catch (e) {
    console.error('[LATEST] error:', e);
    return res.status(500).json({ message: 'server_error' });
  }
});

// ===================== Socratic Helpers =====================

// תקציר ידידותי של ה-JSON מהניתוח (ללא קיצורים)
function summarizeAnalysis(analysisJson = {}) {
  try {
    const strengths  = analysisJson.strengths || analysisJson.topStrengths || analysisJson.observedStrengths || [];
    const weaknesses = analysisJson.weaknesses || analysisJson.topWeaknesses || [];
    const risks      = analysisJson.risks || analysisJson.redFlags || [];
    const recs       = analysisJson.recommendations || analysisJson.tips || analysisJson.areasForImprovement || [];

    const lines = [];
    if (Array.isArray(strengths)   && strengths.length)   lines.push(`Strengths: ${strengths.join(', ')}`);
    if (Array.isArray(weaknesses)  && weaknesses.length)  lines.push(`Red flags / Weaknesses: ${(risks.concat(weaknesses)).join(', ')}`);
    else if (Array.isArray(risks)  && risks.length)       lines.push(`Red flags: ${risks.join(', ')}`);
    if (Array.isArray(recs)        && recs.length)        lines.push(`Suggestions: ${recs.join(', ')}`);

    // דוח CASEL מלא אם יש (בלי חיתוך feedback)
    const casel = [];
    const d = analysisJson;
    const add = (key, label) => {
      if (d && d[key] && typeof d[key] === 'object') {
        const fb = (d[key].feedback ?? 'no feedback').toString();
        casel.push(`${label}: score=${d[key].score ?? 'NA'}; ${fb}`);
      }
    };
    add('selfAwareness',            'SA');
    add('selfManagement',           'SM');
    add('socialAwareness',          'SO');
    add('relationshipSkills',       'RS');
    add('responsibleDecisionMaking','RD');
    if (casel.length) lines.unshift(casel.join(' | '));

    // גיבוי: אם אין שורות – ניקח תקציר חופשי בלי חיתוך
    if (!lines.length && typeof analysisJson.fullText === 'string') {
      lines.push(`Summary: ${analysisJson.fullText}`);
    } else if (!lines.length && typeof analysisJson.summary === 'string') {
      lines.push(`Summary: ${analysisJson.summary}`);
    }

    return lines.join('\n');
  } catch (e) {
    return 'No analysis available';
  }
}

// ⭐ NEW: בניית הקשר מלא לשיחה הסוקרטית — מעדיפים Scenario מה-DB לפי trial.scenarioId
function buildSocraticContext({
  trial,
  scenarioText,     // ⭐ יתקבל מה-Scenario (או מהבקשה אם נשלח)
  reflectionArr     // ⭐ יתקבל מה-Scenario (או מהבקשה אם נשלח)
}) {
  const ctx = [];

  const sit = (scenarioText || '').toString().trim();
  const reflectionJoined = Array.isArray(reflectionArr) ? reflectionArr.join(' ') : (reflectionArr || '').toString();
  const q = reflectionJoined.trim();

  if (sit) ctx.push(`Situation: ${sit}`);
  if (q)   ctx.push(`Reflection question(s): ${q}`);

  const lastAns = ((trial?.answers || []).slice(-1)[0] || '').toString().trim();
  if (lastAns) ctx.push(`Student response: ${lastAns}`);

  const json = trial?.aiAnalysisJson || {};
  const summary = summarizeAnalysis(json);
  if (summary) ctx.push(`Analysis summary:\n${summary}`);

  // לצרף גם JSON מלא? (תלוי MAX_JSON_CHARS)
  if (MAX_JSON_CHARS > 0) {
    const jsonSnippet = safeSlice(JSON.stringify(json, null, 2), MAX_JSON_CHARS);
    if (jsonSnippet) ctx.push(`Analysis (structured JSON):\n${jsonSnippet}`);
  }

  return ctx.join('\n');
}
function buildSystemPromptSocratic() {
  return [
    "🧠 Identity and Role",
    "You are Casely — a Socratic SEL Coach for university students, as part of a research system studying Social-Emotional Learning (SEL).",
    "Your goal is to conduct a short reflective dialogue with the student after they have already completed one simulation and received an AI analysis (Analysis) of their response.",
    "",
    "🎓 Research Context",
    "- You are part of an academic experiment examining how a short Socratic conversation after a single simulation can help students better understand their emotions, decisions, and social relationships.",
    "- You do not judge or grade the student — your role is to help them think deeper and articulate insights about their answer.",
    "- Use only the information provided: the scenario description, reflection question, the student’s answer, and the analysis summary.",
    "- Do not invent new situations or add information beyond what was provided.",
    "",
    "💬 Conversation Style",
    "- Ask only one question at a time, short and clear (no lists or multiple questions).",
    "- Do not give advice or direct answers — encourage independent reflection.",
    "- Maintain a warm, calm, and non-judgmental tone.",
    "- Match the student’s language (Hebrew or English).",
    "- Encourage the student to explore their feelings, thoughts, and values behind their response.",
    "- You may subtly address one or more of the five CASEL competencies — self-awareness, self-management, social awareness, relationship skills, responsible decision-making — but without naming them explicitly. Use natural conversational cues instead.",
    "",
    "🧩 If the student says 'I don’t know'",
    "Do not pressure them. Gently narrow the focus with small, empathetic questions such as:",
    "- “What do you think was most challenging about this situation?”",
    "- “What made you respond that way, even instinctively?”",
    "- “How would you want someone else to feel in your place?”",
    "",
    "🚀 Opening, Flow, and Closing",
    "- Opening: Start with one short question based on a single insight from the analysis summary. Example: “It seems you found it hard to choose how to respond. What do you think made that difficult?”",
    "- During the conversation: Keep a natural back-and-forth rhythm — one thoughtful question per student reply.",
    "- Conversation length: Maintain a smooth flow. After about 8–10 total messages, or if the student asks to stop, gently request permission to close the chat.",
    "- Closing: Thank the student for sharing and end with one brief reflective question, such as: “What is one thing you learned about yourself from this situation?”",
    "",
    "🖋️ Format",
    "- Return only one question per message, with no system notes, technical phrasing, or introductions like 'As a coach…'.",
    "- Do not use emojis, unless the student used one first.",
    "- Keep the tone natural, human, and conversational — like a mentor who truly listens."
  ].join("\n");
}



// מיפוי היסטוריית צ'אט מה-DB לפורמט הודעות
function mapChatLogToMessages(chatLog = []) {
  return (chatLog || []).map(m => ({
    role: m.sender === 'student' ? 'user' : 'assistant',
    content: (m.text || '').toString()
  }));
}

// ===================== Socratic Chat API =====================

/**
 * POST /trial/chat/send
 * body: { anonId, userText?, init?, situation?, question?, maxTokens? }
 *
 * - init=true: פתיחת שיחה עם שאלה קצרה ראשונה.
 * - אחרת: מוסיף תשובת סטודנט (אם יש), ומבקש מהמודל שאלה קצרה נוספת.
 * - תמיד משתמשים ב-DB.aiAnalysisJson להקשר; את הסנריו/רפלקציה נטען אוטומטית לפי scenarioId.
 */
router.post('/trial/chat/send', async (req, res) => {
  try {
    const {
      anonId,
      userText = '',
      init = false,
      situation, // אם בכל זאת נשלח מהקליינט – ניתן עדיפות אליו
      question,  // אם נשלח כמחרוזת/מערך – ניתן עדיפות אליו
      maxTokens = 4000, // ↑ ברירת מחדל גבוהה לתשובה ללא מגבלה מעשית
    } = req.body || {};

    if (!anonId) return res.status(400).json({ error: 'anonId_required' });

    const trial = await Trial.findOne({ anonId });
    if (!trial) return res.status(404).json({ error: 'trial_not_found' });

    // ⭐ NEW: נטען את ה-Scenario לפי trial.scenarioId (אלא אם הקליינט שלח override במפורש)
    let scenarioDoc = null;
    let scenarioText = '';
    let reflectionArr = [];

    if (situation) {
      scenarioText = situation.toString();
    }
    if (question) {
      reflectionArr = Array.isArray(question) ? question.map(toString) : [toString(question)];
    }

    if (!scenarioText || reflectionArr.length === 0) {
      // נטען מה-DB רק אם חסר לנו משהו
      if (trial.scenarioId) {
        scenarioDoc = await Scenario.findOne({ scenarioId: trial.scenarioId }).lean();
        if (scenarioDoc) {
          if (!scenarioText)   scenarioText   = scenarioDoc.text || '';
          if (reflectionArr.length === 0) reflectionArr = Array.isArray(scenarioDoc.reflection) ? scenarioDoc.reflection : [];
        } else {
          console.warn('[SOCRATIC] Scenario not found for scenarioId=', trial.scenarioId);
        }
      }
    }

    // בונים הקשר מלא
    const context = buildSocraticContext({ trial, scenarioText, reflectionArr });

    // היסטוריה קיימת (מלאה)
    const history = mapChatLogToMessages(trial.chatLog);

    // פרומפט מערכת
    const systemPrompt = buildSystemPromptSocratic();

    // הודעות לשיגור אל המודל
    const messages = [];

    // --- DEBUG: מה בדיוק נשלח ל-AI ---
    const analysisSummaryPreview = summarizeAnalysis(trial?.aiAnalysisJson || {});
    console.log('=== [SOCRATIC DEBUG] ===');
    console.log('anonId:', anonId);
    console.log('init:', !!init);
    console.log('groupType/group/scenarioId:', trial.groupType, trial.group, trial.scenarioId);
    console.log('scenario loaded from:', situation ? 'CLIENT.situation' : (scenarioDoc ? 'DB.Scenario' : 'TRIAL/none'));
    console.log('reflection loaded from:', question ? 'CLIENT.question' : (scenarioDoc ? 'DB.Scenario' : 'TRIAL/none'));
    console.log('scenarioText (preview):', safeSlice(scenarioText, 200));
    console.log('reflection (count):', Array.isArray(reflectionArr) ? reflectionArr.length : 0);
    console.log('reflection (preview):', safeSlice((Array.isArray(reflectionArr) ? reflectionArr.join(' | ') : ''), 200));
    console.log('last student answer:', safeSlice(((trial?.answers || []).slice(-1)[0] || ''), 300));
    console.log('analysis source: DB.aiAnalysisJson');
    console.log('analysis json keys:', keysLen(trial?.aiAnalysisJson || {}));
    console.log('analysis summary preview:', safeSlice(analysisSummaryPreview, 400));
    if (MAX_JSON_CHARS > 0) {
      console.log('analysis json (trimmed) length:', safeSlice(JSON.stringify(trial?.aiAnalysisJson || {}), MAX_JSON_CHARS).length, '/', MAX_JSON_CHARS);
    } else {
      console.log('analysis json (raw) not attached (MAX_JSON_CHARS=0).');
    }
    console.log('history length:', Array.isArray(history) ? history.length : 0);
    console.log('system prompt snippet:', safeSlice(systemPrompt, 200));
    console.log('messages count BEFORE send:', messages.length);
    console.log('maxTokens:', maxTokens);
    console.log('========================');

    if (init || history.length === 0) {
      messages.push({
        role: 'user',
        content: `CONTEXT:\n${context}\n\nOpen with ONE brief Socratic question that references one key insight from the analysis.`
      });
    } else {
      messages.push(
        { role: 'user', content: `CONTEXT:\n${context}\n\nContinue the Socratic conversation. Ask only ONE short question now.` },
        ...history
      );
      if (userText.trim()) {
        messages.push({ role: 'user', content: userText.trim() });
      }
    }

    // קריאה לשירות ה-AI במבנה הנכון
    const result = await claudeService.chat(messages, {
      system: systemPrompt,
      maxTokens
    });

    if (!result?.success) {
      console.error('[SOCRATIC SEND] ai failed:', result?.error);
      return res.status(500).json({ error: 'socratic_send_failed_ai' });
    }

    const assistantReply =
      result?.data?.content?.[0]?.text?.toString().trim() ||
      result?.data?.output_text?.toString().trim() || '…';

    // עדכון chatLog ב-DB
    const now = new Date();

    if (!init && userText.trim()) {
      trial.chatLog.push({ sender: 'student', text: userText.trim(), timestamp: now });
    }
    trial.chatLog.push({ sender: 'ai', text: assistantReply, timestamp: now });

    // עדכון סטטיסטיקות בסיסיות
    const stats = trial.chatStats || {};
    stats.turns = (stats.turns || 0) + 1;
    stats.studentTurns = (stats.studentTurns || 0) + (userText.trim() ? 1 : 0);
    stats.aiTurns = (stats.aiTurns || 0) + 1;
    if (trial.startedAt) {
      stats.durationSec = Math.max(0, Math.round((now - trial.startedAt) / 1000));
    }
    trial.chatStats = stats;

    await trial.save();

    console.log('[SOCRATIC SEND] ok | reply.len=', (assistantReply || '').length,
      '| turns=', stats.turns, 'studentTurns=', stats.studentTurns, 'aiTurns=', stats.aiTurns);

    res.json({
      ok: true,
      reply: assistantReply,
      chatLog: trial.chatLog, // ← כל ההיסטוריה ללא חיתוך
      stats
    });
  } catch (err) {
    console.error('[SOCRATIC SEND] error:', err);
    res.status(500).json({ error: 'socratic_send_failed', details: err.message });
  }
});
// ========= Final Summary Utilities =========
function renderChatTranscript(chatLog = []) {
  try {
    if (!Array.isArray(chatLog) || chatLog.length === 0) return 'No Socratic chat took place.';
    // תעתיק קריא (חותך הודעות מאוד ארוכות למניעת טוקנים אינסופיים)
    const MAX_MSG = 1200;
    const lines = chatLog.map((m, i) => {
      const who = m.sender === 'student' ? 'Student' : 'Casely';
      const ts  = m.timestamp ? new Date(m.timestamp).toISOString() : '';
      const txt = (m.text || '').toString();
      const body = txt.length > MAX_MSG ? (txt.slice(0, MAX_MSG) + ' …') : txt;
      return `[${i+1}] ${who} @ ${ts}\n${body}`;
    });
    return lines.join('\n\n');
  } catch {
    return 'Transcript unavailable.';
  }
}

function buildFinalSummaryContext({ trial, scenarioText, reflectionArr }) {
  const base = buildSocraticContext({ trial, scenarioText, reflectionArr }); // כבר מכיל: Situation, Reflection, Student response, Analysis summary + JSON
  const transcript = renderChatTranscript(trial?.chatLog || []);
  const meta = [
    `Group: ${trial?.groupType || '?'} (${trial?.group || '?'})`,
    `ScenarioId: ${trial?.scenarioId || '?'}`,
    `StartedAt: ${trial?.startedAt ? new Date(trial.startedAt).toISOString() : 'N/A'}`,
    `EndedAt: ${trial?.endedAt ? new Date(trial.endedAt).toISOString() : 'N/A'}`,
    `Turns: ${trial?.chatStats?.turns ?? 0} (student=${trial?.chatStats?.studentTurns ?? 0}, ai=${trial?.chatStats?.aiTurns ?? 0})`
  ].join(' | ');

  return [
    base,
    '',
    '--- Conversation Transcript (Socratic Chat) ---',
    transcript,
    '',
    '--- Meta ---',
    meta,
  ].join('\n');
}

function buildFinalSummarySystemPrompt() {
  return [
    'You are Casely, a Socratic SEL coach. Produce a FINAL REPORT for the student, based strictly on the provided context.',
    'The report must be concise, human, warm, and research-appropriate (no grading, no moralizing).',
    '',
    'OUTPUT FORMAT (JSON):',
    '{',
    '  "studentSummary": "2–4 short paragraphs summarizing the student’s overall experience (simulation + reflection + chat) in the student’s language (Hebrew/English). No technical tokens.",',
    '  "topStrengths": ["..."],',
    '  "growthAreas": ["..."],',
    '  "actionableTips": ["..."],',
    '  "closingMessage": "A single friendly thank-you and a short reflection nudge (1–2 sentences).",',
    '  "language": "he|en"',
    '}',
    '',
    'REQUIREMENTS:',
    '- Do NOT invent facts. Use only scenario/answer/analysis/transcript.',
    '- Keep tips concrete and doable in daily student life.',
    '- Respect the student’s tone and language.',
  ].join('\n');
}

// ✅ FINAL SUMMARY (atomic update to avoid VersionError)// ✅ FINAL SUMMARY – one natural English paragraph (atomic update)
router.post('/trial/summary/final', async (req, res) => {
  try {
    const { anonId, maxTokens = 400 } = req.body || {};
    if (!anonId) return res.status(400).json({ ok: false, error: 'anonId_required' });

    // 1) Load trial
    const trial = await Trial.findOne({ anonId });
    if (!trial) return res.status(404).json({ ok: false, error: 'trial_not_found' });

    // 2) Load scenario (for context)
    const scen = trial.scenarioId
      ? await Scenario.findOne({ scenarioId: trial.scenarioId }).lean()
      : null;

    // 3) Build concise context (situation + reflection + last answer + brief analysis + transcript header)
    const context = buildSocraticContext({
      trial,
      scenarioText: scen?.text || '',
      reflectionArr: Array.isArray(scen?.reflection) ? scen.reflection : []
    });

    const transcript = (trial.chatLog || [])
      .map((m, i) =>
        `[${i + 1}] ${m.sender === 'ai' ? 'Casely' : 'Student'} @ ${
          new Date(m.timestamp || Date.now()).toISOString()
        }\n${m.text}`
      )
      .join('\n\n');

    // 4) Prompts – request ONE paragraph in English, no lists/headings/tokens, end with a short thank-you.
const systemMsg = [
  'You are Casely, a Socratic SEL coach talking directly to the student.',
  "Write ONE short paragraph in the SAME language as the student's last response (detect it from the provided context: if there is Hebrew in the student's answer, write fully in Hebrew; otherwise write fully in English).",  'Summarize their experience from the simulation, reflection, and chat in a warm, supportive, and personal tone.',
  'Avoid grading, labeling, or describing them in third person.',
  'Do not use lists, bullets, or headings.',
  'End with a brief thank-you or reflective encouragement like "Thank you for your openness today."'
].join(' ');


    const userMsg =
      [
        'CONTEXT (use only what is here):',
        context,
        '',
        '--- Conversation Transcript (Socratic Chat) ---',
        transcript || '(no chat)'
      ].join('\n');

    // 5) Call AI
    const ai = await claudeService.chat(
      [{ role: 'user', content: userMsg }],
      { system: systemMsg, maxTokens }
    );
    if (!ai?.success) {
      console.error('[FINAL SUMMARY] ai failed:', ai?.error);
      return res.status(500).json({ ok: false, error: 'ai_call_failed' });
    }

    const summaryText =
      ai?.data?.content?.[0]?.text?.toString().trim() ||
      ai?.data?.output_text?.toString().trim() ||
      '';

    if (!summaryText) {
      return res.status(500).json({ ok: false, error: 'final_summary_empty' });
    }

    // 6) Atomic update – avoid VersionError
    await Trial.updateOne(
      { _id: trial._id },
      {
        $set: {
          aiConversationSummary: summaryText,
          // we no longer store structured tips; clear it if exists
          aiRecommendations: [],
          updatedAt: new Date(),
        },
      }
    );

    // 7) Return plain text summary
    return res.json({ ok: true, summaryText });
  } catch (err) {
    console.error('[FINAL SUMMARY] error:', err);
    return res.status(500).json({ ok: false, error: 'final_summary_failed', details: err.message });
  }
});



// GET /trial/summary/:anonId  – שליפת הסיכום השמור (אם יש)
router.get('/trial/summary/:anonId', async (req, res) => {
  try {
    const { anonId } = req.params;
    const t = await Trial.findOne({ anonId }).lean();
    if (!t) return res.status(404).json({ error: 'trial_not_found' });
    return res.json({
      ok: true,
      anonId,
      aiConversationSummary: t.aiConversationSummary || '',
      aiRecommendations: Array.isArray(t.aiRecommendations) ? t.aiRecommendations : [],
      chatStats: t.chatStats || null,
      endedAt: t.endedAt
    });
  } catch (err) {
    console.error('[GET FINAL SUMMARY] error:', err);
    return res.status(500).json({ error: 'get_final_summary_failed', details: err.message });
  }
});
// GET /trial/:anonId – מחזיר רק מידע מינימלי על הקבוצה
router.get('/trial/:anonId', async (req, res) => {
  try {
    const { anonId } = req.params;
    const t = await Trial.findOne({ anonId }, { group: 1, groupType: 1, _id: 0 }).lean();
    if (!t) return res.status(404).json({ error: 'trial_not_found' });
    return res.json({ ok: true, group: t.group || '', groupType: t.groupType || '' });
  } catch (err) {
    console.error('[GET TRIAL GROUP] error:', err);
    return res.status(500).json({ error: 'server_error' });
  }
});
// api/routers/trial.route.js
// api/routers/trial.route.js
router.patch('/trial/final-reflection', async (req, res) => {
  try {
    const { anonId, insight, usefulness } = req.body;
    if (!anonId || !insight?.trim() || !usefulness?.trim()) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    // 1) Find
    const trial = await Trial.findOne({ anonId });
    if (!trial) return res.status(404).json({ error: 'trial_not_found' });

    // 2) Set fields
    trial.finalReflection = {
      insight: insight.trim(),
      usefulness: usefulness.trim(),
      submittedAt: new Date()
    };

    // 3) Only set endedAt if empty
    if (!trial.endedAt) {
      trial.endedAt = new Date();
    }

    // 4) Save
    await trial.save();
    return res.json({ ok: true });
  } catch (e) {
    console.error('[FINAL-REFLECTION] error:', e);
    return res.status(500).json({ error: 'server_error', details: e.message });
  }
});


module.exports = router;
