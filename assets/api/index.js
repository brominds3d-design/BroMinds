import server from '../dist/server/server.js'

export default async function handler(req, res) {
  return server.fetch(req, res)
}