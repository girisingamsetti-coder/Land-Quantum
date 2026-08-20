'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MapPin } from 'lucide-react'

function formatINR(amount: number) { return `\u20B9${amount.toLocaleString('en-IN')}` }
function statusColor(s: string) {
  if (['Approved','Completed','Paid','Published'].includes(s)) return 'bg-emerald-100 text-emerald-800'
  if (['Under Review','In Progress','Under Application','Draft'].includes(s)) return 'bg-amber-100 text-amber-800'
  if (['Rejected','Withdrawn'].includes(s)) return 'bg-red-100 text-red-800'
  if (['On Hold','Reserved'].includes(s)) return 'bg-orange-100 text-orange-800'
  return 'bg-gray-100 text-gray-700'
}

export function LandParcelsView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [zone, setZone] = useState('')

  const fetchParcels = useCallback(async () => {
    setLoading(true)
    try { const params = new URLSearchParams(); if (status) params.set('status', status); if (zone) params.set('zone', zone); const res = await fetch(`/api/land-parcels?${params}`); const json = await res.json(); if (json.success) setData(json.data) } catch {} finally { setLoading(false) }
  }, [status, zone])

  useEffect(() => { fetchParcels() }, [fetchParcels])

  const statusCounts = data?.parcels?.reduce((acc: any, p: any) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc }, {}) || {}
  const statusStyles: Record<string,string> = { Published: 'bg-emerald-100 text-emerald-800', Allotted: 'bg-blue-100 text-blue-800', 'Under Application': 'bg-amber-100 text-amber-800', Reserved: 'bg-purple-100 text-purple-800', 'On Hold': 'bg-orange-100 text-orange-800', Withdrawn: 'bg-gray-100 text-gray-800' }

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold tracking-tight">Land Inventory</h1><p className="text-sm text-muted-foreground">Manage available and allotted land parcels in Amaravati</p></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(statusStyles).map(([st, color]) => (
          <Card key={st} className="p-3"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{st}</p><p className="text-xl font-bold mt-1">{statusCounts[st] || 0}</p></Card>
        ))}
      </div>
      <Card><CardContent className="p-3 flex flex-wrap gap-2 items-center">
        <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{['All','Draft','Under Review','Approved','Published','Reserved','Under Application','Allotted','On Hold','Withdrawn'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={zone || 'All'} onValueChange={v => setZone(v === 'All' ? '' : v)}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Zone" /></SelectTrigger>
          <SelectContent>{['All', ...(data?.zones || []).map((z: any) => z.name)].map((s, i) => <SelectItem key={s} value={i === 0 ? 'All' : data.zones.find((z: any) => z.name === s)?.id || s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </CardContent></Card>
      <Card><CardContent className="p-0">
        {loading ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> :
        <Table><TableHeader><TableRow>
          <TableHead>Plot ID</TableHead><TableHead>Survey #</TableHead><TableHead>Zone</TableHead><TableHead>Land Use</TableHead><TableHead className="text-right">Extent</TableHead><TableHead>FSI</TableHead><TableHead className="text-right">Reserve Price</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead>
        </TableRow></TableHeader><TableBody>
          {data?.parcels?.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs font-medium">{p.plotId}</TableCell>
              <TableCell className="text-xs">{p.surveyNumber}</TableCell>
              <TableCell className="text-xs">{p.zone?.name}</TableCell>
              <TableCell className="text-xs">{p.landUse?.name}</TableCell>
              <TableCell className="text-right text-xs tabular-nums">{p.extentAcres} ac</TableCell>
              <TableCell className="text-xs tabular-nums">{p.fsiFar}</TableCell>
              <TableCell className="text-right text-xs font-medium tabular-nums">{formatINR(p.reservePrice)}</TableCell>
              <TableCell className="text-xs">{p.allotmentMode?.name || '—'}</TableCell>
              <TableCell><Badge className={`${statusColor(p.status)} text-[10px] hover:${statusColor(p.status)}`}>{p.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody></Table>}
      </CardContent></Card>
    </div>
  )
}