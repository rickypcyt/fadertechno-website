/**
 * Pre-optimizes images in public/ by converting them to WebP
 * and generating responsive sizes.
 *
 * Run: bun run scripts/optimize-images.ts
 */
import sharp from 'sharp'
import { readdir, mkdir } from 'fs/promises'
import { join, extname, basename } from 'path'

const PUBLIC_DIR = join(process.cwd(), 'public')
const SIZES = [640, 750, 828, 1080, 1200, 1920]
const QUALITY = 80

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']

async function processImage(filePath: string) {
  const ext = extname(filePath)
  const name = basename(filePath, ext)
  const outDir = join(PUBLIC_DIR, 'optimized')
  await mkdir(outDir, { recursive: true })

  const image = sharp(filePath)
  const metadata = await image.metadata()

  console.log(`Processing ${basename(filePath)} (${metadata.width}x${metadata.height})`)

  // Generate WebP version at original size
  await image
    .webp({ quality: QUALITY })
    .toFile(join(outDir, `${name}.webp`))

  // Generate responsive sizes for large images
  if (metadata.width && metadata.width > 640) {
    for (const width of SIZES) {
      if (width < metadata.width) {
        await image
          .resize(width)
          .webp({ quality: QUALITY })
          .toFile(join(outDir, `${name}-${width}.webp`))
      }
    }
  }

  console.log(`  ✓ ${name}.webp + responsive sizes`)
}

async function main() {
  console.log('Optimizing images in public/...\n')

  const files = await readdir(PUBLIC_DIR)
  const images = files.filter((f) => IMAGE_EXTENSIONS.includes(extname(f).toLowerCase()))

  if (images.length === 0) {
    console.log('No images found to optimize.')
    return
  }

  for (const file of images) {
    await processImage(join(PUBLIC_DIR, file))
  }

  console.log(`\nDone! ${images.length} images optimized.`)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
