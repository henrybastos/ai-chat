import { create } from 'zustand'
import axios from 'axios'

export interface Suggestion {
  label: string
  action: 'prompt' | 'show_categories'
  payload?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  suggestions?: Suggestion[]
}

export type CategoriesStatus = 'idle' | 'loading' | 'success' | 'fail'

interface ChatStore {
  messages: Message[]
  isLoading: boolean
  categories: string[]
  categoriesStatus: CategoriesStatus
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  fetchCategories: () => Promise<void>
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente da Solar Energy. Como posso te ajudar hoje?',
    },
  ],
  isLoading: false,
  categories: [],
  categoriesStatus: 'idle',
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  fetchCategories: async () => {
    set({ categoriesStatus: 'loading' })
    try {
      const response = await axios.get('http://localhost:3333/categories')
      set({ 
        categories: response.data.categories,
        categoriesStatus: 'success'
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      set({ categoriesStatus: 'fail' })
    }
  },
}))
