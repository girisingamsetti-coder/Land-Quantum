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
      const slaDays = parseInt(body.slaDays, 10)
      if (isNaN(slaDays) || slaDays < 1 || !body.stageName || typeof body.stageName !== 'string') {
        return apiError('Valid stageName and positive slaDays are required', 400)
      }
      await db.workflowConfig.update({ where: { stageName: body.stageName.trim() }, data: { slaDays } })
      return apiSuccess({ updated: true })
    }
    if (body.type === 'setting') {
      if (!body.key || typeof body.key !== 'string' || body.value === undefined) {
        return apiError('Setting key and value are required', 400)
      }
      await db.systemSetting.upsert({
        where: { key: body.key.trim() },
        update: { value: String(body.value) },
        create: {
          key: body.key.trim(),
          value: String(body.value),
          label: typeof body.label === 'string' ? body.label.trim() : body.key.trim(),
          category: typeof body.category === 'string' ? body.category.trim() : 'General',
        },
      })
      return apiSuccess({ updated: true })
    }
    return apiError('Invalid update type')
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to update workflow config')
  }
}