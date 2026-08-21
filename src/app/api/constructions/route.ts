import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await requireAuth()
    const constructions = await db.constructionProject.findMany({
      include: {
        application: { select: { id: true, applicationNumber: true, projectName: true, applicant: { select: { organizationName: true } } } },
        progressUpdates: { orderBy: { updateDate: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    })
    const summary = {
      total: constructions.length,
      inProgress: constructions.filter(c => c.status === 'In Progress').length,
      delayed: constructions.filter(c => c.status === 'Delayed').length,
      notStarted: constructions.filter(c => c.status === 'Not Started').length,
      completed: constructions.filter(c => c.status === 'Completed').length,
    }
    return apiSuccess({ constructions, summary })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch constructions')
  }
}