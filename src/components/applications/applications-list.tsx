'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppLayout } from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Search, Eye, Download, FileSpreadsheet, FileText, ChevronLeft, ChevronRight,
  Inbox, RefreshCw, Filter, X,
} from 'lucide-react'

// ---- Types ----

interface AppStage {
  id: string
  stageName: string
  stageOrder: number
  status: string
  decision: string | null
  completedAt: string | null
}

interface AppOfficer {
  id: string
  name: string
  designation: string | null
}

interface AppLandParcel {
  id: string
  plotId: string
  surveyNumber: string
  extentAcres: number
  zone: { name: string; code: string } | null
  landUse: { name: string; code: string } | null
}

interface AppAllotmentMode {
  id: string
  name: string
  code: string
}

interface Application {
  id: string
  applicationNumber: string
  projectName: string | null
  status: string
  priority: string
  currentStage: string
  proposedInvestment: number
  employmentCommitment: number
  slaDueDate: string | null
  slaRemaining: number | null
  createdAt: string
  applicant: { id: string; organizationName: string; contactPerson: string | null; contactEmail: string | null }
  landParcel: AppLandParcel | null
  allotmentMode: AppAllotmentMode | null
  assignedOfficer: AppOfficer | null
  stages: AppStage[]
}

interface ApplicationsResponse {
  applications: Application[]
  total: number
  page: number
  pageSize: number
}

// ---- Constants ----

const STATUS_OPTIONS = ['All', 'Draft', 'Submitted', 'Under Review', 'Clarification Required', 'Approved', 'Rejected', 'Deferred', 'Withdrawn', 'Cancelled', 'Completed']

const STAGE_OPTIONS = [
  'All', 'Application', 'Eligibility', 'DPR Review', 'Economic Review', 'LASC',
  'GoM', 'Cabinet Sub-Committee', 'Authority Approval', 'Cabinet Approval',
  'Government Order', 'LOI', 'Payment', 'Revised DPR', 'Agreement',
  'Possession', 'Building Permission', 'Construction', 'Compliance',
]

const SECTOR_OPTIONS = [
  'All', 'IT & ITES', 'Real Estate', 'Healthcare', 'Education',
  'Hospitality & Tourism', 'Manufacturing', 'Financial Services', 'Retail',
  'Logistics', 'Energy', 'Agriculture', 'Media & Entertainment',
]

const MODE_OPTIONS = [
  'All', 'Nomination / Suo Moto', 'Quality-Based Selection',
  'Quality-cum-Price Selection', 'Public Tender / e-Tender',
  'Public Auction / e-Auction', 'Randomized Selection / Draw of Lots',
]

// ---- Helpers ----

function formatINR(amount: number) {
  return `\u20B9${amount.toLocaleString('en-IN')}`
}

function statusColor(status: string): string {
  switch (status) {
    case 'Approved': case 'Completed': case 'Paid': case 'Compliant': return 'bg-emerald-100 text-emerald-800'
    case 'Under Review': case 'In Progress': case 'Pending': return 'bg-amber-100 text-amber-800'
    case 'Rejected': case 'Failed': case 'Non-Compliant': return 'bg-red-100 text-red-800'
    case 'Deferred': case 'On Hold': return 'bg-orange-100 text-orange-800'
    case 'Submitted': case 'Draft': default: return 'bg-gray-100 text-gray-800'
  }
}

function stageColor(status: string): string {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-800'
    case 'In Progress': case 'Pending Action': return 'bg-amber-100 text-amber-800'
    case 'Returned': return 'bg-orange-100 text-orange-800'
    case 'Rejected': return 'bg-red-100 text-red-800'
    case 'Not Started': default: return 'bg-gray-100 text-gray-700'
  }
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'Critical': return 'bg-red-100 text-red-800'
    case 'High': return 'bg-orange-100 text-orange-800'
    case 'Normal': return 'bg-blue-100 text-blue-800'
    case 'Low': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function slaBadge(slaRemaining: number | null) {
  if (slaRemaining === null) return <span className="text-xs text-muted-foreground">N/A</span>
  if (slaRemaining < 0) return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{Math.abs(slaRemaining)}d overdue</Badge>
  if (slaRemaining <= 3) return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{slaRemaining}d left</Badge>
  if (slaRemaining <= 7) return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{slaRemaining}d left</Badge>
  return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{slaRemaining}d left</Badge>
}

// ---- Component ----

export function ApplicationsList({ hideHeader }: { hideHeader?: boolean } = {}) {
  const { navigateTo } = useAppLayout()

  const [data, setData] = useState<ApplicationsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('All')
  const [stage, setStage] = useState('All')
  const [sector, setSector] = useState('All')
  const [mode, setMode] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) params.set('search', search)
      if (status !== 'All') params.set('status', status)
      if (stage !== 'All') params.set('stage', stage)
      if (sector !== 'All') params.set('sector', sector)
      if (mode !== 'All') params.set('mode', mode)

      const res = await fetch(`/api/applications?${params}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [search, status, stage, sector, mode, page])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatus('All')
    setStage('All')
    setSector('All')
    setMode('All')
    setPage(1)
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0
  const from = data ? (data.page - 1) * data.pageSize + 1 : 0
  const to = data ? Math.min(data.page * data.pageSize, data.total) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      {!hideHeader && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">Manage land allotment applications and track workflow progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={fetchApplications} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      )}
      {/* Filters (No Card, No Padding) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-muted-foreground"><Filter className="h-4 w-4" /><span className="text-xs font-semibold">Filters</span></div>
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <div className="relative max-w-xs w-full sm:w-auto"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search..." className="pl-8 h-8 text-xs" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} /></div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}><SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
          <Select value={stage} onValueChange={(v) => { setStage(v); setPage(1) }}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Stage" /></SelectTrigger><SelectContent>{STAGE_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
          <Select value={sector} onValueChange={(v) => { setSector(v); setPage(1) }}><SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Sector" /></SelectTrigger><SelectContent>{SECTOR_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={resetFilters}><X className="h-3.5 w-3.5" /> Clear</Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-9 w-full" />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.applications.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No applications found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Try adjusting your search or filter criteria to find applications.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App #</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Plot</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Investment</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Assigned Officer</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-xs font-medium">{app.applicationNumber}</TableCell>
                      <TableCell>
                        <div className="max-w-[180px] truncate" title={app.applicant?.organizationName}>
                          <p className="font-medium text-sm truncate">{app.applicant?.organizationName}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.applicant?.contactPerson}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm" title={app.projectName ?? ''}>
                        {app.projectName || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {app.landParcel?.plotId ? (
                          <span className="font-mono text-xs">{app.landParcel.plotId}</span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-xs">{app.sector || '—'}</TableCell>
                      <TableCell>
                        <Badge className={`${stageColor(app.stages.find(s => s.stageName === app.currentStage)?.status ?? 'Not Started')} hover:${stageColor(app.stages.find(s => s.stageName === app.currentStage)?.status ?? 'Not Started')} text-[11px]`}>
                          {app.currentStage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColor(app.status)} hover:${statusColor(app.status)} text-[11px]`}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums">
                        {formatINR(app.proposedInvestment)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${priorityColor(app.priority)} hover:${priorityColor(app.priority)} text-[11px]`}>
                          {app.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{slaBadge(app.slaRemaining)}</TableCell>
                      <TableCell className="text-xs">
                        {app.assignedOfficer?.name || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => navigateTo('application-detail', { id: app.id })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{' '}
                  <span className="font-medium">{data.total}</span> applications
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="sm" className="h-8 gap-1"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </Button>
                  <span className="text-sm font-medium px-2">Page {page} of {totalPages}</span>
                  <Button
                    variant="outline" size="sm" className="h-8 gap-1"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
