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
  Search, Download, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, Users,
  Calendar, ChevronDown, Filter, MessageSquare, Building2, X
} from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface DashboardStats {
  applications: { total: number; pending: number; approved: number; rejected: number }
  landParcels: { total: number; available: number }
  payments: { totalRevenue: number; overdueCount: number }
  constructions: { active: number; inProcess?: number; total?: number }
  grievances: { open: number }
  jobs?: { generated: number }
  deals?: { total: number }
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

function formatCurrencyCr(amount: number) {
  return `₹${(amount / 10000000).toFixed(1)}Cr`
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
  title: string; value: string | number; subtitle?: React.ReactNode
  icon: React.ElementType; color: string
  trend?: 'up' | 'down'; trendValue?: string
}) {
  const bgClass = color.includes('teal') ? 'bg-gradient-to-r from-teal-50 to-white/50'
    : color.includes('indigo') ? 'bg-gradient-to-r from-indigo-50 to-white/50'
    : color.includes('amber') || color.includes('orange') ? 'bg-gradient-to-r from-amber-50 to-white/50'
    : color.includes('purple') || color.includes('violet') ? 'bg-gradient-to-r from-purple-50 to-white/50'
    : color.includes('blue') ? 'bg-gradient-to-r from-blue-50 to-white/50'
    : color.includes('emerald') || color.includes('green') ? 'bg-gradient-to-r from-emerald-50 to-white/50'
    : 'bg-gradient-to-r from-slate-50 to-white/50'

  return (
    <Card className={cn("py-2.5 overflow-hidden border border-transparent hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] shadow-sm hover:shadow-md transition-all cursor-pointer", bgClass)}>
      <CardContent className="px-3 py-0">
        <div className="flex justify-start items-center gap-3">
          <div className={cn('rounded-lg p-2 shrink-0', color)}>
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mt-1.5 text-xs font-bold text-black uppercase tracking-wider leading-none">{title}</p>
            <p className="text-lg font-bold tabular-nums tracking-tight mt-2.5 leading-none">{value}</p>
            <div className="flex items-center w-full mt-3">
              {trend === 'up' && <TrendingUp className="h-2.5 w-2.5 text-emerald-600 mr-1 shrink-0" />}
              {trend === 'down' && <TrendingDown className="h-2.5 w-2.5 text-red-500 mr-1 shrink-0" />}
              {subtitle && (
                <div className="flex-1 w-full min-w-0">
                  {typeof subtitle === 'string' ? <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p> : subtitle}
                </div>
              )}
              {trendValue && (
                <span className={cn('text-[10px] font-medium ml-1 shrink-0', trend === 'up' ? 'text-emerald-600' : 'text-red-500')}>
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
            <span className="text-[9px] text-muted-foreground ">{alert.application}</span>
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
  allocation: { label: 'In Allocation', color: 'oklch(0.72 0.16 75)' },
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
  { id: 'app', title: 'Applications & eligibility', description: 'Application intake and qualification', icon: ClipboardCheck, total: 45, inProgress: { count: 3, pct: 6.7, steps: 2 }, approved: { count: 42, pct: 93.3 }, revision: { count: 0, pct: 0 }, rejected: { count: 0, pct: 0 } },
  { id: 'dpr', title: 'DPR review', description: 'Technical project scrutiny', icon: LayoutList, total: 35, inProgress: { count: 4, pct: 11.4 }, approved: { count: 29, pct: 82.9 }, revision: { count: 2, pct: 5.7 }, rejected: { count: 0, pct: 0 } },
  { id: 'eco', title: 'Economic review', description: 'Investment, jobs, and sector fit', icon: TrendingUp, total: 25, inProgress: { count: 2, pct: 8.0 }, approved: { count: 23, pct: 92.0 }, revision: { count: 0, pct: 0 }, rejected: { count: 0, pct: 0 } },
  { id: 'lasc', title: 'LASC scrutiny', description: 'Site, title, and committee recommendation', icon: ShieldCheck, total: 25, inProgress: { count: 2, pct: 8.0 }, approved: { count: 19, pct: 76.0 }, revision: { count: 3, pct: 12.0 }, rejected: { count: 1, pct: 4.0 } },
  { id: 'govt', title: 'Government approvals', description: 'GoM, Authority, and Cabinet gates', icon: BadgeCheck, total: 40, inProgress: { count: 5, pct: 12.5, steps: 5 }, approved: { count: 35, pct: 87.5 }, revision: { count: 0, pct: 0 }, rejected: { count: 0, pct: 0 }, extra: { label: 'Deferred', count: 1 } },
  { id: 'ord', title: 'Order & offer', description: 'Government Order and Letter of intent', icon: Award, total: 20, inProgress: { count: 2, pct: 10.0, steps: 2 }, approved: { count: 18, pct: 90.0 }, revision: { count: 0, pct: 0 }, rejected: { count: 0, pct: 0 }, extra: { label: 'Expired', count: 1 } },
  { id: 'pay', title: 'Payment & agreement', description: 'Financial close and registered agreement', icon: Handshake, total: 15, inProgress: { count: 2, pct: 13.3, steps: 3 }, approved: { count: 13, pct: 86.7 }, revision: { count: 0, pct: 0 }, rejected: { count: 0, pct: 0 } },
  { id: 'hand', title: 'Handover & compliance', description: 'Possession, construction, and closure', icon: PackageCheck, total: 10, inProgress: { count: 2, pct: 20.0, steps: 4 }, approved: { count: 8, pct: 80.0 }, revision: { count: 0, pct: 0 }, rejected: { count: 0, pct: 0 } },
  { id: 'bpermits', title: 'Building permits', description: 'Approval of building plans', icon: HardHat, total: 32, inProgress: { count: 8, pct: 25.0 }, approved: { count: 20, pct: 62.5 }, revision: { count: 3, pct: 9.4 }, rejected: { count: 1, pct: 3.1 } },
  { id: 'grievances', title: 'Grievances', description: 'Investor complaints & resolution', icon: MessageSquare, total: 18, inProgress: { count: 5, pct: 27.8 }, approved: { count: 10, pct: 55.6 }, revision: { count: 2, pct: 11.1 }, rejected: { count: 1, pct: 5.6 } },
]

function PipelineCard({ stage }: { stage: PipelineStage }) {
  const Icon = stage.icon
  return (
    <Card className="bg-gradient-to-r from-emerald-50/50 to-white/50 border border-transparent shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all py-2 gap-0 cursor-pointer">
      <CardContent className="px-2 pt-2 pb-2">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-4 mt-1">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-50 p-2">
              <Icon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight m-0">{stage.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 m-0 leading-none">{stage.total}</p>
            </div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="flex h-2 w-full gap-1 mb-3 mt-1">
          <div className="bg-indigo-500 w-[25%] rounded-full" />
          <div className="bg-cyan-500 w-[40%] rounded-full" />
          <div className="bg-amber-500 w-[25%] rounded-full" />
          <div className="bg-rose-500 w-[10%] rounded-full" />
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Top Left - In Progress */}
          <div className="rounded-lg bg-slate-50 px-2 py-4 flex flex-col items-center justify-center text-center hover:shadow-md hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
              <span className="text-[10px] font-bold text-slate-500">{stage.inProgress.pct}%</span>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-none">{stage.inProgress.count}</p>
          </div>

          {/* Top Right - Revision */}
          <div className="rounded-lg bg-slate-50 px-2 py-4 flex flex-col items-center justify-center text-center hover:shadow-md hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Revision</span>
              <span className="text-[10px] font-bold text-slate-500">{stage.revision.pct}%</span>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-none">{stage.revision.count}</p>
          </div>

          {/* Bottom Left - Approved */}
          <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 px-2 py-4 flex flex-col items-center justify-center text-center hover:shadow-md hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Approved</span>
              <span className="text-[10px] font-bold text-emerald-600">{stage.approved.pct}%</span>
            </div>
            <p className="text-lg font-bold text-emerald-950 leading-none">{stage.approved.count}</p>
          </div>

          {/* Bottom Right - Rejected */}
          <div className="rounded-lg bg-orange-50/50 border border-orange-100 px-2 py-4 flex flex-col items-center justify-center text-center hover:shadow-md hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider">Rejected</span>
              <span className="text-[10px] font-bold text-orange-600">{stage.rejected.pct}%</span>
            </div>
            <p className="text-lg font-bold text-orange-950 leading-none">{stage.rejected.count}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// â”€â”€â”€ New Chart Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const liveCasesConfig = { approved: { label: 'Approved', color: '#22c55e' }, delayed: { label: 'Delayed', color: '#ef4444' } }
const liveCasesData = [
  { step: '1', approved: 1, delayed: 0 }, { step: '1a', approved: 1, delayed: 1 }, { step: '2', approved: 1, delayed: 1 },
  { step: '3', approved: 2, delayed: 0 }, { step: '4', approved: 1, delayed: 0 }, { step: '5a', approved: 2, delayed: 0 },
  { step: '6', approved: 1, delayed: 0 }, { step: '7', approved: 1, delayed: 1 }, { step: '8', approved: 1, delayed: 0 },
  { step: '9', approved: 1, delayed: 0 }, { step: '10', approved: 1, delayed: 0 }, { step: '11', approved: 1, delayed: 0 },
  { step: '12', approved: 1, delayed: 0 }, { step: '13', approved: 2, delayed: 0 }, { step: '14', approved: 1, delayed: 0 }, { step: '15', approved: 1, delayed: 0 },
]
const funnelData = [
  { stage: 'Applying', count: 215, pct: 100 }, { stage: 'Getting approved', count: 170, pct: 79 },
  { stage: 'Making it official', count: 105, pct: 49 }, { stage: 'Building & checking', count: 45, pct: 21 },
]
const decisionsConfig = { passed: { label: 'Passed', color: '#22c55e' }, sentBack: { label: 'Sent back', color: '#f59e0b' }, refused: { label: 'Refused', color: '#ef4444' } }
const decisionsData = [
  { month: 'Sep', passed: 14, sentBack: 1, refused: 0 }, { month: 'Oct', passed: 15, sentBack: 1, refused: 0 },
  { month: 'Nov', passed: 12, sentBack: 0, refused: 0 }, { month: 'Dec', passed: 16, sentBack: 0, refused: 0 },
  { month: 'Jan', passed: 15, sentBack: 1, refused: 0 }, { month: 'Feb', passed: 14, sentBack: 0, refused: 0 },
  { month: 'Mar', passed: 18, sentBack: 1, refused: 0 }, { month: 'Apr', passed: 13, sentBack: 0, refused: 0 },
  { month: 'May', passed: 17, sentBack: 0, refused: 0 }, { month: 'Jun', passed: 15, sentBack: 0, refused: 0 },
  { month: 'Jul', passed: 20, sentBack: 1, refused: 0 }, { month: 'Aug', passed: 18, sentBack: 0, refused: 1 },
]
const decisionsDataWeekly = [
  { week: 'W1', passed: 4, sentBack: 0, refused: 0 },
  { week: 'W2', passed: 5, sentBack: 1, refused: 0 },
  { week: 'W3', passed: 3, sentBack: 0, refused: 0 },
  { week: 'W4', passed: 6, sentBack: 0, refused: 1 },
]
const moneyConfig = { billed: { label: 'Billed (â‚¹ Cr)', color: '#6366f1' }, collected: { label: 'Collected (â‚¹ Cr)', color: '#22c55e' } }
const moneyData = [
  { month: 'Sep', billed: 120, collected: 100 }, { month: 'Oct', billed: 150, collected: 130 },
  { month: 'Nov', billed: 90, collected: 85 }, { month: 'Dec', billed: 200, collected: 180 },
  { month: 'Jan', billed: 170, collected: 140 }, { month: 'Feb', billed: 130, collected: 125 },
  { month: 'Mar', billed: 220, collected: 200 }, { month: 'Apr', billed: 160, collected: 150 },
  { month: 'May', billed: 190, collected: 170 }, { month: 'Jun', billed: 140, collected: 135 },
  { month: 'Jul', billed: 250, collected: 210 }, { month: 'Aug', billed: 180, collected: 165 },
]
const INVESTMENT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1']
const investmentConfig = { amount: { label: 'Investment (â‚¹ Cr)', color: 'oklch(0.45 0.12 180)' } }
const investmentData = [
  { sector: 'IT & Electronics', amount: 4800 }, { sector: 'Manufacturing', amount: 3600 },
  { sector: 'Pharmaceuticals', amount: 2900 }, { sector: 'Logistics', amount: 2200 },
  { sector: 'Food Processing', amount: 1800 }, { sector: 'Textiles', amount: 1200 },
  { sector: 'Renewable Energy', amount: 900 },
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
  { id: 'APCRDA/LA/2026/0001', applicant: 'Vajra Technologies Pvt Ltd', sector: 'Information Technology', themeCity: 'Knowledge City', plot: 'KC-01', step: '1 â€“ Investor applies', status: 'In progress', investment: 'â‚¹680 Cr', investmentNum: 680, jobs: 4200, acres: 19, ageDays: 23, expectedBy: '02 Sept 2026', isLate: false, applied: '29 Jul 2026' },
  { id: 'APCRDA/LA/2026/0002', applicant: 'Kaveri Media Networks Pvt Ltd', sector: 'Media & Entertainment', themeCity: 'Media City', plot: 'MC-01', step: '1a â€“ Is the applicant eligible?', status: 'In progress', investment: 'â‚¹310 Cr', investmentNum: 310, jobs: 900, acres: 15, ageDays: 42, expectedBy: '25 Aug 2026', isLate: false, applied: '10 Jul 2026' },
  { id: 'APCRDA/LA/2026/0003', applicant: 'Bharat Electronics Systems Ltd', sector: 'Electronics Manufacturing', themeCity: 'Electronics City', plot: 'EC-01', step: '2 â€“ Project plan reviewed', status: 'In progress', investment: 'â‚¹1,450 Cr', investmentNum: 1450, jobs: 6800, acres: 45, ageDays: 97, expectedBy: '08 Sept 2026', isLate: false, applied: '18 May 2026' },
  { id: 'APCRDA/LA/2026/0005', applicant: 'Global Skills Alliance (India JV)', sector: 'Education & Skilling', themeCity: 'Knowledge City', plot: 'KC-03', step: '3 â€“ Economic benefit checked', status: 'In progress', investment: 'â‚¹210 Cr', investmentNum: 210, jobs: 640, acres: 5, ageDays: 119, expectedBy: '01 Sept 2026', isLate: false, applied: '24 Apr 2026' },
  { id: 'APCRDA/LA/2026/0004', applicant: 'Deccan Logistics & Warehousing', sector: 'Logistics & Warehousing', themeCity: 'Electronics City', plot: 'EC-03', step: '2 â€“ Project plan reviewed', status: 'In progress', investment: 'â‚¹120 Cr', investmentNum: 120, jobs: 380, acres: 7, ageDays: 131, expectedBy: '08 Aug 2026', isLate: true, applied: '12 Apr 2026' },
  { id: 'APCRDA/LA/2026/0006', applicant: 'Nirmaan Health Partners LLP', sector: 'Healthcare & Life Sciences', themeCity: 'Health City', plot: 'HC-01', step: '4 â€“ Committee scrutiny', status: 'In progress', investment: 'â‚¹540 Cr', investmentNum: 540, jobs: 1900, acres: 28, ageDays: 177, expectedBy: '08 Sept 2026', isLate: false, applied: '25 Feb 2026' },
  { id: 'APCRDA/LA/2025/0007', applicant: 'Sunrise Sports Ventures Pvt Ltd', sector: 'Sports & Recreation', themeCity: 'Sports City', plot: 'SC-01', step: '5 â€“ Ministers clear it', status: 'In progress', investment: 'â‚¹390 Cr', investmentNum: 390, jobs: 720, acres: 54, ageDays: 213, expectedBy: '17 Sept 2026', isLate: false, applied: '20 Jan 2026' },
  { id: 'APCRDA/LA/2025/0008', applicant: 'AP Judicial Infrastructure Society', sector: 'Legal & Judiciary', themeCity: 'Justice City', plot: 'JC-01', step: '5a â€“ Sub-committee opinion', status: 'In progress', investment: 'â‚¹160 Cr', investmentNum: 160, jobs: 240, acres: 8, ageDays: 239, expectedBy: '08 Sept 2026', isLate: false, applied: '25 Dec 2025' },
  { id: 'APCRDA/LA/2025/0009', applicant: 'Sristi Financial Services Ltd', sector: 'Financial Services', themeCity: 'Financial City', plot: 'FC-01', step: '6 â€“ Authority approves', status: 'In progress', investment: 'â‚¹890 Cr', investmentNum: 890, jobs: 3100, acres: 7, ageDays: 255, expectedBy: '08 Sept 2026', isLate: false, applied: '09 Dec 2025' },
  { id: 'APCRDA/LA/2025/0011', applicant: 'Amaravati Education Foundation', sector: 'Education & Skilling', themeCity: 'Knowledge City', plot: 'KC-02', step: '4 â€“ Committee scrutiny', status: 'Turned down', investment: 'â‚¹430 Cr', investmentNum: 430, jobs: 850, acres: 32, ageDays: 263, expectedBy: 'â€”', isLate: false, applied: '01 Dec 2025' },
  { id: 'APCRDA/LA/2025/0010', applicant: 'Krishna Hospitality Group Pvt Ltd', sector: 'Tourism & Hospitality', themeCity: 'Tourism City', plot: 'TC-01', step: '7 â€“ Cabinet approves', status: 'In progress', investment: 'â‚¹720 Cr', investmentNum: 720, jobs: 1800, acres: 22, ageDays: 287, expectedBy: '17 Sept 2026', isLate: false, applied: '07 Nov 2025' },
  { id: 'APCRDA/LA/2025/0012', applicant: 'Vajra Technologies Pvt Ltd', sector: 'Information Technology', themeCity: 'Electronics City', plot: 'EC-02', step: '9 â€“ Offer letter', status: 'In progress', investment: 'â‚¹560 Cr', investmentNum: 560, jobs: 1100, acres: 12, ageDays: 319, expectedBy: '16 Nov 2026', isLate: false, applied: '06 Oct 2025' },
  { id: 'APCRDA/LA/2025/0013', applicant: 'Greenfield Power & Energy Ltd', sector: 'Renewable Energy', themeCity: 'Electronics City', plot: 'EC-04', step: '8 â€“ Agreement signed', status: 'In progress', investment: 'â‚¹1,100 Cr', investmentNum: 1100, jobs: 2400, acres: 68, ageDays: 341, expectedBy: '05 Dec 2026', isLate: false, applied: '15 Sep 2025' },
  { id: 'APCRDA/LA/2025/0014', applicant: 'Deccan Pharma Research Pvt Ltd', sector: 'Pharmaceuticals', themeCity: 'Health City', plot: 'HC-02', step: '6 â€“ Authority approves', status: 'Approved', investment: 'â‚¹670 Cr', investmentNum: 670, jobs: 2200, acres: 18, ageDays: 368, expectedBy: '10 Oct 2026', isLate: false, applied: '20 Aug 2025' },
  { id: 'APCRDA/LA/2025/0015', applicant: 'Vizag Fisheries Co-operative', sector: 'Agro & Food Processing', themeCity: 'Knowledge City', plot: 'KC-04', step: '3 â€“ Economic benefit checked', status: 'In progress', investment: 'â‚¹85 Cr', investmentNum: 85, jobs: 420, acres: 11, ageDays: 389, expectedBy: '30 Nov 2026', isLate: false, applied: '30 Jul 2025' },
  { id: 'APCRDA/LA/2025/0016', applicant: 'National Skill Corp Ltd', sector: 'Education & Skilling', themeCity: 'Knowledge City', plot: 'KC-05', step: '5 â€“ Ministers clear it', status: 'In progress', investment: 'â‚¹195 Cr', investmentNum: 195, jobs: 560, acres: 9, ageDays: 402, expectedBy: '12 Jan 2027', isLate: false, applied: '17 Jul 2025' },
  { id: 'APCRDA/LA/2024/0017', applicant: 'Coastal Tourism Pvt Ltd', sector: 'Tourism & Hospitality', themeCity: 'Tourism City', plot: 'TC-02', step: '7 â€“ Cabinet approves', status: 'In progress', investment: 'â‚¹340 Cr', investmentNum: 340, jobs: 980, acres: 35, ageDays: 421, expectedBy: '28 Feb 2027', isLate: false, applied: '28 Jun 2025' },
  { id: 'APCRDA/LA/2024/0018', applicant: 'Smart Grid Solutions Ltd', sector: 'Renewable Energy', themeCity: 'Electronics City', plot: 'EC-05', step: '8 â€“ Agreement signed', status: 'Approved', investment: 'â‚¹480 Cr', investmentNum: 480, jobs: 1350, acres: 25, ageDays: 445, expectedBy: '15 Mar 2027', isLate: false, applied: '04 Jun 2025' },
  { id: 'APCRDA/LA/2024/0019', applicant: 'AP Digital Hub Pvt Ltd', sector: 'Information Technology', themeCity: 'Knowledge City', plot: 'KC-06', step: '9 â€“ Offer letter', status: 'In progress', investment: 'â‚¹920 Cr', investmentNum: 920, jobs: 5100, acres: 31, ageDays: 467, expectedBy: '20 Apr 2027', isLate: false, applied: '13 May 2025' },
  { id: 'APCRDA/LA/2024/0020', applicant: 'Andhra Auto Components Ltd', sector: 'Electronics Manufacturing', themeCity: 'Electronics City', plot: 'EC-06', step: '10 â€“ Allotment order', status: 'Withdrawn', investment: 'â‚¹275 Cr', investmentNum: 275, jobs: 730, acres: 14, ageDays: 488, expectedBy: 'â€”', isLate: false, applied: '22 Apr 2025' },
  { id: 'APCRDA/LA/2024/0021', applicant: 'Sunrise Textiles & Fibre Pvt Ltd', sector: 'Textiles & Apparel', themeCity: 'Electronics City', plot: 'EC-07', step: '6 â€“ Authority approves', status: 'In progress', investment: 'â‚¹155 Cr', investmentNum: 155, jobs: 610, acres: 16, ageDays: 512, expectedBy: '01 Jun 2027', isLate: false, applied: '01 Apr 2025' },
]

// ─── Tab Data ──────────────────────────────────────────────────────────────

interface DateEvent { id: string; caseId: string; applicant: string; event: string; date: string; daysAway: number; stage: string; priority: 'High' | 'Medium' | 'Low' }
const DATES_DATA: DateEvent[] = [
  { id: '1', caseId: 'APCRDA/LA/2026/0002', applicant: 'Kaveri Media Networks Pvt Ltd', event: 'SLA deadline – eligibility decision', date: '25 Aug 2026', daysAway: 3, stage: '1a – Eligibility', priority: 'High' },
  { id: '2', caseId: 'APCRDA/LA/2026/0004', applicant: 'Deccan Logistics & Warehousing', event: 'Payment overdue – down payment', date: '08 Aug 2026', daysAway: -14, stage: 'Payment', priority: 'High' },
  { id: '3', caseId: 'APCRDA/LA/2026/0001', applicant: 'Vajra Technologies Pvt Ltd', event: 'GoM review scheduled', date: '02 Sept 2026', daysAway: 11, stage: 'Govt. approval', priority: 'High' },
  { id: '4', caseId: 'APCRDA/LA/2026/0003', applicant: 'Bharat Electronics Systems Ltd', event: 'DPR technical review deadline', date: '08 Sept 2026', daysAway: 17, stage: '2 – DPR Review', priority: 'Medium' },
  { id: '5', caseId: 'APCRDA/LA/2026/0005', applicant: 'Global Skills Alliance (India JV)', event: 'Economic benefit report submission', date: '01 Sept 2026', daysAway: 10, stage: '3 – Economic review', priority: 'Medium' },
  { id: '6', caseId: 'APCRDA/LA/2026/0006', applicant: 'Nirmaan Health Partners LLP', event: 'LASC committee meeting', date: '08 Sept 2026', daysAway: 17, stage: '4 – LASC scrutiny', priority: 'Medium' },
  { id: '7', caseId: 'APCRDA/LA/2025/0007', applicant: 'Sunrise Sports Ventures Pvt Ltd', event: 'Minister’s clearance hearing', date: '17 Sept 2026', daysAway: 26, stage: '5 – Govt. approval', priority: 'High' },
  { id: '8', caseId: 'APCRDA/LA/2025/0008', applicant: 'AP Judicial Infrastructure Society', event: 'Sub-committee report due', date: '08 Sept 2026', daysAway: 17, stage: '5a – Sub-committee', priority: 'Medium' },
  { id: '9', caseId: 'APCRDA/LA/2025/0009', applicant: 'Sristi Financial Services Ltd', event: 'Authority board approval', date: '08 Sept 2026', daysAway: 17, stage: '6 – Authority', priority: 'High' },
  { id: '10', caseId: 'APCRDA/LA/2025/0010', applicant: 'Krishna Hospitality Group Pvt Ltd', event: 'Cabinet agenda submission deadline', date: '17 Sept 2026', daysAway: 26, stage: '7 – Cabinet', priority: 'Medium' },
  { id: '11', caseId: 'APCRDA/LA/2025/0012', applicant: 'Vajra Technologies Pvt Ltd', event: 'Offer letter acceptance deadline', date: '16 Nov 2026', daysAway: 86, stage: '9 – Offer letter', priority: 'Low' },
  { id: '12', caseId: 'APCRDA/LA/2025/0013', applicant: 'Greenfield Power & Energy Ltd', event: 'Agreement signing ceremony', date: '05 Dec 2026', daysAway: 105, stage: '8 – Agreement', priority: 'Medium' },
  { id: '13', caseId: 'APCRDA/LA/2025/0015', applicant: 'Vizag Fisheries Co-operative', event: 'Economic review panel session', date: '30 Nov 2026', daysAway: 100, stage: '3 – Economic review', priority: 'Low' },
  { id: '14', caseId: 'APCRDA/LA/2025/0016', applicant: 'National Skill Corp Ltd', event: 'Minister’s clearance – rescheduled', date: '12 Jan 2027', daysAway: 143, stage: '5 – Govt. approval', priority: 'Low' },
  { id: '15', caseId: 'APCRDA/LA/2024/0017', applicant: 'Coastal Tourism Pvt Ltd', event: 'Cabinet review – Q1 2027 slot', date: '28 Feb 2027', daysAway: 190, stage: '7 – Cabinet', priority: 'Low' },
  { id: '16', caseId: 'APCRDA/LA/2024/0019', applicant: 'AP Digital Hub Pvt Ltd', event: 'Offer letter issuance target', date: '20 Apr 2027', daysAway: 241, stage: '9 – Offer letter', priority: 'Low' },
  { id: '17', caseId: 'APCRDA/LA/2026/0003', applicant: 'Bharat Electronics Systems Ltd', event: 'Site inspection scheduled', date: '12 Sept 2026', daysAway: 21, stage: '2 – DPR Review', priority: 'Medium' },
  { id: '18', caseId: 'APCRDA/LA/2026/0006', applicant: 'Nirmaan Health Partners LLP', event: 'Environmental clearance renewal', date: '22 Sept 2026', daysAway: 31, stage: 'Compliance', priority: 'High' },
  { id: '19', caseId: 'APCRDA/LA/2025/0009', applicant: 'Sristi Financial Services Ltd', event: 'Board resolution submission', date: '25 Aug 2026', daysAway: 3, stage: '6 – Authority', priority: 'High' },
  { id: '20', caseId: 'APCRDA/LA/2025/0007', applicant: 'Sunrise Sports Ventures Pvt Ltd', event: 'Final compliance certificate', date: '30 Sept 2026', daysAway: 39, stage: 'Compliance', priority: 'Medium' },
  { id: '21', caseId: 'APCRDA/LA/2024/0018', applicant: 'Smart Grid Solutions Ltd', event: 'Possession handover date', date: '15 Mar 2027', daysAway: 205, stage: 'Handover', priority: 'Low' },
  { id: '22', caseId: 'APCRDA/LA/2025/0014', applicant: 'Deccan Pharma Research Pvt Ltd', event: 'Allotment order publication', date: '10 Oct 2026', daysAway: 49, stage: '10 – Allotment order', priority: 'Medium' },
  { id: '23', caseId: 'APCRDA/LA/2026/0001', applicant: 'Vajra Technologies Pvt Ltd', event: 'Document verification – title deed', date: '28 Aug 2026', daysAway: 6, stage: '1 – Application', priority: 'High' },
  { id: '24', caseId: 'APCRDA/LA/2025/0013', applicant: 'Greenfield Power & Energy Ltd', event: 'Security deposit due date', date: '20 Nov 2026', daysAway: 90, stage: 'Payment', priority: 'Medium' },
]

interface MoneyRecord { id: string; caseId: string; applicant: string; type: string; amount: string; amountNum: number; dueDate: string; daysNum: number; isOverdue: boolean; penaltyAccrued?: string }
const MONEY_DATA: MoneyRecord[] = [
  { id: '1', caseId: 'APCRDA/LA/2026/0004', applicant: 'Deccan Logistics & Warehousing', type: 'Down payment', amount: '₹5,00,00,000', amountNum: 50000000, dueDate: '08 Aug 2026', daysNum: -14, isOverdue: true, penaltyAccrued: '₹12,50,000' },
  { id: '2', caseId: 'APCRDA/LA/2025/0012', applicant: 'Vajra Technologies Pvt Ltd', type: 'Installment 2', amount: '₹8,40,00,000', amountNum: 84000000, dueDate: '16 Nov 2026', daysNum: 86, isOverdue: false },
  { id: '3', caseId: 'APCRDA/LA/2025/0009', applicant: 'Sristi Financial Services Ltd', type: 'Security deposit', amount: '₹4,45,00,000', amountNum: 44500000, dueDate: '08 Sept 2026', daysNum: 17, isOverdue: false },
  { id: '4', caseId: 'APCRDA/LA/2025/0010', applicant: 'Krishna Hospitality Group Pvt Ltd', type: 'Down payment', amount: '₹7,20,00,000', amountNum: 72000000, dueDate: '17 Sept 2026', daysNum: 26, isOverdue: false },
  { id: '5', caseId: 'APCRDA/LA/2025/0013', applicant: 'Greenfield Power & Energy Ltd', type: 'Security deposit', amount: '₹5,50,00,000', amountNum: 55000000, dueDate: '20 Nov 2026', daysNum: 90, isOverdue: false },
  { id: '6', caseId: 'APCRDA/LA/2026/0003', applicant: 'Bharat Electronics Systems Ltd', type: 'Processing fee', amount: '₹72,50,000', amountNum: 725000, dueDate: '08 Sept 2026', daysNum: 17, isOverdue: false },
  { id: '7', caseId: 'APCRDA/LA/2024/0019', applicant: 'AP Digital Hub Pvt Ltd', type: 'Installment 1', amount: '₹18,40,00,000', amountNum: 184000000, dueDate: '20 Apr 2027', daysNum: 241, isOverdue: false },
  { id: '8', caseId: 'APCRDA/LA/2025/0007', applicant: 'Sunrise Sports Ventures Pvt Ltd', type: 'Lease rent', amount: '₹1,17,00,000', amountNum: 11700000, dueDate: '01 Oct 2026', daysNum: 40, isOverdue: false },
  { id: '9', caseId: 'APCRDA/LA/2025/0014', applicant: 'Deccan Pharma Research Pvt Ltd', type: 'Down payment', amount: '₹13,40,00,000', amountNum: 134000000, dueDate: '10 Oct 2026', daysNum: 49, isOverdue: false },
  { id: '10', caseId: 'APCRDA/LA/2024/0018', applicant: 'Smart Grid Solutions Ltd', type: 'Final installment', amount: '₹9,60,00,000', amountNum: 96000000, dueDate: '15 Mar 2027', daysNum: 205, isOverdue: false },
  { id: '11', caseId: 'APCRDA/LA/2026/0006', applicant: 'Nirmaan Health Partners LLP', type: 'Application fee', amount: '₹27,00,000', amountNum: 270000, dueDate: '25 Aug 2026', daysNum: 3, isOverdue: false },
  { id: '12', caseId: 'APCRDA/LA/2025/0008', applicant: 'AP Judicial Infrastructure Society', type: 'Processing fee', amount: '₹8,00,000', amountNum: 80000, dueDate: '08 Sept 2026', daysNum: 17, isOverdue: false },
  { id: '13', caseId: 'APCRDA/LA/2026/0002', applicant: 'Kaveri Media Networks Pvt Ltd', type: 'Application fee', amount: '₹15,50,000', amountNum: 155000, dueDate: '25 Aug 2026', daysNum: 3, isOverdue: false },
  { id: '14', caseId: 'APCRDA/LA/2025/0016', applicant: 'National Skill Corp Ltd', type: 'Installment 1', amount: '₹3,90,00,000', amountNum: 39000000, dueDate: '12 Jan 2027', daysNum: 143, isOverdue: false },
  { id: '15', caseId: 'APCRDA/LA/2025/0015', applicant: 'Vizag Fisheries Co-operative', type: 'Security deposit', amount: '₹85,00,000', amountNum: 850000, dueDate: '30 Nov 2026', daysNum: 100, isOverdue: false },
]

interface SectorRow { sector: string; cases: number; inProgress: number; approved: number; turnedDown: number; withdrawn: number; investmentCr: number; jobs: number; acres: number; avgAge: number }
const SECTORS_DATA: SectorRow[] = [
  { sector: 'Information Technology', cases: 40, inProgress: 5, approved: 34, turnedDown: 0, withdrawn: 1, investmentCr: 2160, jobs: 10400, acres: 62, avgAge: 270 },
  { sector: 'Electronics Manufacturing', cases: 35, inProgress: 4, approved: 30, turnedDown: 0, withdrawn: 1, investmentCr: 1900, jobs: 8260, acres: 75, avgAge: 362 },
  { sector: 'Education & Skilling', cases: 25, inProgress: 3, approved: 21, turnedDown: 1, withdrawn: 0, investmentCr: 835, jobs: 2050, acres: 46, avgAge: 261 },
  { sector: 'Tourism & Hospitality', cases: 20, inProgress: 2, approved: 17, turnedDown: 0, withdrawn: 1, investmentCr: 1060, jobs: 2780, acres: 57, avgAge: 354 },
  { sector: 'Renewable Energy', cases: 20, inProgress: 2, approved: 17, turnedDown: 0, withdrawn: 1, investmentCr: 1580, jobs: 3750, acres: 93, avgAge: 393 },
  { sector: 'Healthcare & Life Sciences', cases: 15, inProgress: 2, approved: 13, turnedDown: 0, withdrawn: 0, investmentCr: 1210, jobs: 4100, acres: 46, avgAge: 273 },
  { sector: 'Logistics & Warehousing', cases: 10, inProgress: 1, approved: 9, turnedDown: 0, withdrawn: 0, investmentCr: 120, jobs: 380, acres: 7, avgAge: 131 },
  { sector: 'Media & Entertainment', cases: 10, inProgress: 1, approved: 9, turnedDown: 0, withdrawn: 0, investmentCr: 310, jobs: 900, acres: 15, avgAge: 42 },
  { sector: 'Financial Services', cases: 10, inProgress: 1, approved: 8, turnedDown: 0, withdrawn: 1, investmentCr: 890, jobs: 3100, acres: 7, avgAge: 255 },
  { sector: 'Agro & Food Processing', cases: 10, inProgress: 1, approved: 9, turnedDown: 0, withdrawn: 0, investmentCr: 85, jobs: 420, acres: 11, avgAge: 389 },
  { sector: 'Legal & Judiciary', cases: 5, inProgress: 0, approved: 5, turnedDown: 0, withdrawn: 0, investmentCr: 160, jobs: 240, acres: 8, avgAge: 239 },
  { sector: 'Sports & Recreation', cases: 5, inProgress: 0, approved: 5, turnedDown: 0, withdrawn: 0, investmentCr: 390, jobs: 720, acres: 54, avgAge: 213 },
  { sector: 'Pharmaceuticals', cases: 5, inProgress: 0, approved: 5, turnedDown: 0, withdrawn: 0, investmentCr: 670, jobs: 2200, acres: 18, avgAge: 368 },
  { sector: 'Textiles & Apparel', cases: 5, inProgress: 0, approved: 5, turnedDown: 0, withdrawn: 0, investmentCr: 155, jobs: 610, acres: 16, avgAge: 512 },
]

interface CityRow { city: string; totalPlots: number; available: number; allotted: number; cases: number; investmentCr: number; jobs: number; acres: number }
const CITIES_DATA: CityRow[] = [
  { city: 'Electronics City', totalPlots: 14, available: 7, allotted: 7, cases: 50, investmentCr: 3550, jobs: 12090, acres: 178 },
  { city: 'Knowledge City', totalPlots: 12, available: 6, allotted: 6, cases: 45, investmentCr: 2185, jobs: 10260, acres: 131 },
  { city: 'Health City', totalPlots: 6, available: 4, allotted: 2, cases: 30, investmentCr: 1210, jobs: 4100, acres: 46 },
  { city: 'Tourism City', totalPlots: 5, available: 3, allotted: 2, cases: 25, investmentCr: 1060, jobs: 2780, acres: 57 },
  { city: 'Sports City', totalPlots: 4, available: 3, allotted: 1, cases: 15, investmentCr: 390, jobs: 720, acres: 54 },
  { city: 'Financial City', totalPlots: 3, available: 2, allotted: 1, cases: 15, investmentCr: 890, jobs: 3100, acres: 7 },
  { city: 'Media City', totalPlots: 3, available: 2, allotted: 1, cases: 15, investmentCr: 310, jobs: 900, acres: 15 },
  { city: 'Justice City', totalPlots: 3, available: 2, allotted: 1, cases: 10, investmentCr: 160, jobs: 240, acres: 8 },
  { city: 'Smart City Hub', totalPlots: 2, available: 2, allotted: 0, cases: 10, investmentCr: 0, jobs: 0, acres: 0 },
]

interface AllotmentRow { category: string; plots: number; totalAcres: number; allotted: number; available: number; avgPlotAcres: number; utilizationPct: number }
const ALLOTMENT_DATA: AllotmentRow[] = [
  { category: 'Industrial (Large ≥ 30 ac)', plots: 8, totalAcres: 368, allotted: 5, available: 3, avgPlotAcres: 46.0, utilizationPct: 63 },
  { category: 'Industrial (Medium 10–29 ac)', plots: 14, totalAcres: 210, allotted: 9, available: 5, avgPlotAcres: 15.0, utilizationPct: 64 },
  { category: 'Industrial (Small <10 ac)', plots: 10, totalAcres: 62, allotted: 6, available: 4, avgPlotAcres: 6.2, utilizationPct: 60 },
  { category: 'Commercial / IT Park', plots: 7, totalAcres: 87, allotted: 4, available: 3, avgPlotAcres: 12.4, utilizationPct: 57 },
  { category: 'Hospitality & Tourism', plots: 4, totalAcres: 93, allotted: 2, available: 2, avgPlotAcres: 23.3, utilizationPct: 50 },
  { category: 'Healthcare & Research', plots: 4, totalAcres: 58, allotted: 2, available: 2, avgPlotAcres: 14.5, utilizationPct: 50 },
  { category: 'Logistics & Warehousing', plots: 5, totalAcres: 47, allotted: 3, available: 2, avgPlotAcres: 9.4, utilizationPct: 60 },
  { category: 'Renewable Energy Zone', plots: 3, totalAcres: 105, allotted: 2, available: 1, avgPlotAcres: 35.0, utilizationPct: 67 },
  { category: 'Education & Skill Hub', plots: 5, totalAcres: 63, allotted: 3, available: 2, avgPlotAcres: 12.6, utilizationPct: 60 },
]

interface PlotRow { plotId: string; city: string; acres: number; status: 'Available' | 'Allotted' | 'Reserved' | 'Under survey'; allottee?: string; sector?: string; agreementDate?: string }
const PLOTS_DATA: PlotRow[] = [
  { plotId: 'KC-01', city: 'Knowledge City', acres: 19, status: 'Allotted', allottee: 'Vajra Technologies Pvt Ltd', sector: 'IT', agreementDate: 'Pending' },
  { plotId: 'KC-02', city: 'Knowledge City', acres: 32, status: 'Allotted', allottee: 'Amaravati Education Foundation', sector: 'Education & Skilling', agreementDate: '— (Turned down)' },
  { plotId: 'KC-03', city: 'Knowledge City', acres: 5, status: 'Allotted', allottee: 'Global Skills Alliance (India JV)', sector: 'Education & Skilling', agreementDate: 'Pending' },
  { plotId: 'KC-04', city: 'Knowledge City', acres: 11, status: 'Allotted', allottee: 'Vizag Fisheries Co-operative', sector: 'Agro & Food Processing', agreementDate: 'Pending' },
  { plotId: 'KC-05', city: 'Knowledge City', acres: 9, status: 'Allotted', allottee: 'National Skill Corp Ltd', sector: 'Education & Skilling', agreementDate: 'Pending' },
  { plotId: 'KC-06', city: 'Knowledge City', acres: 31, status: 'Allotted', allottee: 'AP Digital Hub Pvt Ltd', sector: 'IT', agreementDate: 'Pending' },
  { plotId: 'KC-07', city: 'Knowledge City', acres: 18, status: 'Available' },
  { plotId: 'KC-08', city: 'Knowledge City', acres: 24, status: 'Reserved' },
  { plotId: 'EC-01', city: 'Electronics City', acres: 45, status: 'Allotted', allottee: 'Bharat Electronics Systems Ltd', sector: 'Electronics Mfg.', agreementDate: 'Pending' },
  { plotId: 'EC-02', city: 'Electronics City', acres: 12, status: 'Allotted', allottee: 'Vajra Technologies Pvt Ltd', sector: 'IT', agreementDate: 'Pending' },
  { plotId: 'EC-03', city: 'Electronics City', acres: 7, status: 'Allotted', allottee: 'Deccan Logistics & Warehousing', sector: 'Logistics', agreementDate: 'Pending' },
  { plotId: 'EC-04', city: 'Electronics City', acres: 68, status: 'Allotted', allottee: 'Greenfield Power & Energy Ltd', sector: 'Renewable Energy', agreementDate: 'Pending' },
  { plotId: 'EC-05', city: 'Electronics City', acres: 25, status: 'Allotted', allottee: 'Smart Grid Solutions Ltd', sector: 'Renewable Energy', agreementDate: '15 Mar 2027' },
  { plotId: 'EC-06', city: 'Electronics City', acres: 14, status: 'Available' },
  { plotId: 'EC-07', city: 'Electronics City', acres: 16, status: 'Allotted', allottee: 'Sunrise Textiles & Fibre Pvt Ltd', sector: 'Textiles', agreementDate: 'Pending' },
  { plotId: 'HC-01', city: 'Health City', acres: 28, status: 'Allotted', allottee: 'Nirmaan Health Partners LLP', sector: 'Healthcare', agreementDate: 'Pending' },
  { plotId: 'HC-02', city: 'Health City', acres: 18, status: 'Allotted', allottee: 'Deccan Pharma Research Pvt Ltd', sector: 'Pharmaceuticals', agreementDate: '10 Oct 2026' },
  { plotId: 'HC-03', city: 'Health City', acres: 22, status: 'Available' },
  { plotId: 'TC-01', city: 'Tourism City', acres: 22, status: 'Allotted', allottee: 'Krishna Hospitality Group Pvt Ltd', sector: 'Tourism', agreementDate: 'Pending' },
  { plotId: 'TC-02', city: 'Tourism City', acres: 35, status: 'Allotted', allottee: 'Coastal Tourism Pvt Ltd', sector: 'Tourism', agreementDate: 'Pending' },
  { plotId: 'TC-03', city: 'Tourism City', acres: 19, status: 'Available' },
  { plotId: 'SC-01', city: 'Sports City', acres: 54, status: 'Allotted', allottee: 'Sunrise Sports Ventures Pvt Ltd', sector: 'Sports & Recreation', agreementDate: 'Pending' },
  { plotId: 'FC-01', city: 'Financial City', acres: 7, status: 'Allotted', allottee: 'Sristi Financial Services Ltd', sector: 'Financial Services', agreementDate: 'Pending' },
  { plotId: 'MC-01', city: 'Media City', acres: 15, status: 'Allotted', allottee: 'Kaveri Media Networks Pvt Ltd', sector: 'Media & Entertainment', agreementDate: 'Pending' },
  { plotId: 'JC-01', city: 'Justice City', acres: 8, status: 'Allotted', allottee: 'AP Judicial Infrastructure Society', sector: 'Legal & Judiciary', agreementDate: 'Pending' },
  { plotId: 'JC-02', city: 'Justice City', acres: 12, status: 'Under survey' },
  { plotId: 'JC-03', city: 'Justice City', acres: 9, status: 'Available' },
]

interface InvestorRow { rank: number; investor: string; cases: number; primarySector: string; totalInvestmentCr: number; jobs: number; acres: number; latestStatus: string }
const INVESTORS_DATA: InvestorRow[] = [
  { rank: 1, investor: 'Vajra Technologies Pvt Ltd', cases: 2, primarySector: 'IT & Electronics', totalInvestmentCr: 1240, jobs: 5300, acres: 50, latestStatus: 'In progress' },
  { rank: 2, investor: 'Bharat Electronics Systems Ltd', cases: 1, primarySector: 'Electronics Mfg.', totalInvestmentCr: 1450, jobs: 6800, acres: 45, latestStatus: 'In progress' },
  { rank: 3, investor: 'AP Digital Hub Pvt Ltd', cases: 1, primarySector: 'Information Technology', totalInvestmentCr: 920, jobs: 5100, acres: 31, latestStatus: 'In progress' },
  { rank: 4, investor: 'Sristi Financial Services Ltd', cases: 1, primarySector: 'Financial Services', totalInvestmentCr: 890, jobs: 3100, acres: 7, latestStatus: 'In progress' },
  { rank: 5, investor: 'Krishna Hospitality Group Pvt Ltd', cases: 1, primarySector: 'Tourism & Hospitality', totalInvestmentCr: 720, jobs: 1800, acres: 22, latestStatus: 'In progress' },
  { rank: 6, investor: 'Deccan Pharma Research Pvt Ltd', cases: 1, primarySector: 'Pharmaceuticals', totalInvestmentCr: 670, jobs: 2200, acres: 18, latestStatus: 'Approved' },
  { rank: 7, investor: 'Nirmaan Health Partners LLP', cases: 1, primarySector: 'Healthcare', totalInvestmentCr: 540, jobs: 1900, acres: 28, latestStatus: 'In progress' },
  { rank: 8, investor: 'Smart Grid Solutions Ltd', cases: 1, primarySector: 'Renewable Energy', totalInvestmentCr: 480, jobs: 1350, acres: 25, latestStatus: 'Approved' },
  { rank: 9, investor: 'Amaravati Education Foundation', cases: 1, primarySector: 'Education & Skilling', totalInvestmentCr: 430, jobs: 850, acres: 32, latestStatus: 'Turned down' },
  { rank: 10, investor: 'Sunrise Sports Ventures Pvt Ltd', cases: 1, primarySector: 'Sports & Recreation', totalInvestmentCr: 390, jobs: 720, acres: 54, latestStatus: 'In progress' },
]

const RECORD_TABS = [
  { id: 'cases', label: 'Leads', count: 21 },
  { id: 'dates', label: 'Dates coming up', count: 24 },
  { id: 'money', label: 'Outstanding money', count: 15 },
  { id: 'sectors', label: 'Sectors', count: 11 },
  { id: 'cities', label: 'Theme cities', count: 9 },
  { id: 'allotment', label: 'Allotment mix', count: null },
  { id: 'plots', label: 'Plot register', count: 9 },
  { id: 'investors', label: 'Top investors', count: 10 },
]

type SortKey = keyof CaseRecord | null
type SortDir = 'asc' | 'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
  return sortDir === 'asc'
    ? <ArrowUp className="h-3 w-3 text-primary" />
    : <ArrowDown className="h-3 w-3 text-primary" />
}

export function RecordsTable({ onNavigateToApp }: { onNavigateToApp: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState('cases')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('ageDays')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const [realCases, setRealCases] = useState<CaseRecord[]>([])

  useEffect(() => {
    fetch('/api/applications?pageSize=50')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.applications) {
          const mapped = data.data.applications.map((app: any) => {
            const ageDays = Math.floor((Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            const applied = new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            const investmentCr = app.proposedInvestment ? Number(app.proposedInvestment) / 10000000 : null
            return {
              id: app.applicationNumber,
              applicant: app.applicant?.organizationName || 'N/A',
              sector: app.sector || 'N/A',
              themeCity: app.landParcel?.zone?.name || 'N/A',
              plot: app.landParcel?.plotId || 'N/A',
              step: app.currentStage || 'Application',
              status: app.status === 'Submitted' ? 'In progress' : (app.status || 'N/A'),
              investment: investmentCr ? `₹${investmentCr.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` : 'N/A',
              investmentNum: investmentCr || 0,
              jobs: app.employmentCommitment || 0,
              acres: app.landParcel?.extentAcres || 0,
              ageDays,
              expectedBy: app.slaDueDate ? new Date(app.slaDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
              isLate: app.slaRemaining !== null && app.slaRemaining < 0,
              applied
            }
          })
          setRealCases(mapped)
        }
      })
      .catch(err => console.error('Failed to fetch real applications', err))
  }, [])

  const combinedCases = useMemo(() => {
    const ids = new Set(realCases.map(r => r.id))
    const dedupedMock = ALL_CASES.filter(c => !ids.has(c.id))
    return [...realCases, ...dedupedMock]
  }, [realCases])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return combinedCases.filter(r =>
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

  let totalRecords = 0
  if (activeTab === 'cases') totalRecords = sorted.length
  else if (activeTab === 'dates') totalRecords = DATES_DATA.length
  else if (activeTab === 'money') totalRecords = MONEY_DATA.length
  else if (activeTab === 'sectors') totalRecords = SECTORS_DATA.length
  else if (activeTab === 'cities') totalRecords = CITIES_DATA.length
  else if (activeTab === 'allotment') totalRecords = ALLOTMENT_DATA.length
  else if (activeTab === 'plots') totalRecords = PLOTS_DATA.length
  else if (activeTab === 'investors') totalRecords = INVESTORS_DATA.length

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCSV = () => {
    const headers = ['Lead', 'Applicant', 'Sector', 'Theme City', 'Plot', 'Step', 'Status', 'Investment', 'Jobs', 'Acres', 'Age (days)', 'Expected By', 'Applied']
    const rows = sorted.map(r => [r.id, r.applicant, r.sector, r.themeCity, r.plot, r.step, r.status, r.investment, r.jobs, r.acres, r.ageDays, r.expectedBy, r.applied])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'cases.csv'; a.click()
  }

  const statusBadge = (s: CaseRecord['status']) => {
    switch (s) {
      case 'In progress': return <Badge variant="outline" className="text-[9px] py-0 bg-blue-50 text-blue-700 border-blue-200 font-medium">In progress</Badge>
      case 'Turned down': return <Badge variant="outline" className="text-[9px] py-0 bg-red-50 text-red-700 border-red-200 font-medium">Turned down</Badge>
      case 'Approved': return <Badge variant="outline" className="text-[9px] py-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Approved</Badge>
      case 'Withdrawn': return <Badge variant="outline" className="text-[9px] py-0 bg-slate-100 text-slate-600 border-slate-200 font-medium">Withdrawn</Badge>
    }
  }

  const th = (label: string, key: SortKey, extra = '') => (
    <th
      className={cn('px-2 py-2 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors', extra)}
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
      <Card>
        <CardHeader className="px-4 py-2 border-b flex flex-row items-center justify-between space-y-0 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-6">
            <CardTitle className="text-sm font-bold tracking-tight whitespace-nowrap">Summary Table</CardTitle>

            {/* Tabs as Buttons */}
            <div className="flex items-center gap-1.5">
              {RECORD_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearch(''); setPage(1) }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold whitespace-nowrap rounded-md transition-all',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm outline outline-2 outline-primary outline-offset-[-1px]'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:outline hover:outline-2 hover:outline-primary/50 hover:outline-offset-[-1px]'
                  )}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={cn('rounded-full px-1.5 py-0 text-[9px] font-bold leading-5 min-w-[16px] text-center',
                      activeTab === tab.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background/80 text-muted-foreground'
                    )}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search by lead, applicant, sector, plot..."
                  className="pl-7 pr-3 h-7 w-[200px] xl:w-64 rounded-md border bg-background text-[11px] outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={handleCSV}>
              <Download className="h-3 w-3" /> Export
            </Button>
          </div>
        </CardHeader>

        {activeTab === 'cases' ? (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-muted/40">
                  <tr>
                    {th('Lead', 'id', 'min-w-[150px]')}
                    {th('Applicant', 'applicant', 'min-w-[180px]')}
                    {th('Sector', 'sector', 'min-w-[150px]')}
                    {th('Theme city', 'themeCity', 'min-w-[120px]')}
                    {th('Plot', 'plot', 'min-w-[60px]')}
                    {th('Step', 'step', 'min-w-[170px]')}
                    {th('Status', 'status', 'min-w-[100px]')}
                    {th('Investment', 'investmentNum', 'min-w-[90px] text-right')}
                    {th('Jobs', 'jobs', 'min-w-[55px] text-right')}
                    {th('Acres', 'acres', 'min-w-[55px] text-right')}
                    {th('Age', 'ageDays', 'min-w-[55px] text-right')}
                    {th('Expected by', 'expectedBy', 'min-w-[110px]')}
                    {th('Applied', 'applied', 'min-w-[110px]')}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pageData.length === 0 ? (
                    <tr><td colSpan={13} className="text-center py-8 text-muted-foreground text-xs">No results found</td></tr>
                  ) : pageData.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onNavigateToApp(row.id)}>
                      <td className="px-2 py-2">
                        <span className=" text-[10px] text-primary font-semibold hover:underline">{row.id}</span>
                      </td>
                      <td className="px-2 py-2 text-[11px] max-w-[200px]">
                        <span className="truncate block">{row.applicant}</span>
                      </td>
                      <td className="px-2 py-2 text-[11px] text-muted-foreground">{row.sector}</td>
                      <td className="px-2 py-2 text-[11px]">{row.themeCity}</td>
                      <td className="px-2 py-2  text-[10px] text-muted-foreground">{row.plot}</td>
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
          </>
        ) : activeTab === 'dates' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40"><tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Lead</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">Applicant</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]">Event</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Days away</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
              </tr></thead>
              <tbody className="divide-y">
                {DATES_DATA.sort((a, b) => a.daysAway - b.daysAway).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(row => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2  text-[10px] text-primary font-semibold">{row.caseId.slice(-11)}</td>
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
                        row.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200'
                          : row.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200')}>
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
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Lead</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">Applicant</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Due date</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Days</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Penalty accrued</th>
              </tr></thead>
              <tbody className="divide-y">
                {MONEY_DATA.sort((a, b) => a.daysNum - b.daysNum).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(row => (
                  <tr key={row.id} className={cn('hover:bg-muted/30 transition-colors', row.isOverdue && 'bg-red-50/40 dark:bg-red-950/10')}>
                    <td className="px-2 py-2  text-[10px] text-primary font-semibold">{row.caseId.slice(-11)}</td>
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
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Leads</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">In progress</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Approved</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Turned down</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Investment (₹ Cr)</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Jobs</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Acres</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Avg age (d)</th>
              </tr></thead>
              <tbody className="divide-y">
                {SECTORS_DATA.sort((a, b) => b.investmentCr - a.investmentCr).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(row => (
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
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Leads</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Investment (₹ Cr)</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Jobs</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Acres</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[120px]">Utilisation</th>
              </tr></thead>
              <tbody className="divide-y">
                {CITIES_DATA.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(row => {
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
                {ALLOTMENT_DATA.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(row => (
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
                {PLOTS_DATA.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(row => (
                  <tr key={row.plotId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2  text-[10px] font-semibold text-primary">{row.plotId}</td>
                    <td className="px-2 py-2">{row.city}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{row.acres}</td>
                    <td className="px-2 py-2">
                      <Badge variant="outline" className={cn('text-[9px] py-0',
                        row.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : row.status === 'Allotted' ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : row.status === 'Reserved' ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200')}>
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
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Leads</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">Primary sector</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Investment (₹ Cr)</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Jobs</th>
                <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Acres</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Latest status</th>
              </tr></thead>
              <tbody className="divide-y">
                {INVESTORS_DATA.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(row => (
                  <tr key={row.rank} className="hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2 text-right">
                      <span className={cn('inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold',
                        row.rank === 1 ? 'bg-amber-100 text-amber-700'
                          : row.rank === 2 ? 'bg-slate-100 text-slate-600'
                            : row.rank === 3 ? 'bg-orange-100 text-orange-700'
                              : 'bg-muted text-muted-foreground')}>{row.rank}</span>
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
                          : row.latestStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.latestStatus === 'Turned down' ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200')}>
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

        {/* Global Pagination Footer */}
        {totalRecords > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t">
            <p className="text-[10px] text-muted-foreground">
              Page {page} of {totalPages} &middot; {totalRecords} records
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
        )}
      </Card>
    </div>
  )
}

// ─── Dashboard Applications Table ──────────────────────────────────────────

export const MOCK_APP_ROWS = [
  { id: 'APCRDA-2026-0001', applicant: 'Vajra Technologies Pvt Ltd', sector: 'IT/ITES', investment: '₹680 Cr', area: '19 ac', appliedOn: '29 Jul 2026', stage: 'Application', sla: '2 days', priority: 'High', status: 'Submitted', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2026-0002', applicant: 'Kaveri Media Networks', sector: 'Media & Entertainment', investment: '₹310 Cr', area: '15 ac', appliedOn: '10 Jul 2026', stage: 'DPR Review', sla: '5 days', priority: 'Normal', status: 'Under Review', lead: 'R. Venkatesh' },
  { id: 'APCRDA-2026-0003', applicant: 'Bharat Electronics Systems', sector: 'Industrial', investment: '₹1,450 Cr', area: '45 ac', appliedOn: '18 May 2026', stage: 'Economic Review', sla: 'Overdue', priority: 'High', status: 'Under Review', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2025-0004', applicant: 'Deccan Logistics & Warehousing', sector: 'Logistics', investment: '₹120 Cr', area: '7 ac', appliedOn: '12 Apr 2026', stage: 'LASC Scrutiny', sla: 'Overdue', priority: 'Normal', status: 'Under Review', lead: 'S. Rao' },
  { id: 'APCRDA-2026-0005', applicant: 'Global Skills Alliance', sector: 'Education', investment: '₹210 Cr', area: '5 ac', appliedOn: '24 Apr 2026', stage: 'Govt. Approval', sla: '10 days', priority: 'Normal', status: 'Under Review', lead: 'R. Venkatesh' },
  { id: 'APCRDA-2026-0006', applicant: 'Nirmaan Health Partners', sector: 'Healthcare', investment: '₹540 Cr', area: '28 ac', appliedOn: '25 Feb 2026', stage: 'LASC Scrutiny', sla: '17 days', priority: 'High', status: 'Under Review', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2025-0007', applicant: 'Sunrise Sports Ventures', sector: 'Sports', investment: '₹390 Cr', area: '54 ac', appliedOn: '20 Jan 2026', stage: 'Govt. Approval', sla: '26 days', priority: 'High', status: 'Approved', lead: 'S. Rao' },
  { id: 'APCRDA-2025-0008', applicant: 'AP Judicial Infrastructure', sector: 'Government Organisations', investment: '₹160 Cr', area: '8 ac', appliedOn: '25 Dec 2025', stage: 'Govt. Approval', sla: '17 days', priority: 'Normal', status: 'Under Review', lead: 'R. Venkatesh' },
  { id: 'APCRDA-2025-0009', applicant: 'Sristi Financial Services', sector: 'Financial Institutions', investment: '₹890 Cr', area: '7 ac', appliedOn: '09 Dec 2025', stage: 'Order & Offer', sla: '17 days', priority: 'High', status: 'Approved', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2025-0010', applicant: 'Krishna Hospitality Group', sector: 'Hospitality', investment: '₹720 Cr', area: '22 ac', appliedOn: '07 Nov 2025', stage: 'Govt. Approval', sla: '26 days', priority: 'Normal', status: 'Under Review', lead: 'S. Rao' },
]

export function DashBadge({ value, variant }: { value: string; variant: 'status' | 'priority' | 'sla' }) {
  const cls = (() => {
    if (variant === 'status') {
      if (value === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      if (value === 'Rejected') return 'bg-red-50 text-red-700 border-red-200'
      if (value === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      if (value === 'Cancelled') return 'bg-red-50 text-red-700 border-red-200'
      if (value === 'Pending') return 'bg-amber-50 text-amber-700 border-amber-200'
      return 'bg-amber-50 text-amber-700 border-amber-200'
    }
    if (variant === 'priority') {
      if (value === 'High' || value === 'Critical') return 'bg-red-50 text-red-700 border-red-200'
      return 'bg-slate-100 text-slate-600 border-slate-200'
    }
    // sla
    if (value === 'Overdue') return 'bg-red-50 text-red-700 border-red-200 font-semibold'
    if (value.includes('2 days') || value.includes('1 day')) return 'bg-orange-50 text-orange-700 border-orange-200'
    return 'bg-slate-50 text-slate-600 border-slate-200'
  })()
  return <Badge variant="outline" className={cn('text-[9px] py-0 font-medium', cls)}>{value}</Badge>
}

export const DASH_SECTOR_OPTIONS = ['All Sectors', 'Commercial', 'Education', 'Financial Institutions', 'Food Processing', 'Government Organisations', 'Healthcare', 'Hospitality', 'IT/ITES', 'Industrial', 'Logistics', 'NGOs', 'Others', 'Pharmaceutical', 'Political Parties', 'Sports', 'Textiles']
export const DASH_STAGE_OPTIONS = ['All Stages', 'Application', 'Eligibility', 'DPR Review', 'Economic Review', 'LASC Scrutiny', 'Govt. Approval', 'Order & Offer']
export const DASH_STATUS_OPTIONS = ['All Statuses', 'Submitted', 'Under Review', 'Approved', 'Rejected']
export const DASH_PRIORITY_OPTIONS = ['All Priorities', 'Normal', 'High', 'Critical']

export function DashboardApplicationsTable({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [rows, setRows] = useState(MOCK_APP_ROWS)
  const [search, setSearch] = useState('')
  const [filterSector, setFilterSector] = useState('All Sectors')
  const [filterStage, setFilterStage] = useState('All Stages')
  const [filterStatus, setFilterStatus] = useState('All Statuses')
  const [filterPriority, setFilterPriority] = useState('All Priorities')
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 8

  // Fetch real applications and prepend
  useEffect(() => {
    fetch('/api/applications?pageSize=50')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.applications?.length) {
          const mapped = data.data.applications.map((a: any) => ({
            id: a.applicationNumber,
            applicant: a.applicant?.organizationName || 'N/A',
            sector: a.sector || 'N/A',
            investment: a.proposedInvestment ? `₹${(Number(a.proposedInvestment) / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` : 'N/A',
            area: a.landParcel?.extentAcres ? `${a.landParcel.extentAcres} ac` : 'N/A',
            appliedOn: new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            stage: a.currentStage || 'Application',
            sla: a.slaRemaining != null ? (a.slaRemaining < 0 ? 'Overdue' : `${a.slaRemaining} days`) : 'N/A',
            priority: a.priority || 'Normal',
            status: a.status || 'Submitted',
            lead: a.assignedOfficer?.name || 'N/A',
          }))
          setRows(prev => {
            const existingIds = new Set(prev.map(r => r.id))
            const unique = mapped.filter((r: any) => !existingIds.has(r.id))
            return [...unique, ...prev]
          })
        }
      })
      .catch(() => { })
  }, [])

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => {
      const matchQ = !q || r.id.toLowerCase().includes(q) || r.applicant.toLowerCase().includes(q) ||
        r.sector.toLowerCase().includes(q) || r.stage.toLowerCase().includes(q) || r.lead.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) || r.priority.toLowerCase().includes(q)

      const matchSector = filterSector === 'All Sectors' || r.sector === filterSector
      const matchStage = filterStage === 'All Stages' || r.stage === filterStage
      const matchStatus = filterStatus === 'All Statuses' || r.status === filterStatus
      const matchPriority = filterPriority === 'All Priorities' || r.priority === filterPriority

      return matchQ && matchSector && matchStage && matchStatus && matchPriority
    })
  }, [rows, search, filterSector, filterStage, filterStatus, filterPriority])

  const sorted = useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      const av = (a as any)[sortCol]; const bv = (b as any)[sortCol]
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }, [filtered, sortCol, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE) || 1
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const th = (label: string, key: string, cls = '') => (
    <th
      className={cn('px-3 py-2 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap', cls)}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortCol === key
          ? sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
          : <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />}
      </div>
    </th>
  )

  const resetFilters = () => {
    setSearch('')
    setFilterSector('All Sectors')
    setFilterStage('All Stages')
    setFilterStatus('All Statuses')
    setFilterPriority('All Priorities')
    setPage(1)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 py-1 border-b flex flex-row items-center justify-between space-y-0 gap-3">
        <CardTitle className="text-sm font-bold tracking-tight shrink-0">Applications</CardTitle>
        <div className="flex flex-wrap items-center justify-end gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search..."
              className="pl-7 pr-3 h-7 w-[160px] md:w-[180px] rounded-md border bg-background text-[11px] outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
            />
          </div>
          <Select value={filterSector} onValueChange={(v) => { setFilterSector(v); setPage(1) }}><SelectTrigger className="w-[125px] h-7 text-[11px]" data-active={filterSector !== 'All Sectors'}><SelectValue placeholder="Sector" /></SelectTrigger><SelectContent>{DASH_SECTOR_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-[11px]">{s}</SelectItem>)}</SelectContent></Select>
          <Select value={filterStage} onValueChange={(v) => { setFilterStage(v); setPage(1) }}><SelectTrigger className="w-[115px] h-7 text-[11px]" data-active={filterStage !== 'All Stages'}><SelectValue placeholder="Stage" /></SelectTrigger><SelectContent>{DASH_STAGE_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-[11px]">{s}</SelectItem>)}</SelectContent></Select>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1) }}><SelectTrigger className="w-[115px] h-7 text-[11px]" data-active={filterStatus !== 'All Status'}><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{DASH_STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-[11px]">{s}</SelectItem>)}</SelectContent></Select>
          <Select value={filterPriority} onValueChange={(v) => { setFilterPriority(v); setPage(1) }}><SelectTrigger className="w-[115px] h-7 text-[11px]" data-active={filterPriority !== 'All Priorities'}><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent>{DASH_PRIORITY_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-[11px]">{s}</SelectItem>)}</SelectContent></Select>
          {(search || filterSector !== 'All Sectors' || filterStage !== 'All Stages' || filterStatus !== 'All Statuses' || filterPriority !== 'All Priorities') && (
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground px-2" onClick={resetFilters}><X className="h-3 w-3" /> Clear</Button>
          )}
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/40 border-b">
            <tr>
              {th('Application ID', 'id', 'min-w-[160px]')}
              {th('Applicant', 'applicant', 'min-w-[180px]')}
              {th('Sector', 'sector', 'min-w-[130px]')}
              {th('Investment', 'investment', 'min-w-[100px]')}
              {th('Area', 'area', 'min-w-[70px]')}
              {th('Applied On', 'appliedOn', 'min-w-[110px]')}
              {th('Stage', 'stage', 'min-w-[130px]')}
              {th('SLA', 'sla', 'min-w-[90px]')}
              {th('Priority', 'priority', 'min-w-[80px]')}
              {th('Status', 'status', 'min-w-[100px]')}
              {th('Lead Manager', 'lead', 'min-w-[130px]')}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-8 text-muted-foreground text-xs">No results found</td></tr>
            ) : paged.map(row => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onNavigate(row.id)}>
                <td className="px-3 py-2 text-[10px] text-primary font-semibold">{row.id}</td>
                <td className="px-3 py-2 max-w-[200px]"><span className="truncate block font-medium">{row.applicant}</span></td>
                <td className="px-3 py-2 text-muted-foreground">{row.sector}</td>
                <td className="px-3 py-2 font-semibold tabular-nums">{row.investment}</td>
                <td className="px-3 py-2 text-muted-foreground tabular-nums">{row.area}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{row.appliedOn}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.stage}</td>
                <td className="px-3 py-2"><DashBadge value={row.sla} variant="sla" /></td>
                <td className="px-3 py-2"><DashBadge value={row.priority} variant="priority" /></td>
                <td className="px-3 py-2"><DashBadge value={row.status} variant="status" /></td>
                <td className="px-3 py-2 text-muted-foreground">{row.lead}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-1.5 border-t flex items-center justify-between bg-muted/20">
        <div className="text-[11px] text-muted-foreground">
          Showing {paged.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} entries
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded hover:bg-muted disabled:opacity-30 border bg-background flex items-center gap-1 px-2 shadow-sm transition-colors"><ChevronLeft className="h-3 w-3" /> Prev</button>
          <span className="px-2 font-medium">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1 rounded hover:bg-muted disabled:opacity-30 border bg-background flex items-center gap-1 px-2 shadow-sm transition-colors">Next <ChevronRight className="h-3 w-3" /></button>
        </div>
      </div>
    </Card>
  )
}

export function DashboardView() {
  const { view, navigateTo } = useAppLayout()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [trendWindow, setTrendWindow] = useState('12M')
  const [decisionsView, setDecisionsView] = useState<'month' | 'week'>('month')
  const [filters, setFilters] = useState({ date: '', parcel: '', app: '', stage: '', project: '', sector: '' })

  const hasFilters = Object.values(filters).some(Boolean)
  const clearFilters = () => setFilters({ date: '', parcel: '', app: '', stage: '', project: '', sector: '' })

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
    { name: 'Allotted', value: Math.floor((stats.landParcels.total - stats.landParcels.available) * 0.7), fill: 'oklch(0.45 0.12 180)' },
    { name: 'In Allocation', value: Math.ceil((stats.landParcels.total - stats.landParcels.available) * 0.3), fill: 'oklch(0.72 0.16 75)' },
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
    <div className="flex flex-col gap-2 pt-1.5">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 px-5 py-1 bg-gradient-to-r from-[#eefaf9] to-[#f4fcfc] rounded-2xl border border-teal-100/60 shadow-sm">
        <div>
          <h1 className="text-[15px] font-bold text-slate-800 flex items-center gap-1">
            Good Afternoon <span className="text-sm">👋</span>
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 font-medium">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>Saturday, 22 August 2026</span>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="flex items-center gap-2.5">
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 px-3 font-medium rounded-full">
              Clear
            </Button>
          )}

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search dashboard..."
              className="pl-8 pr-3 h-8 w-40 xl:w-48 rounded-full border border-slate-200 bg-white text-[11px] outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-slate-400 shadow-sm transition-all"
            />
          </div>

          <div className={cn("relative flex items-center gap-2 bg-white border shadow-sm rounded-full px-3.5 py-1.5 text-[11px] hover:bg-slate-50 transition-colors cursor-pointer", filters.date ? "border-primary/30" : "border-slate-200")}>
            <Calendar className={cn("h-3.5 w-3.5", filters.date ? 'text-primary' : 'text-teal-600')} />
            <span className={cn("font-semibold", filters.date ? 'text-primary' : 'text-slate-600')}>{filters.date || 'Date'}</span>
            <select value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="">All Dates</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
          <div className={cn("relative flex items-center gap-1.5 bg-white border shadow-sm rounded-full px-3.5 py-1.5 text-[11px] hover:bg-slate-50 transition-colors cursor-pointer", filters.parcel ? "border-primary/30" : "border-slate-200")}>
            <LandPlot className={cn("h-3.5 w-3.5", filters.parcel ? 'text-primary' : 'text-teal-600')} />
            <span className={cn("font-semibold", filters.parcel ? 'text-primary' : 'text-slate-600')}>{filters.parcel || 'All Parcels'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-1" />
            <select value={filters.parcel} onChange={e => setFilters(f => ({ ...f, parcel: e.target.value }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="">All Parcels</option>
              <option value="Available">Available</option>
              <option value="Allotted">Allotted</option>
            </select>
          </div>
          <div className={cn("relative flex items-center gap-1.5 bg-white border shadow-sm rounded-full px-3.5 py-1.5 text-[11px] hover:bg-slate-50 transition-colors cursor-pointer", filters.app ? "border-primary/30" : "border-slate-200")}>
            <FileText className={cn("h-3.5 w-3.5", filters.app ? 'text-primary' : 'text-teal-600')} />
            <span className={cn("font-semibold", filters.app ? 'text-primary' : 'text-slate-600')}>{filters.app || 'All Applications'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-1" />
            <select value={filters.app} onChange={e => setFilters(f => ({ ...f, app: e.target.value }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="">All Applications</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className={cn("relative flex items-center gap-1.5 bg-white border shadow-sm rounded-full px-3.5 py-1.5 text-[11px] hover:bg-slate-50 transition-colors cursor-pointer", filters.stage ? "border-primary/30" : "border-slate-200")}>
            <LayoutList className={cn("h-3.5 w-3.5", filters.stage ? 'text-primary' : 'text-teal-600')} />
            <span className={cn("font-semibold", filters.stage ? 'text-primary' : 'text-slate-600')}>{filters.stage || 'All Stages'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-1" />
            <select value={filters.stage} onChange={e => setFilters(f => ({ ...f, stage: e.target.value }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="">All Stages</option>
              <option value="Intake">Intake</option>
              <option value="DPR Review">DPR Review</option>
              <option value="Govt Approval">Govt Approval</option>
            </select>
          </div>
          <div className={cn("relative flex items-center gap-1.5 bg-white border shadow-sm rounded-full px-3.5 py-1.5 text-[11px] hover:bg-slate-50 transition-colors cursor-pointer", filters.project ? "border-primary/30" : "border-slate-200")}>
            <HardHat className={cn("h-3.5 w-3.5", filters.project ? 'text-primary' : 'text-teal-600')} />
            <span className={cn("font-semibold", filters.project ? 'text-primary' : 'text-slate-600')}>{filters.project || 'All Projects'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-1" />
            <select value={filters.project} onChange={e => setFilters(f => ({ ...f, project: e.target.value }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="">All Projects</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className={cn("relative flex items-center gap-1.5 bg-white border shadow-sm rounded-full px-3.5 py-1.5 text-[11px] hover:bg-slate-50 transition-colors cursor-pointer", filters.sector ? "border-primary/30" : "border-slate-200")}>
            <Building2 className={cn("h-3.5 w-3.5", filters.sector ? 'text-primary' : 'text-teal-600')} />
            <span className={cn("font-semibold", filters.sector ? 'text-primary' : 'text-slate-600')}>{filters.sector || 'All Sectors'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-1" />
            <select value={filters.sector} onChange={e => setFilters(f => ({ ...f, sector: e.target.value }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="">All Sectors</option>
              <option value="Commercial">Commercial</option>
              <option value="Education">Education</option>
              <option value="Financial Institutions">Financial Institutions</option>
              <option value="Food Processing">Food Processing</option>
              <option value="Government Organisations">Government Organisations</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Hospitality">Hospitality</option>
              <option value="IT/ITES">IT/ITES</option>
              <option value="Industrial">Industrial</option>
              <option value="Logistics">Logistics</option>
              <option value="NGOs">NGOs</option>
              <option value="Others">Others</option>
              <option value="Pharmaceutical">Pharmaceutical</option>
              <option value="Political Parties">Political Parties</option>
              <option value="Sports">Sports</option>
              <option value="Textiles">Textiles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid gap-1 grid-cols-2 lg:grid-cols-6 shrink-0">
        <StatCard
          title="Total Applications"
          value={stats?.applications.total ?? 0}
          subtitle={
            <div className="flex justify-between items-center w-full gap-x-1 text-[9px] font-bold text-muted-foreground mt-0.5 leading-tight whitespace-nowrap">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />New: {stats ? Math.floor(stats.applications.total * 0.6) : 0}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />LASC: {stats ? Math.floor(stats.applications.total * 0.25) : 0}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />GOM: {stats ? Math.ceil(stats.applications.total * 0.15) : 0}</span>
            </div>
          }
          icon={FileText}
          color="bg-gradient-to-br from-teal-500 to-teal-600"
        />
        <StatCard
          title="Deals"
          value={stats?.deals?.total ?? 142}
          subtitle={
            <div className="flex justify-between items-center w-full gap-x-1 text-[9px] font-bold text-muted-foreground mt-0.5 leading-tight whitespace-nowrap">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />Active: 82</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />Pending: 40</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />Cancelled: 20</span>
            </div>
          }
          icon={Handshake}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          title="Projects"
          value={stats?.constructions?.total ?? ((stats?.constructions?.active ?? 0) + 12)}
          subtitle={
            <div className="flex justify-start items-center w-full gap-x-4 text-[9px] font-bold text-muted-foreground mt-0.5 leading-tight whitespace-nowrap">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />Active: {stats?.constructions?.active ?? 0}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />In Process: {stats?.constructions?.inProcess ?? 12}</span>
            </div>
          }
          icon={HardHat}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          title="Revenue"
          value={formatCurrencyCr(stats?.payments?.totalRevenue ?? 0)}
          subtitle={
            <div className="flex justify-between items-center w-full gap-x-2 text-[9px] font-bold text-muted-foreground mt-0.5 leading-tight whitespace-nowrap">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />Received: {formatCurrencyCr(stats ? stats.payments.totalRevenue * 0.8 : 0)}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />Pending: {formatCurrencyCr(stats ? stats.payments.totalRevenue * 0.2 : 0)}</span>
            </div>
          }
          icon={IndianRupee}
          color="bg-gradient-to-br from-violet-500 to-purple-600"
          trend={(stats?.payments?.overdueCount ?? 0) > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Jobs Generated"
          value={stats?.jobs?.generated ? stats.jobs.generated.toLocaleString('en-IN') : '24,500'}
          subtitle={
            <div className="flex justify-start items-center w-full gap-x-4 text-[9px] font-bold text-muted-foreground mt-0.5 leading-tight whitespace-nowrap">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />Direct: 15,000</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />Indirect: 9,500</span>
            </div>
          }
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Land Parcels"
          value={stats?.landParcels.total ?? 0}
          subtitle={
            <div className="flex justify-between items-center w-full gap-x-2 text-[9px] font-bold text-muted-foreground mt-0.5 leading-tight whitespace-nowrap">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />Available: {stats?.landParcels.available ?? 0}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />Allotted: {stats ? Math.floor((stats.landParcels.total - stats.landParcels.available) * 0.7) : 0}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />Alloc.: {stats ? Math.ceil((stats.landParcels.total - stats.landParcels.available) * 0.3) : 0}</span>
            </div>
          }
          icon={LandPlot}
          color="bg-gradient-to-br from-emerald-500 to-green-600"
        />
      </div>

      {/* Pipeline Stage Cards */}
      <div>

        <div className="grid gap-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {PIPELINE_STAGES.map((stage) => <PipelineCard key={stage.id} stage={stage} />)}
        </div>
      </div>
      {/* Analytics Charts */}
      <div className="grid gap-1 lg:grid-cols-4">
        {/* Revenue Trend */}
        <Card className="border border-border shadow-sm hover:shadow-md hover:border-slate-400 hover:ring-1 hover:ring-slate-400/20 transition-all cursor-pointer">
          <CardHeader className="px-3 py-0">
            <CardTitle className="text-xs font-bold">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0">
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
        <Card className="border border-border shadow-sm hover:shadow-md hover:border-slate-400 hover:ring-1 hover:ring-slate-400/20 transition-all cursor-pointer">
          <CardHeader className="px-3 py-0">
            <CardTitle className="text-xs font-bold">Applications by Status</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0">
            <ChartContainer config={statusChartConfig} className="h-[160px] w-full">
              <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" barSize={18} radius={[10, 10, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Land Availability Pie */}
        <Card className="border border-border shadow-sm hover:shadow-md hover:border-slate-400 hover:ring-1 hover:ring-slate-400/20 transition-all cursor-pointer">
          <CardHeader className="px-3 py-0">
            <CardTitle className="text-xs font-bold">Land Availability</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0 flex items-center justify-center">
            <ChartContainer config={pieConfig} className="h-[160px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  cornerRadius={10}
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

        {/* How far cases get */}
        <Card className="border border-border shadow-sm hover:shadow-md hover:border-slate-400 hover:ring-1 hover:ring-slate-400/20 transition-all cursor-pointer">
          <CardHeader className="px-3 py-0">
            <CardTitle className="text-xs font-bold">How far cases get</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-0">
            <div className="space-y-3.5 mt-3 h-[160px]">
              {funnelData.map((item) => <FunnelBar key={item.stage} stage={item.stage} count={item.count} pct={item.pct} />)}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Decisions / Money / Investment */}
      <div className="grid gap-1 lg:grid-cols-3">
        <Card className="border border-border shadow-sm hover:shadow-md hover:border-slate-400 hover:ring-1 hover:ring-slate-400/20 transition-all cursor-pointer">
          <CardHeader className="px-3 py-2 flex flex-row items-center justify-between border-b pb-2 mb-2">
            <CardTitle className="text-xs font-bold mt-1">Decisions recorded</CardTitle>
            <div className="flex bg-muted/50 p-0.5 rounded-md border mt-0">
              <button onClick={() => setDecisionsView('week')} className={cn("text-[9px] px-2 py-0.5 rounded-sm transition-colors font-medium", decisionsView === 'week' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-slate-700")}>Week</button>
              <button onClick={() => setDecisionsView('month')} className={cn("text-[9px] px-2 py-0.5 rounded-sm transition-colors font-medium", decisionsView === 'month' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-slate-700")}>Month</button>
            </div>
          </CardHeader>
          <CardContent className="px-3 py-0">
            <ChartContainer config={decisionsConfig} className="h-[145px] w-full">
              <BarChart data={decisionsView === 'month' ? decisionsData : decisionsDataWeekly} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barSize={10}>
                <XAxis dataKey={decisionsView === 'month' ? 'month' : 'week'} tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="passed" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sentBack" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="refused" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm hover:shadow-md hover:border-slate-400 hover:ring-1 hover:ring-slate-400/20 transition-all cursor-pointer">
          <CardHeader className="px-3 py-0">
            <CardTitle className="text-xs font-bold">Money in each month</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0">
            <ChartContainer config={moneyConfig} className="h-[160px] w-full">
              <ComposedChart data={moneyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs><linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="billed" stroke="#6366f1" fill="url(#billedGrad)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="collected" stroke="#22c55e" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm hover:shadow-md hover:border-slate-400 hover:ring-1 hover:ring-slate-400/20 transition-all cursor-pointer">
          <CardHeader className="px-3 py-0">
            <CardTitle className="text-xs font-semibold">Investment by sector</CardTitle>
            <CardDescription className="text-[10px]">Committed rupees, largest first (â‚¹ Cr)</CardDescription>
          </CardHeader>
          <CardContent className="px-3 py-0">
            <ChartContainer config={investmentConfig} className="h-[160px] w-full">
              <BarChart data={investmentData} margin={{ top: 10, right: 10, bottom: 40, left: 4 }} barSize={12}>
                <XAxis type="category" dataKey="sector" tickLine={false} axisLine={false} tick={{ fontSize: 8 }} angle={-45} textAnchor="end" interval={0} height={40} />
                <YAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                  {investmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={INVESTMENT_COLORS[index % INVESTMENT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Apps + Risk Alerts */}
      <div className="grid gap-1 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card className="border border-border shadow-sm hover:shadow-md hover:border-slate-400 hover:ring-1 hover:ring-slate-400/20 transition-all cursor-pointer">
          <CardHeader className="px-3 py-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-1.5" onClick={() => navigateTo('applications')}>
                View all <ArrowRight className="h-2.5 w-2.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 py-0">
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
        <Card className="border border-border shadow-sm hover:shadow-md hover:border-slate-400 hover:ring-1 hover:ring-slate-400/20 transition-all cursor-pointer">
          <CardHeader className="px-3 py-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold">Risk Alerts</CardTitle>
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
          <CardContent className="px-3 py-0">
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
      {/* ── Applications Table ── */}
      <DashboardApplicationsTable onNavigate={(id) => navigateTo('application-detail', { id })} />

    </div>
  )
}

