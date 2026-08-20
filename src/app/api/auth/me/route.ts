import { apiSuccess, apiUnauthorized } from '@/lib/api-response'
import { getCurrentSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return apiUnauthorized('Not authenticated')
    }

    return apiSuccess({
      id: session.id,
      email: session.email,
      name: session.name,
      roleName: session.roleName,
      permissions: session.rolePermissions,
      departmentId: session.departmentId,
      departmentName: session.departmentName,
      designation: session.designation,
      employeeId: session.employeeId,
      isSystemRole: session.isSystemRole,
    })
  } catch (error) {
    console.error('Me error:', error)
    return apiUnauthorized('Not authenticated')
  }
}
