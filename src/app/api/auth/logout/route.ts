import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, getCurrentSession, deleteSession } from '@/lib/session'
import { apiSuccess, apiError } from '@/lib/api-response'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession()

    // Audit log if user was logged in
    if (session) {
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
      await db.auditLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          role: session.roleName,
          ipAddress: ipAddress ?? undefined,
          action: 'Logout',
          module: 'Auth',
        },
      })
    }

    // Delete session from DB
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (token) {
      await deleteSession(token)
    }

    // Clear cookie
    const response = apiSuccess(null, 'Logged out successfully')
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return apiError('Internal server error', 500)
  }
}
