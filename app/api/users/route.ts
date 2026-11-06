import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const USERS_FILE = path.join(process.cwd(), 'users.json')

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// GET /api/users — list all users (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = readUsers().map(({ password, ...u }: any) => u) // strip passwords
  return NextResponse.json(users)
}

// POST /api/users — create a user (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { username, name, password, role } = body

  if (!username || !name || !password || !role) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const users = readUsers()
  if (users.find((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const newUser = {
    id: randomUUID(),
    name,
    email: username,
    username,
    password: hashed,
    role,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  writeUsers(users)

  const { password: _, ...safeUser } = newUser
  return NextResponse.json(safeUser, { status: 201 })
}
