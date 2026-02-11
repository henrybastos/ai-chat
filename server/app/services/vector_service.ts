import { LocalIndex } from 'vectra'
import { OllamaEmbeddings } from '@langchain/ollama'
import path from 'node:path'
import fs from 'node:fs/promises'
import app from '@adonisjs/core/services/app'

export default class VectorService {
  private index: LocalIndex
  private embeddings: OllamaEmbeddings

  constructor() {
    this.index = new LocalIndex(path.join(app.makePath(), 'storage', 'index'))
    this.embeddings = new OllamaEmbeddings({
        model: 'nomic-embed-text',
    })
  }

  async init() {
    const isCreated = await this.index.isIndexCreated()
    if (!isCreated) {
      await this.index.createIndex()
    }

    const stats = await this.index.getIndexStats()
    if (stats.items === 0) {
      console.log('Vector index is empty, seeding...')
      await this.seed()
    }
  }

  private async seed() {
    try {
      const faqPath = path.join(app.makePath(), 'solar-faq.json')
      const rawData = await fs.readFile(faqPath, 'utf-8')
      const data = JSON.parse(rawData)

      await this.index.beginUpdate()

      for (const item of data.faq) {
        const text = `Category: ${item.category}\nQuestion: ${item.question}\nAnswer: ${item.answer}\nKeywords: ${item.keywords.join(', ')}`
        const vector = await this.embeddings.embedQuery(text)
        await this.index.insertItem({ vector, metadata: { text, ...item } })
        console.log(`Seeded: ${item.question.substring(0, 50)}...`)
      }

      await this.index.endUpdate()
      console.log('Seeding completed successfully.')
    } catch (error) {
      console.error('Error seeding vector index:', error)
      this.index.cancelUpdate()
    }
  }

  async query(question: string) {
    const vector = await this.embeddings.embedQuery(question)
    const results = await this.index.queryItems(vector, question, 3)
    // Filter results by score (vectra score is similarity, 1.0 is perfect match)
    return results.filter((r) => r.score > 0.6)
  }

  async getCategories() {
    const faqPath = path.join(app.makePath(), 'solar-faq.json')
    const rawData = await fs.readFile(faqPath, 'utf-8')
    const data = JSON.parse(rawData)
    const categories = [...new Set(data.faq.map((item: any) => item.category))]
    return categories
  }
}
