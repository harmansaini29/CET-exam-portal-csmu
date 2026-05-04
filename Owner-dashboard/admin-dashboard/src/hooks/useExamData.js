import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

export function useExamData() {
  const [exams, setExams]              = useState([]);
  const [liveExam, setLiveExam]        = useState(null);
  const [completedExams, setCompleted] = useState([]);
  const [upcomingExams, setUpcoming]   = useState([]);
  const [loading, setLoading]          = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem('adminToken') || '';
        const res = await fetch(`${API_URL}/available_exams`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setExams(data);
          
          // For the dashboard template, we artificially split them up
          // assuming the first exam is live, the rest are upcoming
          if (data.length > 0) {
            const live = { ...data[0], status: 'live' };
            setLiveExam(live);
            setCompleted([live]); // mock completed list for the dropdown
            setUpcoming(data.slice(1).map(e => ({ ...e, status: 'upcoming' })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch exams', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return { exams, liveExam, completedExams, upcomingExams, loading };
}