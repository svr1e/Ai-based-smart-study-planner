import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMaterials, generateQuiz, submitQuiz } from '../services/api'
import toast from 'react-hot-toast'
import { Brain, CheckCircle, XCircle, Trophy } from 'lucide-react'

export default function Quiz() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState([])
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getMaterials(user.userId).then(res => setMaterials(res.data)).catch(console.error)
  }, [])

  const handleGenerate = async () => {
    if (!selectedMaterial) { toast.error('Select a material first'); return }
    setGenerating(true)
    setQuestions([])
    setAnswers({})
    setSubmitted(false)
    setScore(null)
    try {
      const res = await generateQuiz(selectedMaterial, numQuestions)
      setQuestions(res.data)
      toast.success(`${res.data.length} questions generated!`)
    } catch (err) {
      toast.error(err.response?.data || 'Failed to generate quiz')
    } finally {
      setGenerating(false)
    }
  }

  const handleAnswer = (index, option) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [index]: option }))
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions')
      return
    }
    setLoading(true)
    try {
      const enriched = questions.map((q, i) => ({ ...q, userAnswer: answers[i] }))
      const material = materials.find(m => m.id === selectedMaterial)

      const res = await submitQuiz({
        userId: user.userId,
        materialId: selectedMaterial,
        subject: material?.subject || 'General',
        answers: enriched
      })

      setScore(res.data)
      setSubmitted(true)
      toast.success('Quiz submitted!')
    } catch (err) {
      toast.error('Failed to submit quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQuestions([])
    setAnswers({})
    setSubmitted(false)
    setScore(null)
  }

  const getOptionClass = (q, option, index) => {
    if (!submitted) {
      return answers[index] === option
        ? 'border-primary-500 bg-primary-50'
        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 cursor-pointer'
    }
    if (option === q.correctAnswer) return 'border-green-500 bg-green-50'
    if (option === answers[index] && option !== q.correctAnswer) return 'border-red-400 bg-red-50'
    return 'border-gray-200 opacity-60'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Quiz Generator</h1>
        <p className="text-gray-500 mt-1">Generate quiz questions from your uploaded study materials</p>
      </div>

      {/* Config */}
      {!questions.length && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-600" /> Configure Quiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Material</label>
              <select
                className="input"
                value={selectedMaterial}
                onChange={e => setSelectedMaterial(e.target.value)}
              >
                <option value="">-- Choose a material --</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.title} ({m.subject})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
              <select
                className="input"
                value={numQuestions}
                onChange={e => setNumQuestions(Number(e.target.value))}
              >
                {[3, 5, 8, 10].map(n => (
                  <option key={n} value={n}>{n} Questions</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleGenerate} className="btn-primary" disabled={generating}>
            {generating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4" /> Generate Quiz
              </span>
            )}
          </button>
          {materials.length === 0 && (
            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              ⚠️ No materials uploaded yet. Go to "Upload Material" first.
            </p>
          )}
        </div>
      )}

      {/* Score */}
      {submitted && score && (
        <div className={`card text-center ${
          (score.score / score.totalQuestions) >= 0.7 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'
        } border`}>
          <Trophy className={`w-12 h-12 mx-auto mb-2 ${
            (score.score / score.totalQuestions) >= 0.7 ? 'text-green-500' : 'text-orange-400'
          }`} />
          <h2 className="text-3xl font-bold text-gray-900">{score.score}/{score.totalQuestions}</h2>
          <p className="text-gray-600 mt-1">
            {Math.round((score.score / score.totalQuestions) * 100)}% — {
              (score.score / score.totalQuestions) >= 0.8 ? 'Excellent! 🌟' :
              (score.score / score.totalQuestions) >= 0.6 ? 'Good job! 👍' :
              'Keep studying! 📚'
            }
          </p>
          <button onClick={handleReset} className="btn-primary mt-4">Take Another Quiz</button>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={index} className="card">
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <p className="font-medium text-gray-900">{q.question}</p>
              </div>
              <div className="space-y-2 ml-10">
                {q.options.map((option, oi) => (
                  <div
                    key={oi}
                    onClick={() => handleAnswer(index, option)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                      ${getOptionClass(q, option, index)}`}
                  >
                    {submitted && option === q.correctAnswer && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    {submitted && option === answers[index] && option !== q.correctAnswer && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    {(!submitted || (option !== q.correctAnswer && option !== answers[index])) && (
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        answers[index] === option ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                      }`} />
                    )}
                    <span className="text-sm text-gray-700">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!submitted && (
            <button
              onClick={handleSubmit}
              className="btn-primary w-full"
              disabled={loading || Object.keys(answers).length < questions.length}
            >
              {loading ? 'Submitting...' : `Submit Quiz (${Object.keys(answers).length}/${questions.length} answered)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
