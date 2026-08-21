import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await requireAuth()
    const users = await db.user.findMany({
      include: { role: true, department: true },
      select: { id: true, email: true, name: true, designation: true, phone: true, isActive: true, lastLogin: true, failedAttempts: true, isLocked: true, createdAt: true, role: { name: true }, department: { name: true } },
      orderBy: { createdAt: 'desc' },
    })
    const roles = await db.role.findMany({ orderBy: { name: 'asc' } })
    const departments = await db.department.findMany({ orderBy: { name: 'asc' } })
    return apiSuccess({ users, roles, departments })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch users')
  }
}