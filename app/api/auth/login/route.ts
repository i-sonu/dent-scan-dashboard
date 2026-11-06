import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  let fastapiRes: Response
  try {
    fastapiRes = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: body.username, password: body.password }),
      cache: 'no-store',
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Cannot reach auth server. Is the Python backend running?' },
      { status: 503 }
    )
  }

  const data = await fastapiRes.json()

  if (!fastapiRes.ok) {
    return NextResponse.json(
      { error: data.detail || 'Invalid credentials' },
      { status: fastapiRes.status }
    )
  }

  const response = NextResponse.json({ user: data.user, message: 'Login successful' })

  response.cookies.set('auth_token', data.access_token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: data.expires_in,
    path: '/',
  })

  response.cookies.set('auth_user', JSON.stringify(data.user), {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: data.expires_in,
    path: '/',
  })

  return response
}
