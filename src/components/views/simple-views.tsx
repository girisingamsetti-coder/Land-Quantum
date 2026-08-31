'use client'
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ScrollText, Users, Building2, Settings, Map, ClipboardList,
  AlertTriangle, AlertCircle, CheckCircle2, XCircle, Shield, BarChart3,
  Search, Filter, X, ChevronDown, ChevronUp, Clock, ArrowRight, FileWarning,
  IndianRupee, Loader2, FileDown, FileSpreadsheet, Printer, Plus,
  CircleDot, Layers, Zap, Box, User, Settings2, Tag, LayoutList
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppLayout } from '@/components/layout/app-layout'
import { RecordsTable } from '@/components/dashboard/dashboard-view'

function formatINR(amount: number) { return `\u20B9${(amount / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` }

function statusColor(s: string) {
  if (['Approved', 'Completed', 'Paid', 'Compliant', 'Resolved', 'Issued', 'Executed', 'Registered'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
  if (['Under Review', 'In Progress', 'Pending', 'Open', 'Draft', 'Submitted', 'Notice Issued', 'Decision Made', 'Scheduled', 'Under Scrutiny'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
  if (['Rejected', 'Failed', 'Non-Compliant', 'Overdue', 'Cancelled'].includes(s)) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
  if (['Deferred', 'On Hold', 'Delayed', 'At Risk', 'Partially Paid'].includes(s)) return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60'
  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
}

function severityColor(s: string) {
  if (s === 'Critical') return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
  if (s === 'High') return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60'
  if (s === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
  return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60'
}

function severityTileColor(s: string) {
  if (s === 'Critical') return { bg: 'bg-gradient-to-r from-red-50 to-white/50 dark:from-red-950/30 dark:to-card/60', border: 'border-transparent dark:border-border/50 hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px]', text: 'text-red-700 dark:text-red-400', iconBg: 'bg-red-100 dark:bg-red-950/60', iconText: 'text-red-600 dark:text-red-400' }
  if (s === 'High') return { bg: 'bg-gradient-to-r from-orange-50 to-white/50 dark:from-orange-950/30 dark:to-card/60', border: 'border-transparent dark:border-border/50 hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px]', text: 'text-orange-700 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-950/60', iconText: 'text-orange-600 dark:text-orange-400' }
  if (s === 'Medium') return { bg: 'bg-gradient-to-r from-amber-50 to-white/50 dark:from-amber-950/30 dark:to-card/60', border: 'border-transparent dark:border-border/50 hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px]', text: 'text-amber-700 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-950/60', iconText: 'text-amber-600 dark:text-amber-400' }
  return { bg: 'bg-gradient-to-r from-blue-50 to-white/50 dark:from-blue-950/30 dark:to-card/60', border: 'border-transparent dark:border-border/50 hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px]', text: 'text-blue-700 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-950/60', iconText: 'text-blue-600 dark:text-blue-400' }
}

// Filter bar component
function FilterBar({ children, activeCount, onClear }: { children: React.ReactNode; activeCount: number; onClear: () => void }) {
  return (
    <Card>
      <CardContent className="px-3 py-0 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Filters</span>
        </div>
        {children}
        {activeCount > 0 && (
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 px-2 border-destructive text-destructive hover:bg-destructive/10" onClick={onClear}>
            <X className="h-3 w-3" /> Clear ({activeCount})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function SearchInput({ value, onChange, onSearch, placeholder }: {
  value: string; onChange: (v: string) => void; onSearch: () => void; placeholder?: string
}) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder={placeholder || 'Search...'}
        className="pl-8 h-8 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      />
    </div>
  )
}

// CANCELLATIONS
export function CancellationsView({ hideHeader, tabsControl }: { hideHeader?: boolean, tabsControl?: React.ReactNode } = {}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/cancellations').then(r => r.json()).then(j => j.success && setData(j.data)).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!data?.cases) return []
    return data.cases.filter((c: any) => {
      if (search) {
        const s = search.toLowerCase()
        return c.caseNumber?.toLowerCase().includes(s) || c.application?.projectName?.toLowerCase().includes(s) || c.reason?.toLowerCase().includes(s)
      }
      return true
    })
  }, [data, search])

  const activeFilters = [search].filter(Boolean).length

  return (
    <div className="space-y-4">
      {!hideHeader && <div><h1 className="text-2xl font-bold tracking-tight">Cancellation & Resumption</h1><p className="text-sm text-muted-foreground">Track cancellation cases, notices, and resumption proceedings</p></div>}
      
      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            {tabsControl}
          </div>
          <div className="relative w-full sm:flex-1 max-w-md ml-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search cases, applications, reasons..."
              className="pl-8 h-8 text-xs w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={() => setSearch('')}>
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </Card>
      <Card>
        <CardContent className="px-3 py-0">{loading ? <div className="p-4 space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div> :
          <Table><TableHeader><TableRow><TableHead>Case #</TableHead><TableHead>Application</TableHead><TableHead>Project</TableHead><TableHead>Initiated By</TableHead><TableHead>Reason</TableHead><TableHead>Decision</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
            {filtered.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className=" text-xs font-medium">{c.caseNumber}</TableCell>
                <TableCell className=" text-[11px]">{c.application?.applicationNumber}</TableCell>
                <TableCell className="text-xs">{c.application?.projectName}</TableCell>
                <TableCell><Badge variant="outline" className={cn('text-[10px]', c.initiatedBy === 'APCRDA' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200')}>{c.initiatedBy}</Badge></TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{c.reason}</TableCell>
                <TableCell className="text-xs">{c.decision || '—'}</TableCell>
                <TableCell><Badge variant="outline" className={cn('text-[10px]', statusColor(c.status))}>{c.status}</Badge></TableCell>
              </TableRow>))}
          </TableBody></Table>}</CardContent></Card>
    </div>
  )
}

// REPORTS
export function ReportsView() {
  const { navigateTo } = useAppLayout();
  const [reportId, setReportId] = useState('summary');
  const [filters, setFilters] = useState({ from: '', to: '', phase: 'ALL', status: 'ALL' });
  const [exporting, setExporting] = useState<string | null>(null);

  const catalogue = useMemo(() => [
    { id: 'summary', title: 'Summary', description: 'Live summary table of all leads, dates, money, sectors, plots and investors' },
    { id: 'case-pipeline', title: 'Case Pipeline', description: 'Overview of all cases across phases' },
    { id: 'financial-summary', title: 'Financial Summary', description: 'Payments, dues and revenue' },
    { id: 'land-allocation', title: 'Land Allocation', description: 'Plot status and sector distribution' },
    { id: 'stage-aging', title: 'Stage Aging & Bottlenecks', description: 'Time spent in each workflow stage' },
    { id: 'approval-log', title: 'Approval Log', description: 'Detailed log of all case approvals' },
    { id: 'dormant-at-risk', title: 'Dormant / At-Risk Allotment', description: 'Inactive cases and pending cancellations' },
    { id: 'grievances-summary', title: 'Grievances Summary', description: 'Complaints, categories, and resolution SLA' },
    { id: 'allotment-summary', title: 'Allotment Summary', description: 'Breakdown by sector, objectives, and mode' },
  ], []);

  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Simulating the user's API fetch since the backend doesn't exist yet
    const timer = setTimeout(() => {
      let data: any = null;
      if (reportId === 'stage-aging') {
        data = {
          summary: [{ label: 'Avg Cycle Time', value: '42 days' }, { label: 'Stalled Cases', value: '38' }, { label: 'Worst Bottleneck', value: 'Document Verification' }],
          columns: [{ key: 'id', label: 'App ID', align: 'left' }, { key: 'stage', label: 'Current Stage', align: 'left' }, { key: 'daysInStage', label: 'Days in Stage', align: 'right' }, { key: 'slaStatus', label: 'SLA Status', align: 'left' }],
          rows: Array.from({ length: 15 }).map((_, i) => ({ id: `APP-2024-${2000 + i}`, stage: ['Initial Scrutiny', 'Document Verification', 'Board Approval'][i % 3], daysInStage: (i * 3 + 5).toString(), slaStatus: i % 4 === 0 ? 'Breached' : 'On Track' }))
        };
      } else if (reportId === 'approval-log') {
        data = {
          summary: [{ label: 'Approvals this Month', value: '145' }, { label: 'Avg Approval Time', value: '12 days' }],
          columns: [{ key: 'id', label: 'App ID', align: 'left' }, { key: 'applicant', label: 'Applicant', align: 'left' }, { key: 'approvedBy', label: 'Approved By', align: 'left' }, { key: 'date', label: 'Approval Date', align: 'left' }],
          rows: Array.from({ length: 15 }).map((_, i) => ({ id: `APP-2024-${3000 + i}`, applicant: `Applicant ${i}`, approvedBy: 'Board Committee', date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10) }))
        };
      } else if (reportId === 'dormant-at-risk') {
        data = {
          summary: [{ label: 'Dormant Cases', value: '24' }, { label: 'At-Risk Revenue', value: '₹145 Cr' }, { label: 'Pending Cancellations', value: '8' }],
          columns: [{ key: 'id', label: 'App ID', align: 'left' }, { key: 'lastActivity', label: 'Last Activity', align: 'left' }, { key: 'riskLevel', label: 'Risk Level', align: 'left' }, { key: 'pendingDues', label: 'Pending Dues (₹)', align: 'right' }],
          rows: Array.from({ length: 15 }).map((_, i) => ({ id: `APP-2024-${4000 + i}`, lastActivity: `${60 + i * 5} days ago`, riskLevel: i % 3 === 0 ? 'High (Cancellation Pending)' : 'Medium (Dormant)', pendingDues: `₹${((500000 * i) / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` }))
        };
      } else if (reportId === 'grievances-summary') {
        data = {
          summary: [{ label: 'Open Grievances', value: '42' }, { label: 'Resolution Rate', value: '89%' }, { label: 'Avg Resolution Time', value: '4 days' }],
          columns: [{ key: 'id', label: 'Ticket ID', align: 'left' }, { key: 'category', label: 'Category', align: 'left' }, { key: 'status', label: 'Status', align: 'left' }, { key: 'priority', label: 'Priority', align: 'left' }],
          rows: Array.from({ length: 15 }).map((_, i) => ({ id: `TKT-2024-${5000 + i}`, category: ['Payment Issue', 'Document Upload', 'Plot Handover'][i % 3], status: ['Open', 'In Progress', 'Resolved'][i % 3], priority: ['High', 'Medium', 'Low'][i % 3] }))
        };
      } else if (reportId === 'allotment-summary') {
        data = {
          summary: [{ label: 'Total Allotted Area', value: '1,450 Acres' }, { label: 'Top Sector', value: 'Manufacturing' }, { label: 'Total Allotments', value: '312' }],
          columns: [{ key: 'sector', label: 'Sector/Objective', align: 'left' }, { key: 'mode', label: 'Allotment Mode', align: 'left' }, { key: 'count', label: 'Allotments', align: 'right' }, { key: 'acres', label: 'Total Area (Acres)', align: 'right' }],
          rows: Array.from({ length: 10 }).map((_, i) => ({ sector: ['Manufacturing', 'IT/ITES', 'Healthcare', 'Logistics'][i % 4], mode: ['Direct Allotment', 'Auction', 'Tender'][i % 3], count: (10 + i * 2).toString(), acres: (50 + i * 15).toString() }))
        };
      } else {
        // Default Case Pipeline & others
        data = {
          summary: [{ label: 'Total Cases', value: '1,245' }, { label: 'Value', value: '₹4,500 Cr' }, { label: 'Avg Processing', value: '45 days' }],
          columns: [{ key: 'id', label: 'ID', align: 'left' }, { key: 'applicant', label: 'Applicant', align: 'left' }, { key: 'status', label: 'Status', align: 'left' }, { key: 'date', label: 'Date', align: 'left' }, { key: 'value', label: 'Value (₹)', align: 'right' }],
          rows: Array.from({ length: 15 }).map((_, i) => ({ id: `APP-2024-${1000 + i}`, applicant: `Company ${String.fromCharCode(65 + (i % 26))} Pvt Ltd`, status: ['Under Review', 'Approved', 'Pending Payment'][i % 3], date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), value: `₹${((1000000 * (i + 1)) / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` }))
        };
      }
      setReport(data);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [reportId, filters]);

  async function exportAs(format: 'csv' | 'pdf') {
    setExporting(format);
    setTimeout(() => {
      setExporting(null);
      toast.success(`${format.toUpperCase()} downloaded.`);
    }, 1000);
  }

  const active = catalogue.find((r: any) => r.id === reportId);
  const meta = { phases: [{ value: 'P1', label: 'Phase 1' }], caseStatuses: ['UNDER_REVIEW', 'APPROVED'] };
  const hasFilters = Boolean(filters.from || filters.to || filters.phase !== 'ALL' || filters.status !== 'ALL');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Date-range and filter driven. Every report exports to CSV and PDF.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5 mr-2" /> Print
          </Button>
          <Button variant="outline" size="sm" disabled={exporting === 'csv'} onClick={() => exportAs('csv')}>
            {exporting === 'csv' ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />}
            CSV
          </Button>
          <Button size="sm" disabled={exporting === 'pdf'} onClick={() => exportAs('pdf')}>
            {exporting === 'pdf' ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <FileDown className="h-3.5 w-3.5 mr-2" />}
            PDF
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">STANDARD REPORTS</h2>
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
          {catalogue.map((r: any) => (
            <Button
              key={r.id}
              variant={reportId === r.id ? "default" : "outline"}
              onClick={() => setReportId(r.id)}
              className="whitespace-nowrap h-9 px-4 text-xs font-medium shadow-sm transition-all"
            >
              {r.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2 flex-1 mr-auto flex-wrap">
            <span className="text-xs font-medium text-muted-foreground shrink-0">Dates:</span>
            <Input type="date" className="h-8 text-xs w-36" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} title="From Date" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" className="h-8 text-xs w-36" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} title="To Date" />
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
            <Select value={filters.phase} onValueChange={(v) => setFilters({ ...filters, phase: v })}>
              <SelectTrigger className="h-8 text-xs w-[130px]" data-active={filters.phase !== 'ALL'} icon={<Layers className="size-3.5" />}><SelectValue placeholder="Phase" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All phases</SelectItem>
                {meta?.phases?.map((p: any) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger className="h-8 text-xs w-[130px]" data-active={filters.status !== 'ALL'} icon={<CircleDot className="size-3.5" />}><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Any status</SelectItem>
                {meta?.caseStatuses?.map((s: any) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={() => setFilters({ from: '', to: '', phase: 'ALL', status: 'ALL' })}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </Card>
      {reportId === 'summary' ? (
        <RecordsTable onNavigateToApp={(id) => navigateTo('application-detail', { id })} />
      ) : (
        <Card className="shadow-md overflow-hidden">

          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            </div>
          ) : !report ? (
            <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5 mb-2" />
              <p>Select a report</p>
            </div>
          ) : (
            <>

              {report.rows.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No records match the selected filters</div>
              ) : (
                <div className="max-h-[65vh] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                      <TableRow>
                        {report.columns.map((c: any) => (
                          <TableHead key={c.key} className={c.align === 'right' ? 'text-right' : ''}>
                            {c.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.rows.map((row: any, i: number) => (
                        <TableRow key={i} className="hover:bg-muted/50">
                          {report.columns.map((c: any) => (
                            <TableCell key={c.key} className={cn("whitespace-nowrap text-xs", c.align === 'right' && 'text-right')}>
                              {c.key === 'remarks' || c.key === 'note' ? (
                                <span className="block max-w-[22rem] whitespace-normal">{row[c.key]}</span>
                              ) : (
                                row[c.key]
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">
                {report.rows.length.toLocaleString('en-IN')} row{report.rows.length === 1 ? '' : 's'} · generated{' '}
                {new Date().toLocaleString('en-GB')}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  )
}

// AUDIT LOG
export function AuditLogView({ hideHeader }: { hideHeader?: boolean } = {}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')
  const [module, setModule] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/audit-logs?pageSize=50').then(r => r.json()).then(j => j.success && setData(j.data)).finally(() => setLoading(false)) }, [])

  const actions = useMemo(() => { if (!data?.logs) return []; return [...new Set(data.logs.map((l: any) => l.action))].sort() as string[] }, [data])
  const modules = useMemo(() => { if (!data?.logs) return []; return [...new Set(data.logs.map((l: any) => l.module).filter(Boolean))] as string[] }, [data])

  const filtered = useMemo(() => {
    if (!data?.logs) return []
    return data.logs.filter((l: any) => {
      if (action && l.action !== action) return false
      if (module && l.module !== module) return false
      if (search) {
        const s = search.toLowerCase()
        const matchUser = l.userName?.toLowerCase().includes(s)
        const matchRole = l.role?.toLowerCase().includes(s)
        const matchAction = l.action?.toLowerCase().includes(s)
        const matchModule = l.module?.toLowerCase().includes(s)
        return matchUser || matchRole || matchAction || matchModule
      }
      return true
    })
  }, [data, action, module, search])

  const hasFilters = Boolean(action || module || search)
  const resetFilters = () => {
    setAction('')
    setModule('')
    setSearch('')
  }

  return (
    <div className="space-y-4">
      {!hideHeader && <div><h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1><p className="text-sm text-muted-foreground">Immutable record of all system actions and changes</p></div>}
      
      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="relative w-full sm:flex-1 mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search user, role, action, module..."
              className="pl-8 h-8 text-xs w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
            <Select value={action || 'All'} onValueChange={v => setAction(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[130px] h-8 text-xs" data-active={!!action && action !== 'All'} icon={<Zap className="size-3.5" />}>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All Actions</SelectItem>
                {actions.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={module || 'All'} onValueChange={v => setModule(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[130px] h-8 text-xs" data-active={!!module && module !== 'All'} icon={<Box className="size-3.5" />}>
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All Modules</SelectItem>
                {modules.map(m => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </Card>
      <Card>
        <CardContent className="px-3 py-0">{loading ? <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> :
          <Table><TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Action</TableHead><TableHead>Module</TableHead></TableRow></TableHeader><TableBody>
            {filtered.map((l: any) => (<TableRow key={l.id}>
              <TableCell className="text-[11px] tabular-nums text-muted-foreground whitespace-nowrap">{new Date(l.createdAt).toLocaleString('en-IN')}</TableCell>
              <TableCell className="text-xs">{l.userName || 'System'}</TableCell>
              <TableCell className="text-xs">{l.role || '—'}</TableCell>
              <TableCell><Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">{l.action}</Badge></TableCell>
              <TableCell className="text-xs">{l.module || '—'}</TableCell>
            </TableRow>))}
          </TableBody></Table>}</CardContent></Card>
    </div>
  )
}

// USERS
export function UsersView({ hideHeader }: { hideHeader?: boolean } = {}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/users').then(r => r.json()).then(j => j.success && setData(j.data)).finally(() => setLoading(false)) }, [])

  const roles = useMemo(() => { if (!data?.users) return []; return [...new Set(data.users.map((u: any) => u.role?.name).filter(Boolean))] as string[] }, [data])

  const filtered = useMemo(() => {
    if (!data?.users) return []
    return data.users.filter((u: any) => {
      if (role && u.role?.name !== role) return false
      if (search) {
        const s = search.toLowerCase()
        return u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.department?.name?.toLowerCase().includes(s)
      }
      return true
    })
  }, [data, role, search])

  const hasFilters = Boolean(role || search)
  const resetFilters = () => {
    setRole('')
    setSearch('')
  }

  return (
    <div className="space-y-4">
      {!hideHeader && <div><h1 className="text-2xl font-bold tracking-tight">User Management</h1><p className="text-sm text-muted-foreground">Manage system users, roles, and department assignments</p></div>}
      
      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="relative w-full sm:flex-1 mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search user name, email, department..."
              className="pl-8 h-8 text-xs w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
            <Select value={role || 'All'} onValueChange={v => setRole(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!role && role !== 'All'} icon={<User className="size-3.5" />}>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All Roles</SelectItem>
                {roles.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </Card>
      <Card>
        <CardContent className="px-3 py-0">{loading ? <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> :
          <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Designation</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
            {filtered.map((u: any) => (<TableRow key={u.id}>
              <TableCell className="text-sm font-medium">{u.name}</TableCell>
              <TableCell className="text-xs">{u.email}</TableCell>
              <TableCell className="text-xs">{u.designation || '—'}</TableCell>
              <TableCell><Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">{u.role?.name}</Badge></TableCell>
              <TableCell className="text-xs">{u.department?.name || '—'}</TableCell>
              <TableCell><Badge variant="outline" className={cn('text-[10px]', u.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200')}>{u.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
            </TableRow>))}
          </TableBody></Table>}</CardContent></Card>
    </div>
  )
}

// DEPARTMENTS
export function DepartmentsView({ hideHeader }: { hideHeader?: boolean } = {}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/users').then(r => r.json()).then(j => j.success && setData(j.data)).finally(() => setLoading(false)) }, [])

  const filteredDepts = useMemo(() => {
    if (!data?.departments) return []
    if (!search) return data.departments
    const s = search.toLowerCase()
    return data.departments.filter((d: any) => d.name?.toLowerCase().includes(s) || d.code?.toLowerCase().includes(s))
  }, [data, search])

  const filteredRoles = useMemo(() => {
    if (!data?.roles) return []
    if (!search) return data.roles
    const s = search.toLowerCase()
    return data.roles.filter((r: any) => r.name?.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s))
  }, [data, search])

  return (
    <div className="space-y-4">
      {!hideHeader && <div><h1 className="text-2xl font-bold tracking-tight">Departments & Roles</h1><p className="text-sm text-muted-foreground">Manage organizational structure and role-based access</p></div>}
      
      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="relative w-full sm:flex-1 mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search departments and roles..."
              className="pl-8 h-8 text-xs w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={() => setSearch('')}>
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Departments</CardTitle></CardHeader><CardContent className="px-3 py-0"><Table><TableBody>{filteredDepts.map((d: any) => (<TableRow key={d.id}><TableCell className="text-sm font-medium">{d.name}</TableCell><TableCell className=" text-xs text-muted-foreground">{d.code}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Roles</CardTitle></CardHeader><CardContent className="px-3 py-0"><Table><TableBody>{filteredRoles.map((r: any) => (<TableRow key={r.id}><TableCell className="text-sm font-medium">{r.name}</TableCell><TableCell className="text-xs text-muted-foreground">{r.description}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      </div>
    </div>
  )
}

// SETTINGS
export function SettingsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [workflowSearch, setWorkflowSearch] = useState('')
  const [workflowRole, setWorkflowRole] = useState('All')
  const [slaSearch, setSlaSearch] = useState('')
  const [systemSearch, setSystemSearch] = useState('')
  const [systemCategory, setSystemCategory] = useState('All')
  
  const [templates, setTemplates] = useState([
    { id: '1', name: 'LOI Letter', description: 'Allotment terms, financial details, and acceptance annexure.' },
    { id: '2', name: 'Payment Due Notice', description: 'Outstanding payment reminder with bank details.' },
    { id: '3', name: 'Agreement Cover Letter', description: 'Draft agreement with payment and land details.' },
    { id: '4', name: 'Approval Guidelines', description: 'Required clearances and application procedures.' },
    { id: '5', name: 'Construction Start Notice', description: 'Construction timeline and commencement requirements.' },
  ])
  const [editingTemplate, setEditingTemplate] = useState<any>(null)

  const handleSaveTemplate = () => {
    if (!editingTemplate?.name?.trim()) {
      toast.error('Template name is required')
      return
    }
    if (editingTemplate.id) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t))
      toast.success('Template updated successfully.')
    } else {
      setTemplates([...templates, { ...editingTemplate, id: Date.now().toString() }])
      toast.success('Template created successfully.')
    }
    setEditingTemplate(null)
  }

  useEffect(() => { fetch('/api/workflow-config').then(r => r.json()).then(j => j.success && setData(j.data)).finally(() => setLoading(false)) }, [])

  const workflowRoles = useMemo(() => {
    if (!data?.stages) return []
    return [...new Set(data.stages.map((s: any) => s.ownerRole).filter(Boolean))] as string[]
  }, [data])

  const systemCategories = useMemo(() => {
    if (!data?.settings) return []
    return [...new Set(data.settings.map((s: any) => s.category).filter(Boolean))] as string[]
  }, [data])

  const filteredStages = useMemo(() => {
    if (!data?.stages) return []
    return data.stages.filter((s: any) => {
      if (workflowRole !== 'All' && s.ownerRole !== workflowRole) return false
      if (workflowSearch) {
        const q = workflowSearch.toLowerCase()
        return s.stageName?.toLowerCase().includes(q) || s.ownerRole?.toLowerCase().includes(q)
      }
      return true
    })
  }, [data, workflowSearch, workflowRole])

  const filteredSla = useMemo(() => {
    if (!data?.stages) return []
    if (!slaSearch) return data.stages
    const q = slaSearch.toLowerCase()
    return data.stages.filter((s: any) => s.stageName?.toLowerCase().includes(q) || s.ownerRole?.toLowerCase().includes(q))
  }, [data, slaSearch])

  const filteredSettings = useMemo(() => {
    if (!data?.settings) return []
    return data.settings.filter((s: any) => {
      if (systemCategory !== 'All' && s.category !== systemCategory) return false
      if (systemSearch) {
        const q = systemSearch.toLowerCase()
        return s.key?.toLowerCase().includes(q) || s.label?.toLowerCase().includes(q) || String(s.value)?.toLowerCase().includes(q)
      }
      return true
    })
  }, [data, systemSearch, systemCategory])

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1><p className="text-sm text-muted-foreground">Configure workflow stages, SLA targets, and system settings</p></div>
      <Tabs defaultValue="workflow" className="flex flex-col h-full">
        <TabsList className="flex-wrap h-auto mb-3">
          <TabsTrigger value="workflow">Workflow Stages</TabsTrigger>
          <TabsTrigger value="sla">SLA Configuration</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments & Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="templates">Document Templates</TabsTrigger>
        </TabsList>

        {/* TAB 1: WORKFLOW */}
        <TabsContent value="workflow" className="space-y-3">
          <Card className="p-1.5 border shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
              <div className="relative w-full sm:flex-1 mr-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search workflow stages, owner role..."
                  className="pl-8 h-8 text-xs w-full"
                  value={workflowSearch}
                  onChange={e => setWorkflowSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
                <Select value={workflowRole} onValueChange={setWorkflowRole}>
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-active={workflowRole !== 'All'} icon={<User className="size-3.5" />}>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All" className="text-xs">All Roles</SelectItem>
                    {workflowRoles.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                {(workflowSearch || workflowRole !== 'All') && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={() => { setWorkflowSearch(''); setWorkflowRole('All') }}>
                    <X className="h-3.5 w-3.5" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </Card>
          <Card>
            <CardContent className="px-3 py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Owner Role</TableHead>
                    <TableHead>SLA (days)</TableHead>
                    <TableHead>Optional</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStages.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs tabular-nums">{s.stageOrder}</TableCell>
                      <TableCell className="text-sm font-medium">{s.stageName}</TableCell>
                      <TableCell className="text-xs">{s.ownerRole}</TableCell>
                      <TableCell className="text-xs tabular-nums">{s.slaDays}</TableCell>
                      <TableCell>{s.isOptional ? <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60">Yes</Badge> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                      <TableCell>{s.isActive ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SLA */}
        <TabsContent value="sla" className="space-y-3">
          <Card className="p-1.5 border shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
              <div className="relative w-full sm:flex-1 mr-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search SLA configuration by stage name..."
                  className="pl-8 h-8 text-xs w-full"
                  value={slaSearch}
                  onChange={e => setSlaSearch(e.target.value)}
                />
              </div>
              {slaSearch && (
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={() => setSlaSearch('')}>
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>
          </Card>
          <Card>
            <CardContent className="px-3 py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stage</TableHead>
                    <TableHead>Owner Role</TableHead>
                    <TableHead className="text-right">SLA Target</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSla.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm font-medium">{s.stageName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.ownerRole}</TableCell>
                      <TableCell className="text-sm font-bold tabular-nums text-right">{s.slaDays} days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SYSTEM SETTINGS */}
        <TabsContent value="system" className="space-y-3">
          <Card className="p-1.5 border shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
              <div className="relative w-full sm:flex-1 mr-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search settings key, label, value..."
                  className="pl-8 h-8 text-xs w-full"
                  value={systemSearch}
                  onChange={e => setSystemSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
                <Select value={systemCategory} onValueChange={setSystemCategory}>
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-active={systemCategory !== 'All'} icon={<Settings2 className="size-3.5" />}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All" className="text-xs">All Categories</SelectItem>
                    {systemCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {(systemSearch || systemCategory !== 'All') && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={() => { setSystemSearch(''); setSystemCategory('All') }}>
                    <X className="h-3.5 w-3.5" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </Card>
          <Card>
            <CardContent className="px-3 py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Label</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSettings.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs font-medium">{s.key}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{typeof s.value === 'string' && s.value.startsWith('{') ? 'JSON Config' : s.value}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200">{s.category}</Badge></TableCell>
                      <TableCell className="text-xs">{s.label}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users"><UsersView hideHeader /></TabsContent>
        <TabsContent value="departments"><DepartmentsView hideHeader /></TabsContent>
        <TabsContent value="audit"><AuditLogView hideHeader /></TabsContent>
        <TabsContent value="templates" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Document Templates</h3>
                <p className="text-xs text-muted-foreground mt-1">Configure and manage standard templates used for auto-generated documents.</p>
              </div>
              <Button size="sm" onClick={() => setEditingTemplate({ name: '', description: '' })}><Plus className="h-4 w-4 mr-1"/> New Template</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t, idx) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-xs">{t.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.description}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditingTemplate({ ...t })}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          
          <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTemplate?.id ? 'Edit Template' : 'New Template'}</DialogTitle>
              </DialogHeader>
              {editingTemplate && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input 
                      value={editingTemplate.name} 
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })} 
                      placeholder="e.g. Demand Notice"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={editingTemplate.description} 
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })} 
                      placeholder="Brief description of the template's purpose"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Template File</Label>
                    <Input 
                      type="file"
                      accept=".pdf,.docx,.doc"
                      className="cursor-pointer text-xs"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          toast.success(`File "${e.target.files[0].name}" attached successfully.`);
                        }
                      }}
                    />
                    <p className="text-[10px] text-muted-foreground">Upload the standard template file (PDF or Word document).</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                <Button onClick={handleSaveTemplate}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// GIS
export function GISView() {
  const [parcels, setParcels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { fetch('/api/land-parcels?pageSize=100').then(r => r.json()).then(j => j.success && setParcels(j.data.parcels)).finally(() => setLoading(false)) }, [])

  const colorMap: Record<string, string> = { Published: '#10b981', Allotted: '#3b82f6', 'Under Application': '#f59e0b', Reserved: '#8b5cf6', 'On Hold': '#f97316', Withdrawn: '#6b7280', Draft: '#d1d5db', 'Under Review': '#fcd34d' }

  const filtered = statusFilter ? parcels.filter(p => p.status === statusFilter) : parcels

  const activeFilters = statusFilter ? 1 : 0

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">GIS Land Map</h1><p className="text-sm text-muted-foreground">Interactive map visualization of land parcels (mock layer)</p></div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2"><Card className="overflow-hidden"><div className="py-2.5 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 min-h-[400px]">
          <div className="text-center text-muted-foreground mb-4"><Map className="h-3.5 w-3.5 mx-auto mb-2" /><p className="text-sm font-medium">Land Parcel Map</p><p className="text-xs">Mock GIS Layer — Real GIS via PostGIS/MapLibre</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">{filtered.map((p) => (
            <div key={p.id} className="rounded border-2 p-2 hover:shadow-md transition-shadow" style={{ borderColor: colorMap[p.status] || '#9ca3af' }} title={`${p.plotId}\n${p.zone?.name}\n${p.status}`}>
              <div className="h-10 rounded-sm mb-1" style={{ backgroundColor: colorMap[p.status] || '#9ca3af', opacity: 0.6 }} /><p className="text-[7px]  truncate font-medium">{p.plotId.replace('APCRDA-P-', '')}</p><p className="text-[6px] text-muted-foreground">{p.extentAcres}ac · {p.zone?.name}</p>
            </div>))}</div>
        </div></Card></div>
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Legend</h3>
          {Object.entries(colorMap).map(([status, color]) => (<div key={status} className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} /><span className="text-xs">{status} ({parcels.filter(p => p.status === status).length})</span></div>))}
          <Separator /><h3 className="text-sm font-semibold">Zone Distribution</h3>
          {Object.entries(parcels.reduce((acc: any, p: any) => { const z = p.zone?.name || 'Unknown'; acc[z] = (acc[z] || 0) + 1; return acc }, {})).map(([zone, count]) => (
            <div key={zone} className="flex items-center justify-between"><span className="text-xs">{zone}</span><Badge variant="secondary" className="text-[10px]">{count as number}</Badge></div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// MY WORK QUEUE
export function MyWorkQueue({ hideHeader, tabsControl }: { hideHeader?: boolean, tabsControl?: React.ReactNode } = {}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/my-work-queue').then(r => r.json()).then(j => j.success && setData(j.data)).finally(() => setLoading(false)) }, [])
  return (
    <div className="space-y-4">
      {!hideHeader && <div><h1 className="text-2xl font-bold tracking-tight">Work Queue</h1><p className="text-sm text-muted-foreground">Pending tasks, approvals, and queries assigned to you</p></div>}
      {tabsControl && <div className="mb-4">{tabsControl}</div>}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-blue-50 to-white/50 dark:from-blue-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Applications</p><div className="rounded-lg bg-blue-100 dark:bg-blue-950/60 p-2"><FileWarning className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /></div></div><p className="text-lg font-bold tabular-nums leading-tight mt-1 truncate">{data?.assignedApps?.length || 0}</p></CardContent></Card>
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-amber-50 to-white/50 dark:from-amber-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Stages</p><div className="rounded-lg bg-amber-100 dark:bg-amber-950/60 p-2"><Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /></div></div><p className="text-lg font-bold tabular-nums leading-tight mt-1 truncate">{data?.assignedStages?.length || 0}</p></CardContent></Card>
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-rose-50 to-white/50 dark:from-rose-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Grievances</p><div className="rounded-lg bg-rose-100 dark:bg-rose-950/60 p-2"><AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /></div></div><p className="text-lg font-bold tabular-nums leading-tight mt-1 truncate">{data?.grievances?.length || 0}</p></CardContent></Card>
      </div>
      <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Pending Stage Actions</CardTitle></CardHeader><CardContent className="px-3 py-0">
        {loading ? <div className="p-4"><Skeleton className="h-12 w-full" /></div> :
          data?.assignedStages?.length === 0 ? <p className="text-sm text-muted-foreground p-4">No pending actions</p> :
            <Table><TableHeader><TableRow><TableHead>Application</TableHead><TableHead>Project</TableHead><TableHead>Stage</TableHead></TableRow></TableHeader><TableBody>
              {data?.assignedStages?.map((s: any) => (<TableRow key={s.id}><TableCell className=" text-xs">{s.application?.applicationNumber}</TableCell><TableCell className="text-xs">{s.application?.projectName}</TableCell><TableCell><Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">{s.stageName}</Badge></TableCell></TableRow>))}
            </TableBody></Table>}
      </CardContent></Card>
    </div>
  )
}

// RISK ALERTS WITH DRILL-DOWN
const RISK_ALERTS = [
  { id: '1', severity: 'Critical', type: 'SLA Breach', description: 'APCRDA-2024-0008 has breached SLA at Economic Review stage', application: 'APCRDA-2024-0008', createdAt: '2024-12-01T10:30:00Z', details: { stage: 'Economic Review', slaDays: 7, daysOverdue: 3, assignedTo: 'K. Padmavathi', actionRequired: 'Immediate escalation to GoM. Applicant has been notified of delay.' }, history: [{ date: '2024-11-24', event: 'SLA timer started' }, { date: '2024-12-01', event: 'SLA breached — auto-escalation triggered' }] },
  { id: '2', severity: 'High', type: 'Payment Overdue', description: 'Down payment for APCRDA-2024-0004 is overdue by 15 days', application: 'APCRDA-2024-0004', createdAt: '2024-11-28T09:00:00Z', details: { amountDue: '₹5,00,00,000', dueDate: '2024-11-13', daysOverdue: 15, penaltyAccrued: '₹12,50,000', actionRequired: 'Issue final notice. Initiate cancellation proceedings if unpaid within 7 days.' }, history: [{ date: '2024-11-13', event: 'Payment due date' }, { date: '2024-11-20', event: 'First reminder sent' }, { date: '2024-11-28', event: 'Second notice — escalation' }] },
  { id: '3', severity: 'High', type: 'Construction Delayed', description: 'Amaravati Tech Hub construction is 30% behind schedule', application: 'APCRDA-2024-0002', createdAt: '2024-11-25T14:00:00Z', details: { projectName: 'Amaravati Tech Hub', physicalProgress: 22, expectedProgress: 52, delayDays: 45, contractor: 'L&T Construction', actionRequired: 'Convene site review meeting. Assess penalty clauses in agreement.' }, history: [{ date: '2024-10-01', event: 'Construction commenced' }, { date: '2024-11-10', event: 'First delay detected' }, { date: '2024-11-25', event: '30% threshold breached — flag escalated' }] },
  { id: '4', severity: 'Medium', type: 'LOI Expiring', description: 'LOI for APCRDA-2024-0005 expires in 15 days', application: 'APCRDA-2024-0005', createdAt: '2024-11-30T08:00:00Z', details: { loiIssueDate: '2024-09-15', loiExpiryDate: '2024-12-15', daysRemaining: 15, paymentStatus: 'Partially Paid', actionRequired: 'Follow up on pending payment. Consider LOI extension if in progress.' }, history: [{ date: '2024-09-15', event: 'LOI issued' }, { date: '2024-11-15', event: 'Payment partial — 60% received' }, { date: '2024-11-30', event: '15-day expiry warning triggered' }] },
  { id: '5', severity: 'Medium', type: 'Non-Utilisation', description: 'No construction activity on plot APCRDA-P-022 for 6 months', application: 'APCRDA-2024-0013', createdAt: '2024-11-20T11:00:00Z', details: { plotId: 'APCRDA-P-022', lastActivityDate: '2024-05-20', monthsInactive: 6, agreementDate: '2024-01-10', actionRequired: 'Issue show-cause notice. Review non-utilisation clauses.' }, history: [{ date: '2024-01-10', event: 'Land possession handed over' }, { date: '2024-05-20', event: 'Last construction activity recorded' }, { date: '2024-11-20', event: '6-month inactivity alert' }] },
  { id: '6', severity: 'Low', type: 'DPR Returned', description: 'DPR for Capital City Mall returned 2 times', application: 'APCRDA-2024-0009', createdAt: '2024-11-27T16:00:00Z', details: { returnCount: 2, reviewer: 'M. Suresh Babu', lastReturnReason: 'Insufficient structural analysis. FSI calculations need revision.', actionRequired: 'Notify applicant. Provide detailed feedback for DPR resubmission.' }, history: [{ date: '2024-11-10', event: 'DPR submitted (1st attempt)' }, { date: '2024-11-15', event: 'DPR returned — 1st time' }, { date: '2024-11-22', event: 'DPR resubmitted (2nd attempt)' }, { date: '2024-11-27', event: 'DPR returned — 2nd time' }] },
]

function AlertDrillDown({ alert, onClose }: { alert: typeof RISK_ALERTS[0]; onClose: () => void }) {
  const tc = severityTileColor(alert.severity)
  return (
    <div className="mt-3 ml-6 border rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Alert Details</h4>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}><X className="h-3 w-3 mr-1" />Collapse</Button>
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(alert.details).filter(([k]) => k !== 'actionRequired').map(([key, val]) => (
          <div key={key} className="rounded-md bg-muted/50 p-2.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            <p className="text-xs font-medium mt-0.5">{String(val)}</p>
          </div>
        ))}
      </div>

      {/* Action Required */}
      {alert.details.actionRequired && (
        <div className={cn('rounded-md p-3', tc.bg, 'border', tc.border)}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Action Required</p>
          <p className={cn('text-xs mt-1', tc.text)}>{alert.details.actionRequired}</p>
        </div>
      )}

      {/* Timeline */}
      {alert.history && alert.history.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Timeline</p>
          <div className="space-y-1.5">
            {alert.history.map((h, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">{new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs">{h.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function RiskAlertsView() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')

  const types = useMemo(() => [...new Set(RISK_ALERTS.map(a => a.type))], [])

  const filtered = useMemo(() => {
    return RISK_ALERTS.filter(a => {
      if (severityFilter && a.severity !== severityFilter) return false
      if (typeFilter && a.type !== typeFilter) return false
      if (search) {
        const s = search.toLowerCase()
        const matchDesc = a.description.toLowerCase().includes(s)
        const matchApp = a.application.toLowerCase().includes(s)
        const matchType = a.type.toLowerCase().includes(s)
        return matchDesc || matchApp || matchType
      }
      return true
    })
  }, [severityFilter, typeFilter, search])

  const hasFilters = Boolean(severityFilter || typeFilter || search)
  const resetFilters = () => {
    setSeverityFilter('')
    setTypeFilter('')
    setSearch('')
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Risk & Alerts</h1><p className="text-sm text-muted-foreground">Automated risk identification and escalation alerts</p></div>

      {/* Severity Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => {
          const tc = severityTileColor(sev)
          const count = RISK_ALERTS.filter(a => a.severity === sev).length
          return (
            <Card key={sev} className={cn('border', tc.border, tc.bg, 'cursor-pointer transition-all hover:shadow-md', severityFilter === sev && 'outline outline-1 outline-primary outline-offset-[-1px]')} onClick={() => setSeverityFilter(severityFilter === sev ? '' : sev)}>
              <CardContent className="px-3 py-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">{sev}</p>
                    <p className={cn('text-lg font-bold tabular-nums leading-tight mt-1 truncate', tc.text)}>{count}</p>
                  </div>
                  <div className={cn('rounded-lg p-2 shrink-0', tc.iconBg)}>
                    <AlertCircle className={cn('h-3.5 w-3.5', tc.iconText)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="relative w-full sm:flex-1 mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search alerts, description, application..."
              className="pl-8 h-8 text-xs w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
            <Select value={severityFilter || 'All'} onValueChange={v => setSeverityFilter(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[120px] h-8 text-xs" data-active={!!severityFilter && severityFilter !== 'All'} icon={<AlertTriangle className="size-3.5" />}>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
                  <SelectItem key={s} value={s} className="text-xs">{s === 'All' ? 'Severity' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter || 'All'} onValueChange={v => setTypeFilter(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!typeFilter && typeFilter !== 'All'} icon={<Tag className="size-3.5" />}>
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All Types</SelectItem>
                {types.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {filtered.map((alert) => {
          const tc = severityTileColor(alert.severity)
          const isExpanded = expandedId === alert.id
          return (
            <div key={alert.id}>
              <Card className={cn('p-4 border-l-4 cursor-pointer transition-all hover:shadow-sm', tc.border, isExpanded && tc.bg)} onClick={() => setExpandedId(isExpanded ? null : alert.id)}>
                <div className="flex items-start gap-3">
                  <div className={cn('rounded-lg p-2 mt-0.5 shrink-0', tc.iconBg)}>
                    <AlertCircle className={cn('h-4 w-4', tc.iconText)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn('text-[10px]', severityColor(alert.severity))}>{alert.severity}</Badge>
                      <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">{alert.type}</Badge>
                      <span className=" text-[10px] text-muted-foreground">{alert.application}</span>
                    </div>
                    <p className="text-sm mt-1.5">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{new Date(alert.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                </div>
              </Card>
              {isExpanded && <AlertDrillDown alert={alert} onClose={() => setExpandedId(null)} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
