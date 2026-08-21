'use client'
import { useState, useEffect, useMemo } from 'react'
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
import {
  ScrollText, Users, Building2, Settings, Map, ClipboardList,
  AlertTriangle, AlertCircle, CheckCircle2, XCircle, Shield, BarChart3,
  Search, Filter, X, ChevronDown, ChevronUp, Clock, ArrowRight, FileWarning,
  IndianRupee,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function formatINR(amount: number) { return `\u20B9${amount.toLocaleString('en-IN')}` }

function statusColor(s: string) {
  if (['Approved','Completed','Paid','Compliant','Resolved','Issued','Executed','Registered'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (['Under Review','In Progress','Pending','Open','Draft','Submitted','Notice Issued','Decision Made','Scheduled','Under Scrutiny'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200'
  if (['Rejected','Failed','Non-Compliant','Overdue','Cancelled'].includes(s)) return 'bg-red-100 text-red-700 border-red-200'
  if (['Deferred','On Hold','Delayed','At Risk','Partially Paid'].includes(s)) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

function severityColor(s: string) {
  if (s === 'Critical') return 'bg-red-100 text-red-700 border-red-200'
  if (s === 'High') return 'bg-orange-100 text-orange-700 border-orange-200'
  if (s === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-blue-100 text-blue-700 border-blue-200'
}

function severityTileColor(s: string) {
  if (s === 'Critical') return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', iconBg: 'bg-red-100', iconText: 'text-red-600' }
  if (s === 'High') return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', iconBg: 'bg-orange-100', iconText: 'text-orange-600' }
  if (s === 'Medium') return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', iconBg: 'bg-amber-100', iconText: 'text-amber-600' }
  return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-100', iconText: 'text-blue-600' }
}

// Filter bar component
function FilterBar({ children, activeCount, onClear }: { children: React.ReactNode; activeCount: number; onClear: () => void }) {
  return (
    <Card>
      <CardContent className="p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Filters</span>
        </div>
        {children}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={onClear}>
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
export function CancellationsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/cancellations').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!data?.cases) return []
    return data.cases.filter((c: any) => {
      if (status && c.status !== status) return false
      if (search) {
        const s = search.toLowerCase()
        return c.caseNumber?.toLowerCase().includes(s) || c.application?.projectName?.toLowerCase().includes(s) || c.reason?.toLowerCase().includes(s)
      }
      return true
    })
  }, [data, status, search])

  const activeFilters = [status, search].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Cancellation & Resumption</h1><p className="text-sm text-muted-foreground">Track cancellation cases, notices, and resumption proceedings</p></div>
      <FilterBar activeCount={activeFilters} onClear={() => { setStatus(''); setSearch('') }}>
        <SearchInput value={search} onChange={setSearch} onSearch={() => {}} placeholder="Search cases..." />
        <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[140px] h-8"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{['All','Open','Notice Issued','Decision Made','Completed','Cancelled'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </FilterBar>
      <Card><CardContent className="p-0">{loading ? <div className="p-4 space-y-2">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-14 w-full"/>)}</div> :
      <Table><TableHeader><TableRow><TableHead>Case #</TableHead><TableHead>Application</TableHead><TableHead>Project</TableHead><TableHead>Initiated By</TableHead><TableHead>Reason</TableHead><TableHead>Decision</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
        {filtered.map((c: any) => (
          <TableRow key={c.id}>
            <TableCell className="font-mono text-xs font-medium">{c.caseNumber}</TableCell>
            <TableCell className="font-mono text-[11px]">{c.application?.applicationNumber}</TableCell>
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
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/reports?type=overview').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1><p className="text-sm text-muted-foreground">Comprehensive reports on applications, land, finance, and compliance</p></div>
      <Tabs defaultValue="status"><TabsList><TabsTrigger value="status">By Status</TabsTrigger><TabsTrigger value="stage">By Stage</TabsTrigger><TabsTrigger value="sector">By Sector</TabsTrigger><TabsTrigger value="finance">Finance</TabsTrigger></TabsList>
        <TabsContent value="status"><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Status</TableHead><TableHead className="text-right">Count</TableHead><TableHead>Share</TableHead></TableRow></TableHeader><TableBody>
          {data?.byStatus?.map((s: any) => (<TableRow key={s.status}><TableCell><Badge variant="outline" className={cn('text-[10px]', statusColor(s.status))}>{s.status}</Badge></TableCell><TableCell className="text-right font-bold">{s._count}</TableCell><TableCell><div className="flex items-center gap-2"><Progress value={(s._count/(data?.totalApps||1))*100} className="h-2 flex-1"/><span className="text-xs tabular-nums">{((s._count/(data?.totalApps||1))*100).toFixed(1)}%</span></div></TableCell></TableRow>))}
        </TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="stage"><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Stage</TableHead><TableHead className="text-right">Applications</TableHead></TableRow></TableHeader><TableBody>
          {data?.byStage?.map((s: any) => (<TableRow key={s.currentStage}><TableCell className="text-sm">{s.currentStage}</TableCell><TableCell className="text-right font-bold">{s._count}</TableCell></TableRow>))}
        </TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="sector"><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Sector</TableHead><TableHead className="text-right">Applications</TableHead></TableRow></TableHeader><TableBody>
          {data?.bySector?.filter((s:any)=>s.sector).map((s: any) => (<TableRow key={s.sector}><TableCell className="text-sm">{s.sector}</TableCell><TableCell className="text-right font-bold">{s._count}</TableCell></TableRow>))}
        </TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="finance"><div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6"><p className="text-sm text-muted-foreground">Total Committed Investment</p><p className="text-3xl font-bold mt-2">{formatINR(data?.totalInvestment || 0)}</p></Card>
          <Card className="p-6"><p className="text-sm text-muted-foreground">Total Payments Received</p><p className="text-3xl font-bold text-emerald-700 mt-2">{formatINR(data?.payments?._sum?.amountPaid || 0)}</p></Card>
        </div></TabsContent>
      </Tabs>
    </div>
  )
}

// AUDIT LOG
export function AuditLogView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')
  const [module, setModule] = useState('')

  useEffect(() => { fetch('/api/audit-logs?pageSize=50').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  const actions = useMemo(() => { if (!data?.logs) return []; return [...new Set(data.logs.map((l: any) => l.action))].sort() }, [data])
  const modules = useMemo(() => { if (!data?.logs) return []; return [...new Set(data.logs.map((l: any) => l.module).filter(Boolean))] }, [data])

  const filtered = useMemo(() => {
    if (!data?.logs) return []
    return data.logs.filter((l: any) => {
      if (action && l.action !== action) return false
      if (module && l.module !== module) return false
      return true
    })
  }, [data, action, module])

  const activeFilters = [action, module].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1><p className="text-sm text-muted-foreground">Immutable record of all system actions and changes</p></div>
      <FilterBar activeCount={activeFilters} onClear={() => { setAction(''); setModule('') }}>
        <Select value={action || 'All'} onValueChange={v => setAction(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[150px] h-8"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent><SelectItem value="All">All Actions</SelectItem>{actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={module || 'All'} onValueChange={v => setModule(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[150px] h-8"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent><SelectItem value="All">All Modules</SelectItem>{modules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </FilterBar>
      <Card><CardContent className="p-0">{loading ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-10 w-full"/>)}</div> :
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
export function UsersView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/users').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  const roles = useMemo(() => { if (!data?.users) return []; return [...new Set(data.users.map((u: any) => u.role?.name).filter(Boolean))] }, [data])

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

  const activeFilters = [role, search].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">User Management</h1><p className="text-sm text-muted-foreground">Manage system users, roles, and department assignments</p></div>
      <FilterBar activeCount={activeFilters} onClear={() => { setRole(''); setSearch('') }}>
        <SearchInput value={search} onChange={setSearch} onSearch={() => {}} placeholder="Search users..." />
        <Select value={role || 'All'} onValueChange={v => setRole(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[160px] h-8"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent><SelectItem value="All">All Roles</SelectItem>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </FilterBar>
      <Card><CardContent className="p-0">{loading ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> :
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
export function DepartmentsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/users').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Departments & Roles</h1><p className="text-sm text-muted-foreground">Manage organizational structure and role-based access</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Departments</CardTitle></CardHeader><CardContent className="p-0"><Table><TableBody>{data?.departments?.map((d: any) => (<TableRow key={d.id}><TableCell className="text-sm font-medium">{d.name}</TableCell><TableCell className="font-mono text-xs text-muted-foreground">{d.code}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Roles</CardTitle></CardHeader><CardContent className="p-0"><Table><TableBody>{data?.roles?.map((r: any) => (<TableRow key={r.id}><TableCell className="text-sm font-medium">{r.name}</TableCell><TableCell className="text-xs text-muted-foreground">{r.description}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      </div>
    </div>
  )
}

// SETTINGS
export function SettingsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/workflow-config').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1><p className="text-sm text-muted-foreground">Configure workflow stages, SLA targets, and system settings</p></div>
      <Tabs defaultValue="workflow"><TabsList><TabsTrigger value="workflow">Workflow Stages</TabsTrigger><TabsTrigger value="sla">SLA Configuration</TabsTrigger><TabsTrigger value="system">System Settings</TabsTrigger></TabsList>
        <TabsContent value="workflow"><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Stage</TableHead><TableHead>Owner Role</TableHead><TableHead>SLA (days)</TableHead><TableHead>Optional</TableHead><TableHead>Active</TableHead></TableRow></TableHeader><TableBody>
          {data?.stages?.map((s: any) => (<TableRow key={s.id}>
            <TableCell className="text-xs tabular-nums">{s.stageOrder}</TableCell>
            <TableCell className="text-sm font-medium">{s.stageName}</TableCell>
            <TableCell className="text-xs">{s.ownerRole}</TableCell>
            <TableCell className="text-xs tabular-nums">{s.slaDays}</TableCell>
            <TableCell>{s.isOptional ? <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">Yes</Badge> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
            <TableCell>{s.isActive ? <CheckCircle2 className="h-4 w-4 text-emerald-600"/> : <XCircle className="h-4 w-4 text-red-500"/>}</TableCell>
          </TableRow>))}
        </TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="sla"><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Stage</TableHead><TableHead>SLA (days)</TableHead></TableRow></TableHeader><TableBody>
          {data?.stages?.map((s: any) => (<TableRow key={s.id}><TableCell className="text-sm">{s.stageName}</TableCell><TableCell className="text-sm font-bold tabular-nums">{s.slaDays} days</TableCell></TableRow>))}
        </TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="system"><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Key</TableHead><TableHead>Value</TableHead><TableHead>Category</TableHead><TableHead>Label</TableHead></TableRow></TableHeader><TableBody>
          {data?.settings?.map((s: any) => (<TableRow key={s.id}><TableCell className="font-mono text-xs">{s.key}</TableCell><TableCell className="text-xs max-w-[200px] truncate">{typeof s.value === 'string' && s.value.startsWith('{') ? 'JSON Config' : s.value}</TableCell><TableCell><Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200">{s.category}</Badge></TableCell><TableCell className="text-xs">{s.label}</TableCell></TableRow>))}
        </TableBody></Table></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  )
}

// GIS
export function GISView() {
  const [parcels, setParcels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { fetch('/api/land-parcels?pageSize=100').then(r=>r.json()).then(j=>j.success&&setParcels(j.data.parcels)).finally(()=>setLoading(false)) }, [])

  const colorMap: Record<string, string> = { Published: '#10b981', Allotted: '#3b82f6', 'Under Application': '#f59e0b', Reserved: '#8b5cf6', 'On Hold': '#f97316', Withdrawn: '#6b7280', Draft: '#d1d5db', 'Under Review': '#fcd34d' }

  const filtered = statusFilter ? parcels.filter(p => p.status === statusFilter) : parcels

  const activeFilters = statusFilter ? 1 : 0

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">GIS Land Map</h1><p className="text-sm text-muted-foreground">Interactive map visualization of land parcels (mock layer)</p></div>
      <FilterBar activeCount={activeFilters} onClear={() => setStatusFilter('')}>
        <Select value={statusFilter || 'All'} onValueChange={v => setStatusFilter(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[160px] h-8"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{['All', ...Object.keys(colorMap)].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </FilterBar>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2"><Card className="overflow-hidden"><div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 min-h-[400px]">
          <div className="text-center text-muted-foreground mb-4"><Map className="h-8 w-8 mx-auto mb-2"/><p className="text-sm font-medium">Land Parcel Map</p><p className="text-xs">Mock GIS Layer — Real GIS via PostGIS/MapLibre</p></div>
          <div className="grid grid-cols-5 gap-2">{filtered.map((p) => (
            <div key={p.id} className="rounded border-2 p-2 hover:shadow-md transition-shadow" style={{ borderColor: colorMap[p.status] || '#9ca3af' }} title={`${p.plotId}\n${p.zone?.name}\n${p.status}`}>
              <div className="h-10 rounded-sm mb-1" style={{ backgroundColor: colorMap[p.status] || '#9ca3af', opacity: 0.6 }}/><p className="text-[7px] font-mono truncate font-medium">{p.plotId.replace('APCRDA-P-','')}</p><p className="text-[6px] text-muted-foreground">{p.extentAcres}ac · {p.zone?.name}</p>
            </div>))}</div>
        </div></Card></div>
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Legend</h3>
          {Object.entries(colorMap).map(([status, color]) => (<div key={status} className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }}/><span className="text-xs">{status} ({parcels.filter(p=>p.status===status).length})</span></div>))}
          <Separator/><h3 className="text-sm font-semibold">Zone Distribution</h3>
          {Object.entries(parcels.reduce((acc: any, p: any) => { const z = p.zone?.name || 'Unknown'; acc[z] = (acc[z]||0)+1; return acc }, {})).map(([zone, count]) => (
            <div key={zone} className="flex items-center justify-between"><span className="text-xs">{zone}</span><Badge variant="secondary" className="text-[10px]">{count as number}</Badge></div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// MY WORK QUEUE
export function MyWorkQueue() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/my-work-queue').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">My Work Queue</h1><p className="text-sm text-muted-foreground">Pending tasks, approvals, and queries assigned to you</p></div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-blue-100 bg-blue-50/50"><CardContent className="p-4"><div className="flex items-start justify-between"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Applications</p><div className="rounded-lg bg-blue-100 p-2"><FileWarning className="h-4 w-4 text-blue-600"/></div></div><p className="text-2xl font-bold mt-2 text-blue-700 tabular-nums">{data?.assignedApps?.length || 0}</p></CardContent></Card>
        <Card className="border-amber-100 bg-amber-50/50"><CardContent className="p-4"><div className="flex items-start justify-between"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Stages</p><div className="rounded-lg bg-amber-100 p-2"><Clock className="h-4 w-4 text-amber-600"/></div></div><p className="text-2xl font-bold mt-2 text-amber-700 tabular-nums">{data?.assignedStages?.length || 0}</p></CardContent></Card>
        <Card className="border-rose-100 bg-rose-50/50"><CardContent className="p-4"><div className="flex items-start justify-between"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Grievances</p><div className="rounded-lg bg-rose-100 p-2"><AlertTriangle className="h-4 w-4 text-rose-600"/></div></div><p className="text-2xl font-bold mt-2 text-rose-700 tabular-nums">{data?.grievances?.length || 0}</p></CardContent></Card>
      </div>
      <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Pending Stage Actions</CardTitle></CardHeader><CardContent className="p-0">
        {loading ? <div className="p-4"><Skeleton className="h-12 w-full"/></div> :
        data?.assignedStages?.length === 0 ? <p className="text-sm text-muted-foreground p-4">No pending actions</p> :
        <Table><TableHeader><TableRow><TableHead>Application</TableHead><TableHead>Project</TableHead><TableHead>Stage</TableHead></TableRow></TableHeader><TableBody>
          {data?.assignedStages?.map((s: any) => (<TableRow key={s.id}><TableCell className="font-mono text-xs">{s.application?.applicationNumber}</TableCell><TableCell className="text-xs">{s.application?.projectName}</TableCell><TableCell><Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">{s.stageName}</Badge></TableCell></TableRow>))}
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

  const types = useMemo(() => [...new Set(RISK_ALERTS.map(a => a.type))], [])

  const filtered = useMemo(() => {
    return RISK_ALERTS.filter(a => {
      if (severityFilter && a.severity !== severityFilter) return false
      if (typeFilter && a.type !== typeFilter) return false
      return true
    })
  }, [severityFilter, typeFilter])

  const activeFilters = [severityFilter, typeFilter].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Risk & Alerts</h1><p className="text-sm text-muted-foreground">Automated risk identification and escalation alerts</p></div>

      {/* Severity Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => {
          const tc = severityTileColor(sev)
          const count = RISK_ALERTS.filter(a => a.severity === sev).length
          return (
            <Card key={sev} className={cn('border', tc.border, tc.bg, 'cursor-pointer transition-all hover:shadow-md', severityFilter === sev && 'ring-2 ring-offset-1 ring-current')} onClick={() => setSeverityFilter(severityFilter === sev ? '' : sev)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{sev}</p>
                    <p className={cn('text-2xl font-bold mt-1 tabular-nums', tc.text)}>{count}</p>
                  </div>
                  <div className={cn('rounded-lg p-2', tc.iconBg)}>
                    <AlertCircle className={cn('h-4 w-4', tc.iconText)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <FilterBar activeCount={activeFilters} onClear={() => { setSeverityFilter(''); setTypeFilter('') }}>
        <Select value={severityFilter || 'All'} onValueChange={v => setSeverityFilter(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[130px] h-8"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>{['All','Critical','High','Medium','Low'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={typeFilter || 'All'} onValueChange={v => setTypeFilter(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[160px] h-8"><SelectValue placeholder="Alert Type" /></SelectTrigger>
          <SelectContent><SelectItem value="All">All Types</SelectItem>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </FilterBar>

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
                      <span className="font-mono text-[10px] text-muted-foreground">{alert.application}</span>
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
