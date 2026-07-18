import sharp from 'sharp'

const source = 'scripts/logo-source.jpg'

await sharp(source).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(source).resize(512, 512).png().toFile('public/icons/icon-512.png')
await sharp(source).resize(512, 512).png().toFile('public/icons/maskable-icon-512.png')
await sharp(source).resize(180, 180).flatten({ background: '#0a0a0a' }).png().toFile('public/icons/apple-touch-icon-180.png')
await sharp(source).resize(48, 48).png().toFile('public/favicon.png')

console.log('Icons generated.')
