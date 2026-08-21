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
  AlertTriangle, ArrowRight, Zap, ChevronRight, AlertCircle,
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
  return <Badge variant="outline" className={cn('text-[11px] font-medium', cls)}>{status}</Badge>
}

// Vibrant colored stat card
function StatCard({ title, value, subtitle, icon: Icon, gradient, trend, trendValue }: {
  title: string; value: string | number; subtitle?: string
  icon: React.ElementType; gradient: string
  trend?: 'up' | 'down'; trendValue?: string
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className={cn('h-1', gradient)} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5">
              {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-600" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
              {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
              {trendValue && (
                <span className={cn('text-[11px] font-medium', trend === 'up' ? 'text-emerald-600' : 'text-red-500')}>
                  {trendValue}
                </span>
              )}
            </div>
          </div>
          <div className={cn('rounded-xl p-2.5 bg-gradient-to-br shadow-sm', gradient.replace('from-', 'from-/15 ').replace('to-', 'to-/10 '))}>
            <div className={cn('rounded-lg p-2', gradient.replace('from-', 'bg-').split(' ')[0])}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact stat pill
function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-3 bg-card">
      <div className={cn('h-2 w-2 rounded-full', color)} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
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
    <div className={cn('rounded-lg border border-l-4 p-3 cursor-pointer transition-all hover:shadow-sm', s.bg, s.border)} onClick={onDrillDown}>
      <div className="flex items-start gap-2.5">
        <AlertCircle className={cn('h-4 w-4 mt-0.5 shrink-0', s.icon)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className={cn('text-[10px]', s.badge)}>{alert.severity}</Badge>
            <span className="text-[10px] text-muted-foreground font-mono">{alert.application}</span>
          </div>
          <p className="text-xs mt-1 line-clamp-1">{alert.description}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-primary font-medium">
            View details <ChevronRight className="h-3 w-3" />
          </div>
        </div>
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

// Mock revenue trend data
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

const quickActions = [
  { label: 'New Application', icon: FileText, color: 'from-teal-500 to-emerald-600', view: 'applications' as View },
  { label: 'Land Inventory', icon: LandPlot, color: 'from-emerald-500 to-green-600', view: 'land-parcels' as View },
  { label: 'Workflow Board', icon: Activity, color: 'from-violet-500 to-purple-600', view: 'workflow-kanban' as View },
  { label: 'My Work Queue', icon: Clock, color: 'from-amber-500 to-orange-600', view: 'my-work-queue' as View },
]

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

  // Chart data
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
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  const alertCounts = { critical: 1, high: 2, medium: 2, low: 1 }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 p-5 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Welcome to Land Quantum</h1>
            <p className="text-sm text-teal-100 mt-0.5">Monitor applications, land assets, revenue and alerts in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm gap-1.5" onClick={() => navigateTo('my-work-queue')}>
              <Zap className="h-3.5 w-3.5" /> My Queue
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm gap-1.5" onClick={() => navigateTo('risk-alerts')}>
              <AlertTriangle className="h-3.5 w-3.5" /> Alerts ({Object.values(alertCounts).reduce((a,b)=>a+b,0)})
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards - Vibrant Gradient Top Border */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={stats?.applications.total ?? 0}
          subtitle={`${stats?.applications.pending ?? 0} pending review`}
          icon={FileText}
          gradient="from-teal-500 to-teal-600"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Land Parcels"
          value={stats?.landParcels.total ?? 0}
          subtitle={`${stats?.landParcels.available ?? 0} available`}
          icon={LandPlot}
          gradient="from-emerald-500 to-green-600"
        />
        <StatCard
          title="Revenue Collected"
          value={formatCurrency(stats?.payments.totalRevenue ?? 0)}
          subtitle={stats?.payments.overdueCount > 0 ? `${stats.payments.overdueCount} overdue` : 'All on track'}
          icon={IndianRupee}
          gradient="from-violet-500 to-purple-600"
          trend={stats?.payments.overdueCount > 0 ? 'down' : 'up'}
          trendValue={stats?.payments.overdueCount > 0 ? `${stats.payments.overdueCount} late` : '+8%'}
        />
        <StatCard
          title="Active Projects"
          value={stats?.constructions.active ?? 0}
          subtitle={stats?.grievances.open > 0 ? `${stats.grievances.open} open grievances` : 'No grievances'}
          icon={HardHat}
          gradient="from-amber-500 to-orange-600"
          trend={stats?.grievances.open > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Quick Actions + Mini Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.view}
              variant="outline"
              className="h-auto w-full justify-start gap-2.5 p-3 hover:bg-muted/50"
              onClick={() => navigateTo(action.view)}
            >
              <div className={cn('rounded-lg p-1.5 bg-gradient-to-br text-white', action.color)}>
                <action.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
            </Button>
          ))}
        </div>

        {/* Revenue Trend Chart */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
            <CardDescription>Monthly collection overview (₹ Crores)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={revenueConfig} className="h-[160px] w-full">
              <AreaChart data={revenueTrend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.45 0.12 180)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.45 0.12 180)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.45 0.12 180)" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="Approved" value={stats?.applications.approved ?? 0} color="bg-emerald-500" />
          <MiniStat label="Pending" value={stats?.applications.pending ?? 0} color="bg-amber-500" />
          <MiniStat label="Rejected" value={stats?.applications.rejected ?? 0} color="bg-red-500" />
          <MiniStat label="Grievances" value={stats?.grievances.open ?? 0} color="bg-rose-500" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Applications by Status</CardTitle>
            <CardDescription>Distribution of application statuses</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={statusChartConfig} className="h-[220px] w-full">
              <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Land Availability</CardTitle>
            <CardDescription>Parcels by status</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex items-center justify-center">
            <ChartContainer config={pieConfig} className="h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={3}
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

      {/* Bottom Row: Recent Apps + Alert Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Recent Applications</CardTitle>
                <CardDescription>Latest land allotment applications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigateTo('applications')}>
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentApps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No applications yet</p>
              ) : (
                recentApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigateTo('application-detail', { id: app.id })}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{app.projectName || app.applicationNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.applicant?.organizationName}{app.landParcel ? ` · Plot ${app.landParcel.plotId}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={app.status} />
                      <span className="text-[10px] text-muted-foreground">{formatDate(app.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert Summary — replaces Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Risk Alerts</CardTitle>
                <CardDescription>Critical items needing attention</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigateTo('risk-alerts')}>
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Severity counts */}
            <div className="flex gap-2 mb-3">
              {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => {
                const counts: Record<string, number> = { Critical: 1, High: 2, Medium: 2, Low: 1 }
                const styles: Record<string, string> = {
                  Critical: 'bg-red-100 text-red-700',
                  High: 'bg-orange-100 text-orange-700',
                  Medium: 'bg-amber-100 text-amber-700',
                  Low: 'bg-blue-100 text-blue-700',
                }
                return (
                  <div key={sev} className={cn('flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium', styles[sev])}>
                    {counts[sev]} {sev}
                  </div>
                )
              })}
            </div>

            {/* Alert cards */}
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {MOCK_ALERTS.map((alert) => (
                <div key={alert.id}>
                  <AlertSummaryCard
                    alert={alert}
                    onDrillDown={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                  />
                  {expandedAlert === alert.id && (
                    <div className="mt-2 ml-4 rounded-lg bg-muted/50 border p-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(alert.details).map(([key, val]) => (
                          <div key={key} className="rounded-md bg-background p-2">
                            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-xs font-medium mt-0.5">{String(val)}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-[11px] gap-1"
                        onClick={(e) => { e.stopPropagation(); navigateTo('risk-alerts') }}
                      >
                        Open in Risk & Alerts <ArrowRight className="h-3 w-3" />
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