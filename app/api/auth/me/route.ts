import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Auth server unavailable' }, { status: 503 })
  }
}
