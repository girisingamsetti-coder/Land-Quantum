'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HardHat, AlertCircle, CheckCircle2, Clock, Building, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function statusColor(s: string) {
  if (['Completed'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (['In Progress'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200'
  if (['Delayed'].includes(s)) return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
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

  const activeFilters = status ? 1 : 0

  return (
    <div className="space-y-4">
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
      {activeFilters > 0 && (
        <div className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-muted-foreground"/><span className="text-xs text-muted-foreground">Filtered by: <Badge variant="outline" className="text-[10px] mx-1">{status}</Badge></span><Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setStatus('')}><X className="h-3 w-3"/> Clear</Button></div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((c: any) => (
          <Card key={c.id} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3"><CardTitle className="text-sm">{c.application?.projectName}</CardTitle><CardDescription className="text-xs">{c.application?.applicant?.organizationName} {String.fromCharCode(183)} {c.application?.applicationNumber}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Physical Progress</p><div className="flex items-center gap-2 mt-1"><Progress value={c.physicalProgress} className="h-2"/><span className="text-xs font-bold tabular-nums">{c.physicalProgress}%</span></div></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Financial Progress</p><div className="flex items-center gap-2 mt-1"><Progress value={c.financialProgress} className="h-2"/><span className="text-xs font-bold tabular-nums">{c.financialProgress}%</span></div></div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-[10px]', statusColor(c.status))}>{c.status}</Badge>
                {c.progressUpdates?.[0]?.remarks && <p className="text-[11px] text-muted-foreground truncate">{c.progressUpdates[0].remarks}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}