'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard } from 'lucide-react'

function formatINR(amount: number) { return `\u20B9${amount.toLocaleString('en-IN')}` }
function statusColor(s: string) {
  if (['Approved','Completed','Paid','Compliant'].includes(s)) return 'bg-emerald-100 text-emerald-800'
  if (['Under Review','In Progress','Pending','Partially Paid','Under Verification'].includes(s)) return 'bg-amber-100 text-amber-800'
  if (['Rejected','Failed','Overdue','Forfeited'].includes(s)) return 'bg-red-100 text-red-800'
  if (['Deferred','On Hold','Refunded'].includes(s)) return 'bg-orange-100 text-orange-800'
  return 'bg-gray-100 text-gray-700'
}

export function PaymentsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/payments').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Payment Management</h1><p className="text-sm text-muted-foreground">Track land allotment payments, dues, and financial transactions</p></div>
      {data && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total Due</p><p className="text-lg font-bold tabular-nums mt-1">{formatINR(data.summary.totalDue)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total Collected</p><p className="text-lg font-bold text-emerald-700 tabular-nums mt-1">{formatINR(data.summary.totalPaid)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-lg font-bold text-amber-700 tabular-nums mt-1">{formatINR(data.summary.outstanding)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Overdue</p><p className="text-lg font-bold text-red-700 tabular-nums mt-1">{formatINR(data.summary.overdue)}</p></Card>
      </div>}
      <Card><CardContent className="p-0">
        {loading ? <div className="p-4 space-y-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> :
        <Table><TableHeader><TableRow>
          <TableHead>Type</TableHead><TableHead>Application</TableHead><TableHead>Applicant</TableHead><TableHead className="text-right">Due</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead>
        </TableRow></TableHeader><TableBody>
          {data?.payments?.map((p: any, i: number) => (
            <TableRow key={i}>
              <TableCell className="text-xs font-medium">{p.paymentType}</TableCell>
              <TableCell className="font-mono text-[11px]">{p.application?.applicationNumber}</TableCell>
              <TableCell className="text-xs">{p.application?.applicant?.organizationName}</TableCell>
              <TableCell className="text-right text-xs tabular-nums">{formatINR(p.amountDue)}</TableCell>
              <TableCell className="text-right text-xs tabular-nums text-emerald-700">{formatINR(p.amountPaid)}</TableCell>
              <TableCell className="text-right text-xs tabular-nums font-medium">{formatINR(p.amountDue - p.amountPaid)}</TableCell>
              <TableCell className="text-xs">{p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-IN') : '—'}</TableCell>
              <TableCell><Badge className={`${statusColor(p.status)} text-[10px] hover:${statusColor(p.status)}`}>{p.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody></Table>}
      </CardContent></Card>
    </div>
  )
}