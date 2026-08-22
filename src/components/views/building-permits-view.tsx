'use client'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, Search, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

// Mock Data
const mockPermits = [
  { id: 'BP-2024-001', applicant: 'Sri City Developers', type: 'Commercial', zone: 'Zone A — Core', status: 'Approved', date: '2024-01-15' },
  { id: 'BP-2024-002', applicant: 'L&T Construction', type: 'Residential', zone: 'Zone B — Growth', status: 'Under Review', date: '2024-02-10' },
  { id: 'BP-2024-003', applicant: 'GMR Group', type: 'Industrial', zone: 'Zone C — Industrial', status: 'Approved', date: '2024-03-05' },
  { id: 'BP-2024-004', applicant: 'Navayuga Engineering', type: 'Mixed Use', zone: 'Zone A — Core', status: 'Rejected', date: '2024-03-20' },
  { id: 'BP-2024-005', applicant: 'Prestige Estates', type: 'Residential', zone: 'Zone D — Residential', status: 'Under Review', date: '2024-04-12' },
  { id: 'BP-2024-006', applicant: 'DLF', type: 'Commercial', zone: 'Zone B — Growth', status: 'Approved', date: '2024-05-01' },
]



export function BuildingPermitsView() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = useMemo(() => {
    return mockPermits.filter(p => {
      if (status && p.status !== status) return false
      if (search) {
        const s = search.toLowerCase()
        return p.id.toLowerCase().includes(s) || p.applicant.toLowerCase().includes(s)
      }
      return true
    })
  }, [search, status])

  const activeFilters = [status, search].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Building Permits</h1>
        <p className="text-sm text-muted-foreground">Manage and track building permits for Amaravati City, Andhra Pradesh.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FileText className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Permits</p>
              <h3 className="text-2xl font-bold">1,248</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <h3 className="text-2xl font-bold">842</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Clock className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Under Review</p>
              <h3 className="text-2xl font-bold">315</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg"><XCircle className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejected</p>
              <h3 className="text-2xl font-bold">91</h3>
            </div>
          </CardContent>
        </Card>
      </div>



      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Filter className="h-4 w-4" /><span className="text-xs font-semibold">Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <div className="relative max-w-xs w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search ID or Applicant..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {['All', 'Approved', 'Under Review', 'Rejected'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {activeFilters > 0 && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={() => { setStatus(''); setSearch('') }}>Clear</Button>}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permit ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-medium">{p.id}</TableCell>
                  <TableCell className="text-xs font-medium">{p.applicant}</TableCell>
                  <TableCell className="text-xs">{p.type}</TableCell>
                  <TableCell className="text-xs">{p.zone}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px]', 
                      p.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                      p.status === 'Under Review' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                      'bg-red-100 text-red-700 border-red-200'
                    )}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
