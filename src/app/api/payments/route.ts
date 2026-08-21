import { apiSuccess, apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? ''
    const where: any = {}
    if (status) where.status = status

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: { application: { select: { id: true, applicationNumber: true, applicant: { select: { organizationName: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      db.payment.count({ where }),
    ])

    const totalDue = payments.reduce((s, p) => s + p.amountDue, 0)
    const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0)
    const outstanding = totalDue - totalPaid
    const overdue = payments.filter(p => p.status === 'Overdue').reduce((s, p) => s + (p.amountDue - p.amountPaid), 0)

    return apiSuccess({ payments, total, summary: { totalDue, totalPaid, outstanding, overdue } })
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) return (error as any).response
    return apiError('Failed to fetch payments')
  }
}