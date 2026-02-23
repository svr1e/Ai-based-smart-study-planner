import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMaterials, askQuestion, summarizeMaterial } from '../services/api'
import toast from 'react-hot-toast'
import { MessageSquare, Send, Sparkles, User, Bot, FileText } from 'lucide-react'

export default function Chat() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState([])
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    getMaterials(user.userId).then(res => setMaterials(res.data)).catch(console.error)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (selectedMaterial) {
      const material = materials.find(m => m.id === selectedMaterial)
      setMessages([{
        role: 'assistant',
        text: `📚 I've loaded **${material?.title}** (${material?.subject}). Ask me anything about this material, or click "Summarize" to get a quick overview!`
      }])
    }
  }, [selectedMaterial])

  const sendMessage = async () => {
    if (!input.trim() || !selectedMaterial) return
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await askQuestion(selectedMaterial, input)
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleSummarize = async () => {
    if (!selectedMaterial) return
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', text: 'Summarize this material for me.' }])
    try {
      const res = await summarizeMaterial(selectedMaterial)
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.summary }])
    } catch {
      toast.error('Failed to summarize')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ask AI About Your Material</h1>
        <p className="text-gray-500 mt-1">Chat with Gemini AI about your uploaded study materials</p>
      </div>

      {/* Material Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Study Material</label>
        <div className="flex gap-3">
          <select
            className="input flex-1"
            value={selectedMaterial}
            onChange={e => setSelectedMaterial(e.target.value)}
          >
            <option value="">-- Choose a material to chat about --</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.title} ({m.subject})</option>
            ))}
          </select>
          {selectedMaterial && (
            <button onClick={handleSummarize} className="btn-secondary flex items-center gap-2" disabled={loading}>
              <Sparkles className="w-4 h-4 text-primary-600" /> Summarize
            </button>
          )}
        </div>
        {materials.length === 0 && (
          <p className="text-sm text-orange-600 mt-2">Upload materials first to use the AI chat.</p>
        )}
      </div>

      {/* Chat Area */}
      {selectedMaterial ? (
        <div className="card flex flex-col h-[500px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${msg.role === 'user' ? 'bg-primary-600' : 'bg-gray-100'}`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-gray-600" />
                  }
                </div>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <input
              className="input flex-1"
              placeholder="Ask anything about the material..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="btn-primary px-4"
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center py-16 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Select a study material to start chatting with AI</p>
        </div>
      )}
    </div>
  )
}
