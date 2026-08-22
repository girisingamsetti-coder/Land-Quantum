'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppLayout, type View } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Cell, PieChart, Pie, AreaChart, Area, ComposedChart, Line, Legend } from 'recharts'
import {
  FileText, LandPlot, IndianRupee, HardHat,
  TrendingUp, TrendingDown, Clock,
  AlertTriangle, ArrowRight, ChevronRight, AlertCircle,
  ClipboardCheck, LayoutList, ShieldCheck, BadgeCheck, Award, Handshake, PackageCheck,
  Search, Download, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft,
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
  { id: '2', severity: 'High', type: 'Payment Overdue', description: 'Down payment for APCRDA-2024-0004 overdue by 15 days', application: 'APCRDA-2024-0004', details: { amountDue: 'â‚¹5,00,00,000', daysOverdue: 15, penaltyAccrued: 'â‚¹12,50,000' } },
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
  revenue: { label: 'Revenue (â‚¹ Cr)', color: 'oklch(0.45 0.12 180)' },
}

// â”€â”€â”€ Pipeline Stage Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface PipelineStat { count: number; pct: number; steps?: number }
interface PipelineStage {
  id: string; title: string; description: string; icon: React.ElementType; total: number
  inProgress: PipelineStat; approved: PipelineStat; revision: PipelineStat; rejected: PipelineStat
  extra?: { label: string; count: number }
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'app',  title: 'Applications & eligibility', description: 'Application intake and qualification',     icon: ClipboardCheck, total: 41, inProgress: { count: 2, pct: 4.8,  steps: 2 }, approved: { count: 39, pct: 95.1 }, revision: { count: 0, pct: 0 },   rejected: { count: 0, pct: 0 } },
  { id: 'dpr',  title: 'DPR review',                 description: 'Technical project scrutiny',              icon: LayoutList,     total: 20, inProgress: { count: 2, pct: 10.0 },           approved: { count: 17, pct: 85.0 }, revision: { count: 1, pct: 5.0 }, rejected: { count: 0, pct: 0 } },
  { id: 'eco',  title: 'Economic review',            description: 'Investment, jobs, and sector fit',          icon: TrendingUp,     total: 17, inProgress: { count: 1, pct: 5.9  },           approved: { count: 16, pct: 94.1 }, revision: { count: 0, pct: 0 },   rejected: { count: 0, pct: 0 } },
  { id: 'lasc', title: 'LASC scrutiny',              description: 'Site, title, and committee recommendation', icon: ShieldCheck,    total: 18, inProgress: { count: 1, pct: 5.6  },           approved: { count: 14, pct: 77.8 }, revision: { count: 2, pct: 11.1 }, rejected: { count: 1, pct: 5.6 } },
  { id: 'govt', title: 'Government approvals',       description: 'GoM, Authority, and Cabinet gates',        icon: BadgeCheck,     total: 44, inProgress: { count: 4, pct: 9.1,  steps: 5 }, approved: { count: 39, pct: 88.6 }, revision: { count: 0, pct: 0 },   rejected: { count: 0, pct: 0 }, extra: { label: 'Deferred', count: 1 } },
  { id: 'ord',  title: 'Order & offer',              description: 'Government Order and Letter of intent',     icon: Award,          total: 20, inProgress: { count: 1, pct: 5.0,  steps: 2 }, approved: { count: 18, pct: 90.0 }, revision: { count: 0, pct: 0 },   rejected: { count: 0, pct: 0 }, extra: { label: 'Expired', count: 1 } },
  { id: 'pay',  title: 'Payment & agreement',        description: 'Financial close and registered agreement',  icon: Handshake,      total: 21, inProgress: { count: 3, pct: 14.3, steps: 3 }, approved: { count: 18, pct: 85.7 }, revision: { count: 0, pct: 0 },   rejected: { count: 0, pct: 0 } },
  { id: 'hand', title: 'Handover & compliance',      description: 'Possession, construction, and closure',    icon: PackageCheck,   total: 14, inProgress: { count: 3, pct: 21.4, steps: 4 }, approved: { count: 11, pct: 78.6 }, revision: { count: 0, pct: 0 },   rejected: { count: 0, pct: 0 } },
]

function PipelineCard({ stage }: { stage: PipelineStage }) {
  const Icon = stage.icon
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start gap-2 mb-4.5">
          <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 shrink-0"><Icon className="h-3.5 w-3.5 text-primary" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] font-semibold leading-tight truncate">{stage.title}</p>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-base font-bold tabular-nums text-primary">{stage.total}</span>
                <span className="text-[9px] text-muted-foreground leading-tight">stage<br />records</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">{stage.description}</p>
          </div>
        </div>
        {/* Segmented progress bar */}
        <div className="flex h-1.5 w-full rounded-full overflow-hidden gap-px mt-2 mb-4">
          {stage.inProgress.pct > 0 && <div className="bg-blue-500"    style={{ width: `${stage.inProgress.pct}%` }} />}
          {stage.approved.pct > 0   && <div className="bg-emerald-500" style={{ width: `${stage.approved.pct}%`   }} />}
          {stage.revision.pct > 0   && <div className="bg-amber-400"   style={{ width: `${stage.revision.pct}%`   }} />}
          {stage.rejected.pct > 0   && <div className="bg-red-500"     style={{ width: `${stage.rejected.pct}%`   }} />}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <div>
            <p className="text-[11px] font-semibold tabular-nums">{stage.inProgress.count}</p>
            <p className="text-[9px] text-muted-foreground leading-tight"><span className="text-blue-600 font-medium">({stage.inProgress.pct}%)</span><br />In progress{stage.inProgress.steps ? ` across ${stage.inProgress.steps} steps` : ''}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tabular-nums text-emerald-600">{stage.approved.count}</p>
            <p className="text-[9px] text-muted-foreground leading-tight"><span className="text-emerald-600 font-medium">({stage.approved.pct}%)</span><br />Approved / completed</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tabular-nums">{stage.revision.count}</p>
            <p className="text-[9px] text-muted-foreground leading-tight">Sent for<br />revision</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tabular-nums text-red-600">{stage.rejected.count}</p>
            <p className="text-[9px] text-muted-foreground leading-tight">Rejected</p>
          </div>
          {stage.extra && (
            <div>
              <p className="text-[11px] font-semibold tabular-nums text-orange-600">{stage.extra.count}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{stage.extra.label}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// â”€â”€â”€ New Chart Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const liveCasesConfig = { onTime: { label: 'On time', color: '#22c55e' }, late: { label: 'Late', color: '#ef4444' } }
const liveCasesData = [
  { step: '1', onTime: 3, late: 0 }, { step: '1a', onTime: 2, late: 1 }, { step: '2', onTime: 1, late: 1 },
  { step: '3', onTime: 2, late: 0 }, { step: '4', onTime: 1, late: 0 }, { step: '5a', onTime: 2, late: 0 },
  { step: '6', onTime: 1, late: 0 }, { step: '7', onTime: 2, late: 0 }, { step: '8', onTime: 1, late: 0 },
  { step: '9', onTime: 1, late: 0 }, { step: '10', onTime: 2, late: 0 }, { step: '11', onTime: 1, late: 0 },
  { step: '12', onTime: 1, late: 0 }, { step: '13', onTime: 2, late: 0 }, { step: '14', onTime: 1, late: 0 }, { step: '15', onTime: 1, late: 0 },
]
const funnelData = [
  { stage: 'Applying', count: 21, pct: 100 }, { stage: 'Getting approved', count: 19, pct: 90 },
  { stage: 'Making it official', count: 10, pct: 48 }, { stage: 'Building & checking', count: 4, pct: 19 },
]
const decisionsConfig = { passed: { label: 'Passed', color: '#22c55e' }, sentBack: { label: 'Sent back', color: '#f59e0b' }, refused: { label: 'Refused', color: '#ef4444' } }
const decisionsData = [
  { month: 'Sep', passed: 4, sentBack: 1, refused: 0 }, { month: 'Oct', passed: 5, sentBack: 2, refused: 1 },
  { month: 'Nov', passed: 3, sentBack: 1, refused: 0 }, { month: 'Dec', passed: 6, sentBack: 0, refused: 0 },
  { month: 'Jan', passed: 4, sentBack: 2, refused: 1 }, { month: 'Feb', passed: 5, sentBack: 1, refused: 0 },
  { month: 'Mar', passed: 7, sentBack: 1, refused: 0 }, { month: 'Apr', passed: 4, sentBack: 2, refused: 1 },
  { month: 'May', passed: 6, sentBack: 0, refused: 0 }, { month: 'Jun', passed: 5, sentBack: 1, refused: 0 },
  { month: 'Jul', passed: 8, sentBack: 1, refused: 1 }, { month: 'Aug', passed: 6, sentBack: 2, refused: 0 },
]
const moneyConfig = { billed: { label: 'Billed (â‚¹ Cr)', color: '#6366f1' }, collected: { label: 'Collected (â‚¹ Cr)', color: '#22c55e' } }
const moneyData = [
  { month: 'Sep', billed: 120, collected: 100 }, { month: 'Oct', billed: 150, collected: 130 },
  { month: 'Nov', billed: 90,  collected: 85  }, { month: 'Dec', billed: 200, collected: 180 },
  { month: 'Jan', billed: 170, collected: 140 }, { month: 'Feb', billed: 130, collected: 125 },
  { month: 'Mar', billed: 220, collected: 200 }, { month: 'Apr', billed: 160, collected: 150 },
  { month: 'May', billed: 190, collected: 170 }, { month: 'Jun', billed: 140, collected: 135 },
  { month: 'Jul', billed: 250, collected: 210 }, { month: 'Aug', billed: 180, collected: 165 },
]
const investmentConfig = { amount: { label: 'Investment (â‚¹ Cr)', color: 'oklch(0.45 0.12 180)' } }
const investmentData = [
  { sector: 'IT & Electronics', amount: 4800 }, { sector: 'Manufacturing', amount: 3600 },
  { sector: 'Pharmaceuticals',  amount: 2900 }, { sector: 'Logistics',     amount: 2200 },
  { sector: 'Food Processing',  amount: 1800 }, { sector: 'Textiles',      amount: 1200 },
  { sector: 'Renewable Energy', amount: 900  },
]

function TrendWindowSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-4.5 bg-muted rounded-md p-0.5">
      {['12M', '6M', '3M'].map((w) => (
        <button key={w} onClick={() => onChange(w)}
          className={cn('px-2 py-0.5 rounded text-[10px] font-medium transition-colors', value === w ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
          {w}
        </button>
      ))}
    </div>
  )
}

function FunnelBar({ stage, count, pct }: { stage: string; count: number; pct: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium">{stage}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tabular-nums">{count}</span>
          <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}


// â”€â”€â”€ Records Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface CaseRecord {
  id: string; applicant: string; sector: string; themeCity: string; plot: string
  step: string; status: 'In progress' | 'Turned down' | 'Approved' | 'Withdrawn'
  investment: string; investmentNum: number; jobs: number; acres: number; ageDays: number
  expectedBy: string; isLate: boolean; applied: string
}

const ALL_CASES: CaseRecord[] = [
  { id: 'APCRDA/LA/2026/0001', applicant: 'Vajra Technologies Pvt Ltd',        sector: 'Information Technology',   themeCity: 'Knowledge City',       plot: 'KC-01', step: '1 â€“ Investor applies',           status: 'In progress', investment: 'â‚¹680 Cr',   investmentNum: 680,  jobs: 4200, acres: 19, ageDays: 23,  expectedBy: '02 Sept 2026', isLate: false, applied: '29 Jul 2026'  },
  { id: 'APCRDA/LA/2026/0002', applicant: 'Kaveri Media Networks Pvt Ltd',     sector: 'Media & Entertainment',    themeCity: 'Media City',           plot: 'MC-01', step: '1a â€“ Is the applicant eligible?', status: 'In progress', investment: 'â‚¹310 Cr',   investmentNum: 310,  jobs: 900,  acres: 15, ageDays: 42,  expectedBy: '25 Aug 2026', isLate: false, applied: '10 Jul 2026'  },
  { id: 'APCRDA/LA/2026/0003', applicant: 'Bharat Electronics Systems Ltd',    sector: 'Electronics Manufacturing', themeCity: 'Electronics City',     plot: 'EC-01', step: '2 â€“ Project plan reviewed',      status: 'In progress', investment: 'â‚¹1,450 Cr', investmentNum: 1450, jobs: 6800, acres: 45, ageDays: 97,  expectedBy: '08 Sept 2026', isLate: false, applied: '18 May 2026'  },
  { id: 'APCRDA/LA/2026/0005', applicant: 'Global Skills Alliance (India JV)', sector: 'Education & Skilling',     themeCity: 'Knowledge City',       plot: 'KC-03', step: '3 â€“ Economic benefit checked',    status: 'In progress', investment: 'â‚¹210 Cr',   investmentNum: 210,  jobs: 640,  acres: 5,  ageDays: 119, expectedBy: '01 Sept 2026', isLate: false, applied: '24 Apr 2026'  },
  { id: 'APCRDA/LA/2026/0004', applicant: 'Deccan Logistics & Warehousing',    sector: 'Logistics & Warehousing',  themeCity: 'Electronics City',     plot: 'EC-03', step: '2 â€“ Project plan reviewed',      status: 'In progress', investment: 'â‚¹120 Cr',   investmentNum: 120,  jobs: 380,  acres: 7,  ageDays: 131, expectedBy: '08 Aug 2026',  isLate: true,  applied: '12 Apr 2026'  },
  { id: 'APCRDA/LA/2026/0006', applicant: 'Nirmaan Health Partners LLP',       sector: 'Healthcare & Life Sciences',themeCity: 'Health City',          plot: 'HC-01', step: '4 â€“ Committee scrutiny',          status: 'In progress', investment: 'â‚¹540 Cr',   investmentNum: 540,  jobs: 1900, acres: 28, ageDays: 177, expectedBy: '08 Sept 2026', isLate: false, applied: '25 Feb 2026'  },
  { id: 'APCRDA/LA/2025/0007', applicant: 'Sunrise Sports Ventures Pvt Ltd',  sector: 'Sports & Recreation',      themeCity: 'Sports City',          plot: 'SC-01', step: '5 â€“ Ministers clear it',          status: 'In progress', investment: 'â‚¹390 Cr',   investmentNum: 390,  jobs: 720,  acres: 54, ageDays: 213, expectedBy: '17 Sept 2026', isLate: false, applied: '20 Jan 2026'  },
  { id: 'APCRDA/LA/2025/0008', applicant: 'AP Judicial Infrastructure Society',sector: 'Legal & Judiciary',        themeCity: 'Justice City',         plot: 'JC-01', step: '5a â€“ Sub-committee opinion',     status: 'In progress', investment: 'â‚¹160 Cr',   investmentNum: 160,  jobs: 240,  acres: 8,  ageDays: 239, expectedBy: '08 Sept 2026', isLate: false, applied: '25 Dec 2025'  },
  { id: 'APCRDA/LA/2025/0009', applicant: 'Sristi Financial Services Ltd',     sector: 'Financial Services',       themeCity: 'Financial City',       plot: 'FC-01', step: '6 â€“ Authority approves',         status: 'In progress', investment: 'â‚¹890 Cr',   investmentNum: 890,  jobs: 3100, acres: 7,  ageDays: 255, expectedBy: '08 Sept 2026', isLate: false, applied: '09 Dec 2025'  },
  { id: 'APCRDA/LA/2025/0011', applicant: 'Amaravati Education Foundation',    sector: 'Education & Skilling',     themeCity: 'Knowledge City',       plot: 'KC-02', step: '4 â€“ Committee scrutiny',          status: 'Turned down', investment: 'â‚¹430 Cr',   investmentNum: 430,  jobs: 850,  acres: 32, ageDays: 263, expectedBy: 'â€”',           isLate: false, applied: '01 Dec 2025'  },
  { id: 'APCRDA/LA/2025/0010', applicant: 'Krishna Hospitality Group Pvt Ltd', sector: 'Tourism & Hospitality',    themeCity: 'Tourism City',         plot: 'TC-01', step: '7 â€“ Cabinet approves',            status: 'In progress', investment: 'â‚¹720 Cr',   investmentNum: 720,  jobs: 1800, acres: 22, ageDays: 287, expectedBy: '17 Sept 2026', isLate: false, applied: '07 Nov 2025'  },
  { id: 'APCRDA/LA/2025/0012', applicant: 'Vajra Technologies Pvt Ltd',        sector: 'Information Technology',   themeCity: 'Electronics City',     plot: 'EC-02', step: '9 â€“ Offer letter',               status: 'In progress', investment: 'â‚¹560 Cr',   investmentNum: 560,  jobs: 1100, acres: 12, ageDays: 319, expectedBy: '16 Nov 2026', isLate: false, applied: '06 Oct 2025'  },
  { id: 'APCRDA/LA/2025/0013', applicant: 'Greenfield Power & Energy Ltd',     sector: 'Renewable Energy',         themeCity: 'Electronics City',     plot: 'EC-04', step: '8 â€“ Agreement signed',            status: 'In progress', investment: 'â‚¹1,100 Cr', investmentNum: 1100, jobs: 2400, acres: 68, ageDays: 341, expectedBy: '05 Dec 2026', isLate: false, applied: '15 Sep 2025'  },
  { id: 'APCRDA/LA/2025/0014', applicant: 'Deccan Pharma Research Pvt Ltd',    sector: 'Pharmaceuticals',          themeCity: 'Health City',          plot: 'HC-02', step: '6 â€“ Authority approves',         status: 'Approved',    investment: 'â‚¹670 Cr',   investmentNum: 670,  jobs: 2200, acres: 18, ageDays: 368, expectedBy: '10 Oct 2026', isLate: false, applied: '20 Aug 2025'  },
  { id: 'APCRDA/LA/2025/0015', applicant: 'Vizag Fisheries Co-operative',      sector: 'Agro & Food Processing',   themeCity: 'Knowledge City',       plot: 'KC-04', step: '3 â€“ Economic benefit checked',    status: 'In progress', investment: 'â‚¹85 Cr',    investmentNum: 85,   jobs: 420,  acres: 11, ageDays: 389, expectedBy: '30 Nov 2026', isLate: false, applied: '30 Jul 2025'  },
  { id: 'APCRDA/LA/2025/0016', applicant: 'National Skill Corp Ltd',           sector: 'Education & Skilling',     themeCity: 'Knowledge City',       plot: 'KC-05', step: '5 â€“ Ministers clear it',          status: 'In progress', investment: 'â‚¹195 Cr',   investmentNum: 195,  jobs: 560,  acres: 9,  ageDays: 402, expectedBy: '12 Jan 2027', isLate: false, applied: '17 Jul 2025'  },
  { id: 'APCRDA/LA/2024/0017', applicant: 'Coastal Tourism Pvt Ltd',           sector: 'Tourism & Hospitality',    themeCity: 'Tourism City',         plot: 'TC-02', step: '7 â€“ Cabinet approves',            status: 'In progress', investment: 'â‚¹340 Cr',   investmentNum: 340,  jobs: 980,  acres: 35, ageDays: 421, expectedBy: '28 Feb 2027', isLate: false, applied: '28 Jun 2025'  },
  { id: 'APCRDA/LA/2024/0018', applicant: 'Smart Grid Solutions Ltd',          sector: 'Renewable Energy',         themeCity: 'Electronics City',     plot: 'EC-05', step: '8 â€“ Agreement signed',            status: 'Approved',    investment: 'â‚¹480 Cr',   investmentNum: 480,  jobs: 1350, acres: 25, ageDays: 445, expectedBy: '15 Mar 2027', isLate: false, applied: '04 Jun 2025'  },
  { id: 'APCRDA/LA/2024/0019', applicant: 'AP Digital Hub Pvt Ltd',            sector: 'Information Technology',   themeCity: 'Knowledge City',       plot: 'KC-06', step: '9 â€“ Offer letter',               status: 'In progress', investment: 'â‚¹920 Cr',   investmentNum: 920,  jobs: 5100, acres: 31, ageDays: 467, expectedBy: '20 Apr 2027', isLate: false, applied: '13 May 2025'  },
  { id: 'APCRDA/LA/2024/0020', applicant: 'Andhra Auto Components Ltd',        sector: 'Electronics Manufacturing', themeCity: 'Electronics City',     plot: 'EC-06', step: '10 â€“ Allotment order',            status: 'Withdrawn',   investment: 'â‚¹275 Cr',   investmentNum: 275,  jobs: 730,  acres: 14, ageDays: 488, expectedBy: 'â€”',           isLate: false, applied: '22 Apr 2025'  },
  { id: 'APCRDA/LA/2024/0021', applicant: 'Sunrise Textiles & Fibre Pvt Ltd',  sector: 'Textiles & Apparel',       themeCity: 'Electronics City',     plot: 'EC-07', step: '6 â€“ Authority approves',         status: 'In progress', investment: 'â‚¹155 Cr',   investmentNum: 155,  jobs: 610,  acres: 16, ageDays: 512, expectedBy: '01 Jun 2027', isLate: false, applied: '01 Apr 2025'  },
]

// ─── Tab Data ──────────────────────────────────────────────────────────────

interface DateEvent { id: string; caseId: string; applicant: string; event: string; date: string; daysAway: number; stage: string; priority: 'High' | 'Medium' | 'Low' }
const DATES_DATA: DateEvent[] = [
  { id: '1',  caseId: 'APCRDA/LA/2026/0002', applicant: 'Kaveri Media Networks Pvt Ltd',     event: 'SLA deadline – eligibility decision',     date: '25 Aug 2026',  daysAway: 3,   stage: '1a – Eligibility',     priority: 'High'   },
  { id: '2',  caseId: 'APCRDA/LA/2026/0004', applicant: 'Deccan Logistics & Warehousing',    event: 'Payment overdue – down payment',           date: '08 Aug 2026',  daysAway: -14, stage: 'Payment',               priority: 'High'   },
  { id: '3',  caseId: 'APCRDA/LA/2026/0001', applicant: 'Vajra Technologies Pvt Ltd',        event: 'GoM review scheduled',                     date: '02 Sept 2026', daysAway: 11,  stage: 'Govt. approval',        priority: 'High'   },
  { id: '4',  caseId: 'APCRDA/LA/2026/0003', applicant: 'Bharat Electronics Systems Ltd',   event: 'DPR technical review deadline',            date: '08 Sept 2026', daysAway: 17,  stage: '2 – DPR Review',       priority: 'Medium' },
  { id: '5',  caseId: 'APCRDA/LA/2026/0005', applicant: 'Global Skills Alliance (India JV)', event: 'Economic benefit report submission',       date: '01 Sept 2026', daysAway: 10,  stage: '3 – Economic review',  priority: 'Medium' },
  { id: '6',  caseId: 'APCRDA/LA/2026/0006', applicant: 'Nirmaan Health Partners LLP',      event: 'LASC committee meeting',                   date: '08 Sept 2026', daysAway: 17,  stage: '4 – LASC scrutiny',    priority: 'Medium' },
  { id: '7',  caseId: 'APCRDA/LA/2025/0007', applicant: 'Sunrise Sports Ventures Pvt Ltd', event: 'Minister’s clearance hearing',             date: '17 Sept 2026', daysAway: 26,  stage: '5 – Govt. approval',   priority: 'High'   },
  { id: '8',  caseId: 'APCRDA/LA/2025/0008', applicant: 'AP Judicial Infrastructure Society', event: 'Sub-committee report due',               date: '08 Sept 2026', daysAway: 17,  stage: '5a – Sub-committee',   priority: 'Medium' },
  { id: '9',  caseId: 'APCRDA/LA/2025/0009', applicant: 'Sristi Financial Services Ltd',    event: 'Authority board approval',                date: '08 Sept 2026', daysAway: 17,  stage: '6 – Authority',        priority: 'High'   },
  { id: '10', caseId: 'APCRDA/LA/2025/0010', applicant: 'Krishna Hospitality Group Pvt Ltd', event: 'Cabinet agenda submission deadline',     date: '17 Sept 2026', daysAway: 26,  stage: '7 – Cabinet',          priority: 'Medium' },
  { id: '11', caseId: 'APCRDA/LA/2025/0012', applicant: 'Vajra Technologies Pvt Ltd',       event: 'Offer letter acceptance deadline',         date: '16 Nov 2026',  daysAway: 86,  stage: '9 – Offer letter',     priority: 'Low'    },
  { id: '12', caseId: 'APCRDA/LA/2025/0013', applicant: 'Greenfield Power & Energy Ltd',    event: 'Agreement signing ceremony',               date: '05 Dec 2026',  daysAway: 105, stage: '8 – Agreement',        priority: 'Medium' },
  { id: '13', caseId: 'APCRDA/LA/2025/0015', applicant: 'Vizag Fisheries Co-operative',     event: 'Economic review panel session',           date: '30 Nov 2026',  daysAway: 100, stage: '3 – Economic review',  priority: 'Low'    },
  { id: '14', caseId: 'APCRDA/LA/2025/0016', applicant: 'National Skill Corp Ltd',          event: 'Minister’s clearance – rescheduled',      date: '12 Jan 2027',  daysAway: 143, stage: '5 – Govt. approval',   priority: 'Low'    },
  { id: '15', caseId: 'APCRDA/LA/2024/0017', applicant: 'Coastal Tourism Pvt Ltd',          event: 'Cabinet review – Q1 2027 slot',           date: '28 Feb 2027',  daysAway: 190, stage: '7 – Cabinet',          priority: 'Low'    },
  { id: '16', caseId: 'APCRDA/LA/2024/0019', applicant: 'AP Digital Hub Pvt Ltd',           event: 'Offer letter issuance target',             date: '20 Apr 2027',  daysAway: 241, stage: '9 – Offer letter',     priority: 'Low'    },
  { id: '17', caseId: 'APCRDA/LA/2026/0003', applicant: 'Bharat Electronics Systems Ltd',   event: 'Site inspection scheduled',                date: '12 Sept 2026', daysAway: 21,  stage: '2 – DPR Review',       priority: 'Medium' },
  { id: '18', caseId: 'APCRDA/LA/2026/0006', applicant: 'Nirmaan Health Partners LLP',      event: 'Environmental clearance renewal',          date: '22 Sept 2026', daysAway: 31,  stage: 'Compliance',            priority: 'High'   },
  { id: '19', caseId: 'APCRDA/LA/2025/0009', applicant: 'Sristi Financial Services Ltd',    event: 'Board resolution submission',              date: '25 Aug 2026',  daysAway: 3,   stage: '6 – Authority',        priority: 'High'   },
  { id: '20', caseId: 'APCRDA/LA/2025/0007', applicant: 'Sunrise Sports Ventures Pvt Ltd',  event: 'Final compliance certificate',            date: '30 Sept 2026', daysAway: 39,  stage: 'Compliance',            priority: 'Medium' },
  { id: '21', caseId: 'APCRDA/LA/2024/0018', applicant: 'Smart Grid Solutions Ltd',         event: 'Possession handover date',                date: '15 Mar 2027',  daysAway: 205, stage: 'Handover',              priority: 'Low'    },
  { id: '22', caseId: 'APCRDA/LA/2025/0014', applicant: 'Deccan Pharma Research Pvt Ltd',   event: 'Allotment order publication',             date: '10 Oct 2026',  daysAway: 49,  stage: '10 – Allotment order', priority: 'Medium' },
  { id: '23', caseId: 'APCRDA/LA/2026/0001', applicant: 'Vajra Technologies Pvt Ltd',       event: 'Document verification – title deed',      date: '28 Aug 2026',  daysAway: 6,   stage: '1 – Application',      priority: 'High'   },
  { id: '24', caseId: 'APCRDA/LA/2025/0013', applicant: 'Greenfield Power & Energy Ltd',    event: 'Security deposit due date',               date: '20 Nov 2026',  daysAway: 90,  stage: 'Payment',               priority: 'Medium' },
]

interface MoneyRecord { id: string; caseId: string; applicant: string; type: string; amount: string; amountNum: number; dueDate: string; daysNum: number; isOverdue: boolean; penaltyAccrued?: string }
const MONEY_DATA: MoneyRecord[] = [
  { id: '1',  caseId: 'APCRDA/LA/2026/0004', applicant: 'Deccan Logistics & Warehousing',    type: 'Down payment',      amount: '₹5,00,00,000',   amountNum: 50000000,  dueDate: '08 Aug 2026', daysNum: -14, isOverdue: true,  penaltyAccrued: '₹12,50,000'  },
  { id: '2',  caseId: 'APCRDA/LA/2025/0012', applicant: 'Vajra Technologies Pvt Ltd',        type: 'Installment 2',     amount: '₹8,40,00,000',   amountNum: 84000000,  dueDate: '16 Nov 2026', daysNum: 86,  isOverdue: false  },
  { id: '3',  caseId: 'APCRDA/LA/2025/0009', applicant: 'Sristi Financial Services Ltd',     type: 'Security deposit',  amount: '₹4,45,00,000',   amountNum: 44500000,  dueDate: '08 Sept 2026',daysNum: 17,  isOverdue: false  },
  { id: '4',  caseId: 'APCRDA/LA/2025/0010', applicant: 'Krishna Hospitality Group Pvt Ltd', type: 'Down payment',      amount: '₹7,20,00,000',   amountNum: 72000000,  dueDate: '17 Sept 2026',daysNum: 26,  isOverdue: false  },
  { id: '5',  caseId: 'APCRDA/LA/2025/0013', applicant: 'Greenfield Power & Energy Ltd',    type: 'Security deposit',  amount: '₹5,50,00,000',   amountNum: 55000000,  dueDate: '20 Nov 2026', daysNum: 90,  isOverdue: false  },
  { id: '6',  caseId: 'APCRDA/LA/2026/0003', applicant: 'Bharat Electronics Systems Ltd',   type: 'Processing fee',    amount: '₹72,50,000',     amountNum: 725000,    dueDate: '08 Sept 2026',daysNum: 17,  isOverdue: false  },
  { id: '7',  caseId: 'APCRDA/LA/2024/0019', applicant: 'AP Digital Hub Pvt Ltd',           type: 'Installment 1',     amount: '₹18,40,00,000',  amountNum: 184000000, dueDate: '20 Apr 2027', daysNum: 241, isOverdue: false  },
  { id: '8',  caseId: 'APCRDA/LA/2025/0007', applicant: 'Sunrise Sports Ventures Pvt Ltd',  type: 'Lease rent',        amount: '₹1,17,00,000',   amountNum: 11700000,  dueDate: '01 Oct 2026', daysNum: 40,  isOverdue: false  },
  { id: '9',  caseId: 'APCRDA/LA/2025/0014', applicant: 'Deccan Pharma Research Pvt Ltd',   type: 'Down payment',      amount: '₹13,40,00,000',  amountNum: 134000000, dueDate: '10 Oct 2026', daysNum: 49,  isOverdue: false  },
  { id: '10', caseId: 'APCRDA/LA/2024/0018', applicant: 'Smart Grid Solutions Ltd',         type: 'Final installment', amount: '₹9,60,00,000',   amountNum: 96000000,  dueDate: '15 Mar 2027', daysNum: 205, isOverdue: false  },
  { id: '11', caseId: 'APCRDA/LA/2026/0006', applicant: 'Nirmaan Health Partners LLP',      type: 'Application fee',   amount: '₹27,00,000',     amountNum: 270000,    dueDate: '25 Aug 2026', daysNum: 3,   isOverdue: false  },
  { id: '12', caseId: 'APCRDA/LA/2025/0008', applicant: 'AP Judicial Infrastructure Society', type: 'Processing fee',  amount: '₹8,00,000',      amountNum: 80000,     dueDate: '08 Sept 2026',daysNum: 17,  isOverdue: false  },
  { id: '13', caseId: 'APCRDA/LA/2026/0002', applicant: 'Kaveri Media Networks Pvt Ltd',    type: 'Application fee',   amount: '₹15,50,000',     amountNum: 155000,    dueDate: '25 Aug 2026', daysNum: 3,   isOverdue: false  },
  { id: '14', caseId: 'APCRDA/LA/2025/0016', applicant: 'National Skill Corp Ltd',          type: 'Installment 1',     amount: '₹3,90,00,000',   amountNum: 39000000,  dueDate: '12 Jan 2027', daysNum: 143, isOverdue: false  },
  { id: '15', caseId: 'APCRDA/LA/2025/0015', applicant: 'Vizag Fisheries Co-operative',     type: 'Security deposit',  amount: '₹85,00,000',     amountNum: 850000,    dueDate: '30 Nov 2026', daysNum: 100, isOverdue: false  },
]

interface SectorRow { sector: string; cases: number; inProgress: number; approved: number; turnedDown: number; withdrawn: number; investmentCr: number; jobs: number; acres: number; avgAge: number }
const SECTORS_DATA: SectorRow[] = [
  { sector: 'Information Technology',    cases: 3, inProgress: 2, approved: 0, turnedDown: 0, withdrawn: 0, investmentCr: 2160, jobs: 10400, acres: 62,  avgAge: 270 },
  { sector: 'Electronics Manufacturing', cases: 3, inProgress: 2, approved: 1, turnedDown: 0, withdrawn: 1, investmentCr: 1900, jobs: 8260,  acres: 75,  avgAge: 362 },
  { sector: 'Education & Skilling',      cases: 3, inProgress: 2, approved: 0, turnedDown: 1, withdrawn: 0, investmentCr: 835,  jobs: 2050,  acres: 46,  avgAge: 261 },
  { sector: 'Tourism & Hospitality',     cases: 2, inProgress: 2, approved: 0, turnedDown: 0, withdrawn: 0, investmentCr: 1060, jobs: 2780,  acres: 57,  avgAge: 354 },
  { sector: 'Renewable Energy',          cases: 2, inProgress: 1, approved: 1, turnedDown: 0, withdrawn: 0, investmentCr: 1580, jobs: 3750,  acres: 93,  avgAge: 393 },
  { sector: 'Healthcare & Life Sciences',cases: 2, inProgress: 1, approved: 1, turnedDown: 0, withdrawn: 0, investmentCr: 1210, jobs: 4100,  acres: 46,  avgAge: 273 },
  { sector: 'Logistics & Warehousing',   cases: 1, inProgress: 1, approved: 0, turnedDown: 0, withdrawn: 0, investmentCr: 120,  jobs: 380,   acres: 7,   avgAge: 131 },
  { sector: 'Media & Entertainment',     cases: 1, inProgress: 1, approved: 0, turnedDown: 0, withdrawn: 0, investmentCr: 310,  jobs: 900,   acres: 15,  avgAge: 42  },
  { sector: 'Financial Services',        cases: 1, inProgress: 1, approved: 0, turnedDown: 0, withdrawn: 0, investmentCr: 890,  jobs: 3100,  acres: 7,   avgAge: 255 },
  { sector: 'Agro & Food Processing',    cases: 1, inProgress: 1, approved: 0, turnedDown: 0, withdrawn: 0, investmentCr: 85,   jobs: 420,   acres: 11,  avgAge: 389 },
  { sector: 'Legal & Judiciary',         cases: 1, inProgress: 1, approved: 0, turnedDown: 0, withdrawn: 0, investmentCr: 160,  jobs: 240,   acres: 8,   avgAge: 239 },
  { sector: 'Sports & Recreation',       cases: 1, inProgress: 1, approved: 0, turnedDown: 0, withdrawn: 0, investmentCr: 390,  jobs: 720,   acres: 54,  avgAge: 213 },
  { sector: 'Pharmaceuticals',           cases: 1, inProgress: 0, approved: 1, turnedDown: 0, withdrawn: 0, investmentCr: 670,  jobs: 2200,  acres: 18,  avgAge: 368 },
  { sector: 'Textiles & Apparel',        cases: 1, inProgress: 1, approved: 0, turnedDown: 0, withdrawn: 0, investmentCr: 155,  jobs: 610,   acres: 16,  avgAge: 512 },
]

interface CityRow { city: string; totalPlots: number; available: number; allotted: number; cases: number; investmentCr: number; jobs: number; acres: number }
const CITIES_DATA: CityRow[] = [
  { city: 'Electronics City', totalPlots: 14, available: 7,  allotted: 7,  cases: 7,  investmentCr: 3550, jobs: 12090, acres: 178 },
  { city: 'Knowledge City',   totalPlots: 12, available: 6,  allotted: 6,  cases: 6,  investmentCr: 2185, jobs: 10260, acres: 131 },
  { city: 'Health City',      totalPlots: 6,  available: 4,  allotted: 2,  cases: 2,  investmentCr: 1210, jobs: 4100,  acres: 46  },
  { city: 'Tourism City',     totalPlots: 5,  available: 3,  allotted: 2,  cases: 2,  investmentCr: 1060, jobs: 2780,  acres: 57  },
  { city: 'Sports City',      totalPlots: 4,  available: 3,  allotted: 1,  cases: 1,  investmentCr: 390,  jobs: 720,   acres: 54  },
  { city: 'Financial City',   totalPlots: 3,  available: 2,  allotted: 1,  cases: 1,  investmentCr: 890,  jobs: 3100,  acres: 7   },
  { city: 'Media City',       totalPlots: 3,  available: 2,  allotted: 1,  cases: 1,  investmentCr: 310,  jobs: 900,   acres: 15  },
  { city: 'Justice City',     totalPlots: 3,  available: 2,  allotted: 1,  cases: 1,  investmentCr: 160,  jobs: 240,   acres: 8   },
  { city: 'Smart City Hub',   totalPlots: 2,  available: 2,  allotted: 0,  cases: 0,  investmentCr: 0,    jobs: 0,     acres: 0   },
]

interface AllotmentRow { category: string; plots: number; totalAcres: number; allotted: number; available: number; avgPlotAcres: number; utilizationPct: number }
const ALLOTMENT_DATA: AllotmentRow[] = [
  { category: 'Industrial (Large ≥ 30 ac)',   plots: 8,  totalAcres: 368,  allotted: 5, available: 3, avgPlotAcres: 46.0, utilizationPct: 63 },
  { category: 'Industrial (Medium 10–29 ac)',  plots: 14, totalAcres: 210,  allotted: 9, available: 5, avgPlotAcres: 15.0, utilizationPct: 64 },
  { category: 'Industrial (Small <10 ac)',     plots: 10, totalAcres: 62,   allotted: 6, available: 4, avgPlotAcres: 6.2,  utilizationPct: 60 },
  { category: 'Commercial / IT Park',          plots: 7,  totalAcres: 87,   allotted: 4, available: 3, avgPlotAcres: 12.4, utilizationPct: 57 },
  { category: 'Hospitality & Tourism',         plots: 4,  totalAcres: 93,   allotted: 2, available: 2, avgPlotAcres: 23.3, utilizationPct: 50 },
  { category: 'Healthcare & Research',         plots: 4,  totalAcres: 58,   allotted: 2, available: 2, avgPlotAcres: 14.5, utilizationPct: 50 },
  { category: 'Logistics & Warehousing',       plots: 5,  totalAcres: 47,   allotted: 3, available: 2, avgPlotAcres: 9.4,  utilizationPct: 60 },
  { category: 'Renewable Energy Zone',         plots: 3,  totalAcres: 105,  allotted: 2, available: 1, avgPlotAcres: 35.0, utilizationPct: 67 },
  { category: 'Education & Skill Hub',         plots: 5,  totalAcres: 63,   allotted: 3, available: 2, avgPlotAcres: 12.6, utilizationPct: 60 },
]

interface PlotRow { plotId: string; city: string; acres: number; status: 'Available' | 'Allotted' | 'Reserved' | 'Under survey'; allottee?: string; sector?: string; agreementDate?: string }
const PLOTS_DATA: PlotRow[] = [
  { plotId: 'KC-01', city: 'Knowledge City',   acres: 19, status: 'Allotted',      allottee: 'Vajra Technologies Pvt Ltd',         sector: 'IT',                    agreementDate: 'Pending'         },
  { plotId: 'KC-02', city: 'Knowledge City',   acres: 32, status: 'Allotted',      allottee: 'Amaravati Education Foundation',     sector: 'Education & Skilling',  agreementDate: '— (Turned down)'  },
  { plotId: 'KC-03', city: 'Knowledge City',   acres: 5,  status: 'Allotted',      allottee: 'Global Skills Alliance (India JV)', sector: 'Education & Skilling',  agreementDate: 'Pending'         },
  { plotId: 'KC-04', city: 'Knowledge City',   acres: 11, status: 'Allotted',      allottee: 'Vizag Fisheries Co-operative',       sector: 'Agro & Food Processing',agreementDate: 'Pending'         },
  { plotId: 'KC-05', city: 'Knowledge City',   acres: 9,  status: 'Allotted',      allottee: 'National Skill Corp Ltd',            sector: 'Education & Skilling',  agreementDate: 'Pending'         },
  { plotId: 'KC-06', city: 'Knowledge City',   acres: 31, status: 'Allotted',      allottee: 'AP Digital Hub Pvt Ltd',             sector: 'IT',                    agreementDate: 'Pending'         },
  { plotId: 'KC-07', city: 'Knowledge City',   acres: 18, status: 'Available'      },
  { plotId: 'KC-08', city: 'Knowledge City',   acres: 24, status: 'Reserved'       },
  { plotId: 'EC-01', city: 'Electronics City', acres: 45, status: 'Allotted',      allottee: 'Bharat Electronics Systems Ltd',     sector: 'Electronics Mfg.',      agreementDate: 'Pending'         },
  { plotId: 'EC-02', city: 'Electronics City', acres: 12, status: 'Allotted',      allottee: 'Vajra Technologies Pvt Ltd',         sector: 'IT',                    agreementDate: 'Pending'         },
  { plotId: 'EC-03', city: 'Electronics City', acres: 7,  status: 'Allotted',      allottee: 'Deccan Logistics & Warehousing',     sector: 'Logistics',             agreementDate: 'Pending'         },
  { plotId: 'EC-04', city: 'Electronics City', acres: 68, status: 'Allotted',      allottee: 'Greenfield Power & Energy Ltd',      sector: 'Renewable Energy',      agreementDate: 'Pending'         },
  { plotId: 'EC-05', city: 'Electronics City', acres: 25, status: 'Allotted',      allottee: 'Smart Grid Solutions Ltd',           sector: 'Renewable Energy',      agreementDate: '15 Mar 2027'     },
  { plotId: 'EC-06', city: 'Electronics City', acres: 14, status: 'Available'      },
  { plotId: 'EC-07', city: 'Electronics City', acres: 16, status: 'Allotted',      allottee: 'Sunrise Textiles & Fibre Pvt Ltd',  sector: 'Textiles',              agreementDate: 'Pending'         },
  { plotId: 'HC-01', city: 'Health City',      acres: 28, status: 'Allotted',      allottee: 'Nirmaan Health Partners LLP',        sector: 'Healthcare',            agreementDate: 'Pending'         },
  { plotId: 'HC-02', city: 'Health City',      acres: 18, status: 'Allotted',      allottee: 'Deccan Pharma Research Pvt Ltd',     sector: 'Pharmaceuticals',       agreementDate: '10 Oct 2026'     },
  { plotId: 'HC-03', city: 'Health City',      acres: 22, status: 'Available'      },
  { plotId: 'TC-01', city: 'Tourism City',     acres: 22, status: 'Allotted',      allottee: 'Krishna Hospitality Group Pvt Ltd', sector: 'Tourism',               agreementDate: 'Pending'         },
  { plotId: 'TC-02', city: 'Tourism City',     acres: 35, status: 'Allotted',      allottee: 'Coastal Tourism Pvt Ltd',            sector: 'Tourism',               agreementDate: 'Pending'         },
  { plotId: 'TC-03', city: 'Tourism City',     acres: 19, status: 'Available'      },
  { plotId: 'SC-01', city: 'Sports City',      acres: 54, status: 'Allotted',      allottee: 'Sunrise Sports Ventures Pvt Ltd',   sector: 'Sports & Recreation',   agreementDate: 'Pending'         },
  { plotId: 'FC-01', city: 'Financial City',   acres: 7,  status: 'Allotted',      allottee: 'Sristi Financial Services Ltd',      sector: 'Financial Services',    agreementDate: 'Pending'         },
  { plotId: 'MC-01', city: 'Media City',       acres: 15, status: 'Allotted',      allottee: 'Kaveri Media Networks Pvt Ltd',      sector: 'Media & Entertainment', agreementDate: 'Pending'         },
  { plotId: 'JC-01', city: 'Justice City',     acres: 8,  status: 'Allotted',      allottee: 'AP Judicial Infrastructure Society', sector: 'Legal & Judiciary',     agreementDate: 'Pending'         },
  { plotId: 'JC-02', city: 'Justice City',     acres: 12, status: 'Under survey'   },
  { plotId: 'JC-03', city: 'Justice City',     acres: 9,  status: 'Available'      },
]

interface InvestorRow { rank: number; investor: string; cases: number; primarySector: string; totalInvestmentCr: number; jobs: number; acres: number; latestStatus: string }
const INVESTORS_DATA: InvestorRow[] = [
  { rank: 1,  investor: 'Vajra Technologies Pvt Ltd',        cases: 2, primarySector: 'IT & Electronics',      totalInvestmentCr: 1240, jobs: 5300, acres: 50, latestStatus: 'In progress' },
  { rank: 2,  investor: 'Bharat Electronics Systems Ltd',   cases: 1, primarySector: 'Electronics Mfg.',      totalInvestmentCr: 1450, jobs: 6800, acres: 45, latestStatus: 'In progress' },
  { rank: 3,  investor: 'AP Digital Hub Pvt Ltd',           cases: 1, primarySector: 'Information Technology',totalInvestmentCr: 920,  jobs: 5100, acres: 31, latestStatus: 'In progress' },
  { rank: 4,  investor: 'Sristi Financial Services Ltd',    cases: 1, primarySector: 'Financial Services',    totalInvestmentCr: 890,  jobs: 3100, acres: 7,  latestStatus: 'In progress' },
  { rank: 5,  investor: 'Krishna Hospitality Group Pvt Ltd',cases: 1, primarySector: 'Tourism & Hospitality', totalInvestmentCr: 720,  jobs: 1800, acres: 22, latestStatus: 'In progress' },
  { rank: 6,  investor: 'Deccan Pharma Research Pvt Ltd',   cases: 1, primarySector: 'Pharmaceuticals',       totalInvestmentCr: 670,  jobs: 2200, acres: 18, latestStatus: 'Approved'    },
  { rank: 7,  investor: 'Nirmaan Health Partners LLP',      cases: 1, primarySector: 'Healthcare',             totalInvestmentCr: 540,  jobs: 1900, acres: 28, latestStatus: 'In progress' },
  { rank: 8,  investor: 'Smart Grid Solutions Ltd',         cases: 1, primarySector: 'Renewable Energy',      totalInvestmentCr: 480,  jobs: 1350, acres: 25, latestStatus: 'Approved'    },
  { rank: 9,  investor: 'Amaravati Education Foundation',   cases: 1, primarySector: 'Education & Skilling',  totalInvestmentCr: 430,  jobs: 850,  acres: 32, latestStatus: 'Turned down' },
  { rank: 10, investor: 'Sunrise Sports Ventures Pvt Ltd', cases: 1, primarySector: 'Sports & Recreation',   totalInvestmentCr: 390,  jobs: 720,  acres: 54, latestStatus: 'In progress' },
]

const RECORD_TABS = [
  { id: 'cases',    label: 'Cases',             count: 21 },
  { id: 'dates',    label: 'Dates coming up',   count: 24 },
  { id: 'money',    label: 'Outstanding money', count: 15 },
  { id: 'sectors',  label: 'Sectors',           count: 11 },
  { id: 'cities',   label: 'Theme cities',      count: 9  },
  { id: 'allotment',label: 'Allotment mix',     count: null },
  { id: 'plots',    label: 'Plot register',     count: 9  },
  { id: 'investors',label: 'Top investors',     count: 10 },
]

type SortKey = keyof CaseRecord | null
type SortDir = 'asc' | 'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
  return sortDir === 'asc'
    ? <ArrowUp className="h-3 w-3 text-primary" />
    : <ArrowDown className="h-3 w-3 text-primary" />
}

function RecordsTable({ onNavigateToApp }: { onNavigateToApp: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState('cases')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('ageDays')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return ALL_CASES.filter(r =>
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.applicant.toLowerCase().includes(q) ||
      r.sector.toLowerCase().includes(q) ||
      r.plot.toLowerCase().includes(q) ||
      r.themeCity.toLowerCase().includes(q)
    )
  }, [search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey]
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCSV = () => {
    const headers = ['Case', 'Applicant', 'Sector', 'Theme City', 'Plot', 'Step', 'Status', 'Investment', 'Jobs', 'Acres', 'Age (days)', 'Expected By', 'Applied']
    const rows = sorted.map(r => [r.id, r.applicant, r.sector, r.themeCity, r.plot, r.step, r.status, r.investment, r.jobs, r.acres, r.ageDays, r.expectedBy, r.applied])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'cases.csv'; a.click()
  }

  const statusBadge = (s: CaseRecord['status']) => {
    switch (s) {
      case 'In progress': return <Badge variant="outline" className="text-[9px] py-0 bg-blue-50 text-blue-700 border-blue-200 font-medium">In progress</Badge>
      case 'Turned down': return <Badge variant="outline" className="text-[9px] py-0 bg-red-50 text-red-700 border-red-200 font-medium">Turned down</Badge>
      case 'Approved':    return <Badge variant="outline" className="text-[9px] py-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Approved</Badge>
      case 'Withdrawn':   return <Badge variant="outline" className="text-[9px] py-0 bg-slate-100 text-slate-600 border-slate-200 font-medium">Withdrawn</Badge>
    }
  }

  const th = (label: string, key: SortKey, extra = '') => (
    <th
      className={cn('px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors', extra)}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
      </div>
    </th>
  )

  return (
    <div>
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-sm font-bold tracking-tight">The records behind the numbers</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Sort any column, search across all of them, or take the whole view away as a spreadsheet.</p>
      </div>

      <Card>
        {/* Tabs */}
        <div className="border-b px-1 overflow-x-auto">
          <div className="flex items-center gap-4">
            {RECORD_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); setPage(1) }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
                )}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={cn('rounded-full px-1.5 py-0 text-[9px] font-semibold leading-5 min-w-[18px] text-center',
                    activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'cases' ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search by case, applicant, sector, plotâ€¦"
                    className="pl-7 pr-3 h-7 w-64 rounded-md border bg-background text-[11px] outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{filtered.length} of {ALL_CASES.length} rows</span>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={handleCSV}>
                <Download className="h-3 w-3" /> CSV
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-muted/40">
                  <tr>
                    {th('Case',        'id',            'min-w-[150px]')}
                    {th('Applicant',   'applicant',     'min-w-[180px]')}
                    {th('Sector',      'sector',        'min-w-[150px]')}
                    {th('Theme city',  'themeCity',     'min-w-[120px]')}
                    {th('Plot',        'plot',          'min-w-[60px]')}
                    {th('Step',        'step',          'min-w-[170px]')}
                    {th('Status',      'status',        'min-w-[100px]')}
                    {th('Investment',  'investmentNum', 'min-w-[90px] text-right')}
                    {th('Jobs',        'jobs',          'min-w-[55px] text-right')}
                    {th('Acres',       'acres',         'min-w-[55px] text-right')}
                    {th('Age',         'ageDays',       'min-w-[55px] text-right')}
                    {th('Expected by', 'expectedBy',    'min-w-[110px]')}
                    {th('Applied',     'applied',       'min-w-[110px]')}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pageData.length === 0 ? (
                    <tr><td colSpan={13} className="text-center py-8 text-muted-foreground text-xs">No results found</td></tr>
                  ) : pageData.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onNavigateToApp(row.id)}>
                      <td className="px-2 py-2">
                        <span className="font-mono text-[10px] text-primary font-semibold hover:underline">{row.id}</span>
                      </td>
                      <td className="px-2 py-2 text-[11px] max-w-[200px]">
                        <span className="truncate block">{row.applicant}</span>
                      </td>
                      <td className="px-2 py-2 text-[11px] text-muted-foreground">{row.sector}</td>
                      <td className="px-2 py-2 text-[11px]">{row.themeCity}</td>
                      <td className="px-2 py-2 font-mono text-[10px] text-muted-foreground">{row.plot}</td>
                      <td className="px-2 py-2 text-[11px] text-muted-foreground max-w-[200px]">
                        <span className="truncate block">{row.step}</span>
                      </td>
                      <td className="px-2 py-2">{statusBadge(row.status)}</td>
                      <td className="px-2 py-2 text-right font-semibold tabular-nums">{row.investment}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.jobs.toLocaleString('en-IN')}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.acres}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.ageDays} d</td>
                      <td className="px-2 py-2">
                        {row.isLate ? (
                          <span className="inline-flex items-center gap-1">
                            <Badge variant="destructive" className="text-[9px] py-0 px-1">Late</Badge>
                            <span className="text-red-600 font-semibold text-[10px]">{row.expectedBy}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">{row.expectedBy}</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-muted-foreground">{row.applied}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-2 border-t">
              <p className="text-[10px] text-muted-foreground">
                Page {page} of {totalPages} &middot; {sorted.length} records
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2.5" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-3 w-3 mr-0.5" /> Previous
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2.5" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <ArrowRight className="h-3 w-3 ml-0.5" />
                </Button>
              </div>
            </div>
          </>
        ) : activeTab === 'dates' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40"><tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Case</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">Applicant</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]">Event</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Days away</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
              </tr></thead>
              <tbody className="divide-y">
                {DATES_DATA.sort((a,b) => a.daysAway - b.daysAway).map(row => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2 font-mono text-[10px] text-primary font-semibold">{row.caseId.slice(-11)}</td>
                    <td className="px-2 py-2 max-w-[180px]"><span className="truncate block">{row.applicant}</span></td>
                    <td className="px-2 py-2">{row.event}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{row.date}</td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {row.daysAway < 0
                        ? <span className="text-red-600 font-semibold">{Math.abs(row.daysAway)}d overdue</span>
                        : row.daysAway <= 7 ? <span className="text-orange-600 font-semibold">{row.daysAway} d</span>
                        : <span className="text-muted-foreground">{row.daysAway} d</span>}
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{row.stage}</td>
                    <td className="px-2 py-2">
                      <Badge variant="outline" className={cn('text-[9px] py-0',
                        row.priority === 'High'   ? 'bg-red-50 text-red-700 border-red-200'
                      : row.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200'
                      :                             'bg-slate-100 text-slate-600 border-slate-200')}>
                        {row.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'money' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40"><tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Case</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">Applicant</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Due date</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Days</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Penalty accrued</th>
              </tr></thead>
              <tbody className="divide-y">
                {MONEY_DATA.sort((a,b) => a.daysNum - b.daysNum).map(row => (
                  <tr key={row.id} className={cn('hover:bg-muted/30 transition-colors', row.isOverdue && 'bg-red-50/40 dark:bg-red-950/10')}>
                    <td className="px-2 py-2 font-mono text-[10px] text-primary font-semibold">{row.caseId.slice(-11)}</td>
                    <td className="px-2 py-2 max-w-[180px]"><span className="truncate block">{row.applicant}</span></td>
                    <td className="px-2 py-2">{row.type}</td>
                    <td className="px-2 py-2 text-right font-semibold tabular-nums">{row.amount}</td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {row.isOverdue
                        ? <><Badge variant="destructive" className="text-[9px] py-0 px-1 mr-1">Late</Badge><span className="text-red-600 font-semibold">{row.dueDate}</span></>
                        : <span className="text-muted-foreground">{row.dueDate}</span>}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {row.isOverdue
                        ? <span className="text-red-600 font-semibold">{Math.abs(row.daysNum)}d overdue</span>
                        : <span className="text-muted-foreground">{row.daysNum} d</span>}
                    </td>
                    <td className="px-2 py-2 text-[11px]">
                      {row.penaltyAccrued ? <span className="text-red-600 font-semibold">{row.penaltyAccrued}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'sectors' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40"><tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[180px]">Sector</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cases</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">In progress</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Approved</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Turned down</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Investment (₹ Cr)</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Jobs</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Acres</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Avg age (d)</th>
              </tr></thead>
              <tbody className="divide-y">
                {SECTORS_DATA.sort((a,b) => b.investmentCr - a.investmentCr).map(row => (
                  <tr key={row.sector} className="hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2 font-medium">{row.sector}</td>
                    <td className="px-2 py-2 text-right tabular-nums font-semibold">{row.cases}</td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />{row.inProgress}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />{row.approved}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {row.turnedDown > 0 ? <span className="text-red-600">{row.turnedDown}</span> : <span className="text-muted-foreground">0</span>}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums font-semibold">{row.investmentCr.toLocaleString('en-IN')}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.jobs.toLocaleString('en-IN')}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.acres}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.avgAge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'cities' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40"><tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">Theme city</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total plots</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Available</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Allotted</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cases</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Investment (₹ Cr)</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Jobs</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Acres</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[120px]">Utilisation</th>
              </tr></thead>
              <tbody className="divide-y">
                {CITIES_DATA.map(row => {
                  const pct = Math.round((row.allotted / (row.totalPlots || 1)) * 100)
                  return (
                    <tr key={row.city} className="hover:bg-muted/30 transition-colors">
                      <td className="px-2 py-2 font-medium">{row.city}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.totalPlots}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-emerald-600 font-semibold">{row.available}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.allotted}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.cases}</td>
                      <td className="px-2 py-2 text-right tabular-nums font-semibold">{row.investmentCr > 0 ? row.investmentCr.toLocaleString('en-IN') : '—'}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.jobs > 0 ? row.jobs.toLocaleString('en-IN') : '—'}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.acres > 0 ? row.acres : '—'}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'allotment' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40"><tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]">Category</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Plots</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total acres</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Allotted</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Available</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Avg plot (ac)</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[120px]">Utilisation</th>
              </tr></thead>
              <tbody className="divide-y">
                {ALLOTMENT_DATA.map(row => (
                  <tr key={row.category} className="hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2 font-medium">{row.category}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{row.plots}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{row.totalAcres}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{row.allotted}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-emerald-600 font-semibold">{row.available}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.avgPlotAcres.toFixed(1)}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
                          <div className="h-full rounded-full" style={{ width: `${row.utilizationPct}%`, background: row.utilizationPct >= 70 ? '#22c55e' : row.utilizationPct >= 50 ? '#f59e0b' : '#94a3b8' }} />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">{row.utilizationPct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'plots' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40"><tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Plot ID</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Theme city</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Acres</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[180px]">Allottee</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sector</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Agreement date</th>
              </tr></thead>
              <tbody className="divide-y">
                {PLOTS_DATA.map(row => (
                  <tr key={row.plotId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2 font-mono text-[10px] font-semibold text-primary">{row.plotId}</td>
                    <td className="px-2 py-2">{row.city}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{row.acres}</td>
                    <td className="px-2 py-2">
                      <Badge variant="outline" className={cn('text-[9px] py-0',
                        row.status === 'Available'    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : row.status === 'Allotted'     ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : row.status === 'Reserved'     ? 'bg-amber-50 text-amber-700 border-amber-200'
                      :                                 'bg-slate-100 text-slate-600 border-slate-200')}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground max-w-[200px]"><span className="truncate block">{row.allottee ?? '—'}</span></td>
                    <td className="px-2 py-2 text-muted-foreground">{row.sector ?? '—'}</td>
                    <td className="px-2 py-2 text-muted-foreground">{row.agreementDate ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'investors' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40"><tr>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-10">#</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]">Investor</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cases</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">Primary sector</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Investment (₹ Cr)</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Jobs</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Acres</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Latest status</th>
              </tr></thead>
              <tbody className="divide-y">
                {INVESTORS_DATA.map(row => (
                  <tr key={row.rank} className="hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2 text-right">
                      <span className={cn('inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold',
                        row.rank === 1 ? 'bg-amber-100 text-amber-700'
                      : row.rank === 2 ? 'bg-slate-100 text-slate-600'
                      : row.rank === 3 ? 'bg-orange-100 text-orange-700'
                      :                  'bg-muted text-muted-foreground')}>{row.rank}</span>
                    </td>
                    <td className="px-2 py-2 font-medium max-w-[220px]"><span className="truncate block">{row.investor}</span></td>
                    <td className="px-2 py-2 text-right tabular-nums">{row.cases}</td>
                    <td className="px-2 py-2 text-muted-foreground">{row.primarySector}</td>
                    <td className="px-2 py-2 text-right tabular-nums font-bold text-primary">{row.totalInvestmentCr.toLocaleString('en-IN')}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.jobs.toLocaleString('en-IN')}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.acres}</td>
                    <td className="px-2 py-2">
                      <Badge variant="outline" className={cn('text-[9px] py-0',
                        row.latestStatus === 'In progress' ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : row.latestStatus === 'Approved'    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : row.latestStatus === 'Turned down' ? 'bg-red-50 text-red-700 border-red-200'
                      :                                      'bg-slate-100 text-slate-600 border-slate-200')}>
                        {row.latestStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-xs">No data</div>
        )}
      </Card>
    </div>
  )
}


export function DashboardView() {
  const { view, navigateTo } = useAppLayout()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [trendWindow, setTrendWindow] = useState('12M')

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      if (data.success) {
        setStats(data.data.stats)
        setRecentApps(data.data.recentApplications)
      }
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (view === 'dashboard') { setLoading(true); fetchDashboard() }
  }, [view, fetchDashboard])

  if (view !== 'dashboard') return null


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
    <div className="flex flex-col gap-5">
      {/* Header */}
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

      {/* Pipeline Stage Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-semibold">Workflow Pipeline</h2>
            <p className="text-[10px] text-muted-foreground">Live status across all processing stages</p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-1.5" onClick={() => navigateTo('workflow-kanban')}>
            View board <ArrowRight className="h-2.5 w-2.5" />
          </Button>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_STAGES.map((stage) => <PipelineCard key={stage.id} stage={stage} />)}
        </div>
      </div>
      {/* Analytics Charts */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-semibold">Revenue Trend</CardTitle>
            <CardDescription className="text-[10px]">â‚¹ Crores</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-3">
            <ChartContainer config={revenueConfig} className="h-[160px] w-full">
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
            <ChartContainer config={statusChartConfig} className="h-[160px] w-full">
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
            <ChartContainer config={pieConfig} className="h-[160px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
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

      {/* Trends and Bottlenecks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-semibold">Trends and bottlenecks</h2>
            <p className="text-[10px] text-muted-foreground">Where cases pile up, what gets decided, and how the money comes in.</p>
          </div>
          <TrendWindowSelector value={trendWindow} onChange={setTrendWindow} />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-semibold">Where live cases are waiting</CardTitle>
              <CardDescription className="text-[10px]">Cases at each step, split by whether they are still inside their SLA</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-3 px-3">
              <ChartContainer config={liveCasesConfig} className="h-[200px] w-full">
                <BarChart data={liveCasesData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }} barCategoryGap="20%">
                  <XAxis dataKey="step" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} formatter={(v) => v === 'onTime' ? 'On time' : 'Late'} />
                  <Bar dataKey="onTime" stackId="a" fill="#22c55e" />
                  <Bar dataKey="late"   stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-semibold">How far cases get</CardTitle>
              <CardDescription className="text-[10px]">Every case that reached this step or went beyond it</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-4 px-4">
              <div className="space-y-5 mt-2">
                {funnelData.map((item) => <FunnelBar key={item.stage} stage={item.stage} count={item.count} pct={item.pct} />)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decisions / Money / Investment */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-semibold">Decisions recorded</CardTitle>
            <CardDescription className="text-[10px]">Passed, sent back, and refused â€” last 12 months</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-3">
            <ChartContainer config={decisionsConfig} className="h-[160px] w-full">
              <BarChart data={decisionsData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barSize={6}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="passed"   stackId="a" fill="#22c55e" />
                <Bar dataKey="sentBack" stackId="a" fill="#f59e0b" />
                <Bar dataKey="refused"  stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-semibold">Money in each month</CardTitle>
            <CardDescription className="text-[10px]">Collected against billed â€” last 12 months (â‚¹ Cr)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-3">
            <ChartContainer config={moneyConfig} className="h-[160px] w-full">
              <ComposedChart data={moneyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs><linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="billed"    stroke="#6366f1" fill="url(#billedGrad)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="collected" stroke="#22c55e" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-semibold">Investment by sector</CardTitle>
            <CardDescription className="text-[10px]">Committed rupees, largest first (â‚¹ Cr)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-3">
            <ChartContainer config={investmentConfig} className="h-[160px] w-full">
              <BarChart data={investmentData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 4 }} barSize={8}>
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="sector" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} width={88} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="oklch(0.45 0.12 180)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Apps + Risk Alerts */}
      <div className="grid gap-3 lg:grid-cols-2 pb-4">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-1.5" onClick={() => navigateTo('applications')}>
                View all <ArrowRight className="h-2.5 w-2.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
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
                        {app.applicant?.organizationName}{app.landParcel ? ` Â· ${app.landParcel.plotId}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-4.5 shrink-0">
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
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
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
          <CardContent className="px-3 pb-3">
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

      {/* Records Table */}
      <RecordsTable onNavigateToApp={() => navigateTo('applications')} />

    </div>
  )
}
