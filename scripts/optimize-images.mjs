/**
 * Image Optimization Script
 * Generates optimized WebP versions of all static images.
 * Run: node scripts/optimize-images.mjs
 */
import { existsSync, mkdirSync, copyFileSync } from 'fs'
import { resolve, basename, extname } from 'path'

// We'll use sharp if available, otherwise fall back to manual instructions
let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('sharp not available. Install with: npm install sharp --save-dev')
  process.exit(1)
}

const ROOT = resolve(import.meta.dirname, '..')
const BACKUP = resolve(ROOT, 'public', '_originals')

// Ensure backup directory exists
if (!existsSync(BACKUP)) mkdirSync(BACKUP, { recursive: true })

async function optimizeImage(inputPath, outputPath, opts = {}) {
  const { width, height, quality = 80, format = 'webp', preserveAlpha = false } = opts
  
  let pipeline = sharp(inputPath)
  
  if (width || height) {
    pipeline = pipeline.resize(width, height, { 
      fit: 'inside', 
      withoutEnlargement: true 
    })
  }
  
  if (format === 'webp') {
    pipeline = pipeline.webp({ quality, alphaQuality: preserveAlpha ? 90 : 80 })
  } else if (format === 'png') {
    pipeline = pipeline.png({ quality, compressionLevel: 9 })
  } else if (format === 'jpg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  }
  
  const info = await pipeline.toFile(outputPath)
  return info
}

async function run() {
  const tasks = [
    // Logo: 2.5MB → ~5KB WebP at 84x84 (2x retina for 42px display)
    {
      input: 'public/logo.png',
      output: 'public/logo.webp',
      opts: { width: 84, height: 84, quality: 85 },
      backup: true
    },
    // Logo PNG: 2.5MB → ~10KB PNG at 84x84 (for fallback/favicon)
    {
      input: 'public/logo.png',
      output: 'public/logo.png',
      opts: { width: 84, height: 84, quality: 85, format: 'png' },
      backup: true
    },
    // OG image: 2MB → compressed PNG (OG requires PNG/JPG, not WebP)
    {
      input: 'public/og/default.png',
      output: 'public/og/default.png',
      opts: { width: 1200, height: 630, quality: 80, format: 'png' },
      backup: true
    },
    // NCAT logo: 276KB → ~5KB
    {
      input: 'public/images/ncatlogo.png',
      output: 'public/images/ncatlogo.webp',
      opts: { width: 160, quality: 85 },
      backup: true
    },
    // Plane: 174KB → ~25KB (preserve transparency)
    {
      input: 'public/images/plane-png.png',
      output: 'public/images/plane-png.webp',
      opts: { width: 400, quality: 85, preserveAlpha: true },
      backup: true
    },
    // fg.png: 903KB → ~50KB
    {
      input: 'public/images/fg.png',
      output: 'public/images/fg.webp',
      opts: { width: 800, quality: 80 },
      backup: true
    },
    // Avatar images
    {
      input: 'app/assets/image/avatar1.webp',
      output: 'app/assets/image/avatar1_optimized.webp',
      opts: { width: 96, height: 96, quality: 85 },
      backup: false
    },
    {
      input: 'app/assets/image/avatar2.jpg',
      output: 'app/assets/image/avatar2_optimized.webp',
      opts: { width: 96, height: 96, quality: 85 },
      backup: false
    },
    // Student images (optimize JPG versions, keep as WebP)
    {
      input: 'public/images/student1.jpg',
      output: 'public/images/student1.webp',
      opts: { width: 600, quality: 80 },
      backup: true
    },
    {
      input: 'public/images/student2.jpg',
      output: 'public/images/student2.webp',
      opts: { width: 600, quality: 80 },
      backup: true
    },
    {
      input: 'public/images/student3.jpg',
      output: 'public/images/student3.webp',
      opts: { width: 600, quality: 80 },
      backup: true
    },
    {
      input: 'public/images/student4.jpg',
      output: 'public/images/student4.webp',
      opts: { width: 600, quality: 80 },
      backup: true
    },
  ]

  console.log('🔧 Starting image optimization...\n')

  for (const task of tasks) {
    const inputPath = resolve(ROOT, task.input)
    const outputPath = resolve(ROOT, task.output)

    // Backup original
    let actualInputPath = inputPath
    if (task.backup) {
      const backupPath = resolve(BACKUP, basename(inputPath))
      if (!existsSync(backupPath)) {
        if (existsSync(inputPath)) {
          copyFileSync(inputPath, backupPath)
        } else {
          console.log(`⏭  Skipping ${task.input} (not found)`)
          continue
        }
      }
      actualInputPath = backupPath
    } else {
      if (!existsSync(inputPath)) {
        console.log(`⏭  Skipping ${task.input} (not found)`)
        continue
      }
    }

    try {
      const isSameFile = actualInputPath === outputPath
      const targetOutputPath = isSameFile ? outputPath + '.tmp' : outputPath
      const info = await optimizeImage(actualInputPath, targetOutputPath, task.opts)
      
      const inputSize = (await import('fs')).statSync(actualInputPath).size
      
      if (isSameFile) {
        const fs = await import('fs')
        fs.unlinkSync(outputPath)
        fs.renameSync(targetOutputPath, outputPath)
      }
      
      const savings = ((1 - info.size / inputSize) * 100).toFixed(1)
      console.log(`✅ ${task.input} → ${task.output}`)
      console.log(`   ${(inputSize / 1024).toFixed(0)}KB → ${(info.size / 1024).toFixed(0)}KB (${savings}% smaller)\n`)
    } catch (err) {
      console.error(`❌ Failed: ${task.input} — ${err.message}`)
    }
  }

  console.log('✨ Image optimization complete!')
}

run().catch(console.error)
