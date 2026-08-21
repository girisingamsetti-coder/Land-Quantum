'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppLayout, type View } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Cell, PieChart, Pie, AreaChart, Area } from 'recharts'
import {
  FileText, LandPlot, IndianRupee, HardHat, MessageSquareWarning,
  TrendingUp, TrendingDown, Clock, CheckCircle2,
  AlertTriangle, ArrowRight, Zap, ChevronRight, AlertCircle, KanbanSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  applications: { total: number; pending: number; approved: number; rejected: number }
  landParcels: { total: number; available: number }
  payments: { totalRevenue: number; overdueCount: number }
  constructions: { active: number }
  grievances: { open: number }
}

interface RecentApplication {
  id: string
  applicationNumber: string
  projectName: string | null
  status: string
  createdAt: string
  applicant: { organizationName: string } | null
  landParcel: { plotId: string } | null
}

interface DashboardNotification {
  id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cls = (() => {
    switch (status) {
      case 'Approved': case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Submitted': case 'Under Review': case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  })()
  return <Badge variant="outline" className={cn('text-[10px] font-medium', cls)}>{status}</Badge>
}

// Compact stat card
function StatCard({ title, value, subtitle, icon: Icon, color, trend, trendValue }: {
  title: string; value: string | number; subtitle?: string
  icon: React.ElementType; color: string
  trend?: 'up' | 'down'; trendValue?: string
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-3 pb-2.5">
        <div className="flex items-center gap-3">
          <div className={cn('rounded-lg p-2 shrink-0', color)}>
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">{title}</p>
            <p className="text-lg font-bold tabular-nums tracking-tight mt-1 leading-none">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {trend === 'up' && <TrendingUp className="h-2.5 w-2.5 text-emerald-600" />}
              {trend === 'down' && <TrendingDown className="h-2.5 w-2.5 text-red-500" />}
              {subtitle && <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>}
              {trendValue && (
                <span className={cn('text-[10px] font-medium', trend === 'up' ? 'text-emerald-600' : 'text-red-500')}>
                  {trendValue}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Alert summary card (drill-down)
const MOCK_ALERTS = [
  { id: '1', severity: 'Critical', type: 'SLA Breach', description: 'APCRDA-2024-0008 breached SLA at Economic Review', application: 'APCRDA-2024-0008', details: { stage: 'Economic Review', slaDays: 7, daysOverdue: 3, assignedTo: 'K. Padmavathi' } },
  { id: '2', severity: 'High', type: 'Payment Overdue', description: 'Down payment for APCRDA-2024-0004 overdue by 15 days', application: 'APCRDA-2024-0004', details: { amountDue: '₹5,00,00,000', daysOverdue: 15, penaltyAccrued: '₹12,50,000' } },
  { id: '3', severity: 'High', type: 'Construction Delayed', description: 'Amaravati Tech Hub 30% behind schedule', application: 'APCRDA-2024-0002', details: { physicalProgress: '22%', expectedProgress: '52%', delayDays: 45 } },
]

function severityStyle(s: string) {
  if (s === 'Critical') return { bg: 'bg-red-50', border: 'border-l-red-500', badge: 'bg-red-100 text-red-700 border-red-200', icon: 'text-red-500' }
  if (s === 'High') return { bg: 'bg-orange-50', border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'text-orange-500' }
  if (s === 'Medium') return { bg: 'bg-amber-50', border: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'text-amber-500' }
  return { bg: 'bg-blue-50', border: 'border-l-blue-400', badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'text-blue-500' }
}

function AlertSummaryCard({ alert, onDrillDown }: { alert: typeof MOCK_ALERTS[0]; onDrillDown: () => void }) {
  const s = severityStyle(alert.severity)
  return (
    <div className={cn('rounded-md border border-l-3 p-2 cursor-pointer transition-all hover:shadow-sm', s.bg, s.border)} onClick={onDrillDown}>
      <div className="flex items-start gap-2">
        <AlertCircle className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', s.icon)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className={cn('text-[9px] py-0', s.badge)}>{alert.severity}</Badge>
            <span className="text-[9px] text-muted-foreground font-mono">{alert.application}</span>
          </div>
          <p className="text-[11px] mt-0.5 line-clamp-1">{alert.description}</p>
        </div>
        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
      </div>
    </div>
  )
}

const statusChartConfig = {
  approved: { label: 'Approved', color: 'oklch(0.62 0.17 160)' },
  pending: { label: 'Pending', color: 'oklch(0.72 0.16 75)' },
  rejected: { label: 'Rejected', color: 'oklch(0.60 0.20 25)' },
  other: { label: 'Other', color: 'oklch(0.85 0.01 260)' },
}

const pieConfig = {
  available: { label: 'Available', color: 'oklch(0.62 0.17 160)' },
  allotted: { label: 'Allotted', color: 'oklch(0.45 0.12 180)' },
}

const revenueTrend = [
  { month: 'Jul', revenue: 45 },
  { month: 'Aug', revenue: 62 },
  { month: 'Sep', revenue: 58 },
  { month: 'Oct', revenue: 89 },
  { month: 'Nov', revenue: 78 },
  { month: 'Dec', revenue: 95 },
]

const revenueConfig = {
  revenue: { label: 'Revenue (₹ Cr)', color: 'oklch(0.45 0.12 180)' },
}

function PlaceholderView({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
    </div>
  )
}

export function DashboardView() {
  const { view, navigateTo } = useAppLayout()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([])
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      if (data.success) {
        setStats(data.data.stats)
        setRecentApps(data.data.recentApplications)
        setNotifications(data.data.notifications)
      }
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (view === 'dashboard') { setLoading(true); fetchDashboard() }
  }, [view, fetchDashboard])

  if (view !== 'dashboard') {
    const placeholders: Record<Exclude<View, 'dashboard'>, { title: string; description: string }> = {
      applications: { title: 'Applications', description: 'View and manage land allotment applications, track status, and process approvals.' },
      'land-parcels': { title: 'Land Parcels', description: 'Browse and manage land parcels across zones, check availability and status.' },
      payments: { title: 'Payments', description: 'Track payments, manage invoices, process refunds and penalties.' },
      constructions: { title: 'Construction Monitoring', description: 'Monitor construction progress, track milestones, and ensure compliance.' },
      grievances: { title: 'Grievances', description: 'Handle investor grievances, track resolution, and manage appeals.' },
      users: { title: 'User Management', description: 'Manage system users, roles, and permissions.' },
    }
    const p = placeholders[view]
    return <PlaceholderView title={p.title} description={p.description} />
  }

  const barData = stats ? [
    { name: 'Approved', value: stats.applications.approved, fill: 'oklch(0.62 0.17 160)' },
    { name: 'Pending', value: stats.applications.pending, fill: 'oklch(0.72 0.16 75)' },
    { name: 'Rejected', value: stats.applications.rejected, fill: 'oklch(0.60 0.20 25)' },
    { name: 'Others', value: Math.max(0, stats.applications.total - stats.applications.approved - stats.applications.pending - stats.applications.rejected), fill: 'oklch(0.85 0.03 260)' },
  ] : []

  const pieData = stats ? [
    { name: 'Available', value: stats.landParcels.available, fill: 'oklch(0.62 0.17 160)' },
    { name: 'Allotted', value: stats.landParcels.total - stats.landParcels.available, fill: 'oklch(0.45 0.12 180)' },
  ] : []

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4"><Skeleton className="h-6 w-40" /></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-3"><Skeleton className="h-3 w-20 mb-1.5" /><Skeleton className="h-6 w-14" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  const alertCounts = { critical: 1, high: 2, medium: 2, low: 1 }

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      {/* Compact Header Row with Quick Actions */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold tracking-tight">Dashboard</h1>
          <p className="text-[11px] text-muted-foreground -mt-0.5">Real-time overview of applications, land, revenue and alerts</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => navigateTo('my-work-queue')}>
            <Clock className="h-3 w-3" /> My Queue
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => navigateTo('applications')}>
            <FileText className="h-3 w-3" /> New App
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => navigateTo('risk-alerts')}>
            <AlertTriangle className="h-3 w-3" />
            <Badge variant="destructive" className="h-4 min-w-4 px-1 text-[9px] rounded-full">
              {Object.values(alertCounts).reduce((a, b) => a + b, 0)}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 shrink-0">
        <StatCard
          title="Total Applications"
          value={stats?.applications.total ?? 0}
          subtitle={`${stats?.applications.pending ?? 0} pending`}
          icon={FileText}
          color="bg-gradient-to-br from-teal-500 to-teal-600"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Land Parcels"
          value={stats?.landParcels.total ?? 0}
          subtitle={`${stats?.landParcels.available ?? 0} available`}
          icon={LandPlot}
          color="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats?.payments.totalRevenue ?? 0)}
          subtitle={stats?.payments.overdueCount > 0 ? `${stats.payments.overdueCount} overdue` : 'On track'}
          icon={IndianRupee}
          color="bg-gradient-to-br from-violet-500 to-purple-600"
          trend={stats?.payments.overdueCount > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Active Projects"
          value={stats?.constructions.active ?? 0}
          subtitle={stats?.grievances.open > 0 ? `${stats.grievances.open} grievances` : 'No grievances'}
          icon={HardHat}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* Charts Row — 3 charts in one row */}
      <div className="grid gap-3 lg:grid-cols-3 shrink-0">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-semibold">Revenue Trend</CardTitle>
            <CardDescription className="text-[10px]">₹ Crores</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-3">
            <ChartContainer config={revenueConfig} className="h-[120px] w-full">
              <AreaChart data={revenueTrend} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.45 0.12 180)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.45 0.12 180)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.45 0.12 180)" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Applications by Status */}
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-semibold">Applications by Status</CardTitle>
            <CardDescription className="text-[10px]">Distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-3">
            <ChartContainer config={statusChartConfig} className="h-[120px] w-full">
              <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Land Availability Pie */}
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-semibold">Land Availability</CardTitle>
            <CardDescription className="text-[10px]">Parcels by status</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-3 flex items-center justify-center">
            <ChartContainer config={pieConfig} className="h-[120px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={48}
                  strokeWidth={2}
                  stroke="white"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Apps + Risk Alerts — fills remaining space */}
      <div className="grid gap-3 lg:grid-cols-2 min-h-0 flex-1">
        {/* Recent Applications */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2 pt-3 px-3 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-1.5" onClick={() => navigateTo('applications')}>
                View all <ArrowRight className="h-2.5 w-2.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-1.5">
              {recentApps.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No applications yet</p>
              ) : (
                recentApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between gap-2 rounded-md border p-2 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigateTo('application-detail', { id: app.id })}>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium truncate">{app.projectName || app.applicationNumber}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {app.applicant?.organizationName}{app.landParcel ? ` · ${app.landParcel.plotId}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <StatusBadge status={app.status} />
                      <span className="text-[9px] text-muted-foreground">{formatDate(app.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2 pt-3 px-3 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold">Risk Alerts</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-1.5" onClick={() => navigateTo('risk-alerts')}>
                View all <ArrowRight className="h-2.5 w-2.5" />
              </Button>
            </div>
            {/* Severity counts */}
            <div className="flex gap-1.5 mt-1">
              {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => {
                const counts: Record<string, number> = { Critical: 1, High: 2, Medium: 2, Low: 1 }
                const styles: Record<string, string> = {
                  Critical: 'bg-red-100 text-red-700',
                  High: 'bg-orange-100 text-orange-700',
                  Medium: 'bg-amber-100 text-amber-700',
                  Low: 'bg-blue-100 text-blue-700',
                }
                return (
                  <div key={sev} className={cn('flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium', styles[sev])}>
                    {counts[sev]} {sev}
                  </div>
                )
              })}
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-1.5">
              {MOCK_ALERTS.map((alert) => (
                <div key={alert.id}>
                  <AlertSummaryCard
                    alert={alert}
                    onDrillDown={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                  />
                  {expandedAlert === alert.id && (
                    <div className="mt-1.5 ml-3 rounded-md bg-muted/50 border p-2 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.entries(alert.details).map(([key, val]) => (
                          <div key={key} className="rounded bg-background p-1.5">
                            <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider leading-none">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-[11px] font-medium mt-0.5">{String(val)}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-6 text-[10px] gap-1"
                        onClick={(e) => { e.stopPropagation(); navigateTo('risk-alerts') }}
                      >
                        Open in Risk & Alerts <ArrowRight className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}