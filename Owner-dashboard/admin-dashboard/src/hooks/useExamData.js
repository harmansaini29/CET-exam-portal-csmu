import { useState, useEffect } from 'react'
import { getExams, getLiveExam, getCompletedExams, getUpcomingExams } from '../api/examApi'

export function useExamData() {
  const [exams, setExams]              = useState([])
  const [liveExam, setLiveExam]        = useState(null)
  const [completedExams, setCompleted] = useState([])
  const [upcomingExams, setUpcoming]   = useState([])
  const [loading, setLoading]          = useState(true)

  useEffect(() => {
    Promise.all([getExams(), getLiveExam().catch(() => null), getCompletedExams(), getUpcomingExams()])
      .then(([all, live, completed, upcoming]) => {
        setExams(all)
        setLiveExam(live)
        setCompleted(completed)
        setUpcoming(upcoming)
        setLoading(false)
      })
  }, [])

  return { exams, liveExam, completedExams, upcomingExams, loading }
}