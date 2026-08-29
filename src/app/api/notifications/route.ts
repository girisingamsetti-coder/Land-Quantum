import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await requireAuth()
    const notifications = await db.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const unread = await db.notification.count({ where: { userId: session.id, isRead: false } })
    return apiSuccess({ notifications, unread })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch notifications')
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === 'string') : []
    if (ids.length === 0) {
      return apiSuccess({ updated: 0 })
    }
    const result = await db.notification.updateMany({
      where: { id: { in: ids }, userId: session.id },
      data: { isRead: true }
    })
    return apiSuccess({ updated: result.count })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to update notifications')
  }
}