'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { HardHat, AlertCircle, CheckCircle2, Clock, Building, Filter, X, CalendarDays, CheckSquare, Search, CircleDot } from 'lucide-react'
import { cn } from '@/lib/utils'

function statusColor(s: string) {
  if (['Completed'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
  if (['In Progress', 'On Track'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
  if (['Delayed', 'At Risk'].includes(s)) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
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
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/constructions').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!data?.constructions) return []
    return data.constructions.filter((c: any) => {
      if (status && c.status !== status) return false
      if (search) {
        const s = search.toLowerCase()
        const matchProject = c.application?.projectName?.toLowerCase().includes(s)
        const matchApplicant = c.application?.applicant?.organizationName?.toLowerCase().includes(s)
        const matchAppNo = c.application?.applicationNumber?.toLowerCase().includes(s)
        return matchProject || matchApplicant || matchAppNo
      }
      return true
    })
  }, [data, status, search])

  const milestones = useMemo(() => generateMockMilestones(filtered), [filtered])
  const hasFilters = Boolean(status || search)

  const resetFilters = () => {
    setStatus('')
    setSearch('')
  }

  return (
    <div className="space-y-4 pb-10">
      <div><h1 className="text-2xl font-bold tracking-tight">Construction Monitoring</h1><p className="text-sm text-muted-foreground">Track construction progress and milestones for allotted projects</p></div>
      {data && <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          {label:'Total Projects', val:data.summary.total, Icon:Building, color:'slate', border:'border-slate-100', bg:'bg-gradient-to-r from-slate-50 to-white/50 dark:from-slate-900/40 dark:to-card/60', iconBg:'bg-slate-100 dark:bg-slate-800', iconText:'text-slate-600 dark:text-slate-400', valColor:''},
          {label:'In Progress', val:data.summary.inProgress, Icon:HardHat, color:'amber', border:'border-amber-100', bg:'bg-gradient-to-r from-amber-50 to-white/50 dark:from-amber-950/30 dark:to-card/60', iconBg:'bg-amber-100 dark:bg-amber-950/60', iconText:'text-amber-600 dark:text-amber-400', valColor:'text-amber-700 dark:text-amber-400'},
          {label:'Delayed', val:data.summary.delayed, Icon:AlertCircle, color:'red', border:'border-red-100', bg:'bg-gradient-to-r from-red-50 to-white/50 dark:from-red-950/30 dark:to-card/60', iconBg:'bg-red-100 dark:bg-red-950/60', iconText:'text-red-600 dark:text-red-400', valColor:'text-red-700 dark:text-red-400'},
          {label:'Not Started', val:data.summary.notStarted, Icon:Clock, color:'blue', border:'border-blue-100', bg:'bg-gradient-to-r from-blue-50 to-white/50 dark:from-blue-950/30 dark:to-card/60', iconBg:'bg-blue-100 dark:bg-blue-950/60', iconText:'text-blue-600 dark:text-blue-400', valColor:'text-blue-700 dark:text-blue-400'},
          {label:'Completed', val:data.summary.completed, Icon:CheckCircle2, color:'emerald', border:'border-emerald-100', bg:'bg-gradient-to-r from-emerald-50 to-white/50 dark:from-emerald-950/30 dark:to-card/60', iconBg:'bg-emerald-100 dark:bg-emerald-950/60', iconText:'text-emerald-600 dark:text-emerald-400', valColor:'text-emerald-700 dark:text-emerald-400'},
        ].map(s=>(
          <Card key={s.label} className={cn('border border-transparent dark:border-border/50', s.bg, 'cursor-pointer transition-all hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px]', status === s.label && 'outline outline-1 outline-primary outline-offset-[-1px]')} onClick={() => setStatus(status === s.label ? '' : s.label)}>
            <CardContent className="px-3 py-0">
              <div className="flex items-start justify-between">
                <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">{s.label}</p><p className={cn('text-lg font-bold tabular-nums leading-tight mt-1 truncate', s.valColor)}>{s.val}</p></div>
                <div className={cn('rounded-lg p-2 shrink-0', s.iconBg)}><s.Icon className={cn('h-3.5 w-3.5', s.iconText)}/></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>}

      {/* Project Cards Grid */}
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
                  <Progress value={c.financialProgress} className="h-2 bg-blue-100 dark:bg-blue-950/50" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t text-muted-foreground">
                <span>Updated {new Date(c.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5', statusColor(c.status))}>{c.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="relative w-full sm:flex-1 mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search project name, applicant, ID..."
              className="pl-8 h-8 text-xs w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
            <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!status && status !== 'All'} icon={<CircleDot className="size-3.5" />}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {['All', 'In Progress', 'Delayed', 'Not Started', 'Completed'].map(s => (
                  <SelectItem key={s} value={s} className="text-xs">{s === 'All' ? 'Status' : s}</SelectItem>
                ))}
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

      {filtered.length > 0 && (
        <Card>
          <CardContent className="px-3 py-0">
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
