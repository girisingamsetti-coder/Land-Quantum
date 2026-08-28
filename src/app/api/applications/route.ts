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
    const session = await requireAuth()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)))
    const search = searchParams.get('search') ?? ''
    const status = searchParams.get('status') ?? ''
    const stage = searchParams.get('stage') ?? ''
    const sector = searchParams.get('sector') ?? ''
    const mode = searchParams.get('mode') ?? ''
    const zone = searchParams.get('zone') ?? ''
    const excludeStages = searchParams.get('excludeStages') === 'true'
    const viewType = searchParams.get('viewType') ?? ''

    const where: Prisma.ApplicationWhereInput = {}

    if (viewType === 'cancellations') {
      where.status = 'Cancelled'
    }

    // Global search
    if (search) {
      where.OR = [
        { applicationNumber: { contains: search, mode: 'insensitive' } },
        { projectName: { contains: search, mode: 'insensitive' } },
        { applicant: { organizationName: { contains: search, mode: 'insensitive' } } },
        { applicant: { contactPerson: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Role-based access control
    // If not a system admin or super admin, restrict to applications they are assigned to or involved in
    if (!session.isSystemRole || (session.roleName !== 'Super Admin' && session.roleName !== 'System Administrator')) {
      const rbacFilter = {
        OR: [
          { assignedOfficerId: session.id },
          { stages: { some: { assignedToId: session.id } } }
        ]
      }
      
      // Combine with existing OR from search if any
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          rbacFilter
        ]
        delete where.OR
      } else {
        where.OR = rbacFilter.OR
      }
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
          ...(excludeStages ? {} : {
            stages: {
              select: { id: true, stageName: true, stageOrder: true, status: true, decision: true, completedAt: true },
              orderBy: { stageOrder: 'asc' },
            }
          }),
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

const STAGE_SLA: Record<string, number> = {
  'Application': 3, 'Eligibility': 7, 'DPR Review': 14, 'Economic Review': 10,
  'LASC': 21, 'GoM': 14, 'Cabinet Sub-Committee': 14, 'Authority Approval': 14,
  'Cabinet Approval': 21, 'Government Order': 10, 'LOI': 7, 'Payment': 14,
  'Revised DPR': 14, 'Agreement': 14, 'Possession': 7, 'Building Permission': 21,
  'Construction': 365, 'Compliance': 365,
}

export async function POST(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    // The frontend sends everything in a large form object
    const {
      organizationName, enquiryName, sector, subSector,
      representativeName, designation, contactPhone, contactEmail,
      proposedInvestmentCr, permanentEmployees, temporaryEmployees, partTimeEmployees,
      interns, contractualStaff, landExtent, builtUpArea
    } = body

    // Validate required fields
    if (!organizationName || !enquiryName || !sector) {
      return apiError('Missing required fields: organizationName, enquiryName, sector', 400)
    }

    // Generate application number
    const count = await db.application.count()
    const year = new Date().getFullYear()
    const appNumber = `APCRDA-${year}-${String(count + 1).padStart(4, '0')}`

    // Generate applicant ID
    const applicantCount = await db.applicant.count()
    const applicantId = `APCRDA-INV-${String(applicantCount + 1).padStart(5, '0')}`

    // Get default assigned officer (lands officer)
    const landsOfficer = await db.user.findFirst({
      where: { role: { name: 'APCRDA Lands Officer' } },
    })

    const now = new Date()
    const slaDueDate = new Date(now.getTime() + (STAGE_SLA['Application'] ?? 3) * 86400000)

    // Calculate total employment
    const employmentCommitment = (parseInt(permanentEmployees || '0') +
      parseInt(temporaryEmployees || '0') +
      parseInt(partTimeEmployees || '0') +
      parseInt(interns || '0') +
      parseInt(contractualStaff || '0'))

    // Create applicant + application in one transaction
    const application = await db.$transaction(async (tx) => {
      const applicant = await tx.applicant.create({
        data: {
          applicantId,
          organizationName,
          entityType: 'Not Specified', // Can be refined later based on input if added
          contactPerson: representativeName || null,
          contactPhone: contactPhone || null,
          contactEmail: contactEmail || null,
        },
      })

      return tx.application.create({
        data: {
          applicationNumber: appNumber,
          applicantId: applicant.id,
          projectName: enquiryName,
          sector,
          proposedInvestment: parseFloat(proposedInvestmentCr) || 0,
          employmentCommitment,
          status: 'Submitted',
          priority: 'Normal',
          currentStage: 'Application',
          assignedOfficerId: landsOfficer?.id ?? null,
          slaDueDate,
          wizardData: body, // Store the entire 11-step payload
          stages: {
            create: WORKFLOW_STAGES.map((stageName, si) => ({
              stageName,
              stageOrder: si + 1,
              status: si === 0 ? 'In Progress' : 'Not Started',
              assignedToId: si === 0 ? null : (landsOfficer?.id ?? null),
              slaDays: STAGE_SLA[stageName] ?? 7,
              startedAt: si === 0 ? now : null,
            })),
          },
        },
        include: {
          applicant: { select: { id: true, organizationName: true, contactPerson: true, contactEmail: true } },
          stages: { select: { id: true, stageName: true, stageOrder: true, status: true, decision: true, completedAt: true }, orderBy: { stageOrder: 'asc' } },
          assignedOfficer: { select: { id: true, name: true, designation: true } },
        },
      })
    })

    return apiSuccess({ application }, 'Application created successfully', 201)
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      return (error as { response: ReturnType<typeof apiUnauthorized> }).response
    }
    console.error('Create application error:', error)
    return apiError('Failed to create application')
  }
}

