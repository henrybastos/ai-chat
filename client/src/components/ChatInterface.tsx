'use client'

import { IconSend, IconRobot, IconLoader2, IconSparkles, IconUser, IconBulb, IconBookmark } from '@tabler/icons-react'
import { useChatStore, Message } from '@/store/useChatStore'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import axios from 'axios'

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const { messages, addMessage, isLoading, setLoading, categories, fetchCategories } = useChatStore()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const bottomElement = document.getElementById('chat-bottom-scroll-target')
    if (bottomElement) {
      bottomElement.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const handleSend = async (overrideMessage?: string) => {
    const messageContent = overrideMessage || input
    if (!messageContent.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: messageContent,
    }

    addMessage(userMessage)
    setInput('')
    setLoading(true)

    try {
      if (messageContent === 'Listar todas as categorias') {
        const response = await axios.get('http://localhost:3333/categories')
        const categories = response.data.categories as string[]
        
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: 'Aqui estão as categorias de dúvidas disponíveis:\n\n' + 
                   categories.map(cat => `• ${cat}`).join('\n'),
        }
        
        addMessage(assistantMessage)
        return
      }

      const response = await axios.post('http://localhost:3333/chat', {
        message: messageContent,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.data.answer,
        sources: response.data.sources,
        suggestions: response.data.suggestions,
      }

      addMessage(assistantMessage)
    } catch (error) {
      console.error(error)
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto border border-border rounded-xl bg-surface overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
            <IconRobot size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">SolarNova Assistent</h1>
            <p className="text-xs text-muted">Powered by RAG & gemma3:4b</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-border/50 border border-border text-[10px] text-muted uppercase tracking-wider font-medium">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Sistema Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'flex flex-col gap-2 max-w-[85%]',
              m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            )}
          >
            <div data-role={m.role} className="flex data-[role=assistant]:flex-row data-[role=user]:flex-row-reverse items-center gap-2 px-1">
              {
                m.role === 'assistant' 
                ? <IconSparkles size={14} className="text-accent mt-0.5" />
                : <IconUser size={14} className="text-accent mt-0.5" />
              }
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                {m.role === 'user' ? 'Você' : 'SolarNova'}
              </span>
            </div>
            
            <div
              className={cn(
                'px-4 rounded-lg text-sm leading-relaxed border transition-all duration-200 whitespace-pre-wrap',
                m.role === 'user'
                  ? 'py-2 bg-[#1a1a1a] border-accent/30 text-white shadow-[0_0_20px_rgba(244,113,78,0.05)]'
                  : 'py-3 bg-background border-border text-[#e5e5e5]'
              )}
            >
              {m.content}
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/50">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-tight block mb-2">Fontes Consultadas (FAQ):</span>
                  <div className="flex flex-col gap-1.5">
                    {m.sources.map((source, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted leading-tight bg-surface/30 p-2 rounded border border-border/30">
                        <div className="h-1 w-1 rounded-full bg-accent mt-1.5 shrink-0" />
                        {source}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {m.suggestions && m.suggestions.length > 0 && (
                <div className="flex flex-row flex-wrap gap-2 mt-3 mb-1">
                  {m.suggestions.flatMap((suggestion, i) => {
                    if (suggestion.action === 'show_categories') {
                      return categories.map((cat, ci) => (
                        <button
                          key={`cat-${i}-${ci}`}
                          onClick={() => handleSend(`Me fale sobre: ${cat}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-foreground/10 text-foreground/75 rounded-full hover:bg-accent/20 transition-all cursor-pointer"
                        >
                          <IconBookmark className="text-accent" size={16}/>
                          {cat}
                        </button>
                      ))
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handleSend(suggestion.payload || suggestion.label)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent/10 border border-accent/30 text-accent rounded-full hover:bg-accent/20 transition-all cursor-pointer"
                      >
                        <IconBulb size={16}/>
                        {suggestion.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 px-1 text-muted">
            <IconLoader2 className="animate-spin" size={14} />
            <span className="text-xs font-medium animate-pulse">Consultando base de conhecimento...</span>
          </div>
        )}
        <span id="chat-bottom-scroll-target"></span>
      </div>

      {/* Input */}
      <div className="p-6 bg-surface border-t border-border">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre energia solar..."
            className="w-full bg-background border border-border p-4 pr-16 rounded-lg focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 text-white text-sm transition-all placeholder:text-muted/50 shadow-inner"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-accent text-white rounded-md hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed group-focus-within:scale-105 active:scale-95"
          >
            <IconSend className="mr-0.5 mt-0.5" size={18} />
          </button>
        </div>
        <p className="mt-3 text-[10px] text-center text-muted/60 uppercase tracking-widest font-medium">
          Atendimento Inteligente • Respondendo em Português
        </p>
      </div>
    </div>
  )
}
