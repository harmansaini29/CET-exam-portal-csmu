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

// --- Demo Questions Data (25 Questions) ---
const QUESTIONS = [
  { id: 1, question: "What does AI stand for?", options: ["Artificial Intelligence", "Automated Information", "Advanced Integration", "App Intelligence"], correct: 0, topic: "General IT" },
  { id: 2, question: "Which language is primarily used for Web Development?", options: ["Python", "Java", "JavaScript", "C++"], correct: 2, topic: "Web Development" },
  { id: 3, question: "What is the capital of France?", options: ["Berlin", "London", "Madrid", "Paris"], correct: 3, topic: "Geography" },
  { id: 4, question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], correct: 1, topic: "Science" },
  { id: 5, question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Leo Tolstoy"], correct: 1, topic: "Literature" },
  { id: 6, question: "What is the square root of 64?", options: ["6", "7", "8", "9"], correct: 2, topic: "Math" },
  { id: 7, question: "Which chemical element has the symbol O?", options: ["Gold", "Oxygen", "Osmium", "Silver"], correct: 1, topic: "Science" },
  { id: 8, question: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2, topic: "History" },
  { id: 9, question: "What is the largest mammal in the world?", options: ["Elephant", "Blue Whale", "Giraffe", "Shark"], correct: 1, topic: "Biology" },
  { id: 10, question: "Which data structure uses LIFO?", options: ["Queue", "Array", "Stack", "Linked List"], correct: 2, topic: "Computer Science" },
  { id: 11, question: "Who is the CEO of Tesla?", options: ["Jeff Bezos", "Elon Musk", "Bill Gates", "Mark Zuckerberg"], correct: 1, topic: "General Knowledge" },
  { id: 12, question: "What is the boiling point of water at sea level?", options: ["90°C", "100°C", "110°C", "120°C"], correct: 1, topic: "Science" },
  { id: 13, question: "Which organ is responsible for pumping blood?", options: ["Lungs", "Brain", "Heart", "Liver"], correct: 2, topic: "Biology" },
  { id: 14, question: "What is the currency of Japan?", options: ["Yuan", "Won", "Yen", "Dollar"], correct: 2, topic: "Geography" },
  { id: 15, question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correct: 2, topic: "Arts" },
  { id: 16, question: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, topic: "Science" },
  { id: 17, question: "How many bones are in the adult human body?", options: ["201", "206", "210", "215"], correct: 1, topic: "Biology" },
  { id: 18, question: "What is the primary factor in determining climate?", options: ["Wind", "Latitude", "Longitude", "Ocean currents"], correct: 1, topic: "Geography" },
  { id: 19, question: "Which company created the iPhone?", options: ["Samsung", "Google", "Microsoft", "Apple"], correct: 3, topic: "Tech" },
  { id: 20, question: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2, topic: "Math" },
  { id: 21, question: "Which continent is known as the 'Dark Continent'?", options: ["Asia", "Africa", "South America", "Australia"], correct: 1, topic: "Geography" },
  { id: 22, question: "What is the escape velocity of Earth?", options: ["7.2 km/s", "11.2 km/s", "15.2 km/s", "20.1 km/s"], correct: 1, topic: "Physics" },
  { id: 23, question: "Which metal is liquid at room temperature?", options: ["Silver", "Mercury", "Lead", "Zinc"], correct: 1, topic: "Science" },
  { id: 24, question: "Who developed the theory of relativity?", options: ["Newton", "Einstein", "Hawking", "Bohr"], correct: 1, topic: "Physics" },
  { id: 25, question: "What is the most translated book in the world?", options: ["Harry Potter", "The Bible", "The Little Prince", "Pinocchio"], correct: 1, topic: "General Knowledge" },
];

function App() {
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('admin-login'); // admin-login, student-login, instructions, exam, results
  const [adminCreds, setAdminCreds] = useState({ id: '', pass: '' });
  const [studentCreds, setStudentCreds] = useState({ name: '', roll: '' });
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [examTerminated, setExamTerminated] = useState(false);
  const [showViolation, setShowViolation] = useState(false);
  const examWindowRef = useRef(null);

  // Timer logic
  useEffect(() => {
    let timer;
    if (step === 'exam' && timeLeft > 0 && !examTerminated) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && step === 'exam') {
      setStep('results');
    }
    return () => clearInterval(timer);
  }, [step, timeLeft, examTerminated]);

  // Proctoring logic: Cursor Exit
  useEffect(() => {
    const handleMouseLeave = () => {
      if (step === 'exam' && !examTerminated) {
        setWarnings(prev => {
          const newCount = prev + 1;
          setShowViolation(true);
          setTimeout(() => setShowViolation(false), 2000);
          
          if (newCount >= 3) {
            setExamTerminated(true);
            setTimeout(() => setStep('results'), 1500);
          }
          return newCount;
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && step === 'exam' && !examTerminated) {
        handleMouseLeave(); // Treat tab switch as violation too
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [step, examTerminated]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const submitExam = async () => {
  try {
    // convert answers into backend format
    const formattedAnswers = {};
    answers.forEach((ans, idx) => {
      if (ans !== null) {
        formattedAnswers[(idx + 1).toString()] = 
          String.fromCharCode(65 + ans); // 0->A, 1->B, etc
      }
    });

    const res = await fetch("http://localhost:5000/submit_exam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers: formattedAnswers }),
    });

    const data = await res.json();

    setResult(data);   // 🔥 store ML output
    setStep("results");

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-glow">
        <div className="glow-spot spot-1" />
        <div className="glow-spot spot-2" />
      </div>
      <AnimatePresence mode="wait">
        
        {/* --- Admin Login --- */}
        {step === 'admin-login' && (
          <PageWrapper key="admin" title="Admin Portal" icon={ShieldCheck}>
            <div className="glass-morphism p-8 max-w-md mx-auto fade-in">
              <div className="space-y-6">
                <div>
                  <label className="label">Admin ID</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Enter Admin ID"
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
                  onClick={() => setStep('student-login')}
                >
                  Authorize Access <Lock className="w-4 h-4 ml-1" />
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
                  onClick={() => setStep('instructions')}
                >
                  Verify & Proceed <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button 
                  className="text-sky-reflection text-sm hover:underline w-full text-center"
                  onClick={() => setStep('admin-login')}
                >
                  Back to Admin Login
                </button>
              </div>
            </div>
          </PageWrapper>
        )}

        {/* --- Instructions --- */}
        {step === 'instructions' && (
          <PageWrapper key="instruct" title="Exam Guidelines" icon={ClipboardList}>
            <div className="glass-morphism p-8 fade-in text-left">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-sky-reflection mb-4">Core Rules:</h3>
                  <ul className="space-y-3 text-ivory-mist opacity-90">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      Total Questions: 25 Multiple Choice Questions.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      Duration: 25 Minutes (Auto-submit enabled).
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      Each correct answer carries 1 mark. No negative marking.
                    </li>
                  </ul>
                </div>
                <div className="bg-cherry-rose/10 p-6 rounded-xl border border-cherry-rose/20">
                  <h3 className="text-xl font-semibold text-cherry-rose mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Warnings (Strict):
                  </h3>
                  <ul className="space-y-3 text-ivory-mist opacity-90 text-sm">
                    <li>• Do NOT move the cursor outside the specified Exam Window.</li>
                    <li>• Do NOT switch tabs or minimize the browser.</li>
                    <li>• After <b>3 Warnings</b>, the exam will be <b>terminated automatically</b>.</li>
                    <li>• All suspicious activity is logged for review.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-10 flex justify-center">
                <button 
                  className="btn-primary px-12 py-4 text-lg"
                  onClick={() => setStep('exam')}
                >
                  Understood, Start Exam
                </button>
              </div>
            </div>
          </PageWrapper>
        )}

        {/* --- Exam Page --- */}
        {step === 'exam' && (
          <div key="exam" className="min-h-screen pt-6 px-4">
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
                <p className="text-xs uppercase text-cherry-rose font-bold">Violations</p>
                <div className="flex gap-1 justify-end mt-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < warnings ? 'bg-cherry-rose' : 'bg-white/20'}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Exam Body - This is the restricted box */}
            <div 
              ref={examWindowRef}
              onMouseLeave={() => {
                if (!examTerminated) {
                  setWarnings(prev => {
                    const newCount = prev + 1;
                    setShowViolation(true);
                    setTimeout(() => setShowViolation(false), 2000);
                    if (newCount >= 3) {
                      setExamTerminated(true);
                      setTimeout(() => setStep('results'), 1500);
                    }
                    return newCount;
                  });
                }
              }}
              className={`exam-window glass-morphism mb-10 ${showViolation ? 'violation' : ''}`}
            >
              {/* Question area */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-8">
                  <span className="px-4 py-1 bg-white/10 rounded-full text-sm font-medium">
                    Question {currentQuestion + 1} of {QUESTIONS.length}
                  </span>
                  <span className="text-sky-reflection text-sm font-semibold uppercase tracking-widest">
                    {QUESTIONS[currentQuestion].topic}
                  </span>
                </div>

                <h2 className="text-2xl font-medium mb-10 leading-snug">
                  {QUESTIONS[currentQuestion].question}
                </h2>

                <div className="space-y-4">
                  {QUESTIONS[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const newAnswers = [...answers];
                        newAnswers[currentQuestion] = idx;
                        setAnswers(newAnswers);
                      }}
                      className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                        answers[currentQuestion] === idx 
                          ? 'border-sky-reflection bg-sky-reflection/10' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                         answers[currentQuestion] === idx ? 'border-sky-reflection bg-sky-reflection' : 'border-white/20'
                      }`}>
                        {answers[currentQuestion] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-lg">{option}</span>
                    </button>
                  ))}
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
                  <button 
                    disabled={currentQuestion === 0}
                    onClick={() => setCurrentQuestion(prev => prev - 1)}
                    className="flex items-center gap-2 text-white/50 hover:text-white disabled:opacity-0 transition-colors"
                  >
                    <ChevronLeft /> Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {currentQuestion === QUESTIONS.length - 1 ? (
                      <button 
                        className="btn-primary px-10"
                        onClick={submitExam}
                      >
                        Submit Final <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        className="btn-primary px-10"
                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                      >
                        Next Question <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Violation Overlay */}
              <AnimatePresence>
                {showViolation && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-cherry-rose/20 backdrop-blur-md flex flex-col items-center justify-center rounded-[20px]"
                  >
                    <AlertTriangle className="w-20 h-20 text-white mb-4 animate-bounce" />
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">VIOLATION DETECTED</h2>
                    <p className="text-white/80 mt-2">Warning {warnings}/3. Stay inside the box!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Termination Overlay */}
              <AnimatePresence>
                {examTerminated && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-[60] bg-cherry-rose backdrop-blur-xl flex flex-col items-center justify-center rounded-[20px]"
                  >
                    <ShieldCheck className="w-24 h-24 text-white mb-4" />
                    <h2 className="text-4xl font-bold text-white uppercase tracking-tighter">EXAM TERMINATED</h2>
                    <p className="text-white/80 mt-2 text-lg">Too many violations detected. Submitting results...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Question Palette (mini) */}
            <div className="max-w-6xl mx-auto grid grid-cols-10 md:grid-cols-25 gap-2 pb-10">
              {QUESTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  className={`aspect-square rounded-md text-xs font-bold transition-all ${
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
              <div className="mb-10">
                <div className="relative inline-block">
                   <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-48 h-48 rounded-full border-8 border-sky-reflection/20 flex flex-col items-center justify-center bg-sky-reflection/10"
                   >
                     <span className="text-5xl font-bold">{result?.score}</span>
                     <span className="text-sm opacity-60 uppercase font-bold tracking-widest">Score</span>
                   </motion.div>
                   <div className="absolute -top-4 -right-4 bg-cherry-rose text-white text-xs px-3 py-1 rounded-full font-bold">
                     {result?.accuracy}% Accuracy
                   </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-left mb-10">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="text-sky-reflection font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Strong Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result?.strong_topics?.map(t => (
                      <span key={t} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-lg text-sm">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="text-cherry-rose font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result?.weak_topics?.map(t => (
                      <span key={t} className="bg-cherry-rose/20 text-cherry-rose px-3 py-1 rounded-lg text-sm">{t}</span>
                    ))}
                  </div>
                </div>
              </div>


                 {result?.suggestions && (
  <div className="mt-6 text-left">
    <h4 className="text-sky-reflection font-bold mb-2">Suggestions</h4>
    <ul className="list-disc pl-5 text-sm">
      {result.suggestions.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
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

      </AnimatePresence>
    </div>
  );
}

export default App;
