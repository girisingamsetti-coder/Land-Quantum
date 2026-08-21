'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Filter, X, Search, MessageSquareWarning, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

function statusColor(s: string) {
  if (['Resolved','Closed'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (['Open','In Progress'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200'
  if (['Rejected'].includes(s)) return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

export function GrievancesView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/grievances').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  const categories = useMemo(() => { if (!data?.grievances) return []; return [...new Set(data.grievances.map((g: any) => g.category).filter(Boolean))] }, [data])
  const activeFilters = [status, category, search].filter(Boolean).length

  const filtered = useMemo(() => {
    if (!data?.grievances) return []
    return data.grievances.filter((g: any) => {
      if (status && g.status !== status) return false
      if (category && g.category !== category) return false
      if (search) {
        const s = search.toLowerCase()
        return g.grievanceNumber?.toLowerCase().includes(s) || g.applicant?.organizationName?.toLowerCase().includes(s) || g.application?.applicationNumber?.toLowerCase().includes(s)
      }
      return true
    })
  }, [data, status, category, search])

  const summaryStats = data ? {
    total: data.grievances?.length || 0,
    open: data.grievances?.filter((g: any) => g.status === 'Open').length || 0,
    inProgress: data.grievances?.filter((g: any) => g.status === 'In Progress').length || 0,
    resolved: data.grievances?.filter((g: any) => ['Resolved', 'Closed'].includes(g.status)).length || 0,
  } : null

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Grievances & Appeals</h1><p className="text-sm text-muted-foreground">Manage applicant grievances, appeals, and resolutions</p></div>

      {summaryStats && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-slate-100 bg-slate-50/50"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total</p><p className="text-xl font-bold mt-1 tabular-nums">{summaryStats.total}</p></div><div className="rounded-lg bg-slate-100 p-2"><MessageSquareWarning className="h-4 w-4 text-slate-600"/></div></div></CardContent></Card>
        <Card className="border-amber-100 bg-amber-50/50"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Open</p><p className="text-xl font-bold mt-1 text-amber-700 tabular-nums">{summaryStats.open}</p></div><div className="rounded-lg bg-amber-100 p-2"><AlertCircle className="h-4 w-4 text-amber-600"/></div></div></CardContent></Card>
        <Card className="border-blue-100 bg-blue-50/50"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">In Progress</p><p className="text-xl font-bold mt-1 text-blue-700 tabular-nums">{summaryStats.inProgress}</p></div><div className="rounded-lg bg-blue-100 p-2"><Clock className="h-4 w-4 text-blue-600"/></div></div></CardContent></Card>
        <Card className="border-emerald-100 bg-emerald-50/50"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Resolved</p><p className="text-xl font-bold mt-1 text-emerald-700 tabular-nums">{summaryStats.resolved}</p></div><div className="rounded-lg bg-emerald-100 p-2"><CheckCircle2 className="h-4 w-4 text-emerald-600"/></div></div></CardContent></Card>
      </div>}

      <Card><CardContent className="p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-muted-foreground mr-1"><Filter className="h-3.5 w-3.5" /><span className="text-xs font-medium">Filters</span></div>
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search GRV #, applicant, or app #..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}><SelectTrigger className="w-[130px] h-8"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{['All','Open','In Progress','Resolved','Closed','Rejected'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        <Select value={category || 'All'} onValueChange={v => setCategory(v === 'All' ? '' : v)}><SelectTrigger className="w-[160px] h-8"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="All">All Categories</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        {activeFilters > 0 && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => { setStatus(''); setCategory(''); setSearch('') }}><X className="h-3 w-3" /> Clear ({activeFilters})</Button>}
      </CardContent></Card>

      <Card><CardContent className="p-0">
        {loading ? <div className="p-4 space-y-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-16 w-full"/>)}</div> :
        <Table><TableHeader><TableRow>
          <TableHead>GRV #</TableHead><TableHead>Applicant</TableHead><TableHead>Application</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Assigned To</TableHead><TableHead>Submitted</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.map((g: any) => (
            <TableRow key={g.id}>
              <TableCell className="font-mono text-xs font-medium">{g.grievanceNumber}</TableCell>
              <TableCell className="text-xs">{g.applicant?.organizationName || String.fromCharCode(8212)}</TableCell>
              <TableCell className="font-mono text-[11px]">{g.application?.applicationNumber || String.fromCharCode(8212)}</TableCell>
              <TableCell className="text-xs">{g.category}</TableCell>
              <TableCell><Badge variant="outline" className={cn('text-[10px]', statusColor(g.status))}>{g.status}</Badge></TableCell>
              <TableCell className="text-xs">{g.assignedTo?.name || String.fromCharCode(8212)}</TableCell>
              <TableCell className="text-xs">{new Date(g.submittedAt).toLocaleDateString('en-IN')}</TableCell>
            </TableRow>
          ))}
        </TableBody></Table>}
      </CardContent></Card>
    </div>
  )
}