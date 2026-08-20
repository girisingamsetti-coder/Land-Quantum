import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? ''
    const where: any = {}
    if (status) where.status = status

    const [grievances, total] = await Promise.all([
      db.grievance.findMany({
        where,
        include: {
          applicant: { select: { organizationName: true } },
          application: { select: { applicationNumber: true, projectName: true } },
          assignedTo: { select: { name: true, designation: true } },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      db.grievance.count({ where }),
    ])
    return apiSuccess({ grievances, total })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch grievances')
  }
}