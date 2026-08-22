import { apiSuccess, apiUnauthorized, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

const APPLICATION_STATUSES = [
  'Draft', 'Submitted', 'Under Review', 'Clarification Required',
  'Approved', 'Rejected', 'Deferred', 'Withdrawn', 'Cancelled', 'Completed',
]

const WORKFLOW_STAGES = [
  'Application', 'Eligibility', 'DPR Review', 'Economic Review', 'LASC',
  'GoM', 'Cabinet Sub-Committee', 'Authority Approval', 'Cabinet Approval',
  'Government Order', 'LOI', 'Payment', 'Revised DPR', 'Agreement',
  'Possession', 'Building Permission', 'Construction', 'Compliance',
]

const SECTORS = [
  'IT & ITES', 'Real Estate', 'Healthcare', 'Education',
  'Hospitality & Tourism', 'Manufacturing', 'Financial Services', 'Retail',
  'Logistics', 'Energy', 'Agriculture', 'Media & Entertainment',
]

const ALLOTMENT_MODES = [
  'Nomination / Suo Moto', 'Quality-Based Selection', 'Quality-cum-Price Selection',
  'Public Tender / e-Tender', 'Public Auction / e-Auction', 'Randomized Selection / Draw of Lots',
]

export async function GET(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)))
    const search = searchParams.get('search') ?? ''
    const status = searchParams.get('status') ?? ''
    const stage = searchParams.get('stage') ?? ''
    const sector = searchParams.get('sector') ?? ''
    const mode = searchParams.get('mode') ?? ''
    const zone = searchParams.get('zone') ?? ''

    const where: Prisma.ApplicationWhereInput = {}

    // Global search
    if (search) {
      where.OR = [
        { applicationNumber: { contains: search } },
        { projectName: { contains: search } },
        { applicant: { organizationName: { contains: search } } },
        { applicant: { contactPerson: { contains: search } } },
      ]
    }

    // Filters
    if (status && APPLICATION_STATUSES.includes(status)) {
      where.status = status
    }
    if (stage && WORKFLOW_STAGES.includes(stage)) {
      where.currentStage = stage
    }
    if (sector && SECTORS.includes(sector)) {
      where.sector = sector
    }
    if (mode && ALLOTMENT_MODES.includes(mode)) {
      where.allotmentMode = { name: mode }
    }
    if (zone) {
      where.landParcel = { zone: { code: zone } }
    }

    const [applications, total] = await Promise.all([
      db.application.findMany({
        where,
        include: {
          applicant: { select: { id: true, organizationName: true, contactPerson: true, contactEmail: true } },
          landParcel: {
            select: {
              id: true, plotId: true, surveyNumber: true, extentAcres: true,
              zone: { select: { name: true, code: true } },
              landUse: { select: { name: true, code: true } },
            },
          },
          allotmentMode: { select: { id: true, name: true, code: true } },
          assignedOfficer: { select: { id: true, name: true, designation: true } },
          stages: {
            select: { id: true, stageName: true, stageOrder: true, status: true, decision: true, completedAt: true },
            orderBy: { stageOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.application.count({ where }),
    ])

    // Calculate SLA for each application
    const now = new Date()
    const enriched = applications.map((app) => {
      let slaRemaining: number | null = null
      if (app.slaDueDate) {
        const diff = Math.ceil((app.slaDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        slaRemaining = diff
      }
      return { ...app, slaRemaining }
    })

    return apiSuccess({ applications: enriched, total, page, pageSize })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      return (error as { response: ReturnType<typeof apiUnauthorized> }).response
    }
    console.error('Applications list error:', error)
    return apiError('Failed to fetch applications')
  }
}
