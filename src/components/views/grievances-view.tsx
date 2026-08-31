'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Filter, X, Search, MessageSquareWarning, Clock, CheckCircle2, AlertCircle, CircleDot, LayoutList } from 'lucide-react'
import { cn } from '@/lib/utils'

function statusColor(s: string) {
  if (['Resolved','Closed'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
  if (['Open','In Progress'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
  if (['Rejected'].includes(s)) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
}

export function GrievancesView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetch('/api/grievances').then(r=>r.json()).then(j=>j.success&&setData(j.data)).finally(()=>setLoading(false)) }, [])

  const categories = useMemo(() => { if (!data?.grievances) return []; return [...new Set(data.grievances.map((g: any) => g.category).filter(Boolean))] as string[] }, [data])
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
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-slate-50 to-white/50 dark:from-slate-900/40 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Total</p><p className="text-lg font-bold tabular-nums leading-tight mt-1 truncate">{summaryStats.total}</p></div><div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 shrink-0"><MessageSquareWarning className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400"/></div></div></CardContent></Card>
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-amber-50 to-white/50 dark:from-amber-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Open</p><p className="text-lg font-bold tabular-nums leading-tight mt-1 text-amber-700 dark:text-amber-400 truncate">{summaryStats.open}</p></div><div className="rounded-lg bg-amber-100 dark:bg-amber-950/60 p-2 shrink-0"><AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"/></div></div></CardContent></Card>
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-blue-50 to-white/50 dark:from-blue-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">In Progress</p><p className="text-lg font-bold tabular-nums leading-tight mt-1 text-blue-700 dark:text-blue-400 truncate">{summaryStats.inProgress}</p></div><div className="rounded-lg bg-blue-100 dark:bg-blue-950/60 p-2 shrink-0"><Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400"/></div></div></CardContent></Card>
        <Card className="border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer bg-gradient-to-r from-emerald-50 to-white/50 dark:from-emerald-950/30 dark:to-card/60"><CardContent className="px-3 py-0"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Resolved</p><p className="text-lg font-bold tabular-nums leading-tight mt-1 text-emerald-700 dark:text-emerald-400 truncate">{summaryStats.resolved}</p></div><div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/60 p-2 shrink-0"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"/></div></div></CardContent></Card>
      </div>}

      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="relative w-full sm:flex-1 mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search grievance number, applicant, application..."
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
                {['All','Open','In Progress','Resolved','Closed','Rejected'].map(s => (
                  <SelectItem key={s} value={s} className="text-xs">{s === 'All' ? 'Status' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category || 'All'} onValueChange={v => setCategory(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!category && category !== 'All'} icon={<LayoutList className="size-3.5" />}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={() => { setStatus(''); setCategory(''); setSearch('') }}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </Card>
      <Card>
        <CardContent className="px-3 py-0">
        {loading ? <div className="p-4 space-y-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-16 w-full"/>)}</div> :
        <Table><TableHeader><TableRow>
          <TableHead>GRV #</TableHead><TableHead>Applicant</TableHead><TableHead>Application</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Assigned To</TableHead><TableHead>Submitted</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.map((g: any) => (
            <TableRow key={g.id}>
              <TableCell className=" text-xs font-medium">{g.grievanceNumber}</TableCell>
              <TableCell className="text-xs">{g.applicant?.organizationName || String.fromCharCode(8212)}</TableCell>
              <TableCell className=" text-[11px]">{g.application?.applicationNumber || String.fromCharCode(8212)}</TableCell>
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
