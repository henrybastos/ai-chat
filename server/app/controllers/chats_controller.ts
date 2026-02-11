import type { HttpContext } from '@adonisjs/core/http'
import VectorService from '#services/vector_service'
import { ChatOllama } from '@langchain/ollama'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { inject } from '@adonisjs/core'

@inject()
export default class ChatsController {
  constructor(protected vectorService: VectorService) {}

  async handle({ request, response }: HttpContext) {
    const { message } = request.only(['message'])

    if (!message) {
      return response.badRequest({ error: 'Message is required' })
    }

    try {
      // 2. Query vector DB
      const contextResults = await this.vectorService.query(message)
      
      const context = contextResults
        .map((r) => {
          const meta = r.item.metadata as any
          return `Pergunta: ${meta.question}\nResposta: ${meta.answer}`
        })
        .join('\n\n')

      const sources = contextResults.map((r) => (r.item.metadata as any).question)

      // 3. Prepare LangChain
      const model = new ChatOllama({
        model: 'gemma3:4b',
        temperature: 0,
      })

      const prompt = PromptTemplate.fromTemplate(`
        Você é um assistente prestativo da SolarNova Energia, uma empresa de energia solar.
        
        Use o CONTEXTO abaixo para responder à pergunta do usuário de forma precisa e amigável.
        Responda sempre em Português do Brasil.
        
        Se a resposta não estiver no contexto, diga educadamente que você não sabe e sugira que o usuário entre em contato com nosso suporte técnico.
        NÃO tente inventar informações que não estão no contexto.

        CONTEXTO:
        {context}

        PERGUNTA DO USUÁRIO: {question}
        RESPOSTA:
      `)

      const chain = prompt.pipe(model).pipe(new StringOutputParser())

      const answer = await chain.invoke({
        context: context || 'Nenhum contexto relevante encontrado.',
        question: message,
      })

      const suggestions = [
        { label: 'Listar todas as categorias', action: 'show_categories' },
        ...sources.slice(0, 2).map(q => ({
          label: `Perguntar sobre ${q}`,
          action: 'prompt',
          payload: `Me fale mais sobre: ${q}`
        }))
      ]

      return response.ok({ 
        answer,
        sources: sources.length > 0 ? sources : [],
        suggestions
      })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ error: 'Failed to process chat' })
    }
  }

  async categories({ response }: HttpContext) {
    try {
      const categories = await this.vectorService.getCategories()
      return response.ok({ categories })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ error: 'Failed to fetch categories' })
    }
  }
}