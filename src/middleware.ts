import { createMiddleware } from 'hono/factory'
import type { AppEnv } from './types'

/**
 * リクエストコンテキストを設定するミドルウェア
 * - 開発環境判定
 * - プロトコル判定
 * - キャッシュコントロールヘッダー
 */
export const appContext = createMiddleware<AppEnv>(async (c, next) => {
  const host = c.req.header('host') || 'localhost'
  const isDev = host.includes('localhost') || host.includes('127.0.0.1')

  c.set('isDev', isDev)
  c.set('protocol', isDev ? 'http' : 'https')
  c.set('cacheControl', {
    ogImage: isDev ? 'no-cache' : 'public, max-age=604800, s-maxage=604800',
    html: isDev ? 'no-cache' : 'public, max-age=604800, immutable',
  })

  await next()
})
