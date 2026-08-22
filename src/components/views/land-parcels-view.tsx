'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MapPin, Filter, X, Search, Map as MapIcon } from 'lucide-react'
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
  const [selectedParcel, setSelectedParcel] = useState<any>(null)

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-muted-foreground"><Filter className="h-4 w-4" /><span className="text-xs font-semibold">Filters</span></div>
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <div className="relative max-w-xs w-full sm:w-auto"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search ID, survey..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}><SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{['All','Draft','Under Review','Approved','Published','Reserved','Under Application','Allotted','On Hold','Withdrawn'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
          <Select value={zone || 'All'} onValueChange={v => setZone(v === 'All' ? '' : v)}><SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Zone" /></SelectTrigger><SelectContent>{['All', ...(data?.zones || []).map((z: any) => z.name)].map((s, i) => <SelectItem key={s} value={i === 0 ? 'All' : data.zones.find((z: any) => z.name === s)?.id || s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
          {activeFilters > 0 && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={() => { setStatus(''); setZone(''); setSearch('') }}><X className="h-3.5 w-3.5" /> Clear</Button>}
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
        {loading ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> :
        <Table><TableHeader><TableRow>
          <TableHead>Plot ID</TableHead><TableHead>Survey #</TableHead><TableHead>Zone</TableHead><TableHead>Land Use</TableHead><TableHead className="text-right">Extent</TableHead><TableHead>FSI</TableHead><TableHead className="text-right">Reserve Price</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Map</TableHead>
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
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setSelectedParcel(p)}>
                  <MapIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody></Table>}
    </CardContent></Card>
    
      {selectedParcel && (
        <Dialog open={!!selectedParcel} onOpenChange={(open) => !open && setSelectedParcel(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden gap-4">
            <DialogHeader className="p-4 pb-2 bg-background">
              <DialogTitle className="flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-muted-foreground" />
                Plot Map: {selectedParcel.plotId}
              </DialogTitle>
              <DialogDescription>
                Location: Amaravati, Andhra Pradesh ({selectedParcel.zone?.name}) &middot; Coordinates: 16.5167&deg; N, 80.5167&deg; E
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col md:flex-row h-[60vh]">
              <div className="flex-1 bg-muted relative">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=80.45%2C16.48%2C80.55%2C16.55&amp;layer=mapnik&amp;marker=16.5167%2C80.5167"
                  style={{ border: 0 }}
                  title="Amaravati Map"
                ></iframe>
              </div>
              <div className="w-full md:w-72 border-l bg-background p-4 space-y-4 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-2 border-b pb-2">Parcel Details</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
                  <div className="text-muted-foreground text-xs">Survey #</div>
                  <div className="font-medium text-right text-xs">{selectedParcel.surveyNumber}</div>
                  <div className="text-muted-foreground text-xs">Extent</div>
                  <div className="font-medium text-right text-xs">{selectedParcel.extentAcres} ac</div>
                  <div className="text-muted-foreground text-xs">Land Use</div>
                  <div className="font-medium text-right text-xs">{selectedParcel.landUse?.name}</div>
                  <div className="text-muted-foreground text-xs">Reserve Price</div>
                  <div className="font-medium text-right text-xs">{formatINR(selectedParcel.reservePrice)}</div>
                  <div className="text-muted-foreground text-xs">Status</div>
                  <div className="text-right"><Badge variant="outline" className={cn('text-[10px]', statusColor(selectedParcel.status))}>{selectedParcel.status}</Badge></div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
