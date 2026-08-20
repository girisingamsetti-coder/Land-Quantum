import { apiSuccess } from '@/lib/api-response'
import { getCurrentSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return apiSuccess({ authenticated: false })
    }

    // Get notification counts
    const unreadCount = await db.notification.count({
      where: {
        userId: session.id,
        isRead: false,
      },
    })

    // Check if demo mode
    let demoMode = false
    try {
      const setting = await db.systemSetting.findUnique({
        where: { key: 'demo_mode' },
      })
      demoMode = setting?.value === 'true'
    } catch { /* ignore */ }

    return apiSuccess({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        roleName: session.roleName,
        permissions: session.rolePermissions,
        departmentName: session.departmentName,
        designation: session.designation,
        employeeId: session.employeeId,
      },
      meta: {
        unreadNotifications: unreadCount,
        demoMode,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return apiSuccess({ authenticated: false })
  }
}
