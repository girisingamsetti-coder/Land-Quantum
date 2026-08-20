'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle } from 'lucide-react'

function statusColor(s: string) {
  if (['Resolved','Closed'].includes(s)) return 'bg-emerald-100 text-emerald-800'
  if (['Open','In Progress'].includes(s)) return 'bg-amber-100 text-amber-800'
  if (['Rejected'].includes(s)) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-700'
}

export function GrievancesView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/grievances').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Grievances & Appeals</h1><p className="text-sm text-muted-foreground">Manage applicant grievances, appeals, and resolutions</p></div>
      <Card><CardContent className="p-0">
        {loading ? <div className="p-4 space-y-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-16 w-full"/>)}</div> :
        <Table><TableHeader><TableRow>
          <TableHead>GRV #</TableHead><TableHead>Applicant</TableHead><TableHead>Application</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Assigned To</TableHead><TableHead>Submitted</TableHead>
        </TableRow></TableHeader><TableBody>
          {data?.grievances?.map((g: any) => (
            <TableRow key={g.id}>
              <TableCell className="font-mono text-xs font-medium">{g.grievanceNumber}</TableCell>
              <TableCell className="text-xs">{g.applicant?.organizationName || '—'}</TableCell>
              <TableCell className="font-mono text-[11px]">{g.application?.applicationNumber || '—'}</TableCell>
              <TableCell className="text-xs">{g.category}</TableCell>
              <TableCell><Badge className={`${statusColor(g.status)} text-[10px] hover:${statusColor(g.status)}`}>{g.status}</Badge></TableCell>
              <TableCell className="text-xs">{g.assignedTo?.name || '—'}</TableCell>
              <TableCell className="text-xs">{new Date(g.submittedAt).toLocaleDateString('en-IN')}</TableCell>
            </TableRow>
          ))}
        </TableBody></Table>}
      </CardContent></Card>
    </div>
  )
}