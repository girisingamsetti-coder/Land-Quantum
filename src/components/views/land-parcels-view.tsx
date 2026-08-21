'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MapPin, Filter, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatINR(amount: number) { return `\u20B9${amount.toLocaleString('en-IN')}` }
function statusColor(s: string) {
  if (['Approved','Completed','Paid','Published'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (['Under Review','In Progress','Under Application','Draft'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200'
  if (['Rejected','Withdrawn'].includes(s)) return 'bg-red-100 text-red-700 border-red-200'
  if (['On Hold','Reserved'].includes(s)) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

export function LandParcelsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [zone, setZone] = useState('')
  const [search, setSearch] = useState('')

  const fetchParcels = useCallback(async () => {
    setLoading(true)
    try { const params = new URLSearchParams(); if (status) params.set('status', status); if (zone) params.set('zone', zone); const res = await fetch(`/api/land-parcels?${params}`); const json = await res.json(); if (json.success) setData(json.data) } catch {} finally { setLoading(false) }
  }, [status, zone])

  useEffect(() => { fetchParcels() }, [fetchParcels])

  const statusCounts = data?.parcels?.reduce((acc: any, p: any) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc }, {}) || {}
  const statusStyles: Record<string, { color: string; border: string; bg: string }> = {
    Published: { color: 'text-emerald-700', border: 'border-emerald-100', bg: 'bg-emerald-50/50' },
    Allotted: { color: 'text-blue-700', border: 'border-blue-100', bg: 'bg-blue-50/50' },
    'Under Application': { color: 'text-amber-700', border: 'border-amber-100', bg: 'bg-amber-50/50' },
    Reserved: { color: 'text-violet-700', border: 'border-violet-100', bg: 'bg-violet-50/50' },
    'On Hold': { color: 'text-orange-700', border: 'border-orange-100', bg: 'bg-orange-50/50' },
    Withdrawn: { color: 'text-slate-600', border: 'border-slate-100', bg: 'bg-slate-50/50' },
  }

  const filtered = useMemo(() => {
    if (!data?.parcels) return []
    if (!search) return data.parcels
    const s = search.toLowerCase()
    return data.parcels.filter((p: any) => p.plotId?.toLowerCase().includes(s) || p.surveyNumber?.toLowerCase().includes(s) || p.zone?.name?.toLowerCase().includes(s))
  }, [data, search])

  const activeFilters = [status, zone, search].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Land Inventory</h1><p className="text-sm text-muted-foreground">Manage available and allotted land parcels</p></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(statusStyles).map(([st, style]) => (
          <Card key={st} className={cn('border cursor-pointer transition-all hover:shadow-md', style.border, style.bg, status === st && 'ring-2 ring-offset-1')} onClick={() => setStatus(status === st ? '' : st)}>
            <CardContent className="p-3"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{st}</p><p className={cn('text-xl font-bold mt-1 tabular-nums', style.color)}>{statusCounts[st] || 0}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card><CardContent className="p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-muted-foreground mr-1"><Filter className="h-3.5 w-3.5" /><span className="text-xs font-medium">Filters</span></div>
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search plot ID, survey #, zone..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[160px] h-8"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{['All','Draft','Under Review','Approved','Published','Reserved','Under Application','Allotted','On Hold','Withdrawn'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={zone || 'All'} onValueChange={v => setZone(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[180px] h-8"><SelectValue placeholder="Zone" /></SelectTrigger>
          <SelectContent>{['All', ...(data?.zones || []).map((z: any) => z.name)].map((s, i) => <SelectItem key={s} value={i === 0 ? 'All' : data.zones.find((z: any) => z.name === s)?.id || s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        {activeFilters > 0 && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => { setStatus(''); setZone(''); setSearch('') }}><X className="h-3 w-3" /> Clear ({activeFilters})</Button>}
      </CardContent></Card>
      <Card><CardContent className="p-0">
        {loading ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> :
        <Table><TableHeader><TableRow>
          <TableHead>Plot ID</TableHead><TableHead>Survey #</TableHead><TableHead>Zone</TableHead><TableHead>Land Use</TableHead><TableHead className="text-right">Extent</TableHead><TableHead>FSI</TableHead><TableHead className="text-right">Reserve Price</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs font-medium">{p.plotId}</TableCell>
              <TableCell className="text-xs">{p.surveyNumber}</TableCell>
              <TableCell className="text-xs">{p.zone?.name}</TableCell>
              <TableCell className="text-xs">{p.landUse?.name}</TableCell>
              <TableCell className="text-right text-xs tabular-nums">{p.extentAcres} ac</TableCell>
              <TableCell className="text-xs tabular-nums">{p.fsiFar}</TableCell>
              <TableCell className="text-right text-xs font-medium tabular-nums">{formatINR(p.reservePrice)}</TableCell>
              <TableCell className="text-xs">{p.allotmentMode?.name || String.fromCharCode(8212)}</TableCell>
              <TableCell><Badge variant="outline" className={cn('text-[10px]', statusColor(p.status))}>{p.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody></Table>}
      </CardContent></Card>
    </div>
  )
}