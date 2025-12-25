/**
 * RGB色情報
 */
export interface RGB {
  r: number
  g: number
  b: number
}

/**
 * 染料データ
 */
export interface Dye {
  id: string
  name: string
  rgb: RGB
}

/**
 * 染料マップ（IDをキーとしたルックアップ用）
 */
export type DyeMap = Record<string, { name: string; rgb: RGB }>

/**
 * カスタムカラー（ユーザー定義色）
 */
export interface CustomColor {
  type: 'custom'
  rgb: RGB
}

/**
 * パレットデータ（圧縮データをデコードした結果）
 */
export interface PaletteData {
  /** プライマリ色: 染料IDまたはカスタムカラー */
  p: string | CustomColor
  /** セカンダリ色: 染料IDの配列 */
  s?: string[]
}

/**
 * Hono Context用の環境変数型
 */
export type AppEnv = {
  Variables: {
    isDev: boolean
    protocol: 'http' | 'https'
    cacheControl: {
      ogImage: string
      html: string
    }
  }
}
