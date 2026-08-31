import React, { useState, useRef, useEffect } from 'react'
import './App.css'

const API_KEY = import.meta.env.VITE_DEEPSEEK_KEY || 'your-key-here'

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chatRef = useRef(null)

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [...messages, userMsg],
          stream: false
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || 'API error')
      }

      const data = await response.json()
      const assistantMsg = {
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'No response'
      }
      setMessages(prev => [...prev, assistantMsg])

    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🤖 AI Chat</h1>
        <p style={{ fontSize: '12px', opacity: 0.7 }}>DeepSeek V4 Flash</p>
      </div>

      <div className="chat-box" ref={chatRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg ${msg.role}`}>
            <div className="bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="msg assistant">
            <div className="bubble typing">Thinking...</div>
          </div>
        )}
        {error && <div className="error">{error}</div>}
      </div>

      <form className="input-area" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  )
}
