/**
 * OG画像（1200×630）を生成して public/og-image.jpg に保存する。
 * 文言は docs/superpowers/specs/2026-05-02-og-meta-relaunch-design.md の確定値を使用。
 * 実行: npm run og:generate
 */
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

const OUTPUT = path.join(process.cwd(), 'public', 'og-image.jpg')
const LOGO_PATH = path.join(process.cwd(), 'public', 'big-logo.png')
const WIDTH = 1200
const HEIGHT = 630

// ロゴをbase64で埋め込む（外部ファイル参照を避けてレンダリングを安定化）
function logoDataUri(): string {
  const buf = fs.readFileSync(LOGO_PATH)
  return `data:image/png;base64,${buf.toString('base64')}`
}

function buildHtml(): string {
  const logo = logoDataUri()
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    font-family: "Hiragino Sans", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif;
    background: #ffffff;
    color: #333333;
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }
  .left {
    width: 40%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #e5e5e5;
  }
  .left img {
    width: 280px;
    height: auto;
  }
  .right {
    width: 60%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 64px;
    position: relative;
  }
  .main-copy {
    font-size: 48px;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: -0.01em;
    color: #1f2937;
  }
  .sub-copy {
    margin-top: 28px;
    font-size: 32px;
    font-weight: 600;
    line-height: 1.4;
    color: #2BA0A8;
  }
  .url {
    position: absolute;
    bottom: 36px;
    right: 64px;
    font-size: 22px;
    font-weight: 500;
    color: #9ca3af;
    letter-spacing: 0.04em;
  }
</style>
</head>
<body>
  <div class="left"><img src="${logo}" alt="GOODWITH" /></div>
  <div class="right">
    <div class="main-copy">コンテナセキュリティを<br />設計から実装まで</div>
    <div class="sub-copy">AI利用のセキュリティもカバー</div>
    <div class="url">goodwith.tech</div>
  </div>
</body>
</html>`
}

async function main() {
  if (!fs.existsSync(LOGO_PATH)) {
    throw new Error(`Logo not found at ${LOGO_PATH}`)
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  })
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 })
    await page.setContent(buildHtml(), { waitUntil: 'networkidle0' })
    await page.screenshot({
      path: OUTPUT,
      type: 'jpeg',
      quality: 90,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    })
  } finally {
    await browser.close()
  }

  const stat = fs.statSync(OUTPUT)
  console.log(`Generated ${OUTPUT} (${(stat.size / 1024).toFixed(1)} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
