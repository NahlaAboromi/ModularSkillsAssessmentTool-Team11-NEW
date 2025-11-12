// src/AI/AIChat.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n';

const AIChat = ({ teacherId }) => {
  const [showBox, setShowBox] = useState(false);
  const [input, setInput] = useState('');
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

 // שפה וכיוון (עם fallback ל-<html lang> למקרה של השהיית Context)
 const ctx = useContext(LanguageContext) || {};
 const lang = ctx.lang ?? (document.documentElement.lang === 'he' ? 'he' : 'en');
 const isRTL = lang === 'he';
 const { t, ready } = useI18n('aiChat'); // i18n לפי השפה

  const chatRef = useRef(null);
  const greetingRef = useRef(''); // נשמור כאן את ה-greeting האחרון שיצרנו
  const [messages, setMessages] = useState([]); // ⬅️ מתחילים ריק, נייצר greeting כשצריך
  const [loading, setLoading] = useState(false);

  const toggleChatBox = () => setShowBox(v => !v);

  const closeChat = () => {
    setShowBox(false);
    setMessages([]); // ⬅️ נסגור ריק כדי שבפתיחה הבאה ניצור greeting לפי השפה הנוכחית
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  // כשפותחים את הצ'אט או כשהמילון מוכן – נייצר greeting אם עדיין אין הודעות
// greeting תמיד תואם לשפה בעת פתיחה/החלפה, בלי למחוק היסטוריה
useEffect(() => {
  if (!showBox || !ready) return;

  const newG = t('greeting');
  const oldG = greetingRef.current;

  setMessages(prev => {
    if (prev.length === 0) {
      // פתיחה ראשונה: צור הודעת ברירת מחדל בשפה הנוכחית
      return [{ role: 'ai', content: newG }];
    }
    // אם ההודעה הראשונה היא ה-greeting הישן (או היתה כבר greeting), החלף רק אותה
    if (prev[0]?.role === 'ai' && (prev[0].content === oldG || prev[0].content === newG)) {
      return [{ role: 'ai', content: newG }, ...prev.slice(1)];
    }
    // אם כבר יש שיחה אמיתית — אל תשנה כלום
    return prev;
  });

  greetingRef.current = newG;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [showBox, lang, ready, t]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/claude/chat-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          messages: newMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        })
      });

      const data = await res.json().catch(() => ({}));
      const aiReply = data?.success ? data.response : t('fallback');
      setMessages([...newMessages, { role: 'ai', content: aiReply }]);
    } catch {
      setMessages([...newMessages, { role: 'ai', content: t('errGeneric') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .dot{width:6px;height:6px;margin-inline-end:4px;background-color:currentColor;border-radius:50%;display:inline-block;animation:jump 1.4s infinite ease-in-out both;}
        .dot1{animation-delay:-0.32s;}
        .dot2{animation-delay:-0.16s;}
        .dot3{animation-delay:0;}
        @keyframes jump{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}
      `}</style>

      {/* כפתור צף לפתיחה/סגירה */}
      <button
        onClick={toggleChatBox}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        title={t('tooltip')}
        aria-label={t('tooltip')}
      >
        💬
      </button>

      {/* תיבת צ'אט */}
      {showBox && (
        <div
          key={lang}                           
          dir={isRTL ? 'rtl' : 'ltr'}
          lang={lang}
          className={`fixed bottom-24 right-6 w-96 max-h-[80vh] flex flex-col border rounded-lg shadow-lg z-50 ${
            isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'
          }`}
        >
          {/* כותרת */}
          <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <h4 className="text-lg font-semibold">{t('title')}</h4>
            <button
              onClick={closeChat}
              className={`text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                isDark ? 'text-pink-400 hover:text-pink-500 bg-slate-700 hover:bg-slate-600'
                       : 'text-red-500 hover:text-red-600 bg-white hover:bg-gray-100'
              }`}
              aria-label="close"
            >
              &times;
            </button>
          </div>

          {/* הודעות – כל הודעה בשורה מלאה */}
          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  lang={lang}
                >
                  <div
                    className={[
                      'p-2 rounded-md text-sm whitespace-pre-wrap max-w-[85%]',
                      isUser
                        ? 'bg-blue-600 text-white'
                        : (isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'),
                      isRTL ? 'text-right' : 'text-left'
                    ].join(' ')}
                  >
                    <strong><bdi>{isUser ? t('labelYou') : t('labelAI')}:</bdi></strong>{' '}
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="w-full flex justify-start" dir={isRTL ? 'rtl' : 'ltr'} lang={lang}>
                <div className={[
                  'p-2 rounded-md text-sm max-w-[85%] inline-flex items-center gap-1',
                  isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800',
                  isRTL ? 'text-right' : 'text-left'
                ].join(' ')}>
                  <strong><bdi>{t('labelAI')}:</bdi></strong>
                  <div className="flex ms-2">
                    <span className="dot dot1" />
                    <span className="dot dot2" />
                    <span className="dot dot3" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* קלט+שליחה */}
          <div className={`flex items-center p-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('placeholder')}
              className={`flex-1 border rounded p-2 text-sm me-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              lang={lang}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t('asking') : t('ask')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
