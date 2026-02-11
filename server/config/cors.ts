import { defineConfig } from '@adonisjs/cors'

/**
 * The cors package is used to handle Cross-Origin Resource Sharing.
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: [
    'Content-Type',
    'Accept',
    'Authorization',
  ],
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
