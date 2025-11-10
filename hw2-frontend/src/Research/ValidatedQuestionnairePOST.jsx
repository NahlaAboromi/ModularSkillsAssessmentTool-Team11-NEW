// src/Research/ValidatedQuestionnairePOST.jsx
import React, { useContext } from 'react';
import { ThemeProvider, ThemeContext } from '../DarkLightMood/ThemeContext';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import AssessmentContainer from './assessment/AssessmentContainer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';

function ValidatedQuestionnaireContent() {
  const location = useLocation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { student } = (typeof useStudent === 'function' ? useStudent() : {}) || {};
  const anonId = student?.anonId || null;
const phase = (location.state?.phase) || 'post';
  // ✅ בודק קבוצה ומנווט בהתאם
  const handleFinish = async () => {
    try {
      // אפשר לקבל group מה־state בעתיד; אם לא — ננסה להביא מהשרת
      let group = (student?.group || '').toString().toUpperCase();

      if (!group && anonId) {
        const r = await fetch(`/api/trial/${anonId}`);
        if (r.ok) {
          const t = await r.json();
          group = (t?.group || '').toString().toUpperCase();
        }
      }

      // 🔀 ניווט: A/B/C → דף חוות דעת; D → דף תודה
      try { localStorage.setItem('lastAssessmentPhase', 'post'); } catch {}

      if (group && group !== 'D') {
        navigate('/reflection-end', { state: { anonId, group } });
      } else {
        navigate('/thanks', { state: { anonId, group: group || 'D' } });
      }
    } catch {
      // fallback בטוח
      navigate('/thanks', { state: { anonId } });
    }
  };

  return (
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <section className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'} max-w-6xl mx-auto`}>
            <AssessmentContainer
              phase={phase} 
              skipAssign
              onFinish={handleFinish}  
            />
          </div>
        </section>
      </main>

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function ValidatedQuestionnaire() {
  return (
    <ThemeProvider>
      <ValidatedQuestionnaireContent />
    </ThemeProvider>
  );
}
