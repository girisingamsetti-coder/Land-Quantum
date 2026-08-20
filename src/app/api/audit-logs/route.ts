import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50')))
    const filterMod = searchParams.get('module') ?? ''
    const filterAction = searchParams.get('action') ?? ''

    const where: any = {}
    if (filterMod) where.module = filterMod
    if (filterAction) where.action = filterAction

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize, take: pageSize,
      }),
      db.auditLog.count({ where }),
    ])
    return apiSuccess({ logs, total, page, pageSize })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch audit logs')
  }
}