export interface Env {
  IMAGES: R2Bucket
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  svg: 'image/svg+xml',
}

function extOf(name: string): string {
  const e = (name.split('.').pop() || 'jpg').toLowerCase()
  return /^[a-z0-9]{1,8}$/.test(e) ? e : 'jpg'
}

async function isAdmin(token: string, env: Env): Promise<boolean> {
  if (!token) return false
  let sub = ''
  try {
    const payload = token.split('.')[1] ?? ''
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    sub = json.sub ?? ''
  } catch {
    return false
  }
  if (!sub) return false
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${sub}`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return false
  const rows = (await res.json()) as Array<{ role?: string }>
  return rows.some((r) => r.role === 'admin')
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handle(request, env)
    } catch (err) {
      console.error(err)
      return new Response(`ERROR: ${(err as Error).stack ?? (err as Error).message}`, { status: 500 })
    }
  },
} satisfies ExportedHandler<Env>

async function handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'GET') {
      const key = url.pathname.slice(1)
      if (!key || !key.includes('.')) return new Response('Not found', { status: 404 })
      const obj = await env.IMAGES.get(key)
      if (!obj) return new Response('Not found', { status: 404 })
      const headers = new Headers()
      obj.writeHttpMetadata(headers)
      headers.set('etag', obj.httpEtag)
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      headers.set('Access-Control-Allow-Origin', '*')
      return new Response(obj.body, { headers })
    }

    if (request.method === 'POST' && url.pathname === '/upload') {
      const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
      if (!(await isAdmin(token, env))) return new Response('Unauthorized', { status: 401 })
      const form = await request.formData()
      const file = form.get('file')
      if (!(file instanceof File) || file.size === 0) return new Response('Falta el archivo', { status: 400 })
      if (file.size > 5 * 1024 * 1024) return new Response('La imagen supera 5 MB', { status: 400 })
      const ext = extOf(file.name)
      const key = `${crypto.randomUUID()}.${ext}`
      await env.IMAGES.put(key, file.stream(), {
        httpMetadata: { contentType: CONTENT_TYPES[ext] ?? file.type },
      })
      return Response.json({ url: `${url.origin}/${key}` })
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Authorization,Content-Type' },
      })
    }

    return new Response('Not found', { status: 404 })
  }
