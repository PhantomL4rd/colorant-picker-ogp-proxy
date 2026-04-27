import type { Env } from './types'

const SHOWCASE = {
  /** データベースから取得する最大パレット数 */
  FETCH_LIMIT: 10,
  /** 表示するランダム選択パレット数 */
  DISPLAY_COUNT: 5,
} as const

interface DbPalette {
  id: number
  primary_dye_id: string
  suggested_dye_id_1: string
  suggested_dye_id_2: string
  pattern: string
  created_at: string
}

interface ShowcasePalette {
  id: number
  primaryDyeId: string
  suggestedDyeIds: [string, string]
  pattern: string
  createdAt: string
}

interface ShowcaseData {
  palettes: ShowcasePalette[]
  updatedAt: string
}

/**
 * D1から最新N件を取得し、ランダムでM件を選択してKVに保存する
 */
export async function refreshShowcase(env: Env): Promise<ShowcaseData> {
  // 重複パレットを除外しつつ最新を取得
  const result = await env.DB.prepare(
    `SELECT MAX(id) as id, primary_dye_id, suggested_dye_id_1, suggested_dye_id_2, pattern, MAX(created_at) as created_at
     FROM palettes
     GROUP BY primary_dye_id, suggested_dye_id_1, suggested_dye_id_2, pattern
     ORDER BY MAX(created_at) DESC
     LIMIT ?`,
  )
    .bind(SHOWCASE.FETCH_LIMIT)
    .all<DbPalette>()

  const allPalettes: ShowcasePalette[] = (result.results ?? []).map((row: DbPalette) => ({
    id: row.id,
    primaryDyeId: row.primary_dye_id,
    suggestedDyeIds: [row.suggested_dye_id_1, row.suggested_dye_id_2],
    pattern: row.pattern,
    createdAt: row.created_at,
  }))

  // Fisher-Yatesシャッフル
  const shuffled = [...allPalettes]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const showcaseData: ShowcaseData = {
    palettes: shuffled.slice(0, SHOWCASE.DISPLAY_COUNT),
    updatedAt: new Date().toISOString(),
  }

  await env.KV.put('showcase:latest', JSON.stringify(showcaseData))

  return showcaseData
}

export const scheduled: ExportedHandlerScheduledHandler<Env> = async (_event, env, ctx) => {
  ctx.waitUntil(
    (async () => {
      try {
        const data = await refreshShowcase(env)
        console.log(`Showcase refreshed: ${data.palettes.length} palettes at ${data.updatedAt}`)
      } catch (error) {
        console.error('Error refreshing showcase:', error)
        throw error
      }
    })(),
  )
}
