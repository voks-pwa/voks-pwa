import type { R2Bucket, R2ObjectBody } from '@cloudflare/workers-types'

interface Env {
  ASSETS_BUCKET: R2Bucket
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  CDN_URL?: string
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024
const MAX_DIMENSION = 2048
const THUMB_SIZE = 256
const WEBP_QUALITY = 0.85
const THUMB_QUALITY = 0.7

const FOLDER_MAP: Record<string, string> = {
  avatar: 'avatars',
  announcer: 'announcers',
  program: 'programs',
  campaign: 'campaigns',
  reward: 'rewards',
  marketplace: 'marketplace',
  badge: 'badges',
  achievement: 'achievements',
  promo: 'promos',
}

function uuid(): string {
  return crypto.randomUUID()
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = (origin && /^https?:\/\/(localhost|voks\.app|voks-pwa\.pages\.dev)/.test(origin)) ? origin : 'https://voks.app'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Max-Age': '86400',
  }
}

async function verifyAuth(authHeader: string | null, supabaseUrl: string): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: token },
    })
    if (!res.ok) return null
    const user = await res.json() as { id?: string }
    return user.id ?? null
  } catch {
    return null
  }
}

async function processImage(buffer: ArrayBuffer, mimeType: string): Promise<{
  original: ArrayBuffer
  thumbnail: ArrayBuffer
  width: number
  height: number
}> {
  const blob = new Blob([buffer], { type: mimeType })
  const image = await createImageBitmap(blob)

  let { width, height } = image
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, 0, width, height)
  const webpBlob = await canvas.convertToBlob({ type: 'image/webp', quality: WEBP_QUALITY })

  const thumbRatio = Math.min(THUMB_SIZE / width, THUMB_SIZE / height)
  const tw = Math.round(width * thumbRatio)
  const th = Math.round(height * thumbRatio)
  const thumbCanvas = new OffscreenCanvas(tw, th)
  const thumbCtx = thumbCanvas.getContext('2d')!
  thumbCtx.drawImage(image, 0, 0, tw, th)
  const thumbBlob = await thumbCanvas.convertToBlob({ type: 'image/webp', quality: THUMB_QUALITY })

  image.close()

  return {
    original: await webpBlob.arrayBuffer(),
    thumbnail: await thumbBlob.arrayBuffer(),
    width,
    height,
  }
}

async function handlePost(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const userId = await verifyAuth(request.headers.get('Authorization'), env.SUPABASE_URL)
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid form data' }), { status: 400, headers })
  }

  const file = formData.get('file') as File | null
  const assetType = formData.get('asset_type') as string | null
  const ownerId = formData.get('owner_id') as string | null

  if (!file || !assetType || !ownerId) {
    return new Response(JSON.stringify({ error: 'Missing required fields: file, asset_type, owner_id' }), { status: 400, headers })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(JSON.stringify({ error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` }), { status: 400, headers })
  }

  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'File too large. Maximum 5 MB' }), { status: 400, headers })
  }

  if (ownerId !== userId) {
    return new Response(JSON.stringify({ error: 'Owner ID mismatch' }), { status: 403, headers })
  }

  const folder = FOLDER_MAP[assetType]
  if (!folder) {
    return new Response(JSON.stringify({ error: `Invalid asset type: ${assetType}` }), { status: 400, headers })
  }

  const fileId = uuid()
  const baseUrl = env.CDN_URL ?? new URL(request.url).origin

  const buffer = await file.arrayBuffer()
  const { original, thumbnail, width, height } = await processImage(buffer, file.type)

  const storagePath = `${folder}/${fileId}.webp`
  const thumbPath = `${folder}/${fileId}.thumb.webp`
  const publicUrl = `${baseUrl}/${storagePath}`
  const thumbnailUrl = `${baseUrl}/${thumbPath}`

  await Promise.all([
    env.ASSETS_BUCKET.put(storagePath, original, {
      httpMetadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000' },
      customMetadata: { originalType: file.type, assetType, ownerId, width: String(width), height: String(height) },
    }),
    env.ASSETS_BUCKET.put(thumbPath, thumbnail, {
      httpMetadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000' },
      customMetadata: { originalType: file.type, assetType, ownerId, width: String(width), height: String(height), variant: 'thumb' },
    }),
  ])

  const metadataResult = await fetch(`${env.SUPABASE_URL}/rest/v1/assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      owner_id: ownerId,
      asset_type: assetType,
      storage_path: storagePath,
      public_url: publicUrl,
      thumbnail_url: thumbnailUrl,
      mime_type: 'image/webp',
      size: original.byteLength,
      width,
      height,
    }),
  })

  if (!metadataResult.ok) {
    const errText = await metadataResult.text()
    console.error(`[asset-upload] metadata insert failed: ${errText}`)
    return new Response(JSON.stringify({ error: 'Failed to store metadata' }), { status: 500, headers })
  }

  const asset = await metadataResult.json() as { id: string }[]

  return new Response(JSON.stringify({
    assetId: asset[0]?.id ?? fileId,
    publicUrl,
    thumbnailUrl,
  }), { status: 201, headers })
}

async function handleGet(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\//, '')

  if (!path) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  const object = await env.ASSETS_BUCKET.get(path) as R2ObjectBody | null
  if (!object) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  const headers: Record<string, string> = {
    'Content-Type': object.httpMetadata?.contentType ?? 'image/webp',
    'Cache-Control': object.httpMetadata?.cacheControl ?? 'public, max-age=31536000',
    'ETag': `"${object.etag}"`,
  }

  const origin = request.headers.get('Origin')
  const cors = corsHeaders(origin)
  for (const [k, v] of Object.entries(cors)) {
    headers[k] = v
  }

  return new Response(object.body, { headers })
}

async function handleDelete(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const userId = await verifyAuth(request.headers.get('Authorization'), env.SUPABASE_URL)
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
  }

  const url = new URL(request.url)
  const assetId = url.searchParams.get('asset_id')
  if (!assetId) {
    return new Response(JSON.stringify({ error: 'Missing asset_id' }), { status: 400, headers })
  }

  const assetRes = await fetch(`${env.SUPABASE_URL}/rest/v1/assets?id=eq.${assetId}&select=storage_path,owner_id`, {
    headers: {
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
    },
  })

  if (!assetRes.ok) {
    return new Response(JSON.stringify({ error: 'Asset not found' }), { status: 404, headers })
  }

  const assets = await assetRes.json() as { storage_path: string; owner_id: string }[]
  const asset = assets[0]
  if (!asset) {
    return new Response(JSON.stringify({ error: 'Asset not found' }), { status: 404, headers })
  }

  if (asset.owner_id !== userId) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers })
  }

  const thumbPath = asset.storage_path.replace(/\.webp$/, '.thumb.webp')

  await Promise.all([
    env.ASSETS_BUCKET.delete(asset.storage_path),
    env.ASSETS_BUCKET.delete(thumbPath),
  ])

  await fetch(`${env.SUPABASE_URL}/rest/v1/assets?id=eq.${assetId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
    },
  })

  return new Response(JSON.stringify({ success: true }), { headers })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')
    const jsonHeaders = { ...corsHeaders(origin), 'Content-Type': 'application/json' }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { ...corsHeaders(origin) } })
    }

    if (request.method === 'GET') {
      return handleGet(request, env)
    }

    if (request.method === 'DELETE') {
      return handleDelete(request, env, jsonHeaders)
    }

    if (request.method === 'POST') {
      return handlePost(request, env, jsonHeaders)
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders })
  },
}