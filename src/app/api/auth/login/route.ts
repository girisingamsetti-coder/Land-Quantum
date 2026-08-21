import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/session'
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return apiError('Email and password are required')
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { role: true },
    })

    if (!user) {
      return apiUnauthorized('Invalid email or password')
    }

    if (!user.isActive) {
      return apiUnauthorized('Account is deactivated. Contact administrator.')
    }

    if (user.isLocked) {
      return apiUnauthorized('Account is locked due to too many failed login attempts. Contact administrator.')
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      // Increment failed attempts
      const maxAttempts = 5
      const newAttempts = user.failedAttempts + 1
      const lockUser = newAttempts >= maxAttempts

      await db.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: newAttempts,
          isLocked: lockUser,
        },
      })

      if (lockUser) {
        return apiUnauthorized('Account has been locked due to too many failed login attempts. Contact administrator.')
      }
      return apiUnauthorized(`Invalid email or password. ${maxAttempts - newAttempts} attempts remaining.`)
    }

    // Login success - reset failed attempts, update last login
    await db.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lastLogin: new Date(),
      },
    })

    // Create session
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    const userAgent = req.headers.get('user-agent') || null
    const { token, expiresAt } = await createSession(user.id, ipAddress ?? undefined, userAgent ?? undefined)

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        role: user.role.name,
        ipAddress: ipAddress ?? undefined,
        action: 'Login',
        module: 'Auth',
      },
    })

    // Parse permissions
    let permissions: string[] = []
    try {
      const parsed = JSON.parse(user.role.permissions)
      if (Array.isArray(parsed)) permissions = parsed
    } catch { /* empty */ }

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        employeeId: user.employeeId,
        designation: user.designation,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions,
        },
      },
      session: {
        expiresAt: expiresAt.toISOString(),
      },
    }

    const response = apiSuccess(responseData, 'Login successful')

    // Set cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return apiError('Internal server error', 500)
  }
}
