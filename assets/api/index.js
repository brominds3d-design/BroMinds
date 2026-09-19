import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import server from '../dist/server/server.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

export default async function handler(req, res) {
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
    const cleanUrl = (req.url || '/').split('?')[0]

    // Remove a barra inicial e eventuais prefixos
    const relativePath = cleanUrl.replace(/^\//, '')
    const withoutAssetsPrefix = relativePath.replace(/^assets\//, '')

    // Locais possíveis onde o Vite / TanStack guardam os ficheiros estáticos
    const candidatePaths = [
      // Relativo ao ficheiro api/index.js (garantido no contentor da Vercel)
      join(__dirname, '..', 'dist', 'client', relativePath),
      join(__dirname, '..', 'dist', 'client', 'assets', withoutAssetsPrefix),
      join(__dirname, '..', 'public', relativePath),
      // Fallback via process.cwd()
      join(process.cwd(), 'dist', 'client', relativePath),
      join(process.cwd(), 'dist', 'client', 'assets', withoutAssetsPrefix),
      join(process.cwd(), 'public', relativePath),
      join(process.cwd(), 'assets', 'dist', 'client', relativePath),
      join(process.cwd(), 'assets', 'dist', 'client', 'assets', withoutAssetsPrefix),
      join(process.cwd(), 'assets', 'public', relativePath),
    ]

    for (const filePath of candidatePaths) {
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        const ext = extname(filePath).toLowerCase()
        const contentType = MIME_TYPES[ext] || 'application/octet-stream'
        const content = readFileSync(filePath)

        res.statusCode = 200
        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        return res.end(content)
      }
    }

    // SSR: Execução do TanStack Start
    const fullUrl = `${proto}://${host}${req.url}`
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v))
        } else {
          headers.set(key, value)
        }
      }
    }

    let body = undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined
    }

    const webRequest = new Request(fullUrl, {
      method: req.method,
      headers,
      body,
    })

    const response = await server.fetch(webRequest)

    res.statusCode = response.status
    response.headers.forEach((val, key) => {
      res.setHeader(key, val)
    })

    const data = await response.arrayBuffer()
    res.end(Buffer.from(data))
  } catch (err) {
    console.error('Server error:', err)
    res.statusCode = 500
    res.end(err.stack || err.message)
  }
}