'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { IndianRupee, Filter, X, Search, TrendingDown, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatINR(amount: number) { return `\u20B9${(amount / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` }
function statusColor(s: string) {
  if (['Approved','Completed','Paid','Compliant'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (['Under Review','In Progress','Pending','Partially Paid','Under Verification'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200'
  if (['Rejected','Failed','Overdue','Forfeited'].includes(s)) return 'bg-red-100 text-red-700 border-red-200'
  if (['Deferred','On Hold','Refunded'].includes(s)) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

export function PaymentsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/payments').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  const paymentTypes = useMemo(() => { if (!data?.payments) return []; return [...new Set(data.payments.map((p: any) => p.paymentType).filter(Boolean))] as string[] }, [data])

  const activeFilters = [status, type, search].filter(Boolean).length

  const filtered = useMemo(() => {
    if (!data?.payments) return []
    return data.payments.filter((p: any) => {
      if (status && p.status !== status) return false
      if (type && p.paymentType !== type) return false
      if (search) {
        const s = search.toLowerCase()
        return p.application?.applicationNumber?.toLowerCase().includes(s) || p.application?.applicant?.organizationName?.toLowerCase().includes(s)
      }
      return true
    })
  }, [data, status, type, search])

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Payment Management</h1><p className="text-sm text-muted-foreground">Track land allotment payments, dues, and financial transactions</p></div>

      {/* Colored Summary Tiles */}
      {data && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-transparent shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-violet-50 to-white/50"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Due</p><p className="text-xl font-bold mt-1 tabular-nums">{formatINR(data.summary.totalDue)}</p></div><div className="rounded-lg bg-violet-100 p-2"><IndianRupee className="h-4 w-4 text-violet-600"/></div></div></CardContent></Card>
        <Card className="border-transparent shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-emerald-50 to-white/50"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Collected</p><p className="text-xl font-bold mt-1 text-emerald-700 tabular-nums">{formatINR(data.summary.totalPaid)}</p></div><div className="rounded-lg bg-emerald-100 p-2"><CheckCircle2 className="h-4 w-4 text-emerald-600"/></div></div></CardContent></Card>
        <Card className="border-transparent shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-amber-50 to-white/50"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Outstanding</p><p className="text-xl font-bold mt-1 text-amber-700 tabular-nums">{formatINR(data.summary.outstanding)}</p></div><div className="rounded-lg bg-amber-100 p-2"><Clock className="h-4 w-4 text-amber-600"/></div></div></CardContent></Card>
        <Card className="border-transparent shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-red-50 to-white/50"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Overdue</p><p className="text-xl font-bold mt-1 text-red-700 tabular-nums">{formatINR(data.summary.overdue)}</p></div><div className="rounded-lg bg-red-100 p-2"><TrendingDown className="h-4 w-4 text-red-600"/></div></div></CardContent></Card>
      </div>}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-muted-foreground"><Filter className="h-4 w-4" /><span className="text-xs font-semibold">Filters</span></div>
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <div className="relative max-w-xs w-full sm:w-auto"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search app #..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}><SelectTrigger className="w-[120px] h-8 text-xs" data-active={!!status && status !== 'All'}><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{['All','Paid','Pending','Partially Paid','Overdue','Forfeited','Refunded'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
          <Select value={type || 'All'} onValueChange={v => setType(v === 'All' ? '' : v)}><SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!type && type !== 'All'}><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="All" className="text-xs">All Types</SelectItem>{paymentTypes.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent></Select>
          {activeFilters > 0 && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={() => { setStatus(''); setType(''); setSearch('') }}><X className="h-3.5 w-3.5" /> Clear</Button>}
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
        {loading ? <div className="p-4 space-y-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> :
        <Table><TableHeader><TableRow>
          <TableHead>Type</TableHead><TableHead>Application</TableHead><TableHead>Applicant</TableHead><TableHead className="text-right">Due</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.map((p: any, i: number) => (
            <TableRow key={i}>
              <TableCell className="text-xs font-medium">{p.paymentType}</TableCell>
              <TableCell className=" text-[11px]">{p.application?.applicationNumber}</TableCell>
              <TableCell className="text-xs">{p.application?.applicant?.organizationName}</TableCell>
              <TableCell className="text-right text-xs tabular-nums">{formatINR(p.amountDue)}</TableCell>
              <TableCell className="text-right text-xs tabular-nums text-emerald-700">{formatINR(p.amountPaid)}</TableCell>
              <TableCell className="text-right text-xs tabular-nums font-medium">{formatINR(p.amountDue - p.amountPaid)}</TableCell>
              <TableCell className="text-xs">{p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-IN') : String.fromCharCode(8212)}</TableCell>
              <TableCell><Badge variant="outline" className={cn('text-[10px]', statusColor(p.status))}>{p.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody></Table>}
      </CardContent></Card>
    </div>
  )
}
