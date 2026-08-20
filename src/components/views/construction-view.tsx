'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { HardHat, AlertCircle, CheckCircle2, Clock, Building } from 'lucide-react'

function statusColor(s: string) {
  if (['Completed'].includes(s)) return 'bg-emerald-100 text-emerald-800'
  if (['In Progress'].includes(s)) return 'bg-amber-100 text-amber-800'
  if (['Delayed'].includes(s)) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-700'
}

export function ConstructionView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/constructions').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Construction Monitoring</h1><p className="text-sm text-muted-foreground">Track construction progress and milestones for allotted projects</p></div>
      {data && <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[{label:'Total Projects',val:data.summary.total,Icon:Building,color:'text-gray-700'},{label:'In Progress',val:data.summary.inProgress,Icon:HardHat,color:'text-amber-700'},{label:'Delayed',val:data.summary.delayed,Icon:AlertCircle,color:'text-red-700'},{label:'Not Started',val:data.summary.notStarted,Icon:Clock,color:'text-gray-500'},{label:'Completed',val:data.summary.completed,Icon:CheckCircle2,color:'text-emerald-700'}].map(s=>(
          <Card key={s.label} className="p-4"><div className="flex items-center gap-2"><s.Icon className={`h-4 w-4 ${s.color}`}/><p className="text-xs text-muted-foreground">{s.label}</p></div><p className={`text-2xl font-bold ${s.color} mt-1`}>{s.val}</p></Card>
        ))}
      </div>}
      <div className="grid md:grid-cols-2 gap-4">
        {data?.constructions?.map((c: any) => (
          <Card key={c.id}>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{c.application?.projectName}</CardTitle><CardDescription className="text-xs">{c.application?.applicant?.organizationName} • {c.application?.applicationNumber}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Physical Progress</p><div className="flex items-center gap-2 mt-1"><Progress value={c.physicalProgress} className="h-2"/><span className="text-xs font-bold tabular-nums">{c.physicalProgress}%</span></div></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Financial Progress</p><div className="flex items-center gap-2 mt-1"><Progress value={c.financialProgress} className="h-2"/><span className="text-xs font-bold tabular-nums">{c.financialProgress}%</span></div></div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${statusColor(c.status)} text-[10px]`}>{c.status}</Badge>
                {c.progressUpdates?.[0]?.remarks && <p className="text-[11px] text-muted-foreground truncate">{c.progressUpdates[0].remarks}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}