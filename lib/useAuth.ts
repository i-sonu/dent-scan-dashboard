'use client'
import { useState, useEffect } from 'react'

export type AuthUser = {
  username: string
  name: string
  role: string
  email: string
} | null

export function useAuth(): { user: AuthUser; loading: boolean } {
  const [user, setUser]       = useState<AuthUser>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Read from the auth_user cookie (non-httpOnly, client-readable)
    const getCookieUser = () => {
      const match = document.cookie.match(/auth_user=([^;]+)/)
      if (!match) return null
      try { return JSON.parse(decodeURIComponent(match[1])) } catch { return null }
    }
    setUser(getCookieUser())
    setLoading(false)
  }, [])

  return { user, loading }
}
