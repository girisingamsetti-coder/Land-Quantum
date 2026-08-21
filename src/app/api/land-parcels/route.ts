import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '25')))
    const search = searchParams.get('search') ?? ''
    const status = searchParams.get('status') ?? ''
    const zoneId = searchParams.get('zone') ?? ''
    const landUseId = searchParams.get('landUse') ?? ''

    const where: Prisma.LandParcelWhereInput = {}
    if (search) { where.OR = [{ plotId: { contains: search } }, { surveyNumber: { contains: search } }] }
    if (status) where.status = status
    if (zoneId) where.zoneId = zoneId
    if (landUseId) where.landUseId = landUseId

    const [parcels, total] = await Promise.all([
      db.landParcel.findMany({ where, include: { zone: true, landUse: true, allotmentMode: true, applicant: { select: { id: true, organizationName: true } } }, orderBy: { plotId: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
      db.landParcel.count({ where }),
    ])
    const zones = await db.zone.findMany({ orderBy: { code: 'asc' } })
    const landUses = await db.landUse.findMany({ orderBy: { code: 'asc' } })
    return apiSuccess({ parcels, total, page, pageSize, zones, landUses })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch land parcels')
  }
}