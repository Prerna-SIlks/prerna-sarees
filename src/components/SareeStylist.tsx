'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function SareeStylist() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Namaste ji! 🙏 I'm Prerna, your personal saree stylist!

I can help you find the perfect saree for any occasion. Just tell me:
- What's the occasion? (wedding, festival, casual)
- Your budget range?
- Any color preference?

Let me find your dream saree! ✨`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth' 
    })
  }, [messages])
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])
  
  const sendMessage = async () => {
    if (!input.trim() || loading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    
    try {
      const response = await fetch(
        '/api/saree-stylist',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            message: input.trim(),
            conversationHistory: messages.map(m => ({
              role: m.role === 'assistant' 
                ? 'model' 
                : 'user',
              content: m.content
            }))
          })
        }
      )
      
      const data = await response.json()
      
      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
      
    } catch(err) {
      console.error(err)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry ji, I am having trouble connecting. Please try again!',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }
  
  // Parse message and render product links
  const renderMessage = (content: string) => {
    const lines = content.split('\n')
    
    return lines.map((line, idx) => {
      // Check for product link
      if (line.startsWith('PRODUCT_LINK:')) {
        const path = line.replace('PRODUCT_LINK:', '').trim()
        return (
          <button
            key={idx}
            onClick={() => {
              router.push(path)
              setIsOpen(false)
            }}
            className="flex items-center gap-2 
              mt-1 px-3 py-2 rounded-lg text-sm
              bg-[#6B1D1D] text-white 
              hover:bg-[#4A1212] transition-colors
              w-full text-left"
          >
            View Product →
          </button>
        )
      }
      
      // Regular line
      return line ? (
        <span key={idx}>
          {line}
          {idx < lines.length - 1 && <br />}
        </span>
      ) : (
        <br key={idx} />
      )
    })
  }
  
  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className={`
          fixed bottom-24 right-6 z-50
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300
          ${isOpen 
            ? 'scale-0 opacity-0' 
            : 'scale-100 opacity-100'
          }
        `}
        style={{ 
          background: 'linear-gradient(135deg, #6B1D1D, #C9A84C)'
        }}
        title="AI Saree Stylist"
      >
        <span className="text-2xl">✨</span>
      </button>
      
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50
            w-[380px] rounded-2xl shadow-2xl
            overflow-hidden flex flex-col"
          style={{ 
            height: isMinimized ? 'auto' : '560px',
            border: '1px solid #C9A84C'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between
              px-4 py-3 text-white"
            style={{ 
              background: 'linear-gradient(135deg, #6B1D1D, #8B2525)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full 
                flex items-center justify-center text-xl
                bg-white/20">
                👗
              </div>
              <div>
                <div className="font-semibold text-sm">
                  Prerna - Saree Stylist
                </div>
                <div className="text-xs text-white/70 
                  flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full 
                    bg-green-400 animate-pulse"/>
                  AI Powered • Always Online
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 rounded-full 
                  bg-white/20 hover:bg-white/30
                  flex items-center justify-center
                  text-sm transition-colors"
              >
                {isMinimized ? '▲' : '▼'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full 
                  bg-white/20 hover:bg-white/30
                  flex items-center justify-center
                  text-sm transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              {/* Messages */}
              <div 
                className="flex-1 overflow-y-auto p-4 
                  flex flex-col gap-3"
                style={{ background: '#FDF8F0' }}
              >
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 
                      ${msg.role === 'user' 
                        ? 'flex-row-reverse' 
                        : 'flex-row'
                      }`}
                  >
                    {/* Avatar */}
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full
                        flex items-center justify-center
                        text-sm flex-shrink-0 mt-1"
                        style={{ 
                          background: '#6B1D1D',
                          color: 'white'
                        }}
                      >
                        👗
                      </div>
                    )}
                    
                    {/* Bubble */}
                    <div
                      className={`
                        max-w-[80%] rounded-2xl px-4 py-3
                        text-sm leading-relaxed
                        ${msg.role === 'user'
                          ? 'text-white rounded-tr-sm'
                          : 'text-gray-800 rounded-tl-sm'
                        }
                      `}
                      style={{
                        background: msg.role === 'user'
                          ? '#6B1D1D'
                          : 'white',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {renderMessage(msg.content)}
                      <div className={`
                        text-xs mt-1 
                        ${msg.role === 'user'
                          ? 'text-white/60 text-right'
                          : 'text-gray-400'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString(
                          'en-IN', 
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full
                      flex items-center justify-center
                      text-sm flex-shrink-0"
                      style={{ 
                        background: '#6B1D1D',
                        color: 'white'
                      }}
                    >
                      👗
                    </div>
                    <div className="bg-white rounded-2xl 
                      rounded-tl-sm px-4 py-3
                      flex items-center gap-1"
                      style={{ 
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="w-2 h-2 rounded-full 
                        bg-[#6B1D1D] animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div className="w-2 h-2 rounded-full 
                        bg-[#6B1D1D] animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div className="w-2 h-2 rounded-full 
                        bg-[#6B1D1D] animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Quick Suggestions */}
              {messages.length === 1 && (
                <div 
                  className="px-4 py-2 flex gap-2 
                    overflow-x-auto scrollbar-hide"
                  style={{ background: '#FDF8F0' }}
                >
                  {[
                    'Wedding saree under ₹10,000',
                    'Silk sarees',
                    'Casual daily wear',
                    'Festive collection'
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion)
                        inputRef.current?.focus()
                      }}
                      className="flex-shrink-0 text-xs 
                        px-3 py-1.5 rounded-full
                        border transition-colors
                        hover:bg-[#6B1D1D] hover:text-white
                        hover:border-[#6B1D1D]"
                      style={{ 
                        borderColor: '#C9A84C',
                        color: '#6B1D1D'
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Input */}
              <div 
                className="px-4 py-3 flex gap-2 
                  items-center border-t"
                style={{ 
                  background: 'white',
                  borderColor: '#E5E0D8'
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Ask me anything about sarees..."
                  className="flex-1 text-sm outline-none
                    placeholder:text-gray-400"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-full
                    flex items-center justify-center
                    transition-all duration-200
                    disabled:opacity-50 
                    disabled:cursor-not-allowed"
                  style={{ 
                    background: input.trim() 
                      ? '#6B1D1D' 
                      : '#E5E0D8',
                    color: input.trim() ? 'white' : '#999'
                  }}
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
