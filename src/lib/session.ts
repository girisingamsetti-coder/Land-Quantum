import { cookies } from 'next/headers'
import { db } from './db'
import { randomUUID } from 'crypto'

export const SESSION_COOKIE_NAME = 'apcrda_session'
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60 // 8 hours

export interface SessionUser {
  id: string
  email: string
  name: string
  roleName: string
  rolePermissions: string[]
  departmentId: string | null
  departmentName: string | null
  designation: string | null
  employeeId: string | null
  isSystemRole: boolean
}

export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)

  await db.session.create({
    data: { userId, token, ipAddress, userAgent, expiresAt },
  })

  return { token, expiresAt }
}

export async function getSession(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          role: true,
          department: true,
        },
      },
    },
  })

  if (!session) return null

  // Check expiry
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } })
    return null
  }

  // Check user active & not locked
  if (!session.user.isActive || session.user.isLocked) {
    return null
  }

  return session
}

export async function deleteSession(token: string) {
  try {
    await db.session.delete({ where: { token } })
  } catch {
    // Session may not exist, that's ok
  }
}

export async function getCurrentSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  const session = await getSession(token)
  if (!session) return null

  const u = session.user
  const permissions: string[] = []
  try {
    const parsed = JSON.parse(u.role.permissions)
    if (Array.isArray(parsed)) permissions.push(...parsed)
  } catch { /* empty */ }

  return {
    id: u.id,
    email: u.email,
    name: u.name,
    roleName: u.role.name,
    rolePermissions: permissions,
    departmentId: u.departmentId,
    departmentName: u.department?.name ?? null,
    designation: u.designation ?? null,
    employeeId: u.employeeId ?? null,
    isSystemRole: u.role.isSystem,
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getCurrentSession()
  if (!session) {
    const { apiUnauthorized } = await import('./api-response')
    throw new AuthError(apiUnauthorized('Authentication required'))
  }
  return session
}

export function hasPermission(user: SessionUser, permission: string): boolean {
  if (user.rolePermissions.includes('*')) return true
  // Support wildcard like 'applications.*'
  const prefix = permission.split('.')[0] + '.*'
  return user.rolePermissions.includes(permission) || user.rolePermissions.includes(prefix)
}

export class AuthError extends Error {
  response: ReturnType<typeof import('next/server').NextResponse.json>
  constructor(response: ReturnType<typeof import('next/server').NextResponse.json>) {
    super('Auth error')
    this.response = response
  }
}
