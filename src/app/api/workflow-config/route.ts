import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth, requirePermission } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await requireAuth()
    const config = await db.workflowConfig.findMany({ orderBy: { stageOrder: 'asc' } })
    const settings = await db.systemSetting.findMany()
    return apiSuccess({ stages: config, settings })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch workflow config')
  }
}

export async function PUT(request: Request) {
  try {
    await requirePermission('settings:manage')
    const body = await request.json()
    if (body.type === 'sla') {
      await db.workflowConfig.update({ where: { stageName: body.stageName }, data: { slaDays: body.slaDays } })
      return apiSuccess({ updated: true })
    }
    if (body.type === 'setting') {
      await db.systemSetting.upsert({ where: { key: body.key }, update: { value: body.value }, create: { key: body.key, value: body.value, label: body.label, category: body.category } })
      return apiSuccess({ updated: true })
    }
    return apiError('Invalid update type')
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to update workflow config')
  }
}