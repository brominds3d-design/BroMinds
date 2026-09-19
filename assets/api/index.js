import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import server from '../dist/server/server.js'

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

    // 1. Tentar servir ficheiro estático de dist/client ou public
    const relativePath = cleanUrl.replace(/^\//, '')
    const possiblePaths = [
      join(process.cwd(), 'dist', 'client', relativePath),
      join(process.cwd(), 'public', relativePath),
    ]

    for (const filePath of possiblePaths) {
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

    // 2. SSR: Executar o servidor TanStack Start para rotas normais
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