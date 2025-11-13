// src/Research/MetaInfoCard.jsx
import React from 'react';

export default function MetaInfoCard({ anonId, hasSocratic, isDark, isRTL, navigate, t }) {
  return (
    <div className={`rounded-3xl shadow-2xl overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' 
        : 'bg-white border border-slate-200'
    }`}>
      <div className={`h-2 ${
        isDark 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
          : 'bg-gradient-to-r from-purple-400 to-pink-400'
      }`} />
      
      <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className={`flex items-center justify-between mb-8 ${isRTL ? '' : 'flex-row-reverse'}`}>
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('metaTitle')}
          </h3>
          <span className="flex-shrink-0 text-xs font-bold rounded-full px-3 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            ✓ {t('ready')}
          </span>
        </div>

        <div className="space-y-5">
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className={`text-xs font-semibold mb-2 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('meta_anon')}
            </div>
            <code
              dir="ltr"
              className={`block ${isDark ? 'bg-slate-900 text-blue-400' : 'bg-white text-blue-600'} rounded-xl px-4 py-3 text-sm font-mono font-bold border-2 ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              } text-center`}
            >
              {anonId}
            </code>
          </div>

          <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className={`text-xs font-semibold mb-2 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('meta_phase')}
            </div>
            <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'} ${
              isRTL ? 'text-right' : 'text-left'
            }`}>
              {t('meta_phase_post')}
            </div>
          </div>

          <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className={`text-xs font-semibold mb-3 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('notes')}
            </div>
            <p className={`text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            } ${isRTL ? 'text-right' : 'text-left'}`}>
              {hasSocratic ? t('meta_notes_exp') : t('meta_notes_ctrl')}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className={`w-full mt-8 px-6 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 ${
            isDark
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
          }`}
        >
          {t('exit')}
        </button>
      </div>
    </div>
  );
}