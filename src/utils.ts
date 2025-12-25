import LZString from 'lz-string'
import type { DyeMap, PaletteData, RGB } from './types'

const APP_BASE = 'https://colorant-picker.pl4rd.com'
const DYES_URL = `${APP_BASE}/data/dyes.json`
const MAX_QUERY_LENGTH = 2048
const MAX_JSON_LENGTH = 10000

/** 染料データのキャッシュ */
let dyesCache: DyeMap | null = null

/**
 * RGBオブジェクトを16進数カラーコードに変換
 */
export const toHex = (rgb: RGB): string =>
  `#${[rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`

/**
 * 圧縮パラメータをデコードしてパレットデータを取得
 */
export const decodeParam = (raw: string | null): PaletteData | null => {
  if (!raw || raw.length > MAX_QUERY_LENGTH) {
    console.log('Parameter too long or empty:', raw?.length)
    return null
  }

  const json = LZString.decompressFromEncodedURIComponent(raw)
  if (!json || json.length > MAX_JSON_LENGTH) {
    console.log('Failed to decompress or decompressed data too large:', {
      compressed: `${raw?.substring(0, 50)}...`,
      decompressed: `${json?.substring(0, 100)}...`,
      decompressedLength: json?.length,
    })
    return null
  }

  try {
    return JSON.parse(json) as PaletteData
  } catch (e) {
    console.log('JSON parse error:', e, json)
    return null
  }
}

/**
 * 染料データを取得（キャッシュ付き）
 */
export const getDyes = async (): Promise<DyeMap> => {
  if (dyesCache) return dyesCache

  try {
    const res = await fetch(DYES_URL)
    const data = (await res.json()) as {
      dyes?: Array<{ id: string; name: string; rgb: RGB }>
    }

    const dyeMap: DyeMap = {}
    if (data.dyes && Array.isArray(data.dyes)) {
      for (const dye of data.dyes) {
        dyeMap[dye.id] = {
          name: dye.name,
          rgb: dye.rgb,
        }
      }
    }

    dyesCache = dyeMap
    return dyeMap
  } catch (e) {
    console.error('Failed to fetch dyes:', e)
    return {}
  }
}

/**
 * 圧縮データから3色を抽出
 * @returns [primary, secondary1, secondary2] の16進数カラーコード配列
 */
export const extractColors = async (
  compressedData: string | null | undefined,
): Promise<string[]> => {
  const defaultColors = ['#ffffff', '#666666', '#000000']

  if (!compressedData) return defaultColors

  const data = decodeParam(compressedData)
  if (!data) return defaultColors

  console.log('Decoded data:', JSON.stringify(data))
  const dyes = await getDyes()
  console.log('Dyes loaded:', Object.keys(dyes).length, 'entries')
  console.log('Looking for:', data.p, data.s)

  const colors = [...defaultColors]

  // プライマリ色: 通常カララント or カスタムカラー
  if (typeof data.p === 'string' && dyes[data.p]) {
    colors[0] = toHex(dyes[data.p].rgb)
  } else if (typeof data.p === 'object' && data.p?.type === 'custom' && data.p.rgb) {
    colors[0] = toHex(data.p.rgb)
  }

  // セカンダリ色
  if (data.s?.[0] && dyes[data.s[0]]) {
    colors[1] = toHex(dyes[data.s[0]].rgb)
  }
  if (data.s?.[1] && dyes[data.s[1]]) {
    colors[2] = toHex(dyes[data.s[1]].rgb)
  }

  return colors
}

/** アプリのベースURL */
export const APP_BASE_URL = APP_BASE
