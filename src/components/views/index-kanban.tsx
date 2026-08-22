'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  FileText, Clock, AlertCircle, CheckCircle2, Circle, Loader2, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react'

const DEFAULT_STAGES = [
  'Application', 'Eligibility', 'DPR Review', 'Economic Review', 'LASC',
  'GoM', 'Cabinet Sub-Committee', 'Authority Approval', 'Cabinet Approval',
  'Government Order', 'LOI', 'Payment', 'Revised DPR', 'Agreement',
  'Possession', 'Building Permission', 'Construction', 'Compliance',
]

interface StageConfig {
  id: string; stageName: string; stageOrder: number; slaDays: number; isActive: boolean
}

interface AppItem {
  id: string; applicationNumber: string; projectName: string
  currentStage: string; status: string; priority: string
  createdAt: string; slaDueDate: string | null; slaRemaining: number | null
  applicant: { id: string; organizationName: string; contactPerson: string | null; contactEmail: string | null }
  landParcel: { id: string; plotId: string; surveyNumber: string; extentAcres: number; zone: { name: string; code: string } | null; landUse: { name: string; code: string } | null } | null
}

const stageColors: Record<string, string> = {
  'Application': 'bg-blue-50 border-blue-200',
  'Eligibility': 'bg-cyan-50 border-cyan-200',
  'DPR Review': 'bg-violet-50 border-violet-200',
  'Economic Review': 'bg-purple-50 border-purple-200',
  'LASC': 'bg-amber-50 border-amber-200',
  'GoM': 'bg-orange-50 border-orange-200',
  'Cabinet Sub-Committee': 'bg-rose-50 border-rose-200',
  'Authority Approval': 'bg-emerald-50 border-emerald-200',
  'Cabinet Approval': 'bg-teal-50 border-teal-200',
  'Government Order': 'bg-green-50 border-green-200',
  'LOI': 'bg-lime-50 border-lime-200',
  'Payment': 'bg-yellow-50 border-yellow-200',
  'Agreement': 'bg-sky-50 border-sky-200',
  'Possession': 'bg-indigo-50 border-indigo-200',
  'Construction': 'bg-fuchsia-50 border-fuchsia-200',
  'Compliance': 'bg-green-50 border-green-200',
}

function getStageColor(stage: string) {
  return stageColors[stage] || 'bg-gray-50 border-gray-200'
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    'Draft': 'bg-gray-100 text-gray-700',
    'Submitted': 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-amber-100 text-amber-700',
    'Approved': 'bg-emerald-100 text-emerald-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Completed': 'bg-green-100 text-green-700',
  }
  return <Badge variant="secondary" className={variants[status] || ''}>{status}</Badge>
}

function PriorityIndicator({ priority }: { priority: string }) {
  if (priority === 'High') return <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
  if (priority === 'Medium') return <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
  return <Circle className="h-3.5 w-3.5 text-gray-400 shrink-0" />
}

function SLAIndicator({ remaining }: { remaining: number | null }) {
  if (remaining === null) return null
  if (remaining < 0) return <Badge variant="destructive" className="text-[10px] px-1.5">Overdue</Badge>
  if (remaining <= 3) return <Badge variant="outline" className="text-[10px] px-1.5 border-amber-500 text-amber-700">{remaining}d left</Badge>
  return <span className="text-[10px] text-muted-foreground">{remaining}d left</span>
}

function AppCard({ app, onNavigate }: { app: AppItem; onNavigate: (id: string) => void }) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow mb-2"
      onClick={() => onNavigate(app.id)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <PriorityIndicator priority={app.priority} />
            <span className="text-xs  text-muted-foreground truncate">
              {app.applicationNumber}
            </span>
          </div>
          <StatusBadge status={app.status} />
        </div>
        <p className="text-sm font-medium truncate">{app.projectName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {app.applicant?.organizationName}
        </p>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
          <span>{app.landParcel?.plotId || 'N/A'}</span>
          <SLAIndicator remaining={app.slaRemaining} />
        </div>
      </CardContent>
    </Card>
  )
}

function StageSection({ stage, items, navigateTo }: { stage: string, items: AppItem[], navigateTo: (id: string) => void }) {
  const [startIndex, setStartIndex] = useState(0)
  const visibleItems = items.slice(startIndex, startIndex + 4)
  const hasNext = startIndex + 4 < items.length
  const hasPrev = startIndex > 0

  return (
    <div className="w-full flex flex-col">
      <div className={`rounded-md border px-4 py-3 mb-4 flex items-center justify-between shadow-sm border-l-4 ${getStageColor(stage)}`}>
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-800">{stage}</h3>
          <Badge variant="secondary" className="text-xs">
            {items.length} {items.length === 1 ? 'Application' : 'Applications'}
          </Badge>
        </div>
        {items.length > 4 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground mr-2">Showing {startIndex + 1}-{Math.min(startIndex + 4, items.length)} of {items.length}</span>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-white" disabled={!hasPrev} onClick={() => setStartIndex(s => s - 4)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-white" disabled={!hasNext} onClick={() => setStartIndex(s => s + 4)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center bg-muted/10">
          <p className="text-sm text-muted-foreground">No applications currently in this stage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleItems.map(app => (
            <AppCard key={app.id} app={app} onNavigate={navigateTo} />
          ))}
        </div>
      )}
    </div>
  )
}

export function WorkflowKanban({ hideHeader }: { hideHeader?: boolean } = {}) {
  const { navigateTo } = useAppLayout()
  const [stages, setStages] = useState<string[]>(DEFAULT_STAGES)
  const [apps, setApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [configRes, appsRes] = await Promise.all([
        fetch('/api/workflow-config').then(r => r.json()),
        fetch('/api/applications?pageSize=100').then(r => r.json()),
      ])
      if (configRes.success && configRes.data?.stages?.length > 0) {
        setStages(configRes.data.stages.map((s: StageConfig) => s.stageName))
      }
      if (appsRes.success) {
        setApps(appsRes.data.applications || [])
      }
    } catch {
      setError('Failed to load workflow data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const grouped = stages.map(stage => ({
    stage,
    items: apps.filter(a => a.currentStage === stage),
  }))

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[280px] w-[280px]">
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-32 w-full mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  const activeStages = grouped.length > 0 ? grouped : stages.slice(0, 6).map(s => ({ stage: s, items: [] }))

  return (
    <div className="space-y-4 h-full flex flex-col pb-4">
      {!hideHeader && (
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-semibold">Workflow Board</h2>
          <p className="text-sm text-muted-foreground">
            {apps.length} applications across {activeStages.length} active stages
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>
      )}

      <div className="w-full flex-1 min-w-0 overflow-y-auto pr-4 space-y-8 pb-8 pt-2">
        {activeStages.map(({ stage, items }) => (
          <StageSection key={stage} stage={stage} items={items} navigateTo={(id) => navigateTo('application-detail', { id })} />
        ))}
      </div>
    </div>
  )
}
