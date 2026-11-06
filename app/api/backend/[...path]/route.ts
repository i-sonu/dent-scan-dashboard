import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND = 'http://localhost:8000'

function getToken() {
  return cookies().get('auth_token')?.value ?? ''
}

function buildUrl(path: string[], search: string) {
  return `${BACKEND}/${path.join('/')}${search}`
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const res = await fetch(buildUrl(params.path, req.nextUrl.search), {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache: 'no-store',
  })
  // PDF or binary: stream directly
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('application/pdf') || ct.includes('octet-stream')) {
    const buf = await res.arrayBuffer()
    return new NextResponse(buf, {
      status: res.status,
      headers: {
        'Content-Type': ct,
        'Content-Disposition': res.headers.get('Content-Disposition') ?? '',
      },
    })
  }
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const body = await req.text()
  const res = await fetch(buildUrl(params.path, req.nextUrl.search), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': req.headers.get('content-type') ?? 'application/json',
    },
    body,
    cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const body = await req.text()
  const res = await fetch(buildUrl(params.path, req.nextUrl.search), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': req.headers.get('content-type') ?? 'application/json',
    },
    body: body || undefined,
    cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const res = await fetch(buildUrl(params.path, req.nextUrl.search), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
    cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
