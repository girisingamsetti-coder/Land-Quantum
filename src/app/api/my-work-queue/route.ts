import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await requireAuth()
    // Tasks assigned to this user
    const [assignedApps, assignedStages, grievances] = await Promise.all([
      db.application.findMany({ where: { assignedOfficerId: session.id, status: { not: 'Completed' } }, include: { applicant: { select: { organizationName: true } }, stages: { where: { status: 'In Progress' }, select: { stageName: true, slaDays: true, startedAt: true, dueDate: true } } }, orderBy: { createdAt: 'desc' } }),
      db.applicationStage.findMany({ where: { assignedToId: session.id, status: { in: ['In Progress', 'Pending Action'] } }, include: { application: { select: { id: true, applicationNumber: true, projectName: true, applicant: { select: { organizationName: true } } } } }, orderBy: { dueDate: 'asc' } }),
      db.grievance.findMany({ where: { assignedToId: session.id, status: { not: 'Closed' } }, include: { application: { select: { applicationNumber: true } } }, orderBy: { submittedAt: 'desc' } }),
    ])
    return apiSuccess({ assignedApps, assignedStages, grievances })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch work queue')
  }
}