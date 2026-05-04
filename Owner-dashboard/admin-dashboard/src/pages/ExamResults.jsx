import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function ExamResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'accuracy', direction: 'desc' });

  useEffect(() => {
    // In a real scenario, the admin token would be fetched from localStorage or context
    // We assume the token is stored as 'adminToken' for the dashboard
    const token = localStorage.getItem('adminToken') || '';
    
    fetch(`${API_URL}/admin_results`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.results)) {
          setResults(data.results);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch admin results", err);
        setLoading(false);
      });
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredResults = sortedResults.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="card mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-ivory-mist)', margin: 0 }}>Candidate Performance & Security Log</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Monitor student scores and AI-detected anomalies.</p>
          </div>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input 
              type="text" 
              placeholder="Search by student name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 36px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading secure results...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Student <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  </th>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleSort('accuracy')}>
                    Accuracy <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  </th>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleSort('flags')}>
                    Violations <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  </th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length > 0 ? filteredResults.map((result) => (
                  <motion.tr 
                    key={result.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px', fontWeight: 500, color: 'var(--color-ivory-mist)' }}>
                      {result.name}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${result.accuracy}%`, 
                            height: '100%', 
                            background: result.accuracy >= 70 ? 'var(--color-green-safe)' : result.accuracy >= 40 ? '#f59e0b' : 'var(--color-cherry-rose)' 
                          }} />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{result.accuracy}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {result.flags > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-cherry-rose)', background: 'rgba(166,28,60,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                          <AlertTriangle size={14} /> {result.flags} Flags
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Clean</span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {result.status === 'Terminated' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-cherry-rose)' }}>
                          <ShieldAlert size={16} /> Auto-Terminated
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-green-safe)' }}>
                          <CheckCircle size={16} /> Completed
                        </span>
                      )}
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}