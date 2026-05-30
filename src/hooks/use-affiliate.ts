'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const COOKIE_NAME = 'afiliado_id'
const COOKIE_DAYS = 90

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

export function useAffiliate() {
  const searchParams = useSearchParams()
  const [afiliadoId, setAfiliadoId] = useState<string | null>(null)

  useEffect(() => {
    const urlId = searchParams.get('a')
    const cookieId = getCookie(COOKIE_NAME)
    const id = urlId ?? cookieId

    if (id) {
      setAfiliadoId(id)
      if (!cookieId && urlId) {
        setCookie(COOKIE_NAME, urlId, COOKIE_DAYS)
      }
    }
  }, [searchParams])

  function getAffiliateParam(): string {
    const id = afiliadoId || getCookie(COOKIE_NAME)
    return id ? `?a=${id}` : ''
  }

  return { afiliadoId, getAffiliateParam }
}
