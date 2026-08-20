import { apiSuccess, apiUnauthorized, apiNotFound, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

const WORKFLOW_STAGES = [
  'Application', 'Eligibility', 'DPR Review', 'Economic Review', 'LASC',
  'GoM', 'Cabinet Sub-Committee', 'Authority Approval', 'Cabinet Approval',
  'Government Order', 'LOI', 'Payment', 'Revised DPR', 'Agreement',
  'Possession', 'Building Permission', 'Construction', 'Compliance',
]

const VALID_DECISIONS = ['Approved', 'Rejected', 'Returned', 'Deferred']

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const body = await request.json()
    const { stageName, decision, remarks, data: stageData } = body as {
      stageName: string
      decision: string
      remarks?: string
      data?: unknown
    }

    if (!stageName || !decision) {
      return apiError('stageName and decision are required')
    }

    if (!VALID_DECISIONS.includes(decision)) {
      return apiError(`Invalid decision. Must be one of: ${VALID_DECISIONS.join(', ')}`)
    }

    // Fetch the application with stages
    const application = await db.application.findUnique({
      where: { id },
      include: { stages: { orderBy: { stageOrder: 'asc' } } },
    })

    if (!application) {
      return apiNotFound('Application not found')
    }

    // Find the current stage record
    const stageRecord = application.stages.find((s) => s.stageName === stageName)
    if (!stageRecord) {
      return apiError(`Stage "${stageName}" not found for this application`)
    }

    if (stageRecord.status === 'Completed') {
      return apiError(`Stage "${stageName}" is already completed`)
    }

    const currentStageIdx = WORKFLOW_STAGES.indexOf(stageName)
    const now = new Date()

    if (decision === 'Approved') {
      // Complete current stage
      await db.applicationStage.update({
        where: { id: stageRecord.id },
        data: {
          status: 'Completed',
          decision: 'Approved',
          remarks: remarks ?? null,
          completedAt: now,
          data: stageData ? JSON.stringify(stageData) : stageRecord.data,
        },
      })

      // Find next stage
      const nextStageName = WORKFLOW_STAGES[currentStageIdx + 1]
      if (nextStageName) {
        // Start the next stage
        const nextStageRecord = application.stages.find((s) => s.stageName === nextStageName)
        if (nextStageRecord) {
          const nextConfig = await db.workflowConfig.findUnique({
            where: { stageName: nextStageName },
          })
          await db.applicationStage.update({
            where: { id: nextStageRecord.id },
            data: {
              status: 'In Progress',
              startedAt: now,
              dueDate: nextConfig
                ? new Date(now.getTime() + nextConfig.slaDays * 86400000)
                : null,
            },
          })
        }

        // Update application
        await db.application.update({
          where: { id },
          data: {
            currentStage: nextStageName,
            status: 'Under Review',
            slaDueDate: (() => {
              const nextConfig = WORKFLOW_STAGES.indexOf(nextStageName)
              return new Date(now.getTime() + ([3, 7, 14, 10, 21, 14, 14, 14, 21, 10, 7, 14, 14, 14, 7, 21, 365, 365][nextConfig] || 7) * 86400000)
            })(),
          },
        })
      } else {
        // Last stage completed
        await db.application.update({
          where: { id },
          data: { status: 'Completed' },
        })
      }
    } else if (decision === 'Returned') {
      // Mark current stage as returned
      await db.applicationStage.update({
        where: { id: stageRecord.id },
        data: {
          status: 'Returned',
          decision: 'Returned',
          remarks: remarks ?? null,
          data: stageData ? JSON.stringify(stageData) : stageRecord.data,
        },
      })

      // Return to the previous stage
      const prevStageName = WORKFLOW_STAGES[currentStageIdx - 1]
      if (prevStageName) {
        const prevStageRecord = application.stages.find((s) => s.stageName === prevStageName)
        if (prevStageRecord) {
          await db.applicationStage.update({
            where: { id: prevStageRecord.id },
            data: { status: 'In Progress' },
          })
        }
        await db.application.update({
          where: { id },
          data: { currentStage: prevStageName, status: 'Under Review' },
        })
      }
    } else if (decision === 'Rejected') {
      await db.applicationStage.update({
        where: { id: stageRecord.id },
        data: {
          status: 'Rejected',
          decision: 'Rejected',
          remarks: remarks ?? null,
          completedAt: now,
          data: stageData ? JSON.stringify(stageData) : stageRecord.data,
        },
      })

      await db.application.update({
        where: { id },
        data: {
          status: 'Rejected',
          rejectionReason: remarks ?? 'Application rejected at ' + stageName + ' stage',
        },
      })
    } else if (decision === 'Deferred') {
      await db.applicationStage.update({
        where: { id: stageRecord.id },
        data: {
          status: 'Deferred',
          decision: 'Deferred',
          remarks: remarks ?? null,
          data: stageData ? JSON.stringify(stageData) : stageRecord.data,
        },
      })

      await db.application.update({
        where: { id },
        data: { status: 'Deferred' },
      })
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        role: user.roleName,
        action: decision === 'Approved' ? 'APPROVE' : (decision === 'Rejected' ? 'REJECT' : 'UPDATE'),
        module: stageName,
        recordId: id,
        remarks: `${decision} at ${stageName} stage: ${remarks ?? ''}`.trim(),
      },
    })

    // Fetch updated application
    const updatedApplication = await db.application.findUnique({
      where: { id },
      include: {
        stages: {
          include: { assignedTo: { select: { id: true, name: true, designation: true } } },
          orderBy: { stageOrder: 'asc' },
        },
      },
    })

    return apiSuccess(updatedApplication, `${decision} at ${stageName} stage`)
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      return (error as { response: ReturnType<typeof apiUnauthorized> }).response
    }
    console.error('Stage update error:', error)
    return apiError('Failed to update stage')
  }
}
