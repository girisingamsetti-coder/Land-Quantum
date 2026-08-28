'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HardHat, AlertCircle, CheckCircle2, Clock, Building, Filter, X, CalendarDays, CheckSquare, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

function statusColor(s: string) {
  if (['Completed'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (['In Progress', 'On Track'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200'
  if (['Delayed', 'At Risk'].includes(s)) return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

// Mock milestones generator for demo purposes
const generateMockMilestones = (projects: any[]) => {
  const milestones: any[] = []
  projects.forEach((p, i) => {
    milestones.push({ id: `m1-${p.id}`, projectId: p.application?.applicationNumber || `PROJ-${i}`, projectName: p.application?.projectName || 'Unknown Project', name: 'Site Preparation & Excavation', targetDate: '2024-03-15', status: 'Completed', progress: 100, contractor: 'L&T Infra', inspector: 'R. Sharma' })
    milestones.push({ id: `m2-${p.id}`, projectId: p.application?.applicationNumber || `PROJ-${i}`, projectName: p.application?.projectName || 'Unknown Project', name: 'Foundation Completed', targetDate: '2024-06-30', status: p.status === 'Delayed' ? 'Delayed' : 'Completed', progress: p.status === 'Delayed' ? 85 : 100, contractor: 'L&T Infra', inspector: 'K. Reddy' })
    milestones.push({ id: `m3-${p.id}`, projectId: p.application?.applicationNumber || `PROJ-${i}`, projectName: p.application?.projectName || 'Unknown Project', name: 'Structural Framework', targetDate: '2024-11-15', status: p.status === 'Delayed' ? 'At Risk' : 'In Progress', progress: p.physicalProgress || 45, contractor: 'Mega Builders', inspector: 'S. Patel' })
    milestones.push({ id: `m4-${p.id}`, projectId: p.application?.applicationNumber || `PROJ-${i}`, projectName: p.application?.projectName || 'Unknown Project', name: 'Interior & Finishing', targetDate: '2025-04-20', status: 'Pending', progress: 0, contractor: 'Mega Builders', inspector: 'S. Patel' })
  })
  return milestones
}

export function ConstructionView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => { fetch('/api/constructions').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!data?.constructions) return []
    if (!status) return data.constructions
    return data.constructions.filter((c: any) => c.status === status)
  }, [data, status])

  const milestones = useMemo(() => generateMockMilestones(filtered), [filtered])
  const activeFilters = status ? 1 : 0

  return (
    <div className="space-y-6 pb-10">
      <div><h1 className="text-2xl font-bold tracking-tight">Construction Monitoring</h1><p className="text-sm text-muted-foreground">Track construction progress and milestones for allotted projects</p></div>
      {data && <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          {label:'Total Projects', val:data.summary.total, Icon:Building, color:'slate', border:'border-slate-100', bg:'bg-slate-50/50', iconBg:'bg-slate-100', iconText:'text-slate-600', valColor:''},
          {label:'In Progress', val:data.summary.inProgress, Icon:HardHat, color:'amber', border:'border-amber-100', bg:'bg-amber-50/50', iconBg:'bg-amber-100', iconText:'text-amber-600', valColor:'text-amber-700'},
          {label:'Delayed', val:data.summary.delayed, Icon:AlertCircle, color:'red', border:'border-red-100', bg:'bg-red-50/50', iconBg:'bg-red-100', iconText:'text-red-600', valColor:'text-red-700'},
          {label:'Not Started', val:data.summary.notStarted, Icon:Clock, color:'blue', border:'border-blue-100', bg:'bg-blue-50/50', iconBg:'bg-blue-100', iconText:'text-blue-600', valColor:'text-blue-700'},
          {label:'Completed', val:data.summary.completed, Icon:CheckCircle2, color:'emerald', border:'border-emerald-100', bg:'bg-emerald-50/50', iconBg:'bg-emerald-100', iconText:'text-emerald-600', valColor:'text-emerald-700'},
        ].map(s=>(
          <Card key={s.label} className={cn('border', s.border, s.bg, 'cursor-pointer transition-all hover:shadow-md', status === s.label && 'ring-2 ring-offset-1')} onClick={() => setStatus(status === s.label ? '' : s.label)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p><p className={cn('text-2xl font-bold mt-1 tabular-nums', s.valColor)}>{s.val}</p></div>
                <div className={cn('rounded-lg p-2', s.iconBg)}><s.Icon className={cn('h-4 w-4', s.iconText)}/></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-muted-foreground"><Filter className="h-4 w-4" /><span className="text-xs font-semibold">Filters</span></div>
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}><SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!status && status !== 'All'}><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{['All', 'In Progress', 'Delayed', 'Not Started', 'Completed'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
          {activeFilters > 0 && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={() => setStatus('')}><X className="h-3.5 w-3.5" /> Clear</Button>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c: any) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: c.status === 'Delayed' ? '#ef4444' : c.status === 'Completed' ? '#10b981' : '#f59e0b' }}>
            <CardHeader className="pb-3"><CardTitle className="text-sm line-clamp-1">{c.application?.projectName}</CardTitle><CardDescription className="text-xs">{c.application?.applicant?.organizationName} {String.fromCharCode(183)} {c.application?.applicationNumber}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center"><p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Physical</p><span className="text-xs font-bold tabular-nums">{c.physicalProgress}%</span></div>
                  <Progress value={c.physicalProgress} className="h-2" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center"><p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Financial</p><span className="text-xs font-bold tabular-nums">{c.financialProgress}%</span></div>
                  <Progress value={c.financialProgress} className="h-2 bg-blue-100" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-dashed">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5', statusColor(c.status))}>{c.status}</Badge>
                </div>
                {c.progressUpdates?.[0]?.remarks && <div className="text-[11px] text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Last updated recently</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length > 0 && (
        <Card className="mt-8">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Project Milestones Tracking</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[120px]">Project ID</TableHead>
                    <TableHead className="w-[180px]">Project Name</TableHead>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead className="text-right">Target Date</TableHead>
                    <TableHead className="text-right w-[150px]">Progress</TableHead>
                    <TableHead className="text-right w-[120px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milestones.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs text-muted-foreground">{m.projectId}</TableCell>
                      <TableCell className="text-xs font-medium">{m.projectName}</TableCell>
                      <TableCell className="text-xs flex items-center gap-2">
                        {m.status === 'Completed' ? <CheckSquare className="h-3.5 w-3.5 text-emerald-500" /> : <div className="h-3.5 w-3.5 rounded border border-muted-foreground/30" />}
                        {m.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.contractor}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.inspector}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums text-muted-foreground">{m.targetDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={m.progress} className="h-1.5 w-16" />
                          <span className="text-[10px] font-medium tabular-nums w-6 text-right">{m.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={cn('text-[10px]', statusColor(m.status))}>{m.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
