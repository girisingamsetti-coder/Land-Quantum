import { apiSuccess, apiUnauthorized, apiNotFound, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const application = await db.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        landParcel: {
          include: {
            zone: true,
            landUse: true,
            allotmentMode: true,
          },
        },
        allotmentMode: true,
        project: true,
        assignedOfficer: {
          select: { id: true, name: true, email: true, designation: true, department: { select: { name: true } } },
        },
        stages: {
          include: {
            assignedTo: { select: { id: true, name: true, designation: true } },
          },
          orderBy: { stageOrder: 'asc' },
        },
        dprVersions: {
          include: {
            reviewer: { select: { id: true, name: true, designation: true } },
            queries: {
              include: {
                raisedBy: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        economicReviews: {
          include: {
            reviewer: { select: { id: true, name: true, designation: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        payments: { orderBy: { createdAt: 'asc' } },
        grievances: {
          include: {
            assignedTo: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        governmentOrders: { orderBy: { createdAt: 'desc' } },
        lois: { orderBy: { createdAt: 'desc' } },
        agreements: { orderBy: { createdAt: 'desc' } },
        possessions: { orderBy: { createdAt: 'desc' } },
        buildingPerms: { orderBy: { createdAt: 'desc' } },
        constructions: {
          include: {
            progressUpdates: {
              include: {
                reportedBy: { select: { id: true, name: true } },
              },
              orderBy: { updateDate: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        complianceRecords: { orderBy: { createdAt: 'desc' } },
        cancellationCases: { orderBy: { createdAt: 'desc' } },
        documents: {
          include: {
            uploadedBy: { select: { id: true, name: true } },
            verifiedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!application) {
      return apiNotFound('Application not found')
    }

    // Also fetch the workflow config for stage metadata
    const workflowConfig = await db.workflowConfig.findMany({
      orderBy: { stageOrder: 'asc' },
    })

    // Fetch audit logs for this application
    const auditLogs = await db.auditLog.findMany({
      where: { recordId: application.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return apiSuccess({ application, workflowConfig, auditLogs })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      return (error as { response: ReturnType<typeof apiUnauthorized> }).response
    }
    console.error('Application detail error:', error)
    return apiError('Failed to fetch application')
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Validate if the application exists
    const existing = await db.application.findUnique({
      where: { id },
      select: { applicantId: true }
    })

    if (!existing) {
      return apiNotFound('Application not found')
    }

    const {
      projectName, sector, projectCategory, projectDescription,
      proposedInvestment, employmentCommitment, developmentTimeline, intendedLandUse, priority,
      // applicant fields
      organizationName, contactPerson, contactPhone, contactEmail, entityType, registrationNumber,
      pan, gst, registeredAddress, authorizedRep, netWorth, experience
    } = body

    // Update Application and Applicant
    const application = await db.$transaction(async (tx) => {
      // Update Applicant
      await tx.applicant.update({
        where: { id: existing.applicantId },
        data: {
          organizationName: organizationName !== undefined ? organizationName : undefined,
          contactPerson: contactPerson !== undefined ? contactPerson : undefined,
          contactPhone: contactPhone !== undefined ? contactPhone : undefined,
          contactEmail: contactEmail !== undefined ? contactEmail : undefined,
          entityType: entityType !== undefined ? entityType : undefined,
          registrationNumber: registrationNumber !== undefined ? registrationNumber : undefined,
          pan: pan !== undefined ? pan : undefined,
          gst: gst !== undefined ? gst : undefined,
          registeredAddress: registeredAddress !== undefined ? registeredAddress : undefined,
          authorizedRep: authorizedRep !== undefined ? authorizedRep : undefined,
          netWorth: netWorth !== undefined ? parseFloat(netWorth) : undefined,
          experience: experience !== undefined ? experience : undefined,
        }
      })

      // Update Application
      return tx.application.update({
        where: { id },
        data: {
          projectName: projectName !== undefined ? projectName : undefined,
          sector: sector !== undefined ? sector : undefined,
          projectCategory: projectCategory !== undefined ? projectCategory : undefined,
          projectDescription: projectDescription !== undefined ? projectDescription : undefined,
          proposedInvestment: proposedInvestment !== undefined ? parseFloat(proposedInvestment) : undefined,
          employmentCommitment: employmentCommitment !== undefined ? parseInt(employmentCommitment, 10) : undefined,
          developmentTimeline: developmentTimeline !== undefined ? developmentTimeline : undefined,
          intendedLandUse: intendedLandUse !== undefined ? intendedLandUse : undefined,
          priority: priority !== undefined ? priority : undefined,
        }
      })
    })

    return apiSuccess({ application }, 'Application updated successfully')
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      return (error as { response: ReturnType<typeof apiUnauthorized> }).response
    }
    console.error('Update application error:', error)
    return apiError('Failed to update application')
  }
}
