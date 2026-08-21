'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ScrollText, Bell, Users, Building2, Settings, Map, ClipboardList,
  AlertTriangle, AlertCircle, CheckCircle2, XCircle, Shield, BarChart3,
} from 'lucide-react'

function formatINR(amount: number) { return `\u20B9${amount.toLocaleString('en-IN')}` }
function statusColor(s: string) {
  if (['Approved','Completed','Paid','Compliant','Resolved','Issued','Executed','Registered'].includes(s)) return 'bg-emerald-100 text-emerald-800'
  if (['Under Review','In Progress','Pending','Open','Draft','Submitted','Notice Issued','Decision Made','Scheduled','Under Scrutiny'].includes(s)) return 'bg-amber-100 text-amber-800'
  if (['Rejected','Failed','Non-Compliant','Overdue','Cancelled'].includes(s)) return 'bg-red-100 text-red-800'
  if (['Deferred','On Hold','Delayed','At Risk','Partially Paid'].includes(s)) return 'bg-orange-100 text-orange-800'
  return 'bg-gray-100 text-gray-700'
}
function severityColor(s: string) {
  if (s === 'Critical') return 'bg-red-100 text-red-800'
  if (s === 'High') return 'bg-orange-100 text-orange-800'
  if (s === 'Medium') return 'bg-amber-100 text-amber-800'
  return 'bg-blue-100 text-blue-800'
}

// CANCELLATIONS
export function CancellationsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/cancellations').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Cancellation & Resumption</h1><p className="text-sm text-muted-foreground">Track cancellation cases, notices, and resumption proceedings</p></div>
      <Card><CardContent className="p-0">{loading ? <div className="p-4 space-y-2">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-14 w-full"/>)}</div> :
      <Table><TableHeader><TableRow><TableHead>Case #</TableHead><TableHead>Application</TableHead><TableHead>Project</TableHead><TableHead>Initiated By</TableHead><TableHead>Reason</TableHead><TableHead>Decision</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
        {data?.cases?.map((c: any) => (
          <TableRow key={c.id}>
            <TableCell className="font-mono text-xs font-medium">{c.caseNumber}</TableCell>
            <TableCell className="font-mono text-[11px]">{c.application?.applicationNumber}</TableCell>
            <TableCell className="text-xs">{c.application?.projectName}</TableCell>
            <TableCell><Badge className={`text-[10px] ${c.initiatedBy === 'APCRDA' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>{c.initiatedBy}</Badge></TableCell>
            <TableCell className="text-xs max-w-[200px] truncate">{c.reason}</TableCell>
            <TableCell className="text-xs">{c.decision || '—'}</TableCell>
            <TableCell><Badge className={`${statusColor(c.status)} text-[10px] hover:${statusColor(c.status)}`}>{c.status}</Badge></TableCell>
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
          {data?.byStatus?.map((s: any) => (<TableRow key={s.status}><TableCell><Badge className={`${statusColor(s.status)} text-[10px]`}>{s.status}</Badge></TableCell><TableCell className="text-right font-bold">{s._count}</TableCell><TableCell><div className="flex items-center gap-2"><Progress value={(s._count/(data?.totalApps||1))*100} className="h-2 flex-1"/><span className="text-xs tabular-nums">{((s._count/(data?.totalApps||1))*100).toFixed(1)}%</span></div></TableCell></TableRow>))}
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
  useEffect(() => { fetch('/api/audit-logs?pageSize=50').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1><p className="text-sm text-muted-foreground">Immutable record of all system actions and changes</p></div>
      <Card><CardContent className="p-0">{loading ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-10 w-full"/>)}</div> :
      <Table><TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Action</TableHead><TableHead>Module</TableHead></TableRow></TableHeader><TableBody>
        {data?.logs?.map((l: any) => (<TableRow key={l.id}>
          <TableCell className="text-[11px] tabular-nums text-muted-foreground whitespace-nowrap">{new Date(l.createdAt).toLocaleString('en-IN')}</TableCell>
          <TableCell className="text-xs">{l.userName || 'System'}</TableCell>
          <TableCell className="text-xs">{l.role || '—'}</TableCell>
          <TableCell><Badge className="text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-100">{l.action}</Badge></TableCell>
          <TableCell className="text-xs">{l.module || '—'}</TableCell>
        </TableRow>))}
      </TableBody></Table>}</CardContent></Card>
    </div>
  )
}

// NOTIFICATIONS
export function NotificationsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/notifications').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])
  const markRead = async (ids: string[]) => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
    setData((prev: any) => ({ ...prev, notifications: prev.notifications.map((n: any) => ids.includes(n.id) ? { ...n, isRead: true } : n), unread: prev.unread - ids.length }))
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Notifications</h1><p className="text-sm text-muted-foreground">{data?.unread || 0} unread notifications</p></div>
        {data?.unread > 0 && <Button variant="outline" size="sm" onClick={() => { const ids = data.notifications.filter((n: any) => !n.isRead).map((n: any) => n.id); markRead(ids) }}>Mark all read</Button>}
      </div>
      <div className="space-y-2">
        {loading ? Array.from({length:4}).map((_,i)=><Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-3/4"/><Skeleton className="h-3 w-1/2 mt-2"/></CardContent></Card>) :
        data?.notifications?.map((n: any) => (
          <Card key={n.id} className={`p-4 cursor-pointer transition-colors ${!n.isRead ? 'border-l-4 border-l-emerald-500 bg-emerald-50/50' : ''}`} onClick={() => !n.isRead && markRead([n.id])}>
            <div className="flex items-center gap-2"><Badge className="text-[9px] bg-gray-100 text-gray-600 hover:bg-gray-100">{n.type}</Badge>{!n.isRead && <div className="h-2 w-2 rounded-full bg-emerald-500"/>}</div>
            <p className="text-sm font-medium mt-1">{n.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
          </Card>))}
        {data?.notifications?.length === 0 && <div className="text-center py-12"><Bell className="h-8 w-8 mx-auto text-muted-foreground"/><p className="text-sm text-muted-foreground mt-2">No notifications</p></div>}
      </div>
    </div>
  )
}

// USERS
export function UsersView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/users').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">User Management</h1><p className="text-sm text-muted-foreground">Manage system users, roles, and department assignments</p></div>
      <Card><CardContent className="p-0">{loading ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> :
      <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Designation</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
        {data?.users?.map((u: any) => (<TableRow key={u.id}>
          <TableCell className="text-sm font-medium">{u.name}</TableCell>
          <TableCell className="text-xs">{u.email}</TableCell>
          <TableCell className="text-xs">{u.designation || '—'}</TableCell>
          <TableCell><Badge className="text-[10px] bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{u.role?.name}</Badge></TableCell>
          <TableCell className="text-xs">{u.department?.name || '—'}</TableCell>
          <TableCell><Badge className={`text-[10px] ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{u.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
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
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Departments</CardTitle></CardHeader><CardContent className="p-0"><Table><TableBody>{data?.departments?.map((d: any) => (<TableRow key={d.id}><TableCell className="text-sm font-medium">{d.name}</TableCell><TableCell className="font-mono text-xs text-muted-foreground">{d.code}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Roles</CardTitle></CardHeader><CardContent className="p-0"><Table><TableBody>{data?.roles?.map((r: any) => (<TableRow key={r.id}><TableCell className="text-sm font-medium">{r.name}</TableCell><TableCell className="text-xs text-muted-foreground">{r.description}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
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
            <TableCell>{s.isOptional ? <Badge className="text-[10px] bg-amber-100 text-amber-800">Yes</Badge> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
            <TableCell>{s.isActive ? <CheckCircle2 className="h-4 w-4 text-emerald-600"/> : <XCircle className="h-4 w-4 text-red-500"/>}</TableCell>
          </TableRow>))}
        </TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="sla"><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Stage</TableHead><TableHead>SLA (days)</TableHead></TableRow></TableHeader><TableBody>
          {data?.stages?.map((s: any) => (<TableRow key={s.id}><TableCell className="text-sm">{s.stageName}</TableCell><TableCell className="text-sm font-bold tabular-nums">{s.slaDays} days</TableCell></TableRow>))}
        </TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="system"><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Key</TableHead><TableHead>Value</TableHead><TableHead>Category</TableHead><TableHead>Label</TableHead></TableRow></TableHeader><TableBody>
          {data?.settings?.map((s: any) => (<TableRow key={s.id}><TableCell className="font-mono text-xs">{s.key}</TableCell><TableCell className="text-xs max-w-[200px] truncate">{typeof s.value === 'string' && s.value.startsWith('{') ? 'JSON Config' : s.value}</TableCell><TableCell><Badge className="text-[10px] bg-gray-100 text-gray-600">{s.category}</Badge></TableCell><TableCell className="text-xs">{s.label}</TableCell></TableRow>))}
        </TableBody></Table></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  )
}

// GIS
export function GISView() {
  const [parcels, setParcels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/land-parcels?pageSize=100').then(r=>r.json()).then(j=>j.success&&setParcels(j.data.parcels)).finally(()=>setLoading(false)) }, [])
  const colorMap: Record<string, string> = { Published: '#10b981', Allotted: '#3b82f6', 'Under Application': '#f59e0b', Reserved: '#8b5cf6', 'On Hold': '#f97316', Withdrawn: '#6b7280', Draft: '#d1d5db', 'Under Review': '#fcd34d' }
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">GIS Land Map</h1><p className="text-sm text-muted-foreground">Interactive map visualization of Amaravati land parcels (mock layer)</p></div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2"><Card className="overflow-hidden"><div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 min-h-[400px]">
          <div className="text-center text-muted-foreground mb-4"><Map className="h-8 w-8 mx-auto mb-2"/><p className="text-sm font-medium">Amaravati Land Parcel Map</p><p className="text-xs">Mock GIS Layer — Real GIS integration via PostGIS/MapLibre</p></div>
          <div className="grid grid-cols-5 gap-2">{parcels.map((p) => (
            <div key={p.id} className="rounded border-2 p-2 hover:shadow-md transition-shadow" style={{ borderColor: colorMap[p.status] || '#9ca3af' }} title={`${p.plotId}\n${p.zone?.name}\n${p.status}`}>
              <div className="h-10 rounded-sm mb-1" style={{ backgroundColor: colorMap[p.status] || '#9ca3af', opacity: 0.6 }}/><p className="text-[7px] font-mono truncate font-medium">{p.plotId.replace('APCRDA-P-','')}</p><p className="text-[6px] text-muted-foreground">{p.extentAcres}ac • {p.zone?.name}</p>
            </div>))}</div>
        </div></Card></div>
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Legend</h3>
          {Object.entries(colorMap).map(([status, color]) => (<div key={status} className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }}/><span className="text-xs">{status} ({parcels.filter(p=>p.status===status).length})</span></div>))}
          <Separator/><h3 className="text-sm font-semibold">Zone Distribution</h3>
          {Object.entries(parcels.reduce((acc: any, p: any) => { const z = p.zone?.name || 'Unknown'; acc[z] = (acc[z]||0)+1; return acc }, {})).map(([zone, count]) => (
            <div key={zone} className="flex items-center justify-between"><span className="text-xs">{zone}</span><Badge className="text-[10px]" variant="secondary">{count as number}</Badge></div>
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
      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Assigned Applications</p><p className="text-2xl font-bold mt-1">{data?.assignedApps?.length || 0}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Pending Stages</p><p className="text-2xl font-bold text-amber-700 mt-1">{data?.assignedStages?.length || 0}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Open Grievances</p><p className="text-2xl font-bold text-red-700 mt-1">{data?.grievances?.length || 0}</p></Card>
      </div>
      <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Pending Stage Actions</CardTitle></CardHeader><CardContent className="p-0">
        {loading ? <div className="p-4"><Skeleton className="h-12 w-full"/></div> :
        data?.assignedStages?.length === 0 ? <p className="text-sm text-muted-foreground p-4">No pending actions</p> :
        <Table><TableHeader><TableRow><TableHead>Application</TableHead><TableHead>Project</TableHead><TableHead>Stage</TableHead></TableRow></TableHeader><TableBody>
          {data?.assignedStages?.map((s: any) => (<TableRow key={s.id}><TableCell className="font-mono text-xs">{s.application?.applicationNumber}</TableCell><TableCell className="text-xs">{s.application?.projectName}</TableCell><TableCell><Badge className="text-[10px] bg-amber-100 text-amber-800">{s.stageName}</Badge></TableCell></TableRow>))}
        </TableBody></Table>}
      </CardContent></Card>
    </div>
  )
}

// RISK ALERTS
const RISK_ALERTS = [
  { severity: 'Critical', type: 'SLA Breach', description: 'APCRDA-2024-0008 has breached SLA at Economic Review stage', application: 'APCRDA-2024-0008' },
  { severity: 'High', type: 'Payment Overdue', description: 'Down payment for APCRDA-2024-0004 is overdue by 15 days', application: 'APCRDA-2024-0004' },
  { severity: 'High', type: 'Construction Delayed', description: 'Amaravati Tech Hub construction is 30% behind schedule', application: 'APCRDA-2024-0002' },
  { severity: 'Medium', type: 'LOI Expiring', description: 'LOI for APCRDA-2024-0005 expires in 15 days', application: 'APCRDA-2024-0005' },
  { severity: 'Medium', type: 'Non-Utilisation', description: 'No construction activity on plot APCRDA-P-022 for 6 months', application: 'APCRDA-2024-0013' },
  { severity: 'Low', type: 'DPR Returned', description: 'DPR for Capital City Mall returned 2 times', application: 'APCRDA-2024-0009' },
]

export function RiskAlertsView() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Risk & Alerts</h1><p className="text-sm text-muted-foreground">Automated risk identification and escalation alerts</p></div>
      <div className="grid md:grid-cols-4 gap-3">
        {[{label:'Critical',count:RISK_ALERTS.filter(r=>r.severity==='Critical').length},{label:'High',count:RISK_ALERTS.filter(r=>r.severity==='High').length},{label:'Medium',count:RISK_ALERTS.filter(r=>r.severity==='Medium').length},{label:'Low',count:RISK_ALERTS.filter(r=>r.severity==='Low').length}].map(s=>(
          <Card key={s.label} className="p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.count}</p></Card>
        ))}
      </div>
      <div className="space-y-2">
        {RISK_ALERTS.map((alert, i) => (
          <Card key={i} className={`p-4 border-l-4 ${alert.severity === 'Critical' ? 'border-l-red-500 bg-red-50/50' : alert.severity === 'High' ? 'border-l-orange-500 bg-orange-50/50' : alert.severity === 'Medium' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${alert.severity === 'Critical' ? 'text-red-600' : alert.severity === 'High' ? 'text-orange-600' : 'text-amber-600'}`}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${severityColor(alert.severity)} text-[10px]`}>{alert.severity}</Badge>
                  <Badge className="text-[10px] bg-gray-100 text-gray-600 hover:bg-gray-100">{alert.type}</Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">{alert.application}</span>
                </div>
                <p className="text-sm mt-1">{alert.description}</p>
              </div>
            </div>
          </Card>))}
      </div>
    </div>
  )
}
