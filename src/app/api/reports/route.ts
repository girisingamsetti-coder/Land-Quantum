import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') ?? 'overview'

    if (type === 'overview') {
      const [totalApps, byStatus, byStage, bySector, byZone, apps] = await Promise.all([
        db.application.count(),
        db.application.groupBy({ by: ['status'], _count: true }),
        db.application.groupBy({ by: ['currentStage'], _count: true }),
        db.application.groupBy({ by: ['sector'], _count: true }),
        db.application.findMany({ include: { landParcel: { select: { zone: { select: { name: true } } } } } }),
        db.application.findMany({ select: { createdAt: true, status: true, proposedInvestment: true } }),
      ])

      const totalInvestment = await db.application.aggregate({ _sum: { proposedInvestment: true } })
      const payments = await db.payment.aggregate({ _sum: { amountPaid: true, amountDue: true } })

      // Monthly trend (last 6 months)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const monthlyApps = await db.application.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: sixMonthsAgo } },
        _count: true,
      })

      return apiSuccess({ totalApps, byStatus, byStage, bySector, totalInvestment: totalInvestment._sum.proposedInvestment || 0, payments: payments._sum, monthlyApps })
    }

    return apiSuccess({})
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch reports')
  }
}