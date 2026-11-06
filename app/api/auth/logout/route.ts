import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  // Clear both cookies
  response.cookies.set('auth_token', '', { maxAge: 0, path: '/' })
  response.cookies.set('auth_user',  '', { maxAge: 0, path: '/' })
  return response
}
