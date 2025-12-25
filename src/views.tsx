import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api'
import { html } from 'hono/html'

/**
 * OGP画像のメインビュー（黄金比レイアウト）
 */
const OgImageView = ({ colors }: { colors: string[] }) => (
  <div
    style={{
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'row',
    }}
  >
    {/* 左：メイン 61.8% */}
    <div
      style={{
        flex: 61.8,
        backgroundColor: colors[0],
        display: 'flex',
        position: 'relative',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
      }}
    />

    {/* 右：残りを縦に 23.6% / 14.6% */}
    <div
      style={{
        flex: 38.2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 23.6,
          backgroundColor: colors[1],
          display: 'flex',
          position: 'relative',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
        }}
      />
      <div
        style={{
          flex: 14.6,
          backgroundColor: colors[2],
          display: 'flex',
          position: 'relative',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
        }}
      />
    </div>
  </div>
)

/**
 * エラー時のOGP画像ビュー
 */
const ErrorImageView = () => (
  <div
    style={{
      width: '1200px',
      height: '630px',
      backgroundColor: '#1a1a1a',
      fontFamily: 'sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        color: 'white',
        fontSize: '32px',
        textAlign: 'center',
        fontWeight: 'bold',
      }}
    >
      FFXIV Colorant Picker
    </div>
  </div>
)

const OG_IMAGE_SIZE = { width: 1200, height: 630 }

/**
 * OGP画像を生成
 */
export const generateOgImage = (colors: string[], cacheControl: string) =>
  new ImageResponse(<OgImageView colors={colors} />, {
    ...OG_IMAGE_SIZE,
    headers: { 'Cache-Control': cacheControl },
  })

/**
 * エラー時のOGP画像を生成
 */
export const generateErrorImage = () =>
  new ImageResponse(<ErrorImageView />, {
    ...OG_IMAGE_SIZE,
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
          content="FF14のカララント（染料）から3色の組み合わせを提案するツールです。"
        />
        <meta property="og:site_name" content="カララントピッカー" />
        <meta property="og:image" content="${ogImageUrl}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="カララントピッカー" />
        <meta
          name="twitter:description"
          content="FF14のカララント（染料）から3色の組み合わせを提案するツールです。"
        />
        <meta name="twitter:image" content="${ogImageUrl}" />
        <link rel="canonical" href="${targetUrl}" />
        <meta name="robots" content="noindex,follow" />
        <meta http-equiv="refresh" content="0;url=${targetUrl}" />
      </head>
      <body
        style="background:#0b0d10;color:#fff;display:grid;place-items:center;height:100vh"
      >
        <p>Redirecting… <a href="${targetUrl}">open</a></p>
        <script>
          location.replace(${JSON.stringify(targetUrl)})
        </script>
      </body>
    </html>`
}
