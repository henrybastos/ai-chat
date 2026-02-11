import type { ApplicationService } from '@adonisjs/core/types'
import VectorService from '#services/vector_service'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    const vectorService = await this.app.container.make(VectorService)
    await vectorService.init()
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}