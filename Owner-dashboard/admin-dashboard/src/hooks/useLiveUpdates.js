import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function useLiveUpdates(enabled = true) {
  const [analytics, setAnalytics]   = useState(null);
  const [violations, setViolations] = useState([]);
  const [students, setStudents]     = useState([]);
  const [connected, setConnected]   = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken') || '';
        const res = await fetch(`${API_URL}/admin_results`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.stats) {
          setAnalytics({ live_stats: data.stats });
        }
        
        if (Array.isArray(data.results)) {
          setStudents(data.results);
          // Convert student flags to a violations list for the feed
          const allViolations = data.results
            .filter(s => s.flags > 0)
            .map(s => ({
              id: s.id,
              name: s.name,
              reason: 'Security violation detected',
              time: 'Just now'
            }));
          setViolations(allViolations);
        }
        
        setConnected(true);
      } catch (err) {
        console.error('Polling error', err);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Initial fetch
    
    // Poll every 5 seconds
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [enabled]);

  return { analytics, violations, students, connected, loading };
}