'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { IndianRupee, Filter, X, Search, TrendingDown, CheckCircle2, AlertCircle, Clock, CircleDot, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatINR(amount: number) { return `\u20B9${(amount / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` }
function statusColor(s: string) {
  if (['Approved','Completed','Paid','Compliant'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
  if (['Under Review','In Progress','Pending','Partially Paid','Under Verification'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
  if (['Rejected','Failed','Overdue','Forfeited'].includes(s)) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
  if (['Deferred','On Hold','Refunded'].includes(s)) return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60'
  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
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
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-violet-50 to-white/50 dark:from-violet-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Total Due</p><p className="text-lg font-bold tabular-nums leading-tight mt-1 truncate">{formatINR(data.summary.totalDue)}</p></div><div className="rounded-lg bg-violet-100 dark:bg-violet-950/60 p-2 shrink-0"><IndianRupee className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400"/></div></div></CardContent></Card>
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-emerald-50 to-white/50 dark:from-emerald-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Total Collected</p><p className="text-lg font-bold tabular-nums leading-tight mt-1 text-emerald-700 dark:text-emerald-400 truncate">{formatINR(data.summary.totalPaid)}</p></div><div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/60 p-2 shrink-0"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"/></div></div></CardContent></Card>
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-amber-50 to-white/50 dark:from-amber-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Outstanding</p><p className="text-lg font-bold tabular-nums leading-tight mt-1 text-amber-700 dark:text-amber-400 truncate">{formatINR(data.summary.outstanding)}</p></div><div className="rounded-lg bg-amber-100 dark:bg-amber-950/60 p-2 shrink-0"><Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"/></div></div></CardContent></Card>
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-red-50 to-white/50 dark:from-red-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Overdue</p><p className="text-lg font-bold tabular-nums leading-tight mt-1 text-red-700 dark:text-red-400 truncate">{formatINR(data.summary.overdue)}</p></div><div className="rounded-lg bg-red-100 dark:bg-red-950/60 p-2 shrink-0"><TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400"/></div></div></CardContent></Card>
      </div>}

      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="relative w-full sm:flex-1 mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search application number, applicant organization..."
              className="pl-8 h-8 text-xs w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
            <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[120px] h-8 text-xs" data-active={!!status && status !== 'All'} icon={<CircleDot className="size-3.5" />}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {['All','Paid','Pending','Partially Paid','Overdue','Forfeited','Refunded'].map(s => (
                  <SelectItem key={s} value={s} className="text-xs">{s === 'All' ? 'Status' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type || 'All'} onValueChange={v => setType(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!type && type !== 'All'} icon={<Tag className="size-3.5" />}>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All Types</SelectItem>
                {paymentTypes.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 px-2 border-destructive text-destructive hover:bg-destructive/10" onClick={() => { setStatus(''); setType(''); setSearch('') }}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </Card>
      <Card>
        <CardContent className="px-3 py-0">
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
