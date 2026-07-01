export function validateOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (!origin) return false

  try {
    const originUrl = new URL(origin)

    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev && originUrl.protocol !== 'https:') return false

    return originUrl.host === host
  } catch {
    return false
  }
}
