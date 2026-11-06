import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'users.json')

function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')) } catch { return [] }
}
function writeUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// DELETE /api/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = readUsers()
  const idx = users.findIndex((u: any) => u.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const admins = users.filter((u: any) => u.role === 'Admin')
  if (admins.length === 1 && users[idx].role === 'Admin') {
    return NextResponse.json({ error: 'Cannot delete the last admin' }, { status: 400 })
  }

  users.splice(idx, 1)
  writeUsers(users)
  return NextResponse.json({ success: true })
}

// PATCH /api/users/[id] - change password
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })

  const bcrypt = await import('bcryptjs')
  const users = readUsers()
  const idx = users.findIndex((u: any) => u.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  users[idx].password = await bcrypt.hash(password, 10)
  writeUsers(users)
  return NextResponse.json({ success: true })
}
