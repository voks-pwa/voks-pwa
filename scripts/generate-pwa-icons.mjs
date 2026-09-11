import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')
const svgSourcePath = path.join(publicDir, 'favicon.svg')
const pngFallbackPath = path.join(publicDir, 'icon-512.png')

const BRAND_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 }
const MASKABLE_SAFE_RATIO = 0.72

async function assertDimensions(filePath, expectedSize) {
  const { width, height } = await sharp(filePath).metadata()
  if (width !== expectedSize || height !== expectedSize) {
    throw new Error(
      `${path.basename(filePath)} is ${width}x${height}, expected ${expectedSize}x${expectedSize}`,
    )
  }
}

async function writeAnyIcon(sourceBuffer, size) {
  const outputPath = path.join(publicDir, `icon-${size}.png`)

  await sharp(sourceBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: BRAND_BACKGROUND,
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)

  await assertDimensions(outputPath, size)
  console.log(`Created ${path.basename(outputPath)} (${size}x${size})`)
}

async function writeMaskableIcon(sourceBuffer, size) {
  const outputPath = path.join(publicDir, `maskable-${size}.png`)
  const logoSize = Math.round(size * MASKABLE_SAFE_RATIO)

  const logo = await sharp(sourceBuffer)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: BRAND_BACKGROUND,
    })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BACKGROUND,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath)

  await assertDimensions(outputPath, size)
  console.log(`Created ${path.basename(outputPath)} (${size}x${size})`)
}

async function getSourceBuffer() {
  // Prefer vector favicon.svg (full 477×477 lockup with tagline)
  try {
    const { default: fs } = await import('node:fs')
    if (fs.existsSync(svgSourcePath)) {
      // density 512 ensures crisp rasterization of vector at 512px
      const buf = await sharp(svgSourcePath, { density: 512 }).png().toBuffer()
      const { width, height } = await sharp(buf).metadata()
      console.log(`Source: favicon.svg → rasterized ${width}x${height}`)
      return buf
    }
  } catch {
    // fall through to PNG fallback
  }
  const buf = await sharp(pngFallbackPath).png().toBuffer()
  const { width, height } = await sharp(buf).metadata()
  console.log(`Source: icon-512.png (${width}x${height}) fallback`)
  return buf
}

async function main() {
  const sourceBuffer = await getSourceBuffer()

  await writeAnyIcon(sourceBuffer, 192)
  await writeAnyIcon(sourceBuffer, 512)
  await writeMaskableIcon(sourceBuffer, 192)
  await writeMaskableIcon(sourceBuffer, 512)

  console.log('All PWA icons generated with correct dimensions.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
