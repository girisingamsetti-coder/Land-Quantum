'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MapPin,
  Filter,
  X,
  Search,
  Map as MapIcon,
  Layers,
  Building2,
  Compass,
  CheckCircle2,
  Info,
  Navigation,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Maximize2,
  Landmark,
  GraduationCap,
  Scale,
  Briefcase,
  Waves
} from 'lucide-react'
import { cn } from '@/lib/utils'

function formatINR(amount: number) {
  if (amount == null) return '—'
  return `₹${(amount / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`
}

function statusColor(s: string) {
  if (['Approved', 'Completed', 'Paid', 'Published', 'Available'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (['Under Review', 'In Progress', 'Under Application', 'Draft'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200'
  if (['Rejected', 'Withdrawn'].includes(s)) return 'bg-red-100 text-red-700 border-red-200'
  if (['On Hold', 'Reserved'].includes(s)) return 'bg-purple-100 text-purple-700 border-purple-200'
  if (['Allotted'].includes(s)) return 'bg-blue-100 text-blue-700 border-blue-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

interface AmaravatiLandmark {
  id: string
  name: string
  village: string
  category: string
  icon: string
  lat: number
  lng: number
  bbox: string
  details: string
}

const AMARAVATI_LANDMARKS: AmaravatiLandmark[] = [
  {
    id: 'gov-core',
    name: 'AP Secretariat & Assembly',
    village: 'Velagapudi',
    category: 'Government Admin Core',
    icon: 'Landmark',
    lat: 16.5410,
    lng: 80.5180,
    bbox: '80.49%2C16.52%2C80.55%2C16.56',
    details: 'State Secretariat Blocks 1-5, AP Legislative Assembly & Council'
  },
  {
    id: 'high-court',
    name: 'High Court of Andhra Pradesh',
    village: 'Nelapadu',
    category: 'Judicial Complex',
    icon: 'Scale',
    lat: 16.5280,
    lng: 80.5350,
    bbox: '80.50%2C16.51%2C80.56%2C16.55',
    details: 'Principal Seat of AP High Court & State Judicial Academy'
  },
  {
    id: 'tech-hub',
    name: 'IT SEZ & FinTech Towers',
    village: 'Sakhamuru',
    category: 'Technology Core',
    icon: 'Briefcase',
    lat: 16.5210,
    lng: 80.5350,
    bbox: '80.49%2C16.49%2C80.57%2C16.55',
    details: 'FinTech Hub, AI & Global Tech Incubator, HCL & Adani ConneX Data Center'
  },
  {
    id: 'edu-hub',
    name: 'SRM & VIT Universities',
    village: 'Inavolu & Neerukonda',
    category: 'Knowledge District',
    icon: 'GraduationCap',
    lat: 16.5050,
    lng: 80.5120,
    bbox: '80.47%2C16.47%2C80.54%2C16.53',
    details: '200+ Acre Higher Education Hub, SRM University AP & VIT-AP Campuses'
  },
  {
    id: 'riverfront',
    name: 'Krishna Riverfront Promenade',
    village: 'Venkatapalem & Undavalli',
    category: 'Riverfront Corridor',
    icon: 'Waves',
    lat: 16.5350,
    lng: 80.5580,
    bbox: '80.51%2C16.50%2C80.59%2C16.56',
    details: 'Scenic Riverfront Walkway, Undavalli Caves Link & Amaravati Marinas'
  }
]

// Comprehensive Statutory Land Parcel Dataset for Amaravati Capital City
const DEFAULT_AMARAVATI_LANDS: any[] = [
  {
    id: 'lp-01',
    plotId: 'APCRDA-P-001',
    surveyNumber: '104/1A',
    zone: { id: 'z-gov', name: 'Zone A - Administrative Core (Velagapudi)' },
    landUse: { id: 'lu-com', name: 'Commercial & Office Headquarters' },
    extentAcres: 12.5,
    fsiFar: '3.50',
    reservePrice: 45000000,
    allotmentMode: { name: 'E-Auction Global Tender' },
    status: 'Published'
  },
  {
    id: 'lp-02',
    plotId: 'APCRDA-P-002',
    surveyNumber: '108/2B',
    zone: { id: 'z-gov', name: 'Zone A - Administrative Core (Rayapudi)' },
    landUse: { id: 'lu-gov', name: 'State Judicial & Legal Academy' },
    extentAcres: 8.0,
    fsiFar: '2.50',
    reservePrice: 32000000,
    allotmentMode: { name: 'Government Allocation' },
    status: 'Allotted'
  },
  {
    id: 'lp-03',
    plotId: 'APCRDA-P-003',
    surveyNumber: '112/3',
    zone: { id: 'z-gov', name: 'Zone A - Administrative Core (Velagapudi)' },
    landUse: { id: 'lu-civ', name: 'Civic Center & Public Utilities' },
    extentAcres: 5.5,
    fsiFar: '3.00',
    reservePrice: 24000000,
    allotmentMode: { name: 'E-Auction' },
    status: 'Published'
  },
  {
    id: 'lp-04',
    plotId: 'APCRDA-P-004',
    surveyNumber: '116/4',
    zone: { id: 'z-gov', name: 'Zone A - Administrative Core (Mandadam)' },
    landUse: { id: 'lu-sec', name: 'Secretariat Extension & Central Vista' },
    extentAcres: 14.0,
    fsiFar: '3.00',
    reservePrice: 52000000,
    allotmentMode: { name: 'Direct Allocation' },
    status: 'Under Application'
  },
  {
    id: 'lp-05',
    plotId: 'APCRDA-P-005',
    surveyNumber: '120/1',
    zone: { id: 'z-gov', name: 'Zone A - Administrative Core (Mandadam)' },
    landUse: { id: 'lu-bank', name: 'Financial Banking Plaza' },
    extentAcres: 9.0,
    fsiFar: '3.50',
    reservePrice: 38000000,
    allotmentMode: { name: 'E-Auction' },
    status: 'Published'
  },
  {
    id: 'lp-06',
    plotId: 'APCRDA-P-011',
    surveyNumber: '202/1',
    zone: { id: 'z-tech', name: 'Zone B - Tech & FinTech Hub (Nelapadu)' },
    landUse: { id: 'lu-it', name: 'IT / ITES Software Technology Park' },
    extentAcres: 25.0,
    fsiFar: '4.00',
    reservePrice: 95000000,
    allotmentMode: { name: 'Fast-Track Tech Allocation' },
    status: 'Published'
  },
  {
    id: 'lp-07',
    plotId: 'APCRDA-P-012',
    surveyNumber: '205/4',
    zone: { id: 'z-tech', name: 'Zone B - Tech & FinTech Hub (Sakhamuru)' },
    landUse: { id: 'lu-fin', name: 'FinTech Tower & AI Center' },
    extentAcres: 16.5,
    fsiFar: '3.50',
    reservePrice: 62000000,
    allotmentMode: { name: 'Expression of Interest (EOI)' },
    status: 'Under Application'
  },
  {
    id: 'lp-08',
    plotId: 'APCRDA-P-013',
    surveyNumber: '210/2A',
    zone: { id: 'z-tech', name: 'Zone B - Tech & FinTech Hub (Nelapadu)' },
    landUse: { id: 'lu-data', name: 'Hyperscale Cloud Data Center' },
    extentAcres: 30.0,
    fsiFar: '4.50',
    reservePrice: 120000000,
    allotmentMode: { name: 'Strategic Investor Allotment' },
    status: 'Allotted'
  },
  {
    id: 'lp-09',
    plotId: 'APCRDA-P-014',
    surveyNumber: '215/1',
    zone: { id: 'z-tech', name: 'Zone B - Tech & FinTech Hub (Sakhamuru)' },
    landUse: { id: 'lu-inc', name: 'Startup Incubation & Accelerator Core' },
    extentAcres: 10.0,
    fsiFar: '3.00',
    reservePrice: 40000000,
    allotmentMode: { name: 'E-Auction' },
    status: 'Published'
  },
  {
    id: 'lp-10',
    plotId: 'APCRDA-P-021',
    surveyNumber: '315/1',
    zone: { id: 'z-edu', name: 'Zone C - Knowledge & Health City (Inavolu)' },
    landUse: { id: 'lu-univ', name: 'Premier Multi-Disciplinary University' },
    extentAcres: 45.0,
    fsiFar: '2.00',
    reservePrice: 135000000,
    allotmentMode: { name: 'Institutional Allocation' },
    status: 'Allotted'
  },
  {
    id: 'lp-11',
    plotId: 'APCRDA-P-022',
    surveyNumber: '320/2',
    zone: { id: 'z-edu', name: 'Zone C - Knowledge & Health City (Kuragallu)' },
    landUse: { id: 'lu-med', name: 'Multi-Specialty Super Hospital & Clinic' },
    extentAcres: 20.0,
    fsiFar: '2.50',
    reservePrice: 65000000,
    allotmentMode: { name: 'E-Auction' },
    status: 'Published'
  },
  {
    id: 'lp-12',
    plotId: 'APCRDA-P-023',
    surveyNumber: '328/4',
    zone: { id: 'z-edu', name: 'Zone C - Knowledge & Health City (Inavolu)' },
    landUse: { id: 'lu-bio', name: 'Biomedical & Life Sciences Park' },
    extentAcres: 15.0,
    fsiFar: '2.00',
    reservePrice: 50000000,
    allotmentMode: { name: 'E-Auction' },
    status: 'Published'
  },
  {
    id: 'lp-13',
    plotId: 'APCRDA-P-031',
    surveyNumber: '401/1',
    zone: { id: 'z-river', name: 'Zone D - Krishna Riverfront (Venkatapalem)' },
    landUse: { id: 'lu-prom', name: 'Riverfront Promenade & Commercial Mall' },
    extentAcres: 22.0,
    fsiFar: '3.50',
    reservePrice: 110000000,
    allotmentMode: { name: 'Global Commercial Auction' },
    status: 'Published'
  },
  {
    id: 'lp-14',
    plotId: 'APCRDA-P-032',
    surveyNumber: '408/3',
    zone: { id: 'z-river', name: 'Zone D - Krishna Riverfront (Undavalli)' },
    landUse: { id: 'lu-res', name: 'Luxury Riverfront Residential Community' },
    extentAcres: 18.0,
    fsiFar: '4.00',
    reservePrice: 90000000,
    allotmentMode: { name: 'PPP Auction' },
    status: 'Allotted'
  },
  {
    id: 'lp-15',
    plotId: 'APCRDA-P-033',
    surveyNumber: '415/2',
    zone: { id: 'z-river', name: 'Zone D - Krishna Riverfront (Venkatapalem)' },
    landUse: { id: 'lu-hosp', name: '5-Star Resort & International Convention' },
    extentAcres: 14.0,
    fsiFar: '3.00',
    reservePrice: 70000000,
    allotmentMode: { name: 'E-Auction' },
    status: 'Published'
  },
  {
    id: 'lp-16',
    plotId: 'APCRDA-P-041',
    surveyNumber: '501/2',
    zone: { id: 'z-log', name: 'Zone E - Logistics & Industrial (Ananthavaram)' },
    landUse: { id: 'lu-cold', name: 'Multi-Modal Logistics & Cold Chain' },
    extentAcres: 50.0,
    fsiFar: '1.50',
    reservePrice: 150000000,
    allotmentMode: { name: 'Industrial Infrastructure Tender' },
    status: 'Published'
  },
  {
    id: 'lp-17',
    plotId: 'APCRDA-P-042',
    surveyNumber: '509/1',
    zone: { id: 'z-log', name: 'Zone E - Logistics & Industrial (Ananthavaram)' },
    landUse: { id: 'lu-mfg', name: 'Clean Tech Electronics Manufacturing' },
    extentAcres: 35.0,
    fsiFar: '1.20',
    reservePrice: 98000000,
    allotmentMode: { name: 'Industrial Allotment' },
    status: 'Allotted'
  },
  {
    id: 'lp-18',
    plotId: 'APCRDA-P-043',
    surveyNumber: '516/3',
    zone: { id: 'z-log', name: 'Zone E - Logistics & Industrial (Nowluru)' },
    landUse: { id: 'lu-freight', name: 'Freight Container Terminal & Warehousing' },
    extentAcres: 28.0,
    fsiFar: '1.50',
    reservePrice: 84000000,
    allotmentMode: { name: 'EOI' },
    status: 'Under Application'
  },
  {
    id: 'lp-19',
    plotId: 'APCRDA-P-051',
    surveyNumber: '601/1',
    zone: { id: 'z-green', name: 'Zone F - Green Belt & Eco Reserve (Thullur)' },
    landUse: { id: 'lu-eco', name: 'Botanical Garden & Eco-Tourism Buffer' },
    extentAcres: 30.0,
    fsiFar: '0.50',
    reservePrice: 35000000,
    allotmentMode: { name: 'Conservation Scheme' },
    status: 'Reserved'
  },
  {
    id: 'lp-20',
    plotId: 'APCRDA-P-052',
    surveyNumber: '610/2',
    zone: { id: 'z-green', name: 'Zone F - Green Belt & Eco Reserve (Malkapuram)' },
    landUse: { id: 'lu-agro', name: 'Agro-Business & Floriculture Research' },
    extentAcres: 15.0,
    fsiFar: '1.00',
    reservePrice: 20000000,
    allotmentMode: { name: 'E-Auction' },
    status: 'Published'
  }
]

export function LandParcelsView() {
  const [activeTab, setActiveTab] = useState('lands')
  const [data, setData] = useState<any>({ parcels: DEFAULT_AMARAVATI_LANDS, total: DEFAULT_AMARAVATI_LANDS.length })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [zone, setZone] = useState('')
  const [landUse, setLandUse] = useState('')
  const [allotmentMode, setAllotmentMode] = useState('')
  const [fsiFar, setFsiFar] = useState('')
  const [search, setSearch] = useState('')
  const [selectedParcel, setSelectedParcel] = useState<any>(null)

  // In-map active focus landmark
  const [activeLandmark, setActiveLandmark] = useState<AmaravatiLandmark | null>(null)
  const [mapKey, setMapKey] = useState(0)

  const fetchParcels = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (zone) params.set('zone', zone)
      const res = await fetch(`/api/land-parcels?${params}`)
      const json = await res.json()
      if (json.success && json.data?.parcels?.length > 0) {
        setData(json.data)
      } else {
        setData({ parcels: DEFAULT_AMARAVATI_LANDS, total: DEFAULT_AMARAVATI_LANDS.length })
      }
    } catch {
      setData({ parcels: DEFAULT_AMARAVATI_LANDS, total: DEFAULT_AMARAVATI_LANDS.length })
    }
  }, [status, zone])

  useEffect(() => {
    fetchParcels()
  }, [fetchParcels])

  const parcelsList = data?.parcels || DEFAULT_AMARAVATI_LANDS

  const statusCounts =
    parcelsList.reduce((acc: any, p: any) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {}) || {}

  const statusStyles: Record<string, { color: string; border: string; bg: string }> = {
    Published: { color: 'text-emerald-700', border: 'border-emerald-100', bg: 'bg-emerald-50/50' },
    Allotted: { color: 'text-blue-700', border: 'border-blue-100', bg: 'bg-blue-50/50' },
    'Under Application': { color: 'text-amber-700', border: 'border-amber-100', bg: 'bg-amber-50/50' },
    Reserved: { color: 'text-violet-700', border: 'border-violet-100', bg: 'bg-violet-50/50' },
    'On Hold': { color: 'text-orange-700', border: 'border-orange-100', bg: 'bg-orange-50/50' },
    Withdrawn: { color: 'text-slate-600', border: 'border-slate-100', bg: 'bg-slate-50/50' },
  }

  const filteredLands = useMemo(() => {
    let list = parcelsList
    if (status) {
      list = list.filter((p: any) => p.status === status)
    }
    if (zone && zone !== 'All') {
      list = list.filter((p: any) => p.zone?.name?.toLowerCase().includes(zone.toLowerCase()) || p.zone?.id === zone)
    }
    if (landUse && landUse !== 'All') {
      list = list.filter((p: any) => p.landUse?.name?.toLowerCase().includes(landUse.toLowerCase()) || p.landUse?.id === landUse)
    }
    if (allotmentMode && allotmentMode !== 'All') {
      list = list.filter((p: any) => p.allotmentMode?.name?.toLowerCase().includes(allotmentMode.toLowerCase()) || p.allotmentMode?.id === allotmentMode)
    }
    if (fsiFar && fsiFar !== 'All') {
      list = list.filter((p: any) => p.fsiFar === fsiFar)
    }
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(
        (p: any) =>
          p.plotId?.toLowerCase().includes(s) ||
          p.surveyNumber?.toLowerCase().includes(s) ||
          p.zone?.name?.toLowerCase().includes(s) ||
          p.landUse?.name?.toLowerCase().includes(s)
      )
    }
    return list
  }, [parcelsList, status, zone, landUse, allotmentMode, fsiFar, search])

  const currentBbox = activeLandmark
    ? activeLandmark.bbox
    : '80.42%2C16.46%2C80.60%2C16.58'
  const currentMarker = activeLandmark
    ? `${activeLandmark.lat}%2C${activeLandmark.lng}`
    : '16.525%2C80.518'

  return (
    <div className="space-y-5 pb-12">
      {/* 2 Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Amaravati Capital City Land Management</h1>
            <p className="text-sm text-muted-foreground">
              Geographical GIS map of Amaravati City and comprehensive land inventory records
            </p>
          </div>
          <TabsList className="grid w-full sm:w-[380px] grid-cols-2 p-1 bg-muted/80 shrink-0">
            <TabsTrigger value="lands" className="text-xs font-semibold flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" /> Lands Details
            </TabsTrigger>
            <TabsTrigger value="gis" className="text-xs font-semibold flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" /> GIS Map
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: AMARAVATI MAP WITH IN-MAP DETAILS HUD */}
        {/* ============================================================== */}
        <TabsContent value="gis" className="space-y-4">
          {/* Main Map Card (Edge-to-Edge with In-Map HUD) */}
          <Card className="overflow-hidden border shadow-md flex flex-col bg-slate-950 p-0">
            {/* Map Viewport with In-Map Details & HUD Cards */}
            <div className="relative w-full h-[650px] bg-slate-900 overflow-hidden">
              {/* Underlying Actual OpenStreetMap of Amaravati */}
              <iframe
                key={`${mapKey}-${currentBbox}`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentBbox}&layer=mapnik&marker=${currentMarker}`}
                style={{
                  border: 0,
                  filter: 'contrast(1.08) brightness(0.98)',
                  width: '100%',
                  height: '100%'
                }}
                title="Amaravati City Map"
                className="w-full h-full"
              />

              {/* 1. TOP-LEFT: IN-MAP QUICK JUMP PILLS & RESET BUTTON */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 max-w-[80%] sm:max-w-none">
                <Button
                  size="sm"
                  variant={activeLandmark === null ? 'default' : 'outline'}
                  className={cn(
                    'h-7 text-[11px] font-semibold backdrop-blur-md shadow-lg',
                    activeLandmark === null
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
                  )}
                  onClick={() => setActiveLandmark(null)}
                >
                  Amaravati Full City
                </Button>

                {AMARAVATI_LANDMARKS.map((lm) => {
                  const isSelected = activeLandmark?.id === lm.id
                  return (
                    <Button
                      key={lm.id}
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      className={cn(
                        'h-7 text-[11px] font-medium backdrop-blur-md shadow-lg transition-all',
                        isSelected
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
                      )}
                      onClick={() => setActiveLandmark(lm)}
                    >
                      {lm.name}
                    </Button>
                  )
                })}

                {activeLandmark && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white backdrop-blur-md gap-1"
                    onClick={() => {
                      setActiveLandmark(null)
                      setMapKey(k => k + 1)
                    }}
                  >
                    <RotateCcw className="h-3 w-3" /> Reset View
                  </Button>
                )}
              </div>

              {/* 2. TOP-RIGHT: IN-MAP CAPITAL CITY DETAILS HUD CARD */}
              <div className="absolute top-3 right-3 z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-2xl text-white max-w-[250px] hidden md:block">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <h3 className="font-bold text-xs">Amaravati Capital Facts</h3>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">APCRDA</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Capital Area:</span>
                    <span className="font-bold text-white font-mono">217.23 sq km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Notified Villages:</span>
                    <span className="font-bold text-white font-mono">29 Villages</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Land Pooling (LPS):</span>
                    <span className="font-bold text-emerald-400 font-mono">34,000+ Acres</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Main River Link:</span>
                    <span className="font-bold text-white">Krishna River</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Key Arterial Road:</span>
                    <span className="font-bold text-white">Seed Access Road</span>
                  </div>
                </div>
              </div>

              {/* 3. BOTTOM-LEFT: IN-MAP ACTIVE LOCATION DETAILS CARD */}
              <div className="absolute bottom-3 left-3 z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-emerald-500/50 shadow-2xl text-white max-w-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {activeLandmark ? activeLandmark.category : 'Capital City Geography'}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-0.5">
                      {activeLandmark ? activeLandmark.name : 'Amaravati Capital Region (APCRDA)'}
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-slate-800 border-slate-700 text-slate-300 shrink-0">
                    {activeLandmark ? activeLandmark.village : '29 Villages'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {activeLandmark
                    ? activeLandmark.details
                    : 'The People’s Capital of Andhra Pradesh planned across 217.23 sq km along the southern bank of Krishna River with 9 thematic economic cities.'}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10.5px] text-slate-300">
                  <div>Datum: <strong className="text-white font-mono">WGS 84 (EPSG:4326)</strong></div>
                  <div>Elevation: <strong className="text-white font-mono">18m MSL</strong></div>
                </div>
              </div>

              {/* 4. BOTTOM-RIGHT: IN-MAP GEOPORTAL CADASTRE BADGE */}
            </div>
          </Card>

          {/* ============================================================== */}
          {/* LAND PARCEL DETAILS CARD CONTAINER WITH 3 ROWS SCROLLING */}
          {/* ============================================================== */}
          <Card className="border shadow-sm overflow-hidden bg-card mt-2">
            {/* Card Header & Status Filters */}
            <CardHeader className="p-3.5 pb-2.5 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2 text-foreground">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> Amaravati Land Parcel Records
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Verified land parcels across Amaravati Capital City &middot; 3 rows visible &middot; Scroll inside to view all
                </CardDescription>
              </div>

              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Published', 'Allotted', 'Under Application', 'Reserved'].map((st) => {
                  const isSelected = (status === '' && st === 'All') || status === st
                  return (
                    <Button
                      key={st}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs font-medium"
                      onClick={() => setStatus(st === 'All' ? '' : st)}
                    >
                      {st === 'All' ? 'All Parcels' : st === 'Published' ? '🟢 Available' : st === 'Allotted' ? '🔵 Allotted' : st === 'Under Application' ? '🟡 In Bidding' : '🟣 Reserved'}
                    </Button>
                  )
                })}
              </div>
            </CardHeader>

            {/* Card Content - 3 Rows Visible with Internal Scroll */}
            <CardContent className="px-3 py-0">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Card key={i} className="p-3 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-10 w-full" />
                    </Card>
                  ))}
                </div>
              ) : filteredLands.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-lg">
                  <p className="text-xs text-muted-foreground">No land parcels match the selected filters.</p>
                  <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={() => { setStatus(''); setZone(''); setSearch(''); }}>
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="max-h-[460px] overflow-y-auto pr-1.5 scrollbar-thin">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {filteredLands.map((p: any) => (
                      <Card
                        key={p.id}
                        className="border shadow-2xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between overflow-hidden group bg-card"
                      >
                        <div>
                          {/* Compact Card Header */}
                          <div className="p-2.5 pb-2 border-b bg-muted/20">
                            <div className="flex items-start justify-between gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-primary tracking-tight">
                                {p.plotId}
                              </span>
                              <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 font-semibold shrink-0', statusColor(p.status))}>
                                {p.status === 'Published' ? 'Available' : p.status}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-xs text-foreground leading-snug mt-1 truncate group-hover:text-primary transition-colors" title={p.landUse?.name}>
                              {p.landUse?.name || 'Mixed-Use Plot'}
                            </h4>

                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 truncate">
                              <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{p.zone?.name || 'Capital Core'}</span>
                              <span>&middot;</span>
                              <span className="font-mono shrink-0">Sy #{p.surveyNumber}</span>
                            </div>
                          </div>

                          {/* Compact Card Body */}
                          <div className="p-2.5 space-y-2">
                            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded bg-muted/40 text-[10px]">
                              <div>
                                <span className="text-[9px] text-muted-foreground block">Extent</span>
                                <span className="text-xs font-bold text-foreground font-mono">{p.extentAcres} ac</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-muted-foreground block">FSI</span>
                                <span className="text-xs font-bold text-foreground font-mono">{p.fsiFar || '3.0'}</span>
                              </div>
                              <div className="col-span-2 pt-1 border-t border-muted/60 flex items-center justify-between">
                                <span className="text-[9px] text-muted-foreground">Price</span>
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                  {formatINR(p.reservePrice)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Compact Card Footer Actions */}
                        <div className="p-2 border-t bg-muted/10 flex items-center justify-between gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-1.5 text-primary hover:bg-primary/10 gap-1 font-medium"
                            onClick={() => {
                              const lm = AMARAVATI_LANDMARKS.find(l => p.zone?.name?.toLowerCase().includes(l.village.toLowerCase()))
                              if (lm) setActiveLandmark(lm)
                              window.scrollTo({ top: 120, behavior: 'smooth' })
                            }}
                          >
                            <Navigation className="h-2.5 w-2.5" /> Focus
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-1.5 gap-1 hover:bg-primary hover:text-white transition-colors"
                            onClick={() => setSelectedParcel(p)}
                          >
                            <MapIcon className="h-2.5 w-2.5" /> Cadastre
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 2: LANDS DETAILS */}
        {/* ============================================================== */}
        <TabsContent value="lands" className="space-y-4">


          {/* Status KPI Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(statusStyles).map(([st, style]) => (
              <Card
                key={st}
                className={cn(
                  'border border-transparent cursor-pointer transition-all hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px]',
                  style.bg,
                  status === st && 'outline outline-1 outline-primary outline-offset-[-1px]'
                )}
                onClick={() => setStatus(status === st ? '' : st)}
              >
                <CardContent className="px-3 py-0 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">{st}</p>
                  <p className={cn('text-lg font-bold tabular-nums leading-tight mt-1 truncate', style.color)}>{statusCounts[st] || 0}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter Toolbar Card */}
          <Card className="p-1.5 border shadow-sm mb-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
              <div className="relative w-full sm:flex-1 mr-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search ID, survey, zone..."
                  className="pl-8 h-8 text-xs w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
                <Select value={status || 'All'} onValueChange={(v) => setStatus(v === 'All' ? '' : v)}>
                  <SelectTrigger className="w-[120px] h-8 text-xs" data-active={!!status && status !== 'All'}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">Status: All</SelectItem>
                    {['Draft', 'Under Review', 'Approved', 'Published', 'Reserved', 'Under Application', 'Allotted', 'On Hold', 'Withdrawn'].map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={zone || 'All'} onValueChange={(v) => setZone(v === 'All' ? '' : v)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!zone && zone !== 'All'}>
                    <SelectValue placeholder="Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">Zone: All</SelectItem>
                    {(data?.zones?.length ? data.zones.map((z: any) => z.name) : Array.from(new Set(parcelsList.map((p: any) => p.zone?.name).filter(Boolean)))).map((s: any) => (
                      <SelectItem
                        key={s}
                        value={data?.zones?.find((z: any) => z.name === s)?.id || s}
                        className="text-xs"
                      >
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={landUse || 'All'} onValueChange={(v) => setLandUse(v === 'All' ? '' : v)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!landUse && landUse !== 'All'}>
                    <SelectValue placeholder="Land Use" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">Land Use: All</SelectItem>
                    {Array.from(new Set(parcelsList.map((p: any) => p.landUse?.name).filter(Boolean))).map((s: any) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={allotmentMode || 'All'} onValueChange={(v) => setAllotmentMode(v === 'All' ? '' : v)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-active={!!allotmentMode && allotmentMode !== 'All'}>
                    <SelectValue placeholder="Allotment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">Allotment: All</SelectItem>
                    {Array.from(new Set(parcelsList.map((p: any) => p.allotmentMode?.name).filter(Boolean))).map((s: any) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={fsiFar || 'All'} onValueChange={(v) => setFsiFar(v === 'All' ? '' : v)}>
                  <SelectTrigger className="w-[100px] h-8 text-xs" data-active={!!fsiFar && fsiFar !== 'All'}>
                    <SelectValue placeholder="FSI / FAR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">FSI: All</SelectItem>
                    {Array.from(new Set(parcelsList.map((p: any) => p.fsiFar).filter(Boolean))).sort().map((s: any) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(status || zone || landUse || allotmentMode || fsiFar || search) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-muted-foreground"
                    onClick={() => {
                      setStatus('')
                      setZone('')
                      setLandUse('')
                      setAllotmentMode('')
                      setFsiFar('')
                      setSearch('')
                    }}
                  >
                    <X className="h-3.5 w-3.5" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Land Parcels Table Card */}
          <Card className="border shadow-sm overflow-hidden">
            <CardContent className="px-3 py-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : filteredLands.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm text-muted-foreground">No land parcels match the specified criteria.</p>
                  <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => { setStatus(''); setZone(''); setSearch(''); }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="max-h-[560px] overflow-y-auto overflow-x-auto relative scrollbar-thin">
                  <Table>
                    <TableHeader className="bg-muted/95 backdrop-blur-sm sticky top-0 z-10 border-b shadow-xs">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-xs">Plot ID</TableHead>
                        <TableHead className="font-bold text-xs">Survey Number</TableHead>
                        <TableHead className="font-bold text-xs">Zone & Village</TableHead>
                        <TableHead className="font-bold text-xs">Land Classification</TableHead>
                        <TableHead className="text-right font-bold text-xs">Extent</TableHead>
                        <TableHead className="font-bold text-xs text-center">FSI / FAR</TableHead>
                        <TableHead className="text-right font-bold text-xs">Reserve Price</TableHead>
                        <TableHead className="font-bold text-xs">Allotment Mode</TableHead>
                        <TableHead className="font-bold text-xs">Status</TableHead>
                        <TableHead className="text-center font-bold text-xs">Cadastre Map</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLands.map((p: any, idx: number) => (
                        <TableRow
                          key={p.id}
                          className={cn('hover:bg-muted/50 transition-colors h-9', idx % 2 === 1 && 'bg-muted/15')}
                        >
                          <TableCell className="text-xs font-mono font-bold text-primary whitespace-nowrap py-2">
                            {p.plotId}
                          </TableCell>
                          <TableCell className="text-xs font-mono whitespace-nowrap py-2">
                            Sy. #{p.surveyNumber}
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate py-2" title={p.zone?.name}>
                            {p.zone?.name || 'Amaravati Capital Core'}
                          </TableCell>
                          <TableCell className="text-xs font-medium max-w-[220px] truncate py-2" title={p.landUse?.name}>
                            {p.landUse?.name || 'Commercial & Office'}
                          </TableCell>
                          <TableCell className="text-right text-xs font-mono font-bold whitespace-nowrap py-2">
                            {p.extentAcres} Acres
                          </TableCell>
                          <TableCell className="text-center text-xs font-mono tabular-nums whitespace-nowrap py-2">
                            {p.fsiFar || '3.00'}
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap py-2">
                            {formatINR(p.reservePrice)}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap py-2">
                            <span className="bg-muted px-2 py-0.5 rounded text-[11px] font-medium">
                              {p.allotmentMode?.name || 'E-Auction'}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap py-2">
                            <Badge variant="outline" className={cn('text-[10px] font-semibold', statusColor(p.status))}>
                              {p.status === 'Published' ? 'Available' : p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-primary hover:bg-primary/10 gap-1"
                              onClick={() => setSelectedParcel(p)}
                            >
                              <MapIcon className="h-3.5 w-3.5" /> View Map
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Parcel Detail Drawer */}
      {selectedParcel && (
        <Sheet open={!!selectedParcel} onOpenChange={(open) => !open && setSelectedParcel(null)}>
          <SheetContent side="right" className="w-full sm:max-w-[60vw] p-0 flex flex-col gap-0 border-l">
            <SheetHeader className="p-4 border-b bg-background text-left flex flex-row items-start justify-between space-y-0">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <MapIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Plot Cadastral Map: {selectedParcel.plotId}
                </SheetTitle>
                <SheetDescription>
                  Location: Amaravati, Andhra Pradesh ({selectedParcel.zone?.name}) &middot; Coordinates: 16.5167&deg; N, 80.5167&deg; E
                </SheetDescription>
              </div>
            </SheetHeader>
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
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
                  title="Amaravati Plot Map"
                />
              </div>
              <div className="w-80 border-l bg-background p-6 space-y-4 overflow-y-auto shrink-0">
                <h4 className="text-lg font-semibold mb-4 border-b pb-2">Parcel Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <div className="text-muted-foreground">Survey #</div>
                  <div className="font-medium text-right">{selectedParcel.surveyNumber}</div>
                  <div className="text-muted-foreground">Extent</div>
                  <div className="font-medium text-right">{selectedParcel.extentAcres} ac</div>
                  <div className="text-muted-foreground">Land Use</div>
                  <div className="font-medium text-right">{selectedParcel.landUse?.name}</div>
                  <div className="text-muted-foreground">Reserve Price</div>
                  <div className="font-medium text-right">{formatINR(selectedParcel.reservePrice)}</div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn('text-xs', statusColor(selectedParcel.status))}>
                      {selectedParcel.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
