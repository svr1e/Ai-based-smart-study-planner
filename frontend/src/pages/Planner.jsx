import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { generatePlan, getUserPlans, markComplete, markIncomplete, deletePlan } from '../services/api'
import toast from 'react-hot-toast'
import { Calendar, Sparkles, CheckCircle, Circle, Trash2, Clock } from 'lucide-react'

export default function Planner() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    topics: '',
    examDate: '',
    dailyHours: 2
  })

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await getUserPlans(user.userId)
      setPlans(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlans() }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!form.subject || !form.topics || !form.examDate) {
      toast.error('Please fill all fields')
      return
    }
    setGenerating(true)
    try {
      await generatePlan({ ...form, userId: user.userId, userEmail: user.email })
      toast.success('Study plan generated! 🎯')
      fetchPlans()
    } catch (err) {
      toast.error(err.response?.data || 'Failed to generate plan')
    } finally {
      setGenerating(false)
    }
  }

  const handleToggle = async (plan) => {
    try {
      if (plan.completed) {
        await markIncomplete(plan.id)
      } else {
        await markComplete(plan.id)
      }
      fetchPlans()
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deletePlan(id)
      toast.success('Session deleted')
      fetchPlans()
    } catch {
      toast.error('Failed to delete')
    }
  }

  // Group plans by date
  const grouped = plans.reduce((acc, plan) => {
    const key = plan.date
    if (!acc[key]) acc[key] = []
    acc[key].push(plan)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
        <p className="text-gray-500 mt-1">Let AI generate a personalized study schedule for you</p>
      </div>

      {/* Generate Form */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" /> Generate AI Study Schedule
        </h2>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              className="input"
              placeholder="e.g. Data Structures"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
            <input
              type="date"
              className="input"
              value={form.examDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, examDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Study Hours</label>
            <select
              className="input"
              value={form.dailyHours}
              onChange={e => setForm({ ...form, dailyHours: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6].map(h => (
                <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topics to Cover</label>
            <input
              className="input"
              placeholder="e.g. Arrays, Trees, Graphs, DP"
              value={form.topics}
              onChange={e => setForm({ ...form, topics: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary" disabled={generating}>
              {generating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating with AI...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Generate Schedule
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Plans Timeline */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No study sessions yet. Generate a schedule above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => {
            const dayPlans = grouped[date]
            const allDone = dayPlans.every(p => p.completed)
            const today = new Date().toISOString().split('T')[0]
            const isToday = date === today
            const isPast = date < today

            return (
              <div key={date} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                      {isToday ? '📅 Today — ' : ''}{new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric'
                      })}
                    </h3>
                    {allDone && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Done ✓</span>}
                  </div>
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {dayPlans.reduce((s, p) => s + p.durationMinutes, 0)} min total
                  </span>
                </div>
                <div className="space-y-2">
                  {dayPlans.map(plan => (
                    <div
                      key={plan.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors
                        ${plan.completed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                    >
                      <button onClick={() => handleToggle(plan)}>
                        {plan.completed
                          ? <CheckCircle className="w-5 h-5 text-green-500" />
                          : <Circle className="w-5 h-5 text-gray-400 hover:text-primary-500" />
                        }
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${plan.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {plan.topic}
                        </p>
                        {plan.notes && <p className="text-xs text-gray-500 mt-0.5">{plan.notes}</p>}
                      </div>
                      <span className="text-xs text-gray-400 mr-2">{plan.durationMinutes}m</span>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
