import server from '../dist/server/server.js'

export default async function handler(req, res) {
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
    const fullUrl = `${proto}://${host}${req.url}`

    // Cria os headers da Web Request
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

    // Prepara o body caso venha em POST/PUT
    let body = undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined
    }

    const webRequest = new Request(fullUrl, {
      method: req.method,
      headers,
      body,
    })

    // Chama o servidor TanStack Start
    const response = await server.fetch(webRequest)

    // Devolve a resposta para a Vercel
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