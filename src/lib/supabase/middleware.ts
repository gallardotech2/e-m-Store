import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/api')) {
    return supabaseResponse
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAffiliateRoute = request.nextUrl.pathname.startsWith('/affiliate')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (!user && (isAdminRoute || isAffiliateRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute && request.nextUrl.pathname !== '/auth/pending') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol, status')
      .eq('id', user.id)
      .single()

    // Check if user is approved (admins are always approved)
    const isApproved = profile?.rol === 'admin' || profile?.status === 'aprobado'
    
    // If not approved and not on pending page, redirect to pending
    if (!isApproved && request.nextUrl.pathname !== '/auth/pending') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/pending'
      return NextResponse.redirect(url)
    }

    // If approved and on pending page, redirect to appropriate dashboard
    if (isApproved && request.nextUrl.pathname === '/auth/pending') {
      const url = request.nextUrl.clone()
      url.pathname = profile?.rol === 'admin' ? '/admin' : '/affiliate'
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && profile?.rol !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (isAffiliateRoute && profile?.rol !== 'afiliado' && profile?.rol !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
