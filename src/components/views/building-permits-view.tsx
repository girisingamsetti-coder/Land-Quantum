'use client'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, Search, FileText, CheckCircle2, Clock, XCircle, Building2, MapPin, Calendar, History, FileCheck, Landmark, UploadCloud, X, CircleDot, Tag, Layers } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'

// Enhanced Mock Data
const mockPermits = [
  { 
    id: 'BP-2024-001', applicant: 'Sri City Developers', type: 'Commercial', zone: 'Zone A — Core', status: 'Approved', date: '2024-01-15',
    history: [
      { date: '2024-01-15', action: 'Permit Approved', actor: 'City Planning Dept' },
      { date: '2024-01-10', action: 'Final Review Completed', actor: 'Review Board' },
      { date: '2023-12-20', action: 'Application Submitted', actor: 'Applicant' }
    ],
    stages: ['Submitted', 'Initial Review', 'NOC Verification', 'Final Review', 'Approved'],
    currentStage: 4,
    noc: [
      { name: 'Fire Safety NOC', status: 'Approved' },
      { name: 'Environmental Clearance', status: 'Approved' },
      { name: 'Traffic Police Clearance', status: 'Not Required' }
    ],
    documents: [
      { name: 'Architectural Drawings.pdf', date: '2023-12-20' },
      { name: 'Structural Stability Certificate.pdf', date: '2023-12-21' },
      { name: 'Land Ownership Proof.pdf', date: '2023-12-20' }
    ]
  },
  { 
    id: 'BP-2024-002', applicant: 'L&T Construction', type: 'Residential', zone: 'Zone B — Growth', status: 'Under Review', date: '2024-02-10',
    history: [
      { date: '2024-02-15', action: 'NOC Verification Started', actor: 'NOC Dept' },
      { date: '2024-02-12', action: 'Initial Review Passed', actor: 'City Planning Dept' },
      { date: '2024-02-10', action: 'Application Submitted', actor: 'Applicant' }
    ],
    stages: ['Submitted', 'Initial Review', 'NOC Verification', 'Final Review', 'Approved'],
    currentStage: 2,
    noc: [
      { name: 'Fire Safety NOC', status: 'Pending' },
      { name: 'Environmental Clearance', status: 'Approved' },
      { name: 'Water Board NOC', status: 'Pending' }
    ],
    documents: [
      { name: 'Site Plan.pdf', date: '2024-02-10' },
      { name: 'Elevation Drawings.pdf', date: '2024-02-10' }
    ]
  },
  { 
    id: 'BP-2024-003', applicant: 'GMR Group', type: 'Industrial', zone: 'Zone C — Industrial', status: 'Approved', date: '2024-03-05',
    history: [
      { date: '2024-03-05', action: 'Permit Approved', actor: 'City Planning Dept' },
      { date: '2024-02-28', action: 'NOC Cleared', actor: 'NOC Dept' },
      { date: '2024-02-15', action: 'Application Submitted', actor: 'Applicant' }
    ],
    stages: ['Submitted', 'Initial Review', 'NOC Verification', 'Final Review', 'Approved'],
    currentStage: 4,
    noc: [
      { name: 'Fire Safety NOC', status: 'Approved' },
      { name: 'Pollution Control Board NOC', status: 'Approved' },
      { name: 'Industrial Safety NOC', status: 'Approved' }
    ],
    documents: [
      { name: 'Factory Layout.pdf', date: '2024-02-15' },
      { name: 'Environmental Impact Assessment.pdf', date: '2024-02-18' }
    ]
  },
  { 
    id: 'BP-2024-004', applicant: 'Navayuga Engineering', type: 'Mixed Use', zone: 'Zone A — Core', status: 'Rejected', date: '2024-03-20',
    history: [
      { date: '2024-03-20', action: 'Application Rejected', actor: 'Review Board' },
      { date: '2024-03-18', action: 'Issue found in structural plan', actor: 'City Planning Dept' },
      { date: '2024-03-10', action: 'Application Submitted', actor: 'Applicant' }
    ],
    stages: ['Submitted', 'Initial Review', 'NOC Verification', 'Final Review', 'Approved'],
    currentStage: 1,
    noc: [
      { name: 'Fire Safety NOC', status: 'Pending' },
      { name: 'Traffic Police Clearance', status: 'Pending' }
    ],
    documents: [
      { name: 'Mixed Use Layout.pdf', date: '2024-03-10' }
    ]
  },
  { 
    id: 'BP-2024-005', applicant: 'Prestige Estates', type: 'Residential', zone: 'Zone D — Residential', status: 'Under Review', date: '2024-04-12',
    history: [
      { date: '2024-04-15', action: 'Initial Review Started', actor: 'City Planning Dept' },
      { date: '2024-04-12', action: 'Application Submitted', actor: 'Applicant' }
    ],
    stages: ['Submitted', 'Initial Review', 'NOC Verification', 'Final Review', 'Approved'],
    currentStage: 1,
    noc: [
      { name: 'Fire Safety NOC', status: 'Pending' },
      { name: 'Water Board NOC', status: 'Pending' }
    ],
    documents: [
      { name: 'Apartment Complex Plan.pdf', date: '2024-04-12' },
      { name: 'Amenities Plan.pdf', date: '2024-04-12' }
    ]
  },
  { 
    id: 'BP-2024-006', applicant: 'DLF', type: 'Commercial', zone: 'Zone B — Growth', status: 'Approved', date: '2024-05-01',
    history: [
      { date: '2024-05-01', action: 'Permit Approved', actor: 'City Planning Dept' },
      { date: '2024-04-20', action: 'Final Review Completed', actor: 'Review Board' },
      { date: '2024-04-05', action: 'Application Submitted', actor: 'Applicant' }
    ],
    stages: ['Submitted', 'Initial Review', 'NOC Verification', 'Final Review', 'Approved'],
    currentStage: 4,
    noc: [
      { name: 'Fire Safety NOC', status: 'Approved' },
      { name: 'Traffic Police Clearance', status: 'Approved' }
    ],
    documents: [
      { name: 'Mall Blueprint.pdf', date: '2024-04-05' },
      { name: 'Traffic Impact Study.pdf', date: '2024-04-06' }
    ]
  },
  // Replicating a few to fill up the grid and demonstrate scrolling
  ...Array.from({ length: 14 }).map((_, i) => ({
    id: `BP-2024-0${i + 7 < 10 ? '0' + (i + 7) : i + 7}`,
    applicant: `Applicant ${i + 7}`,
    type: i % 2 === 0 ? 'Residential' : 'Commercial',
    zone: `Zone ${String.fromCharCode(65 + (i % 4))} — Segment`,
    status: i % 3 === 0 ? 'Approved' : i % 3 === 1 ? 'Under Review' : 'Rejected',
    date: `2024-06-${(i + 1).toString().padStart(2, '0')}`,
    history: [ { date: `2024-06-${(i + 1).toString().padStart(2, '0')}`, action: 'Application Created', actor: 'System' } ],
    stages: ['Submitted', 'Initial Review', 'NOC Verification', 'Final Review', 'Approved'],
    currentStage: i % 3 === 0 ? 4 : i % 3 === 1 ? 2 : 1,
    noc: [ { name: 'Basic Clearance', status: i % 3 === 0 ? 'Approved' : 'Pending' } ],
    documents: [ { name: 'Initial Document.pdf', date: `2024-06-${(i + 1).toString().padStart(2, '0')}` } ]
  }))
]


export function BuildingPermitsView() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [zone, setZone] = useState('')
  const [stage, setStage] = useState('')
  const [year, setYear] = useState('')
  const [selectedPermit, setSelectedPermit] = useState<typeof mockPermits[0] | null>(null)

  const filtered = useMemo(() => {
    return mockPermits.filter(p => {
      if (status && p.status !== status) return false
      if (type && p.type !== type) return false
      if (zone && p.zone !== zone) return false
      if (stage && p.stages[p.currentStage] !== stage) return false
      if (year && !p.date.startsWith(year)) return false
      if (search) {
        const s = search.toLowerCase()
        return p.id.toLowerCase().includes(s) || p.applicant.toLowerCase().includes(s)
      }
      return true
    })
  }, [search, status, type, zone, stage, year])

  const activeFilters = [status, type, zone, stage, year, search].filter(Boolean).length

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Building Permits</h1>
        <p className="text-sm text-muted-foreground">Manage and track building permits for Amaravati City, Andhra Pradesh.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-r from-blue-50 to-white/50 dark:from-blue-950/30 dark:to-card/60 border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer">
          <CardContent className="px-3 py-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Total Permits</p>
                <p className="text-lg font-bold tabular-nums leading-tight mt-1 truncate">1,248</p>
              </div>
              <div className="rounded-lg p-2 bg-blue-100/50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                <FileText className="h-3.5 w-3.5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-emerald-50 to-white/50 dark:from-emerald-950/30 dark:to-card/60 border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer">
          <CardContent className="px-3 py-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Approved</p>
                <p className="text-lg font-bold tabular-nums leading-tight mt-1 text-emerald-700 dark:text-emerald-400 truncate">842</p>
              </div>
              <div className="rounded-lg p-2 bg-emerald-100/50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-amber-50 to-white/50 dark:from-amber-950/30 dark:to-card/60 border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer">
          <CardContent className="px-3 py-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Under Review</p>
                <p className="text-lg font-bold tabular-nums leading-tight mt-1 text-amber-700 dark:text-amber-400 truncate">315</p>
              </div>
              <div className="rounded-lg p-2 bg-amber-100/50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-50 to-white/50 dark:from-red-950/30 dark:to-card/60 border-transparent dark:border-border/50 shadow-sm hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px] transition-all cursor-pointer">
          <CardContent className="px-3 py-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">Rejected</p>
                <p className="text-lg font-bold tabular-nums leading-tight mt-1 text-red-700 dark:text-red-400 truncate">91</p>
              </div>
              <div className="rounded-lg p-2 bg-red-100/50 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                <XCircle className="h-3.5 w-3.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="relative w-full sm:flex-1 mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search ID or Applicant..." className="pl-8 h-8 text-xs w-full" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
            <Select value={status || 'All'} onValueChange={v => setStatus(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[120px] h-8 text-xs" data-active={!!status && status !== 'All'} icon={<CircleDot className="size-3.5" />}><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                {['Approved', 'Under Review', 'Rejected'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type || 'All'} onValueChange={v => setType(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[110px] h-8 text-xs" data-active={!!type && type !== 'All'} icon={<Tag className="size-3.5" />}><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Type: All</SelectItem>
                {['Commercial', 'Residential', 'Industrial', 'Mixed Use'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={zone || 'All'} onValueChange={v => setZone(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[130px] h-8 text-xs" data-active={!!zone && zone !== 'All'} icon={<MapPin className="size-3.5" />}><SelectValue placeholder="Zone" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Zone: All</SelectItem>
                {['Zone A — Core', 'Zone B — Growth', 'Zone C — Industrial', 'Zone D — Residential'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={stage || 'All'} onValueChange={v => setStage(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[130px] h-8 text-xs" data-active={!!stage && stage !== 'All'} icon={<Layers className="size-3.5" />}><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Stage: All</SelectItem>
                {['Submitted', 'Initial Review', 'NOC Verification', 'Final Review', 'Approved'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={year || 'All'} onValueChange={v => setYear(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[95px] h-8 text-xs" data-active={!!year && year !== 'All'} icon={<Calendar className="size-3.5" />}><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Year: All</SelectItem>
                {['2024', '2023'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {activeFilters > 0 && <Button variant="outline" size="sm" className="h-8 text-xs gap-1 px-2 border-destructive text-destructive hover:bg-destructive/10" onClick={() => { setStatus(''); setType(''); setZone(''); setStage(''); setYear(''); setSearch('') }}><X className="h-3.5 w-3.5" /> Clear</Button>}
          </div>
        </div>
      </Card>

      {/* Main Stage View Area */}
      <Card className="overflow-hidden border-2">
        <CardContent className="max-h-[540px] overflow-auto p-2 bg-muted/5">
          {/* Responsive column grid (1 col mobile, 2 cols sm, 3 cols md, 6 cols lg) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 items-stretch">
          {filtered.map((p) => (
            <Card 
              key={p.id} 
              className={cn(
                "cursor-pointer hover:border-primary/60 transition-all flex flex-col justify-between h-full min-h-[180px] shadow-sm hover:shadow-md",
                selectedPermit?.id === p.id ? "border-primary ring-1 ring-primary/20 shadow-md bg-primary/[0.02]" : "border-border/60"
              )}
              onClick={() => setSelectedPermit(p)}
            >
              <CardHeader className="p-3 sm:p-4 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={cn('text-[10px] font-semibold border', 
                    p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60' : 
                    p.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60' : 
                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
                  )}>
                    {p.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground ">{p.date}</span>
                </div>
                <CardTitle className="text-sm font-bold line-clamp-2 leading-tight" title={p.applicant}>{p.applicant}</CardTitle>
                <div className="text-xs  text-muted-foreground mt-1">{p.id}</div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0 text-xs text-muted-foreground flex-1 flex flex-col justify-end">
                <div className="flex items-center gap-1.5 mt-2 text-foreground/80">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{p.type}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-foreground/80">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{p.zone}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <Search className="h-8 w-8 mb-4 opacity-50" />
              <p>No building permits found matching your criteria.</p>
            </div>
          )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Permit ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedPermit(p)}>
                    <TableCell className=" text-xs font-medium pl-4">{p.id}</TableCell>
                    <TableCell className="text-xs font-medium">{p.applicant}</TableCell>
                    <TableCell className="text-xs">{p.type}</TableCell>
                    <TableCell className="text-xs">{p.zone}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-[10px] font-semibold border', 
                        p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60' : 
                        p.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60' : 
                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
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

      {/* Side Panel for Detail View */}
      <Sheet open={!!selectedPermit} onOpenChange={(open) => !open && setSelectedPermit(null)}>
        <SheetContent className="w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0 flex flex-col border-l-0 shadow-2xl" side="right">
          {selectedPermit && (
            <>
              <SheetHeader className="p-6 pb-5 border-b shrink-0 sticky top-0 bg-background/95 backdrop-blur z-10 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                      {selectedPermit.id}
                      <Badge variant="outline" className={cn('text-xs font-semibold ml-2 border', 
                        selectedPermit.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        selectedPermit.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-red-50 text-red-700 border-red-200'
                      )}>
                        {selectedPermit.status}
                      </Badge>
                    </SheetTitle>
                    <SheetDescription className="text-base mt-1 text-foreground font-medium">
                      {selectedPermit.applicant}
                    </SheetDescription>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t text-sm">
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="text-muted-foreground text-xs font-medium mb-1.5 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5"/> Type</div>
                    <div className="font-semibold">{selectedPermit.type}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="text-muted-foreground text-xs font-medium mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Zone</div>
                    <div className="font-semibold truncate" title={selectedPermit.zone}>{selectedPermit.zone}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="text-muted-foreground text-xs font-medium mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Applied On</div>
                    <div className="font-semibold">{selectedPermit.date}</div>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="flex-1 p-6 space-y-10">
                
                {/* Stages */}
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-5"><CheckCircle2 className="w-5 h-5 text-primary" /> Progress Stages</h3>
                  <div className="relative pl-2">
                    <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-muted/60"></div>
                    <div className="space-y-7">
                      {selectedPermit.stages.map((stage, idx) => (
                        <div key={idx} className="flex gap-5 items-start relative">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 bg-background z-10 transition-colors", 
                            idx <= selectedPermit.currentStage ? "border-primary bg-primary/10" : "border-muted/60"
                          )}>
                            {idx <= selectedPermit.currentStage && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <div className="pt-0.5">
                            <p className={cn("text-sm font-semibold", idx <= selectedPermit.currentStage ? "text-foreground" : "text-muted-foreground")}>{stage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <Separator />

                {/* NOCs */}
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-5"><Landmark className="w-5 h-5 text-primary" /> Clearances & NOCs</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedPermit.noc.map((n, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/10 shadow-sm hover:shadow transition-shadow">
                        <span className="text-sm font-medium">{n.name}</span>
                        <Badge variant={n.status === 'Approved' ? 'default' : n.status === 'Not Required' ? 'secondary' : 'outline'} className={cn(
                           n.status === 'Approved' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm' : ''
                        )}>
                          {n.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* Documents */}
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-5"><FileCheck className="w-5 h-5 text-primary" /> Submitted Documentation</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedPermit.documents.map((doc, idx) => (
                      <Card key={idx} className="shadow-sm hover:border-primary/40 transition-colors cursor-pointer group">
                        <CardContent className="p-3.5 flex items-start gap-3.5">
                          <div className="p-2.5 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><FileText className="w-4 h-4" /></div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" title={doc.name}>{doc.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{doc.date}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* History */}
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-5"><History className="w-5 h-5 text-primary" /> Timeline History</h3>
                  <div className="space-y-4">
                    {selectedPermit.history.map((item, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="text-xs text-muted-foreground w-20 shrink-0 pt-1.5  text-right">{item.date}</div>
                        <div className="relative">
                           <div className="absolute left-[-11px] top-2 w-2 h-2 rounded-full bg-border group-hover:bg-primary transition-colors"></div>
                           <div className="absolute left-[-8px] top-4 bottom-[-16px] w-[2px] bg-border/50 group-last:hidden"></div>
                        </div>
                        <div className="flex-1 bg-muted/20 hover:bg-muted/40 transition-colors p-3.5 rounded-xl border border-border/50 shadow-sm ml-2">
                          <p className="text-sm font-semibold">{item.action}</p>
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span> {item.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
              <div className="p-5 border-t bg-muted/10 shrink-0 sticky bottom-0 backdrop-blur-sm z-10 flex gap-3">
                <Button className="flex-1 font-semibold" size="lg">Download Full Dossier <UploadCloud className="w-4 h-4 ml-2" /></Button>
                <Button variant="outline" size="lg">Print</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
