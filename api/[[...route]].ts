import { handle } from 'hono/vercel'
import app from '../src/app.js'

export const config = {
  runtime: 'edge',
  regions: ['nrt1', 'kix1']
}

export const GET = handle(app)
export const POST = handle(app)