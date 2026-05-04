import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import './index.css';

// ─── Page Components ──────────────────────────────────────────
import InvigilatorLogin  from './components/InvigilatorLogin';
import StudentLogin      from './components/StudentLogin';
import Instructions      from './components/Instructions';
import StudentDashboard  from './components/StudentDashboard';
import ExamEngine        from './components/ExamEngine';
import Results           from './components/Results';
import Background3D      from './components/Background3D';
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [step, setStep]                   = useState('invigilator-login');
  const [token, setToken]                 = useState(null);
  const [studentName, setStudentName]     = useState('');
  const [questions, setQuestions]         = useState([]);
  const [answers, setAnswers]             = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft]           = useState(1500);
  const [selectedExamId, setSelectedExamId]   = useState(null);
  const [examTerminated, setExamTerminated]   = useState(false);
  const [examReport, setExamReport]       = useState(null);
  const [availableExams, setAvailableExams]   = useState([]);

  const answersRef      = useRef(answers);
  const terminatedRef   = useRef(false);
  const stepRef         = useRef(step);
  useEffect(() => { answersRef.current    = answers;   }, [answers]);
  useEffect(() => { terminatedRef.current = examTerminated; }, [examTerminated]);
  useEffect(() => { stepRef.current       = step;      }, [step]);

  useEffect(() => {
    if (step === 'exam') {
      document.body.classList.add('exam-active');
    } else {
      document.body.classList.remove('exam-active');
    }
    return () => document.body.classList.remove('exam-active');
  }, [step]);

  useEffect(() => {
    if (step === 'student-dashboard' && token) {
      fetch(`${API_URL}/available_exams`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setAvailableExams).catch(console.error);
    }
  }, [step, token]);

  const submitExam = useCallback(async (currentAnswers) => {
    if (!token) { setStep('results'); return; }
    try {
      const res  = await fetch(`${API_URL}/submit_exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ exam_id: selectedExamId || 1, answers: currentAnswers }),
      });
      const data = await res.json();
      if (res.ok) setExamReport(data);
    } catch (err) {
      console.error('Submission error', err);
    } finally {
      setStep('results');
    }
  }, [token, selectedExamId]);

  const terminateExam = useCallback(async (reason) => {
    if (terminatedRef.current) return;
    setExamTerminated(true);
    terminatedRef.current = true;
    if (token) {
      try {
        await fetch(`${API_URL}/log_tab_switch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ exam_id: selectedExamId || 1, details: reason }),
        });
      } catch (_) {}
    }
    setTimeout(() => submitExam(answersRef.current), 1200);
  }, [token, selectedExamId, submitExam]);

  useEffect(() => {
    if (step !== 'exam') return;

    const onVisibility    = () => { if (document.hidden) terminateExam('Tab switched or window minimized'); };
    const onBlur          = () => terminateExam('Window focus lost (Alt+Tab / OS switch)');
    const onFullscreen    = () => { if (!document.fullscreenElement) terminateExam('Exited fullscreen mode'); };
    const onKeydown       = (e) => {
      if (e.metaKey || e.key === 'Meta' || e.key === 'OS') terminateExam('Meta/Windows key pressed');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('keydown', onKeydown);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('keydown', onKeydown);
    };
  }, [step, terminateExam]);

  useEffect(() => {
    if (step !== 'exam' || examTerminated) return;
    if (timeLeft <= 0) { submitExam(answersRef.current); return; }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timeLeft, examTerminated, submitExam]);

  const handleStartExam = ({ questions: qs, examId, durationSeconds }) => {
    setQuestions(qs);
    setAnswers(Array(qs.length).fill(null));
    setCurrentQuestion(0);
    setSelectedExamId(examId);
    setTimeLeft(durationSeconds);
    setExamTerminated(false);
    terminatedRef.current = false;
    setStep('exam');
  };

  const handleLogout = () => window.location.reload();

  // BgGlow replaced by Background3D

  return (
    <div style={{ minHeight: '100vh', paddingBottom: step === 'exam' ? 0 : 80 }}>
      <Background3D isExamActive={step === 'exam'} />
      <AnimatePresence mode="wait">
        {step === 'invigilator-login' && (
          <InvigilatorLogin
            key="invigilator"
            onUnlocked={() => setStep('student-login')}
          />
        )}
        {step === 'student-login' && (
          <StudentLogin
            key="student-login"
            onVerified={({ token: t, name }) => {
              setToken(t);
              setStudentName(name);
              setStep('instructions');
            }}
            onBack={() => setStep('invigilator-login')}
          />
        )}
        {step === 'instructions' && (
          <Instructions
            key="instructions"
            studentName={studentName}
            onProceed={() => setStep('student-dashboard')}
          />
        )}
        {step === 'student-dashboard' && (
          <StudentDashboard
            key="student-dashboard"
            token={token}
            availableExams={availableExams}
            onStartExam={handleStartExam}
          />
        )}
        {step === 'exam' && (
          <ExamEngine
            key="exam"
            questions={questions}
            answers={answers}
            setAnswers={setAnswers}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            timeLeft={timeLeft}
            studentName={studentName}
            examTerminated={examTerminated}
            onSubmit={() => submitExam(answersRef.current)}
          />
        )}
        {step === 'results' && (
          <Results
            key="results"
            studentName={studentName}
            examReport={examReport}
            examTerminated={examTerminated}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
