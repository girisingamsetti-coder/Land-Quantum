import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await requireAuth()
    const cases = await db.cancellationCase.findMany({
      where: {
        status: 'Cancelled',
      },
      include: {
        application: { select: { applicationNumber: true, projectName: true, applicant: { select: { organizationName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return apiSuccess({ cases, total: cases.length })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch cancellations')
  }
}