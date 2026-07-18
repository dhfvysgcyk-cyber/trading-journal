import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const base = readFileSync(new URL('./icon-source.svg', import.meta.url))
const maskable = readFileSync(new URL('./icon-source-maskable.svg', import.meta.url))

await sharp(base).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(base).resize(512, 512).png().toFile('public/icons/icon-512.png')
await sharp(maskable).resize(512, 512).png().toFile('public/icons/maskable-icon-512.png')
await sharp(base).resize(180, 180).flatten({ background: '#0b0d12' }).png().toFile('public/icons/apple-touch-icon-180.png')

console.log('Icons generated.')
