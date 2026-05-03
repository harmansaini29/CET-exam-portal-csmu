import { useState, useEffect, useRef } from 'react'
import { getLiveAnalytics } from '../api/analyticsApi'
import { getViolations } from '../api/violationsApi'

const WS_URL = 'ws://localhost:8000/ws/live'

export function useLiveUpdates(enabled = true) {
  const [analytics, setAnalytics]   = useState(null)
  const [violations, setViolations] = useState([])
  const [students, setStudents]     = useState([])
  const [connected, setConnected]   = useState(false)
  const [loading, setLoading]       = useState(true)
  const wsRef = useRef(null)

  // Load initial data from REST API
  useEffect(() => {
    Promise.all([getLiveAnalytics(), getViolations()])
      .then(([a, v]) => {
        setAnalytics(a)
        setViolations(v)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!enabled) return

    function connect() {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        console.log('WebSocket connected to Python backend')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'live_update') {
            // Update analytics stats from Python push
            setAnalytics(prev => prev ? {
              ...prev,
              live_stats: data.live_stats
            } : prev)
            // Update student list
            if (data.students) setStudents(data.students)
          }
        } catch (e) {
          console.error('WebSocket message parse error', e)
        }
      }

      ws.onclose = () => {
        setConnected(false)
        console.log('WebSocket closed — reconnecting in 3s...')
        // Auto-reconnect after 3 seconds
        setTimeout(connect, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [enabled])

  return { analytics, violations, students, connected, loading }
}