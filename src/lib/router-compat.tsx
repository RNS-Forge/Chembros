'use client'

import React, { Suspense } from 'react'
import NextLink from 'next/link'
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation'

export function Link({ to, href, children, ...props }: any) {
  const target = href || to || '/'
  return (
    <NextLink href={target} {...props}>
      {children}
    </NextLink>
  )
}

export function useNavigate() {
  const router = useNextRouter()
  return (to: any, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (to === -1) {
        if (typeof window !== 'undefined') window.history.back()
      }
      return
    }
    if (options?.replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }
}

export function useLocation() {
  const pathname = useNextPathname()
  return {
    pathname: pathname || '/',
    search: typeof window !== 'undefined' ? window.location.search : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null,
  }
}

export function useParams<T = any>(): T {
  try {
    const params = useNextParams()
    return ((params as any) || {}) as T
  } catch {
    return {} as T
  }
}

function SearchParamsHelper({ onParams }: { onParams: (sp: URLSearchParams) => void }) {
  const sp = useNextSearchParams()
  React.useEffect(() => {
    onParams(new URLSearchParams(sp ? sp.toString() : ''))
  }, [sp, onParams])
  return null
}

export function useSearchParams(): [URLSearchParams, (params: any) => void] {
  const router = useNextRouter()
  const pathname = useNextPathname()

  let initialParams = new URLSearchParams()
  if (typeof window !== 'undefined') {
    initialParams = new URLSearchParams(window.location.search)
  }

  const [searchParams, setSearchParamsState] = React.useState<URLSearchParams>(initialParams)

  const setSearchParams = React.useCallback(
    (newParams: any) => {
      const sp = new URLSearchParams(newParams)
      setSearchParamsState(sp)
      router.push(`${pathname}?${sp.toString()}`)
    },
    [router, pathname]
  )

  return [searchParams, setSearchParams]
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useNextRouter()
  React.useEffect(() => {
    if (replace) router.replace(to)
    else router.push(to)
  }, [to, replace, router])
  return null
}

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Router({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Route({ element }: { path: string; element: React.ReactNode }) {
  return <>{element}</>
}

export default {
  Link,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
  BrowserRouter,
  Router,
  Routes,
  Route,
}

