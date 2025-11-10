// src/Research/SocraticCoach.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { translateUI } from '../utils/translateUI';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
/**
 * SocraticCoach – real AI-backed Socratic chat (Claude/backend).
 */
const DEFAULT_TITLE = "Hi! I'm your Socratic Coach ✋";

export default function SocraticCoach({
  anonId,
  situation,
  question,
  analysisText,
  onComplete,
  title = DEFAULT_TITLE,
  disabled = false,
  startImmediately = true,
}) {
  // ---- language / RTL ----
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const dir = lang === 'he' ? 'rtl' : 'ltr';
const { theme } = useContext(ThemeContext) || { theme: 'light' };
 const isDark = theme === 'dark';
  // ---- i18n (בלי עברית בקוד) ----
  const SOURCE = {
    title: "Hi! I'm your Socratic Coach ✋",
    missingAnonId: 'Missing anonId',
    initFailed: 'Init failed',
    initError: 'Init error',
    sendFailed: 'Send failed',
    sendError: 'Send error',
    finalizeError: 'Failed to finalize conversation',
    aiSummaryFailed: 'AI summary failed',
    inputPlaceholder: 'Type your reply…',
    send: 'Send',
    finish: 'Finish',
    processing: 'Processing…',
    hintBeforeFinish:
      'The "Continue to Validated Questionnaire" button will enable after you click "Finish".',
  };

  const [T, setT] = useState(SOURCE);
  const t = (k) => T[k] ?? k;

  useEffect(() => {
    let cancelled = false;
    async function loadT() {
      if (lang === 'he') {
        try {
          const keys = Object.keys(SOURCE);
          const vals = Object.values(SOURCE);
          const tr = await translateUI({
            sourceLang: 'EN',
            targetLang: 'HE',
            texts: vals,
          });
          if (!cancelled) {
            const map = {};
            keys.forEach((k, i) => (map[k] = tr[i]));
            setT(map);
          }
        } catch {
          if (!cancelled) setT(SOURCE);
        }
      } else {
        setT(SOURCE);
      }
    }
    loadT();
    return () => { cancelled = true; };
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- state ----
  // message shape: { role: 'assistant'|'user', text: string, ts: string(ISO) }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [finished, setFinished] = useState(false);

  // two separate loading states
  const [chatLoading, setChatLoading] = useState(false); // init/send only
  const [finishing, setFinishing] = useState(false);     // building summary + navigate

  const [error, setError] = useState('');
  const listRef = useRef(null);
  const navigate = useNavigate();

  // guard to prevent double init
  const startedRef = useRef({ ran: false, anonId: null });

  // auto scroll to bottom
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, chatLoading]);

  const canType = useMemo(
    () => !finished && !disabled && !chatLoading && !finishing,
    [finished, disabled, chatLoading, finishing]
  );
  const canSend = useMemo(() => canType && input.trim().length > 0, [canType, input]);

  const fmtTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const TypingDots = ({ align = 'left' }) => (
    <div className={align === 'left' ? 'text-left' : 'text-right'}>
<span className={`inline-flex items-center gap-1 px-4 py-3 rounded-2xl shadow-sm
  ${isDark ? 'bg-slate-700' : 'bg-gradient-to-r from-slate-100 to-slate-50'}`}>
  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-300' : 'bg-slate-400'} animate-bounce`} style={{ animationDelay: '0ms' }} />
  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-300' : 'bg-slate-400'} animate-bounce`} style={{ animationDelay: '150ms' }} />
  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-300' : 'bg-slate-400'} animate-bounce`} style={{ animationDelay: '300ms' }} />
</span>

    </div>
  );

  // ---- init (first AI turn) ----
  async function start() {
    if (startedRef.current.ran && startedRef.current.anonId === anonId) return;
    startedRef.current = { ran: true, anonId };

    try {
      if (!anonId) {
        setError(t('missingAnonId'));
        return;
      }
      setError('');
      setChatLoading(true);

      const res = await fetch('/api/trial/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId,
          init: true,
          situation,
          question,
          analysisText,
          maxTokens: 300,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || t('initFailed'));

      const reply = (data?.reply || '').toString();
      if (reply) {
        setMessages([{ role: 'assistant', text: reply, ts: new Date().toISOString() }]);
      }
    } catch (e) {
      setError(e.message || t('initError'));
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    if (startImmediately && anonId) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anonId, startImmediately, situation, question, analysisText]);

  // ---- send user turn ----
  async function send() {
    const text = input.trim();
    if (!text || !canType) return;

    const nowIso = new Date().toISOString();

    try {
      setError('');
      setChatLoading(true);
      setMessages((prev) => [...prev, { role: 'user', text, ts: nowIso }]);
      setInput('');

      const res = await fetch('/api/trial/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId,
          userText: text,
          maxTokens: 300,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || t('sendFailed'));

      const reply = (data?.reply || '').toString();
      if (reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: reply, ts: new Date().toISOString() }]);
      }
    } catch (e) {
      setError(e.message || t('sendError'));
    } finally {
      setChatLoading(false);
    }
  }

  // ---- finish ----
  async function finish() {
    if (finished || finishing) return;
    try {
      setError('');
      setFinished(true);
      setFinishing(true); // shows spinner on button

      if (!anonId) throw new Error(t('missingAnonId'));

      // Build & save summary on server (AI) — server returns summaryText
      const resp = await fetch('/api/trial/summary/final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonId, maxTokens: 600 })
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) throw new Error(data?.error || t('aiSummaryFailed'));

      const summaryText = (data.summaryText || '').toString();

      // Navigate only after ready — pass it via state
      navigate('/simulation/final-summary', {
        state: { anonId, summaryText, from: 'coach-finish' }
      });
    } catch (e) {
      setFinished(false);
      setFinishing(false);
      setError(e.message || t('finalizeError'));
    }
  }

  // כותרת: אם זה הטקסט הדיפולטי—נשתמש בתרגום; אחרת נשאיר כמו שהועבר בפרופס
  const shownTitle = title === DEFAULT_TITLE ? t('title') : title;

  return (
<div
  className={`rounded-3xl p-6 md:p-7 shadow-lg border
    ${isDark
      ? 'border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-100'
      : 'border-slate-200 bg-gradient-to-br from-white to-slate-50 text-slate-800'}
  `}
  dir={dir}
>

<div className={`flex items-center gap-3 mb-5 ${dir === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-md">
          ✋
        </div>
        <h3
  className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
>
  {shownTitle.replace(' ✋', '')}
</h3>

      </div>

      {error && (
        <div className="mb-4 text-sm rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 text-red-800 shadow-sm" aria-live="polite">
          <div className={`flex items-start gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* chat area */}
      <div
        ref={listRef}
        className={`h-80 overflow-y-auto space-y-3 mb-4 rounded-2xl p-4 shadow-inner border
  ${isDark
    ? 'border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 text-slate-100'
    : 'border-slate-200 bg-gradient-to-b from-white to-slate-50/50 text-slate-800'
  }`}

        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <div key={i} className={isUser ? 'text-right' : 'text-left'}>
              <div className={`inline-flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <span
                  className={`inline-block px-4 py-3 rounded-2xl leading-relaxed whitespace-pre-wrap break-words shadow-sm transition-all hover:shadow-md ${
isUser
  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
  : (isDark
      ? 'bg-slate-700 text-slate-100 border border-slate-600'
      : 'bg-gradient-to-br from-slate-100 to-slate-50 text-slate-800 border border-slate-200')

                  }`}
                >
                  {m.text}
                </span>
                <span className={`mt-1.5 text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
  {fmtTime(m.ts)}
</span>

              </div>
            </div>
          );
        })}

        {/* typing dots only during chat loading (not while finishing) */}
        {chatLoading && !finishing && <TypingDots align="left" />}
      </div>

      {/* input row */}
      <div className={`flex gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <input
className={`flex-1 rounded-xl px-4 py-3 transition-all focus:outline-none
  ${isDark
    ? 'bg-slate-800 text-slate-100 placeholder-slate-400 border-2 border-slate-600 focus:border-blue-400 focus:ring-4 focus:ring-blue-900/40'
    : 'bg-white text-slate-800 placeholder-slate-400 border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'}
  ${finishing ? 'cursor-wait opacity-70' : 'shadow-sm'}`}
          placeholder={t('inputPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!canType}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (canSend) send();
            }
          }}
        />
        <button
          onClick={send}
          disabled={!canSend}
          className="px-5 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          {t('send')}
        </button>

        {/* Finish button with spinner */}
        <button
          onClick={finish}
          disabled={finished || finishing}
          aria-busy={finishing ? 'true' : 'false'}
          className={`min-w-32 px-5 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 ${finishing ? 'cursor-wait opacity-90' : 'transform hover:scale-105 active:scale-95'}`}
        >
          {finishing ? (
            <>
              {/* circular spinner */}
              <svg
                className="w-5 h-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a 8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                />
              </svg>
              <span>{t('processing')}</span>
            </>
          ) : (
            t('finish')
          )}
        </button>
      </div>

      {!finished && (
        <div className={`mt-4 flex items-start gap-2 text-xs rounded-xl px-4 py-3 border
  ${isDark
    ? 'text-slate-300 bg-slate-800 border-slate-700'
    : 'text-slate-600 bg-blue-50 border-blue-100'}`}>

          <span className="text-sm">💡</span>
          <p>{t('hintBeforeFinish')}</p>
        </div>
      )}
    </div>
  );
}
