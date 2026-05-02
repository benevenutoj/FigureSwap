import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Capturar referral code da URL
  const refCode = request.nextUrl.searchParams.get('ref')
  if (refCode) {
    // Salvar no cookie por 30 dias
    supabaseResponse.cookies.set('fs_referral', refCode, { maxAge: 60 * 60 * 24 * 30, path: '/' })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname === '/login'
  const isPublicRoute = request.nextUrl.pathname === '/' || isAuthRoute
  const isOnboarding = request.nextUrl.pathname === '/onboarding'

  // If user is not signed in and not on public/auth routes, redirect to login
  if (!user && !isPublicRoute && !request.nextUrl.pathname.startsWith('/_next')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user IS signed in and on the login page, redirect to home
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
