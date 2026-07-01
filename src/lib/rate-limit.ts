import { LRUCache } from 'lru-cache'

const ipCache = new LRUCache<string, { count: number; resetAt: number }>({
  max: 10000,
  ttl: 60_000,
  ttlAutopurge: true,
})

function buildHeaders(max: number, remaining: number, resetAt: number): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(max),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
  }
}

export async function checkRateLimit(
  request: Request,
  { max = 10, windowMs = 60_000 }: { max?: number; windowMs?: number } = {}
): Promise<{ rateLimited: boolean; headers?: Record<string, string> }> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'

  const now = Date.now()
  const entry = ipCache.get(ip)

  if (!entry || now > entry.resetAt) {
    ipCache.set(ip, { count: 1, resetAt: now + windowMs })
    return {
      rateLimited: false,
      headers: buildHeaders(max, max - 1, now + windowMs),
    }
  }

  entry.count++
  const remaining = Math.max(0, max - entry.count)

  if (entry.count > max) {
    return {
      rateLimited: true,
      headers: {
        'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
        ...buildHeaders(max, 0, entry.resetAt),
      },
    }
  }

  return {
    rateLimited: false,
    headers: buildHeaders(max, remaining, entry.resetAt),
  }
}
