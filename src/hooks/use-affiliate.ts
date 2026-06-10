'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

const COOKIE_NAME = 'afiliado_id'
const COOKIE_DAYS = 90

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`
}

export function useAffiliate() {
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('a')
  const cookieId = getCookie(COOKIE_NAME)

  const [afiliadoId] = useState<string | null>(() => {
    return urlParam ?? cookieId
  })

  useEffect(() => {
    if (urlParam && (!cookieId || cookieId !== urlParam)) {
      setCookie(COOKIE_NAME, urlParam, COOKIE_DAYS)
    }
  }, [urlParam, cookieId])

  function getAffiliateParam(): string {
    const currentId = afiliadoId || getCookie(COOKIE_NAME)
    return currentId ? `?a=${currentId}` : ''
  }

  return { afiliadoId, getAffiliateParam }
}
