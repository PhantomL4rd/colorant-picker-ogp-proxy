import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api'
import { html } from 'hono/html'
import { loadFonts } from './fonts'

const BRAND = '#FCFBF8'
const INK = '#2E2640'
const TRIAD = ['#F3638E', '#22C5B2', '#F7B842']

/** 背景輝度から文字色(濃 or 白)を返す */
const contrastText = (hex: string): string => {
  const h = hex.replace('#', '')
  const r = Number.parseInt(h.slice(0, 2), 16)
  const g = Number.parseInt(h.slice(2, 4), 16)
  const b = Number.parseInt(h.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.62 ? INK : '#FFFFFF'
}

/** ブランドのドロップマーク(3円・半透明) — Satori が PNG にラスタライズするため a11y チェックは不要 */
const BrandMark = ({ size = 40 }: { size?: number }) => (
  // biome-ignore lint/a11y/noSvgWithoutTitle: rendered to PNG by Satori, never in DOM
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="31.5" r="28.5" fill={TRIAD[0]} fillOpacity="0.9" />
    <circle cx="33.98" cy="59.25" r="28.5" fill={TRIAD[1]} fillOpacity="0.9" />
    <circle cx="66.02" cy="59.25" r="28.5" fill={TRIAD[2]} fillOpacity="0.9" />
  </svg>
)

/** pt コード → 表示ラベル */
const PALETTE_TYPE_LABEL: Record<string, string> = {
  triadic: 'トライアド配色',
  analogous: 'アナログ配色',
  complementary: '補色配色',
  split: 'スプリット補色',
  monochromatic: 'モノクロ配色',
}

/**
 * OGP画像のメインビュー(黄金比3分割 + ブランドピル + 配色タグ)
 */
const OgImageView = ({
  colors,
  paletteType,
}: {
  colors: [string, string, string]
  paletteType?: string
}) => {
  const [primary, sec1, sec2] = colors
  const tag = paletteType ? (PALETTE_TYPE_LABEL[paletteType] ?? null) : null

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        width: '1200px',
        height: '630px',
      }}
    >
      <div style={{ display: 'flex', width: '61.8%', height: '100%', backgroundColor: primary }} />
      <div style={{ display: 'flex', flexDirection: 'column', width: '38.2%', height: '100%' }}>
        <div style={{ display: 'flex', height: '61.8%', backgroundColor: sec1 }} />
        <div style={{ display: 'flex', flexGrow: 1, backgroundColor: sec2 }} />
      </div>

      <div
        style={{
          position: 'absolute',
          top: '44px',
          left: '48px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '14px 30px 14px 18px',
          borderRadius: '40px',
          backgroundColor: 'rgba(255,255,255,0.92)',
          boxShadow: '0 6px 20px rgba(40,30,60,0.12)',
        }}
      >
        <BrandMark size={46} />
        <span
          style={{
            marginLeft: '14px',
            fontFamily: 'M PLUS Rounded 1c',
            fontWeight: 700,
            fontSize: '30px',
            color: INK,
          }}
        >
          カララントピッカー
        </span>
      </div>

      {tag && (
        <div
          style={{
            position: 'absolute',
            top: '64px',
            right: '48px',
            display: 'flex',
            fontFamily: 'M PLUS Rounded 1c',
            fontWeight: 700,
            fontSize: '23px',
            color: contrastText(sec1),
          }}
        >
          {tag}
        </div>
      )}
    </div>
  )
}

/**
 * エラー時のOGP画像ビュー
 */
const ErrorImageView = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1200px',
      height: '630px',
      backgroundColor: BRAND,
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <BrandMark size={64} />
      <span
        style={{
          marginLeft: '20px',
          fontFamily: 'M PLUS Rounded 1c',
          fontWeight: 700,
          fontSize: '48px',
          color: INK,
        }}
      >
        カララントピッカー
      </span>
    </div>
  </div>
)

const OG_IMAGE_SIZE = { width: 1200, height: 630 }

/**
 * OGP画像を生成
 */
export const generateOgImage = (
  colors: [string, string, string],
  cacheControl: string,
  paletteType?: string,
) =>
  new ImageResponse(<OgImageView colors={colors} paletteType={paletteType} />, {
    ...OG_IMAGE_SIZE,
    fonts: loadFonts(),
    headers: { 'Cache-Control': cacheControl },
  })

/**
 * エラー時のOGP画像を生成
 */
export const generateErrorImage = () =>
  new ImageResponse(<ErrorImageView />, {
    ...OG_IMAGE_SIZE,
    fonts: loadFonts(),
    headers: { 'Cache-Control': 'no-cache' },
  })

/**
 * シェアページのHTML生成
 */
export const generateShareHtml = (ogImageUrl: string, targetUrl: string) => {
  return html`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>カララントピッカー</title>
        <meta property="og:title" content="カララントピッカー" />
        <meta
          property="og:description"
          content="カララント（染料）から3色の組み合わせを提案する配色ツールです。"
        />
        <meta property="og:site_name" content="カララントピッカー" />
        <meta property="og:image" content="${ogImageUrl}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="カララントピッカー" />
        <meta
          name="twitter:description"
          content="カララント（染料）から3色の組み合わせを提案する配色ツールです。"
        />
        <meta name="twitter:image" content="${ogImageUrl}" />
        <link rel="canonical" href="${targetUrl}" />
        <meta name="robots" content="noindex,follow" />
        <meta http-equiv="refresh" content="0;url=${targetUrl}" />
      </head>
      <body style="background:#0b0d10;color:#fff;display:grid;place-items:center;height:100vh">
        <p>Redirecting… <a href="${targetUrl}">open</a></p>
        <script>
          location.replace(${JSON.stringify(targetUrl)})
        </script>
      </body>
    </html>`
}
