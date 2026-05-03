import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  User, 
  ClipboardList, 
  Timer, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  LogOut,
  Lock,
  ChevronRight,
  ChevronLeft,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// --- API Config ---
const API_URL = 'http://localhost:5000';

const PageWrapper = ({ children, title, icon: Icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="max-w-4xl mx-auto pt-10 px-4"
  >
    <div className="text-center mb-10">
      {Icon && <Icon className="mx-auto w-16 h-16 text-cherry-rose mb-4" />}
      <h1 className="text-4xl font-bold tracking-tight text-ivory-mist">{title}</h1>
    </div>
    {children}
  </motion.div>
);

function App() {
  const [step, setStep] = useState('invigilator-login'); // invigilator-login, student-login, instructions, student-dashboard, exam, results
  const [adminCreds, setAdminCreds] = useState({ id: '', pass: '' });
  const [studentCreds, setStudentCreds] = useState({ name: '', roll: '' });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  const [token, setToken] = useState(null);
  const [examReport, setExamReport] = useState(null);
  const [adminData, setAdminData] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);

  // Add Question State
  const [selectedExamForUpload, setSelectedExamForUpload] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('');
  const [newMarks, setNewMarks] = useState(1);

  useEffect(() => {
    if (step === 'admin-dashboard' && token) {
      fetch(`${API_URL}/admin_results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setAdminData(data))
      .catch(err => console.error(err));
    }
  }, [step, token]);

  useEffect(() => {
    if ((step === 'student-dashboard' || step === 'admin-dashboard') && token) {
      fetch(`${API_URL}/available_exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setAvailableExams(data))
      .catch(err => console.error(err));
    }
  }, [step, token]);

  const submitExam = async (currentAnswers) => {
    if (!token) return setStep('results');
    try {
      const res = await fetch(`${API_URL}/submit_exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ exam_id: selectedExamId || 1, answers: currentAnswers })
      });
      const data = await res.json();
      if (res.ok) {
        setExamReport(data);
      }
    } catch (err) {
      console.error("Submission error", err);
    } finally {
      setStep('results');
    }
  };
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [examTerminated, setExamTerminated] = useState(false);
  const examWindowRef = useRef(null);

  // Zero-tolerance instant terminate
  const terminateExam = async (reason) => {
    if (examTerminated) return;
    setExamTerminated(true);
    if (token) {
      try {
        await fetch(`${API_URL}/log_tab_switch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ exam_id: selectedExamId || 1, details: reason })
        });
      } catch (_) {}
    }
    setTimeout(() => submitExam(answersRef.current), 1200);
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (step === 'exam' && timeLeft > 0 && !examTerminated) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && step === 'exam') {
      submitExam(answersRef.current);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft, examTerminated]);

  // Zero-tolerance proctoring: visibility, fullscreen exit, blur
  useEffect(() => {
    if (step !== 'exam') return;

    const handleViolation = (reason) => {
      if (!examTerminated) terminateExam(reason);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation('Tab switched or window minimized');
    };
    const handleBlur = () => handleViolation('Window focus lost (OS key or alt-tab)');
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) handleViolation('Exited fullscreen mode');
    };
    const handleKeydown = (e) => {
      if (e.metaKey || e.key === 'Meta' || e.key === 'OS') handleViolation('Meta/Windows key pressed');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [step, examTerminated]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let score = 0;
    answers.forEach((ans, idx) => {
      if (ans === questions[idx]?.correct) score++;
    });
    return score;
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-glow">
        <div className="glow-spot spot-1" />
        <div className="glow-spot spot-2" />
      </div>
      <AnimatePresence mode="wait">
        
        {/* --- Invigilator Unlock --- */}
        {step === 'invigilator-login' && (
          <PageWrapper key="invigilator" title="Invigilator Unlock" icon={ShieldCheck}>
            <div className="glass-morphism p-8 max-w-md mx-auto fade-in">
              <div className="space-y-6">
                <div>
                  <label className="label">Admin / Teacher ID</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Enter ID"
                    value={adminCreds.id}
                    onChange={(e) => setAdminCreds({...adminCreds, id: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="••••••••"
                    value={adminCreds.pass}
                    onChange={(e) => setAdminCreds({...adminCreds, pass: e.target.value})}
                  />
                </div>
                <button 
                  className="btn-primary w-full"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_URL}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: adminCreds.id, pass: adminCreds.pass })
                      });
                      const data = await res.json();
                      if (res.ok && data.token) {
                        // DO NOT store the admin token for the student session
                        setToken(null);
                        setStep('student-login');
                      } else {
                        alert(data.message || 'Login failed');
                      }
                    } catch (e) {
                      console.error(e);
                      alert('Server connection error');
                    }
                  }}
                >
                  Unlock Terminal <Lock className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </PageWrapper>
        )}

        {/* --- Student Login --- */}
        {step === 'student-login' && (
          <PageWrapper key="student" title="Student Verification" icon={User}>
            <div className="glass-morphism p-8 max-w-md mx-auto fade-in">
              <div className="space-y-6">
                <div>
                  <label className="label">Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="John Doe"
                    value={studentCreds.name}
                    onChange={(e) => setStudentCreds({...studentCreds, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Roll Number / Enrollment</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="ABC-123-XYZ"
                    value={studentCreds.roll}
                    onChange={(e) => setStudentCreds({...studentCreds, roll: e.target.value})}
                  />
                </div>
                <button 
                  className="btn-primary w-full"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_URL}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: studentCreds.name, roll: studentCreds.roll })
                      });
                      const data = await res.json();
                      if (res.ok && data.token) {
                        setToken(data.token);
                        setStep('instructions');
                      } else {
                        alert(data.message || 'Login failed');
                      }
                    } catch (e) {
                      console.error(e);
                      alert('Server connection error');
                    }
                  }}
                >
                  Verify & Proceed <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button 
                  className="text-sky-reflection text-sm hover:underline w-full text-center"
                  onClick={() => setStep('invigilator-login')}
                >
                  Back to Invigilator Unlock
                </button>
              </div>
            </div>
          </PageWrapper>
        )}

        {/* --- Instructions --- */}
        {step === 'instructions' && (
          <PageWrapper key="instruct" title="Exam Guidelines" icon={ClipboardList}>
            <div className="glass-morphism p-8 fade-in text-left">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-sky-reflection mb-6 border-b border-white/10 pb-4"
              >
                Welcome, {studentCreds.name}! Your exam environment is secured and ready.
              </motion.h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-sky-reflection mb-4">Core Rules:</h3>
                  <ul className="space-y-3 text-ivory-mist opacity-90">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      Questions are randomly shuffled for each candidate.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      Timer auto-submits when time expires.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      No negative marking. Each correct answer: 1 mark.
                    </li>
                  </ul>
                </div>
                <div className="bg-cherry-rose/10 p-6 rounded-xl border border-cherry-rose/20">
                  <h3 className="text-xl font-semibold text-cherry-rose mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Zero-Tolerance Policy:
                  </h3>
                  <ul className="space-y-3 text-ivory-mist opacity-90 text-sm">
                    <li>• Exam runs in <b>mandatory fullscreen</b> mode.</li>
                    <li>• Switching tabs, pressing Windows/Cmd key, or exiting fullscreen will <b>instantly terminate</b> your exam.</li>
                    <li>• There are <b>no warnings</b>. First violation = immediate submission.</li>
                    <li>• All activity is recorded and reported to the invigilator.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-10 flex justify-center">
                <button 
                  className="btn-primary px-12 py-4 text-lg"
                  onClick={async () => {
                    setStep('student-dashboard');
                  }}
                >
                  Understood, View Exams
                </button>
              </div>
            </div>
          </PageWrapper>
        )}

        {/* --- Student Dashboard --- */}
        {step === 'student-dashboard' && (
          <PageWrapper key="student-dashboard" title="Available Exams" icon={ClipboardList}>
            <div className="grid md:grid-cols-2 gap-6 fade-in text-left">
              {availableExams.map(exam => (
                <div key={exam.id} className="glass-morphism p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-sky-reflection mb-2">{exam.title}</h3>
                    <p className="text-ivory-mist opacity-80 mb-4">{exam.description}</p>
                    <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
                      <Timer className="w-4 h-4" />
                      {exam.duration_minutes} Minutes
                    </div>
                  </div>
                  <button 
                    className="btn-primary w-full"
                    onClick={async () => {
                      setSelectedExamId(exam.id);
                      try {
                        const res = await fetch(`${API_URL}/start_exam?exam_id=${exam.id}`, {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await res.json();
                        if (res.ok && Array.isArray(data)) {
                          setQuestions(data);
                          setAnswers(Array(data.length).fill(null));
                          setTimeLeft(exam.duration_minutes * 60 || 1500);
                          // Enter fullscreen lockdown
                          try {
                            await document.documentElement.requestFullscreen();
                          } catch (_) {}
                          setStep('exam');
                        } else {
                          alert('Failed to load questions');
                        }
                      } catch (e) {
                        console.error(e);
                        alert('Server connection error');
                      }
                    }}
                  >
                    Start Exam <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ))}
              {availableExams.length === 0 && (
                <div className="col-span-2 text-center text-white/50 p-8 glass-morphism">
                  No exams available at the moment.
                </div>
              )}
            </div>
          </PageWrapper>
        )}

        {/* --- Exam Page --- */}
        {step === 'exam' && (
          <div key="exam" className="exam-lockdown min-h-screen pt-6 px-4">
            {/* Header: Timer & User info */}
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-6 glass-morphism p-4 px-8">
              <div className="flex items-center gap-4">
                <div className="bg-sky-reflection/20 p-2 rounded-lg">
                  <User className="text-sky-reflection" />
                </div>
                <div>
                  <p className="text-xs uppercase text-sky-reflection font-bold">Candidate</p>
                  <p className="font-semibold">{studentCreds.name || 'Student'}</p>
                </div>
              </div>
              
              <div className={`flex items-center gap-4 px-6 py-2 rounded-full border-2 ${timeLeft < 300 ? 'border-cherry-rose animate-pulse' : 'border-sky-reflection'}`}>
                <Timer className={timeLeft < 300 ? 'text-cherry-rose' : 'text-sky-reflection'} />
                <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase text-cherry-rose font-bold">🔒 Zero-Tolerance</p>
                <p className="text-xs text-white/50 mt-1">Any violation = instant submit</p>
              </div>
            </div>

            {/* Exam Body */}
            <div 
              ref={examWindowRef}
              className="exam-window glass-morphism mb-10"
            >
              {/* Question area */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-8">
                  <span className="px-4 py-1 bg-white/10 rounded-full text-sm font-medium">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-sky-reflection text-sm font-semibold uppercase tracking-widest">
                    {questions[currentQuestion].topic}
                  </span>
                </div>

                <h2 className="text-2xl font-medium mb-10 leading-snug">
                  {questions[currentQuestion].question}
                </h2>

                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <motion.button
                      key={`${currentQuestion}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.3 }}
                      onClick={() => {
                        const newAnswers = [...answers];
                        newAnswers[currentQuestion] = idx;
                        setAnswers(newAnswers);
                      }}
                      className={`option-btn w-full text-left p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                        answers[currentQuestion] === idx 
                          ? 'border-sky-reflection bg-sky-reflection/10 shadow-glow' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                         answers[currentQuestion] === idx ? 'border-sky-reflection bg-sky-reflection' : 'border-white/20'
                      }`}>
                        {answers[currentQuestion] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-lg">{option}</span>
                    </motion.button>
                  ))}
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
                  <button 
                    disabled={currentQuestion === 0}
                    onClick={() => setCurrentQuestion(prev => prev - 1)}
                    className="nav-btn flex items-center gap-2 text-white/50 hover:text-white disabled:opacity-0 transition-colors"
                  >
                    <ChevronLeft /> Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {currentQuestion === questions.length - 1 ? (
                      <button 
                        className="nav-btn btn-primary px-10"
                        onClick={() => submitExam(answersRef.current)}
                      >
                        Submit Final <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        className="nav-btn btn-primary px-10"
                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                      >
                        Next Question <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Zero-Tolerance Termination Overlay */}
              <AnimatePresence>
                {examTerminated && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="absolute inset-0 z-[60] bg-cherry-rose backdrop-blur-xl flex flex-col items-center justify-center rounded-[20px]"
                  >
                    <ShieldCheck className="w-24 h-24 text-white mb-4" />
                    <h2 className="text-4xl font-bold text-white uppercase tracking-tighter">EXAM TERMINATED</h2>
                    <p className="text-white/80 mt-2 text-lg">Security violation detected. Auto-submitting...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Question Palette (mini) */}
            <div className="max-w-6xl mx-auto grid grid-cols-10 md:grid-cols-25 gap-2 pb-10">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  className={`palette-btn aspect-square rounded-md text-xs font-bold transition-all ${
                    currentQuestion === i 
                      ? 'bg-sky-reflection text-white ring-2 ring-white/50' 
                      : answers[i] !== null 
                        ? 'bg-green-500/40 text-white' 
                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- Results Page --- */}
        {step === 'results' && (
          <PageWrapper key="results" title="Performance Analysis" icon={Trophy}>
            <div className="glass-morphism p-10 fade-in text-center">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-ivory-mist">
                  {(examReport ? examReport.overall_accuracy : 0) >= 70 ? `Great job, ${studentCreds.name}!` : `Good effort, ${studentCreds.name}. Keep practicing!`}
                </h2>
              </div>
              <div className="mb-10">
                <div className="relative inline-block">
                   <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-48 h-48 rounded-full border-8 border-sky-reflection/20 flex flex-col items-center justify-center bg-sky-reflection/10"
                   >
                     <span className="text-5xl font-bold">{examReport ? examReport.total_score : calculateScore()}</span>
                     <span className="text-sm opacity-60 uppercase font-bold tracking-widest">Score</span>
                   </motion.div>
                   <div className="absolute -top-4 -right-4 bg-cherry-rose text-white text-xs px-3 py-1 rounded-full font-bold">
                     {examReport ? examReport.overall_accuracy : Math.round((calculateScore() / Math.max(1, questions.length)) * 100)}% Accuracy
                   </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-left mb-10">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="text-sky-reflection font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Strong Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(examReport ? examReport.strong_topics : ["Logic", "Science", "General IT"]).map(t => (
                      <span key={t} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-lg text-sm">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="text-cherry-rose font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(examReport ? examReport.weak_topics : ["Geography", "History"]).map(t => (
                      <span key={t} className="bg-cherry-rose/20 text-cherry-rose px-3 py-1 rounded-lg text-sm">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {examReport && examReport.suggestions && examReport.suggestions.length > 0 && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left mb-10">
                  <h4 className="text-sky-reflection font-bold mb-4">AI Suggestions</h4>
                  <ul className="space-y-2 text-sm text-ivory-mist opacity-90">
                    {examReport.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              )}

              {examTerminated && (
                <div className="bg-cherry-rose/20 border border-cherry-rose/30 p-4 rounded-xl mb-10 text-cherry-rose flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6" />
                  <p className="text-sm font-medium">This exam was terminated prematurely due to security violations.</p>
                </div>
              )}

              <button 
                className="btn-primary mx-auto"
                onClick={() => window.location.reload()}
              >
                Logout Portal <LogOut className="w-4 h-4" />
              </button>
            </div>
          </PageWrapper>
        )}

        {/* --- Admin Dashboard --- */}
        {step === 'admin-dashboard' && (
          <PageWrapper key="admin-dashboard" title="Admin Dashboard" icon={ShieldCheck}>
            <div className="glass-morphism p-8 fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-ivory-mist">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="p-4 font-bold text-sky-reflection">Student Name</th>
                      <th className="p-4 font-bold text-sky-reflection">Score</th>
                      <th className="p-4 font-bold text-sky-reflection">Accuracy</th>
                      <th className="p-4 font-bold text-cherry-rose">Tab Switches</th>
                      <th className="p-4 font-bold text-cherry-rose">Weak Topics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.map((row, idx) => (
                      <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium">{row.student_name}</td>
                        <td className="p-4">{row.score}</td>
                        <td className="p-4">{row.accuracy.toFixed(1)}%</td>
                        <td className="p-4">
                          {row.tab_switches > 0 ? (
                            <span className="bg-cherry-rose/20 text-cherry-rose px-2 py-1 rounded font-bold">
                              {row.tab_switches} Warnings
                            </span>
                          ) : (
                            <span className="text-green-400">0</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {row.weak_topics.length > 0 ? row.weak_topics.map(t => (
                              <span key={t} className="bg-cherry-rose/20 text-cherry-rose text-xs px-2 py-1 rounded">
                                {t}
                              </span>
                            )) : <span className="text-green-400">None</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {adminData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-white/50">No submissions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* --- Add Question Form --- */}
              <div className="mt-12 bg-white/5 p-6 rounded-2xl border border-white/10 text-left">
                <h3 className="text-2xl font-bold text-sky-reflection mb-6">Add New Question</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Select Exam</label>
                    <select 
                      className="input-field w-full bg-black/20 text-white"
                      value={selectedExamForUpload}
                      onChange={e => setSelectedExamForUpload(e.target.value)}
                    >
                      <option value="" className="text-black">-- Choose Exam --</option>
                      {availableExams.map(ex => (
                        <option key={ex.id} value={ex.id} className="text-black">{ex.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Question Text</label>
                    <textarea 
                      className="input-field w-full bg-black/20"
                      rows="3"
                      value={newQuestionText}
                      onChange={e => setNewQuestionText(e.target.value)}
                      placeholder="Enter question text here..."
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {newOptions.map((opt, i) => (
                      <div key={i}>
                        <label className="label">Option {i + 1}</label>
                        <input 
                          type="text" 
                          className="input-field w-full bg-black/20"
                          value={opt}
                          onChange={e => {
                            const updated = [...newOptions];
                            updated[i] = e.target.value;
                            setNewOptions(updated);
                          }}
                          placeholder={`Option ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Correct Answer</label>
                      <select 
                        className="input-field w-full bg-black/20 text-white"
                        value={newCorrectAnswer}
                        onChange={e => setNewCorrectAnswer(e.target.value)}
                      >
                        <option value="" className="text-black">-- Choose Correct Option --</option>
                        {newOptions.map((opt, i) => opt && (
                          <option key={i} value={opt} className="text-black">{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Marks</label>
                      <input 
                        type="number" 
                        className="input-field w-full bg-black/20"
                        value={newMarks}
                        onChange={e => setNewMarks(e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>
                  <button 
                    className="btn-primary w-full mt-4"
                    onClick={async () => {
                      if (!selectedExamForUpload || !newQuestionText || !newCorrectAnswer || newOptions.some(o => !o)) {
                        alert("Please fill in all fields.");
                        return;
                      }
                      try {
                        const res = await fetch(`${API_URL}/add_question`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                          },
                          body: JSON.stringify({
                            exam_id: selectedExamForUpload,
                            question_text: newQuestionText,
                            options: newOptions,
                            correct_answer: newCorrectAnswer,
                            marks: newMarks
                          })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          alert('Question saved successfully!');
                          setNewQuestionText('');
                          setNewOptions(['', '', '', '']);
                          setNewCorrectAnswer('');
                          setNewMarks(1);
                        } else {
                          alert(`Error: ${data.message || data.error}`);
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Failed to save question.");
                      }
                    }}
                  >
                    Save Question
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button 
                  className="btn-primary mx-auto"
                  onClick={() => window.location.reload()}
                >
                  Logout Portal <LogOut className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </PageWrapper>
        )}

      </AnimatePresence>
    </div>
  );
}

export default App;
