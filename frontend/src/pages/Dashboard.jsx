import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getStats, getTodayPlans, getUserQuizzes, markComplete } from '../services/api'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { CheckCircle, Circle, Brain, BookOpen, Calendar, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [todayPlans, setTodayPlans] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [statsRes, todayRes, quizRes] = await Promise.all([
        getStats(user.userId),
        getTodayPlans(user.userId),
        getUserQuizzes(user.userId)
      ])
      setStats(statsRes.data)
      setTodayPlans(todayRes.data)
      setQuizzes(quizRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleToggle = async (plan) => {
    try {
      if (plan.completed) return
      await markComplete(plan.id)
      toast.success('Session marked complete! 🎉')
      fetchData()
    } catch {
      toast.error('Failed to update')
    }
  }

  const chartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [stats?.completedPlans || 0, (stats?.totalPlans || 0) - (stats?.completedPlans || 0)],
      backgroundColor: ['#6366f1', '#e0e7ff'],
      borderWidth: 0,
    }]
  }

  const avgQuizScore = quizzes.length
    ? Math.round(quizzes.reduce((acc, q) => acc + (q.score / q.totalQuestions) * 100, 0) / quizzes.length)
    : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, {user.name}! 👋</h1>
        <p className="text-gray-500 mt-1">Here's your study overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: stats?.totalPlans || 0, icon: Calendar, color: 'text-blue-600 bg-blue-100' },
          { label: 'Completed', value: stats?.completedPlans || 0, icon: CheckCircle, color: 'text-green-600 bg-green-100' },
          { label: 'Quizzes Taken', value: quizzes.length, icon: Brain, color: 'text-purple-600 bg-purple-100' },
          { label: 'Avg Quiz Score', value: `${avgQuizScore}%`, icon: Trophy, color: 'text-yellow-600 bg-yellow-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-600" /> Overall Progress
          </h2>
          {stats?.totalPlans > 0 ? (
            <div className="max-w-48 mx-auto">
              <Doughnut data={chartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
              <p className="text-center text-sm text-gray-500 mt-4">
                {stats.completedPlans} of {stats.totalPlans} sessions done
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No study plans yet. Create one in the Planner!</p>
            </div>
          )}
        </div>

        {/* Today's Sessions */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" /> Today's Sessions
          </h2>
          {todayPlans.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No sessions scheduled for today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayPlans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => handleToggle(plan)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                    ${plan.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-primary-50'}`}
                >
                  {plan.completed
                    ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    : <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${plan.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {plan.topic}
                    </p>
                    <p className="text-xs text-gray-500">{plan.subject} • {plan.durationMinutes} min</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Quiz Results */}
      {quizzes.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-600" /> Recent Quiz Results
          </h2>
          <div className="space-y-2">
            {quizzes.slice(0, 5).map(q => (
              <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{q.subject || 'Quiz'}</p>
                  <p className="text-xs text-gray-500">{new Date(q.takenAt).toLocaleDateString()}</p>
                </div>
                <div className={`font-bold text-lg ${
                  (q.score / q.totalQuestions) >= 0.7 ? 'text-green-600' : 'text-orange-500'
                }`}>
                  {q.score}/{q.totalQuestions}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
