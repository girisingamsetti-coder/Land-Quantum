'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Search, Plus, Download, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp,
  Briefcase, Handshake, CheckCircle2, Clock, Target,
  FileSignature, BadgeCheck, Ban, Building2, Users,
  X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppLayout } from '@/components/layout/app-layout'
import {
  DashboardApplicationsTable, MOCK_APP_ROWS, DashBadge,
  DASH_SECTOR_OPTIONS, DASH_STAGE_OPTIONS, DASH_PRIORITY_OPTIONS
} from '@/components/dashboard/dashboard-view'

const DEAL_STATUS_OPTIONS = ['All Deal Statuses', 'Active', 'Pending', 'Cancelled']

const MOCK_DEALS_ROWS = [
  { id: 'APCRDA-2026-0001', applicant: 'Vajra Technologies Pvt Ltd', sector: 'IT/ITES', investment: '₹680 Cr', area: '19 ac', appliedOn: '29 Jul 2026', stage: 'Order & Offer', sla: '2 days', priority: 'High', status: 'Approved', dealStatus: 'Active', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2026-0002', applicant: 'Kaveri Media Networks', sector: 'Others', investment: '₹310 Cr', area: '15 ac', appliedOn: '10 Jul 2026', stage: 'Order & Offer', sla: '5 days', priority: 'Normal', status: 'Approved', dealStatus: 'Pending', lead: 'R. Venkatesh' },
  { id: 'APCRDA-2026-0003', applicant: 'Bharat Electronics Systems', sector: 'Industrial', investment: '₹1,450 Cr', area: '45 ac', appliedOn: '18 May 2026', stage: 'Order & Offer', sla: 'Overdue', priority: 'High', status: 'Approved', dealStatus: 'Active', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2025-0004', applicant: 'Deccan Logistics & Warehousing', sector: 'Logistics', investment: '₹120 Cr', area: '7 ac', appliedOn: '12 Apr 2026', stage: 'Order & Offer', sla: 'Overdue', priority: 'Normal', status: 'Approved', dealStatus: 'Active', lead: 'S. Rao' },
  { id: 'APCRDA-2026-0005', applicant: 'Global Skills Alliance', sector: 'Education', investment: '₹210 Cr', area: '5 ac', appliedOn: '24 Apr 2026', stage: 'Order & Offer', sla: '10 days', priority: 'Normal', status: 'Approved', dealStatus: 'Active', lead: 'R. Venkatesh' },
  { id: 'APCRDA-2026-0006', applicant: 'Nirmaan Health Partners', sector: 'Healthcare', investment: '₹540 Cr', area: '28 ac', appliedOn: '25 Feb 2026', stage: 'Order & Offer', sla: '17 days', priority: 'High', status: 'Approved', dealStatus: 'Pending', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2025-0007', applicant: 'Sunrise Sports Ventures', sector: 'Sports', investment: '₹390 Cr', area: '54 ac', appliedOn: '20 Jan 2026', stage: 'Order & Offer', sla: '26 days', priority: 'High', status: 'Approved', dealStatus: 'Active', lead: 'S. Rao' },
  { id: 'APCRDA-2025-0008', applicant: 'AP Judicial Infrastructure', sector: 'Government Organisations', investment: '₹160 Cr', area: '8 ac', appliedOn: '25 Dec 2025', stage: 'Order & Offer', sla: '17 days', priority: 'Normal', status: 'Approved', dealStatus: 'Cancelled', lead: 'R. Venkatesh' },
  { id: 'APCRDA-2025-0009', applicant: 'Sristi Financial Services', sector: 'Financial Institutions', investment: '₹890 Cr', area: '7 ac', appliedOn: '09 Dec 2025', stage: 'Order & Offer', sla: '17 days', priority: 'High', status: 'Approved', dealStatus: 'Active', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2025-0010', applicant: 'Krishna Hospitality Group', sector: 'Hospitality', investment: '₹720 Cr', area: '22 ac', appliedOn: '07 Nov 2025', stage: 'Order & Offer', sla: '26 days', priority: 'Normal', status: 'Approved', dealStatus: 'Active', lead: 'S. Rao' },
  { id: 'APCRDA-2025-0011', applicant: 'Pioneer Textiles', sector: 'Textiles', investment: '₹220 Cr', area: '12 ac', appliedOn: '15 Oct 2025', stage: 'Order & Offer', sla: '8 days', priority: 'Normal', status: 'Approved', dealStatus: 'Pending', lead: 'M. Srinivas' },
  { id: 'APCRDA-2025-0012', applicant: 'AgriCorp Processing Hub', sector: 'Food Processing', investment: '₹85 Cr', area: '4 ac', appliedOn: '02 Sep 2025', stage: 'Order & Offer', sla: '12 days', priority: 'Normal', status: 'Approved', dealStatus: 'Cancelled', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2025-0013', applicant: 'Vanguard Realty', sector: 'Commercial', investment: '₹950 Cr', area: '30 ac', appliedOn: '14 Aug 2025', stage: 'Order & Offer', sla: '30 days', priority: 'High', status: 'Approved', dealStatus: 'Active', lead: 'S. Rao' },
  { id: 'APCRDA-2025-0014', applicant: 'Nava Bharat IT Parks', sector: 'IT/ITES', investment: '₹1,200 Cr', area: '40 ac', appliedOn: '25 Jul 2025', stage: 'Order & Offer', sla: 'Overdue', priority: 'High', status: 'Approved', dealStatus: 'Pending', lead: 'R. Venkatesh' },
  { id: 'APCRDA-2025-0015', applicant: 'Apollo Healthcare', sector: 'Healthcare', investment: '₹350 Cr', area: '15 ac', appliedOn: '01 Jul 2025', stage: 'Order & Offer', sla: '10 days', priority: 'Normal', status: 'Approved', dealStatus: 'Active', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2025-0016', applicant: 'Godavari Logistics', sector: 'Logistics', investment: '₹140 Cr', area: '10 ac', appliedOn: '18 Jun 2025', stage: 'Order & Offer', sla: '5 days', priority: 'Normal', status: 'Approved', dealStatus: 'Active', lead: 'M. Srinivas' },
  { id: 'APCRDA-2025-0017', applicant: 'Coastal Sports City', sector: 'Sports', investment: '₹600 Cr', area: '60 ac', appliedOn: '05 May 2025', stage: 'Order & Offer', sla: '15 days', priority: 'High', status: 'Approved', dealStatus: 'Cancelled', lead: 'S. Rao' },
  { id: 'APCRDA-2025-0018', applicant: 'Grand Meridian Hotels', sector: 'Hospitality', investment: '₹560 Cr', area: '18 ac', appliedOn: '22 Apr 2025', stage: 'Order & Offer', sla: '2 days', priority: 'Normal', status: 'Approved', dealStatus: 'Active', lead: 'R. Venkatesh' },
  { id: 'APCRDA-2025-0019', applicant: 'Sri City Manufacturing', sector: 'Industrial', investment: '₹880 Cr', area: '25 ac', appliedOn: '10 Mar 2025', stage: 'Order & Offer', sla: 'Overdue', priority: 'High', status: 'Approved', dealStatus: 'Pending', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2025-0020', applicant: 'Deccan Educational Trust', sector: 'Education', investment: '₹180 Cr', area: '8 ac', appliedOn: '15 Feb 2025', stage: 'Order & Offer', sla: '20 days', priority: 'Normal', status: 'Approved', dealStatus: 'Active', lead: 'M. Srinivas' },
  { id: 'APCRDA-2025-0021', applicant: 'Global Finance Center', sector: 'Financial Institutions', investment: '₹1,500 Cr', area: '12 ac', appliedOn: '01 Jan 2025', stage: 'Order & Offer', sla: '40 days', priority: 'High', status: 'Approved', dealStatus: 'Active', lead: 'S. Rao' },
  { id: 'APCRDA-2024-0022', applicant: 'Swachh Andhra Mission', sector: 'Government Organisations', investment: '₹50 Cr', area: '2 ac', appliedOn: '10 Dec 2024', stage: 'Order & Offer', sla: '10 days', priority: 'Normal', status: 'Approved', dealStatus: 'Active', lead: 'R. Venkatesh' },
  { id: 'APCRDA-2024-0023', applicant: 'Visakha Pharma City', sector: 'Pharmaceutical', investment: '₹1,100 Cr', area: '35 ac', appliedOn: '25 Nov 2024', stage: 'Order & Offer', sla: '14 days', priority: 'High', status: 'Approved', dealStatus: 'Pending', lead: 'K. Padmavathi' },
  { id: 'APCRDA-2024-0024', applicant: 'Amaravati Food Park', sector: 'Food Processing', investment: '₹320 Cr', area: '20 ac', appliedOn: '05 Nov 2024', stage: 'Order & Offer', sla: '8 days', priority: 'Normal', status: 'Approved', dealStatus: 'Cancelled', lead: 'M. Srinivas' },
  { id: 'APCRDA-2024-0025', applicant: 'Aurobindo Textiles', sector: 'Textiles', investment: '₹450 Cr', area: '16 ac', appliedOn: '18 Oct 2024', stage: 'Order & Offer', sla: '22 days', priority: 'Normal', status: 'Approved', dealStatus: 'Active', lead: 'S. Rao' },
]

export function DealsApplicationsTable({ search, filterSector, filterStage, filterDealStatus, filterPriority, onNavigate }: { search: string, filterSector: string, filterStage: string, filterDealStatus: string, filterPriority: string, onNavigate: (id: string) => void }) {
  const [rows, setRows] = useState(MOCK_DEALS_ROWS)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 16

  useEffect(() => { setPage(1) }, [search, filterSector, filterStage, filterDealStatus, filterPriority])

  // Fetch real applications and prepend
  useEffect(() => {
    fetch('/api/applications?pageSize=50')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.applications?.length) {
          const mapped = data.data.applications
            .filter((a: any) => a.status === 'Approved')
            .map((a: any) => ({
              id: a.applicationNumber,
              applicant: a.applicant?.organizationName || 'Unknown',
              sector: a.sector || '—',
              investment: a.proposedInvestment ? `₹${(Number(a.proposedInvestment) / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` : '—',
              area: a.landParcel?.extentAcres ? `${a.landParcel.extentAcres} ac` : '—',
              appliedOn: new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              stage: a.currentStage || 'Application',
              sla: a.slaRemaining != null ? (a.slaRemaining < 0 ? 'Overdue' : `${a.slaRemaining} days`) : '—',
              priority: a.priority || 'Normal',
              status: a.status || 'Approved',
              lead: a.assignedOfficer?.name || '—',
              dealStatus: ['Active', 'Pending', 'Cancelled'][Math.floor(Math.random() * 3)],
            }))
          setRows(prev => {
            const existingIds = new Set(prev.map(r => r.id))
            const unique = mapped.filter((r: any) => !existingIds.has(r.id))
            return [...unique, ...prev]
          })
        }
      })
      .catch(() => { })
  }, [])

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => {
      const matchQ = !q || r.id.toLowerCase().includes(q) || r.applicant.toLowerCase().includes(q) ||
        r.sector.toLowerCase().includes(q) || r.stage.toLowerCase().includes(q) || r.lead.toLowerCase().includes(q) ||
        r.dealStatus.toLowerCase().includes(q) || r.priority.toLowerCase().includes(q)

      const matchSector = filterSector === 'All Sectors' || r.sector === filterSector
      const matchStage = filterStage === 'All Stages' || r.stage === filterStage
      const matchDealStatus = filterDealStatus === 'All Deal Statuses' || r.dealStatus === filterDealStatus
      const matchPriority = filterPriority === 'All Priorities' || r.priority === filterPriority

      return matchQ && matchSector && matchStage && matchDealStatus && matchPriority
    })
  }, [rows, search, filterSector, filterStage, filterDealStatus, filterPriority])

  const sorted = useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      const av = (a as any)[sortCol]; const bv = (b as any)[sortCol]
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }, [filtered, sortCol, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE) || 1
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const th = (label: string, key: string, cls = '') => (
    <th
      className={cn('px-3 py-2 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap', cls)}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortCol === key
          ? sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
          : <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />}
      </div>
    </th>
  )

  return (
    <Card className="shadow-sm flex-1 flex flex-col min-h-0">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full text-sm relative">
          <thead className="bg-muted border-b sticky top-0 z-10 shadow-sm">
            <tr>
              {th('Application ID', 'id', 'min-w-[160px]')}
              {th('Applicant', 'applicant', 'min-w-[180px]')}
              {th('Sector', 'sector', 'min-w-[130px]')}
              {th('Investment', 'investment', 'min-w-[100px]')}
              {th('Area', 'area', 'min-w-[70px]')}
              {th('Applied On', 'appliedOn', 'min-w-[110px]')}
              {th('Stage', 'stage', 'min-w-[130px]')}
              {th('SLA', 'sla', 'min-w-[90px]')}
              {th('Priority', 'priority', 'min-w-[80px]')}
              {th('Deal Status', 'dealStatus', 'min-w-[100px]')}
              {th('Lead Manager', 'lead', 'min-w-[130px]')}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-8 text-muted-foreground text-xs">No results found</td></tr>
            ) : paged.map(row => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onNavigate(row.id)}>
                <td className="px-3 py-2 text-xs text-primary font-semibold">{row.id}</td>
                <td className="px-3 py-2 max-w-[200px]"><span className="truncate block font-medium">{row.applicant}</span></td>
                <td className="px-3 py-2 text-muted-foreground">{row.sector}</td>
                <td className="px-3 py-2 font-semibold tabular-nums">{row.investment}</td>
                <td className="px-3 py-2 text-muted-foreground tabular-nums">{row.area}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{row.appliedOn}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.stage}</td>
                <td className="px-3 py-2"><DashBadge value={row.sla} variant="sla" /></td>
                <td className="px-3 py-2"><DashBadge value={row.priority} variant="priority" /></td>
                <td className="px-3 py-2"><DashBadge value={row.dealStatus} variant="status" /></td>
                <td className="px-3 py-2 text-muted-foreground">{row.lead}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-2 py-1.5 border-t flex items-center justify-between bg-muted/20">
        <div className="text-xs text-muted-foreground">
          Showing {paged.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} entries
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded hover:bg-muted disabled:opacity-30 border bg-background flex items-center gap-1 px-2 shadow-sm transition-colors"><ChevronLeft className="h-3 w-3" /> Prev</button>
          <span className="px-2 font-medium">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1 rounded hover:bg-muted disabled:opacity-30 border bg-background flex items-center gap-1 px-2 shadow-sm transition-colors">Next <ChevronRight className="h-3 w-3" /></button>
        </div>
      </div>
    </Card>
  )
}

// ─── Types ──────────────────────────────────────────────────────────────────

type DealStage = 'Prospect' | 'Negotiation' | 'MOU Signed' | 'Agreement' | 'Closed' | 'Lost'
type DealPriority = 'High' | 'Medium' | 'Low'

interface Deal {
  id: string
  dealName: string
  investor: string
  sector: string
  stage: DealStage
  priority: DealPriority
  investmentCr: number
  jobs: number
  acres: number
  assignedTo: string
  lastActivity: string
  expectedClose: string
  probability: number
  notes: string
  createdAt: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_DEALS: Deal[] = [
  { id: 'DL-2026-001', dealName: 'Apex Tech Park Phase 2', investor: 'Apex Technologies Ltd', sector: 'IT/ITES', stage: 'Negotiation', priority: 'High', investmentCr: 850, jobs: 4200, acres: 22, assignedTo: 'K. Padmavathi', lastActivity: '2 days ago', expectedClose: '30 Sep 2026', probability: 65, notes: 'Investor requesting 5% discount on land rate.', createdAt: '15 Jul 2026' },
  { id: 'DL-2026-002', dealName: 'Sunrise Pharma Hub', investor: 'Sunrise Pharmaceuticals', sector: 'Pharmaceutical', stage: 'MOU Signed', priority: 'High', investmentCr: 1200, jobs: 3100, acres: 35, assignedTo: 'R. Venkatesh', lastActivity: '1 day ago', expectedClose: '15 Oct 2026', probability: 80, notes: 'MOU signed. Final agreement in legal review.', createdAt: '01 Jul 2026' },
  { id: 'DL-2026-003', dealName: 'Coastal Logistics Centre', investor: 'BlueStar Logistics Pvt Ltd', sector: 'Logistics', stage: 'Prospect', priority: 'Medium', investmentCr: 320, jobs: 900, acres: 12, assignedTo: 'S. Rao', lastActivity: '5 days ago', expectedClose: '31 Dec 2026', probability: 30, notes: 'Initial site visit completed. Follow-up scheduled.', createdAt: '20 Jul 2026' },
  { id: 'DL-2026-004', dealName: 'GreenEnergy Solar Farm', investor: 'CleanVolt Energy Ltd', sector: 'Industrial', stage: 'Agreement', priority: 'High', investmentCr: 2100, jobs: 1800, acres: 90, assignedTo: 'K. Padmavathi', lastActivity: 'Today', expectedClose: '05 Sep 2026', probability: 92, notes: 'Agreement draft sent to investor counsel.', createdAt: '10 Jun 2026' },
  { id: 'DL-2026-005', dealName: 'Amaravati Hotel & Convention', investor: 'Grand Meridian Hotels', sector: 'Hospitality', stage: 'Closed', priority: 'High', investmentCr: 560, jobs: 1200, acres: 18, assignedTo: 'R. Venkatesh', lastActivity: '10 days ago', expectedClose: '20 Aug 2026', probability: 100, notes: 'Deal closed. Registration complete.', createdAt: '01 May 2026' },
  { id: 'DL-2026-006', dealName: 'AP Food Processing Zone', investor: 'Agri-Fresh Industries', sector: 'Food Processing', stage: 'Negotiation', priority: 'Medium', investmentCr: 190, jobs: 620, acres: 8, assignedTo: 'S. Rao', lastActivity: '3 days ago', expectedClose: '30 Nov 2026', probability: 55, notes: 'Negotiating power supply commitments.', createdAt: '05 Aug 2026' },
  { id: 'DL-2026-007', dealName: 'Knowledge City University', investor: 'Nalanda Education Trust', sector: 'Education', stage: 'Lost', priority: 'Low', investmentCr: 430, jobs: 850, acres: 32, assignedTo: 'K. Padmavathi', lastActivity: '20 days ago', expectedClose: '—', probability: 0, notes: 'Investor chose a different location.', createdAt: '15 Apr 2026' },
  { id: 'DL-2026-008', dealName: 'FinTech Innovation Hub', investor: 'PayBridge Financial Services', sector: 'Financial Institutions', stage: 'Prospect', priority: 'High', investmentCr: 670, jobs: 2800, acres: 10, assignedTo: 'R. Venkatesh', lastActivity: '1 day ago', expectedClose: '28 Feb 2027', probability: 25, notes: 'Initial deck shared. Awaiting board approval.', createdAt: '22 Aug 2026' },
  { id: 'DL-2026-009', dealName: 'Smart Healthcare Campus', investor: 'MedTech Solutions Pvt Ltd', sector: 'Healthcare', stage: 'MOU Signed', priority: 'High', investmentCr: 980, jobs: 3400, acres: 28, assignedTo: 'K. Padmavathi', lastActivity: 'Yesterday', expectedClose: '20 Nov 2026', probability: 78, notes: 'APCRDA board approved site allotment.', createdAt: '10 Jul 2026' },
  { id: 'DL-2026-010', dealName: 'Textiles Export Cluster', investor: 'Silk Road Fabrics Ltd', sector: 'Textiles', stage: 'Prospect', priority: 'Low', investmentCr: 140, jobs: 480, acres: 14, assignedTo: 'S. Rao', lastActivity: '7 days ago', expectedClose: '31 Mar 2027', probability: 20, notes: 'Sent project brief. Awaiting response.', createdAt: '18 Aug 2026' },
  { id: 'DL-2026-011', dealName: 'Sports Complex & Arena', investor: 'Sportz Infrastructure Ltd', sector: 'Sports', stage: 'Agreement', priority: 'Medium', investmentCr: 390, jobs: 720, acres: 54, assignedTo: 'R. Venkatesh', lastActivity: '4 days ago', expectedClose: '15 Sep 2026', probability: 88, notes: 'Minor clause amendments under review.', createdAt: '25 May 2026' },
  { id: 'DL-2026-012', dealName: 'Government Data Centre', investor: 'NIC / AP State Govt.', sector: 'Government Organisations', stage: 'Closed', priority: 'High', investmentCr: 310, jobs: 400, acres: 6, assignedTo: 'K. Padmavathi', lastActivity: '15 days ago', expectedClose: '01 Aug 2026', probability: 100, notes: 'Full payment received. Possession given.', createdAt: '10 Mar 2026' },
]

// ─── Stage Config ─────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<DealStage, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  'Prospect': { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Target },
  'Negotiation': { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Briefcase },
  'MOU Signed': { color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', icon: FileSignature },
  'Agreement': { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: Handshake },
  'Closed': { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: BadgeCheck },
  'Lost': { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: Ban },
}

const PRIORITY_CONFIG: Record<DealPriority, string> = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
}

const STAGES: DealStage[] = ['Prospect', 'Negotiation', 'MOU Signed', 'Agreement', 'Closed', 'Lost']

const SECTORS = [
  'Commercial', 'Education', 'Financial Institutions', 'Food Processing',
  'Government Organisations', 'Healthcare', 'Hospitality', 'IT/ITES',
  'Industrial', 'Logistics', 'NGOs', 'Others', 'Pharmaceutical',
  'Political Parties', 'Sports', 'Textiles',
]

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN').format(n)
}

function StageBadge({ stage }: { stage: DealStage }) {
  const cfg = STAGE_CONFIG[stage]
  const Icon = cfg.icon
  return (
    <Badge variant="outline" className={cn('text-[10px] font-semibold gap-1 py-0', cfg.color, cfg.bg, cfg.border)}>
      <Icon className="h-2.5 w-2.5" />{stage}
    </Badge>
  )
}

// ─── New Deal Dialog ─────────────────────────────────────────────────────────

function NewDealDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    dealName: '', investor: '', sector: '', stage: 'Prospect', priority: 'Medium',
    investmentCr: '', jobs: '', acres: '', assignedTo: '', expectedClose: '', notes: ''
  })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">New Deal</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Deal Name *</Label>
            <Input placeholder="e.g. Apex Tech Park Phase 2" value={form.dealName} onChange={e => set('dealName', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Investor / Company *</Label>
            <Input placeholder="Company name" value={form.investor} onChange={e => set('investor', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sector *</Label>
            <Select value={form.sector} onValueChange={v => set('sector', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select sector" /></SelectTrigger>
              <SelectContent>{SECTORS.map(s => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Stage</Label>
            <Select value={form.stage} onValueChange={v => set('stage', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Priority</Label>
            <Select value={form.priority} onValueChange={v => set('priority', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['High', 'Medium', 'Low'].map(p => <SelectItem key={p} value={p} className="text-sm">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Investment (₹ Cr)</Label>
            <Input type="number" placeholder="e.g. 500" value={form.investmentCr} onChange={e => set('investmentCr', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Expected Jobs</Label>
            <Input type="number" placeholder="e.g. 2000" value={form.jobs} onChange={e => set('jobs', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Land Required (Acres)</Label>
            <Input type="number" placeholder="e.g. 15" value={form.acres} onChange={e => set('acres', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Expected Close Date</Label>
            <Input type="date" value={form.expectedClose} onChange={e => set('expectedClose', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Assigned To</Label>
            <Input placeholder="Officer name" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Notes</Label>
            <Textarea placeholder="Any relevant notes about this deal..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className="text-sm resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="gap-1.5" onClick={onClose}>
            <Plus className="h-3.5 w-3.5" /> Create Deal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Pipeline Board ───────────────────────────────────────────────────────────

function PipelineBoard({ deals }: { deals: Deal[] }) {
  const grouped = useMemo(() => {
    const map = Object.fromEntries(STAGES.map(s => [s, [] as Deal[]])) as Record<DealStage, Deal[]>
    deals.forEach(d => map[d.stage].push(d))
    return map
  }, [deals])

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 min-h-[480px]">
      {STAGES.map(stage => {
        const cfg = STAGE_CONFIG[stage]
        const Icon = cfg.icon
        const items = grouped[stage]
        const totalCr = items.reduce((s, d) => s + d.investmentCr, 0)
        return (
          <div key={stage} className="flex-shrink-0 w-[220px]">
            <div className={cn('rounded-t-lg px-3 py-2 border border-b-0 flex items-center justify-between', cfg.bg, cfg.border)}>
              <div className="flex items-center gap-1.5">
                <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                <span className={cn('text-xs font-bold', cfg.color)}>{stage}</span>
              </div>
              <span className={cn('text-[10px] font-bold rounded-full px-1.5 py-0.5 border', cfg.bg, cfg.border, cfg.color)}>
                {items.length}
              </span>
            </div>
            <div className={cn('rounded-b-lg border px-2 py-2 space-y-2 min-h-[420px] bg-muted/20', cfg.border)}>
              {items.length > 0 && (
                <div className="text-[10px] text-muted-foreground px-1 pb-1 border-b border-dashed">
                  ₹{fmt(totalCr)} Cr total
                </div>
              )}
              {items.map(deal => (
                <div key={deal.id} className="bg-background rounded-lg border p-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <p className="text-[11px] font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{deal.dealName}</p>
                    <Badge variant="outline" className={cn('text-[9px] py-0 shrink-0 ml-1', PRIORITY_CONFIG[deal.priority])}>{deal.priority}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-2">
                    <Building2 className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{deal.investor}</span>
                  </p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold">₹{fmt(deal.investmentCr)} Cr</span>
                    <span className="text-muted-foreground">{deal.probability}%</span>
                  </div>
                  {deal.probability > 0 && (
                    <div className="mt-1.5 h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${deal.probability}%` }} />
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" />{deal.assignedTo.split(' ')[0]}</span>
                    <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{deal.lastActivity}</span>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="flex items-center justify-center h-32 text-[11px] text-muted-foreground">No deals</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Deals Table ─────────────────────────────────────────────────────────────

type SortKey = keyof Deal | null
type SortDir = 'asc' | 'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
  return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
}

function DealsTable({ deals }: { deals: Deal[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('investmentCr')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return deals
    return [...deals].sort((a, b) => {
      const av = a[sortKey as keyof Deal]; const bv = b[sortKey as keyof Deal]
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [deals, sortKey, sortDir])

  const th = (label: string, key: SortKey, cls = '') => (
    <th
      className={cn('px-3 py-2 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors whitespace-nowrap select-none', cls)}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">{label}<SortIcon col={key} sortKey={sortKey} sortDir={sortDir} /></div>
    </th>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead className="bg-muted/40 border-b">
          <tr>
            {th('Deal ID', 'id', 'min-w-[120px]')}
            {th('Deal Name', 'dealName', 'min-w-[200px]')}
            {th('Investor', 'investor', 'min-w-[180px]')}
            {th('Sector', 'sector', 'min-w-[130px]')}
            {th('Stage', 'stage', 'min-w-[120px]')}
            {th('Priority', 'priority', 'min-w-[80px]')}
            {th('Investment', 'investmentCr', 'min-w-[110px] text-right')}
            {th('Jobs', 'jobs', 'min-w-[65px] text-right')}
            {th('Acres', 'acres', 'min-w-[65px] text-right')}
            {th('Probability', 'probability', 'min-w-[100px] text-right')}
            {th('Expected Close', 'expectedClose', 'min-w-[120px]')}
            {th('Assigned To', 'assignedTo', 'min-w-[120px]')}
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map(deal => (
            <tr key={deal.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
              <td className="px-3 py-2 text-[10px] text-primary font-semibold">{deal.id}</td>
              <td className="px-3 py-2 font-medium max-w-[220px]"><span className="truncate block">{deal.dealName}</span></td>
              <td className="px-3 py-2 text-muted-foreground max-w-[200px]"><span className="truncate block">{deal.investor}</span></td>
              <td className="px-3 py-2 text-muted-foreground">{deal.sector}</td>
              <td className="px-3 py-2"><StageBadge stage={deal.stage} /></td>
              <td className="px-3 py-2">
                <Badge variant="outline" className={cn('text-[9px] py-0', PRIORITY_CONFIG[deal.priority])}>{deal.priority}</Badge>
              </td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums">₹{fmt(deal.investmentCr)} Cr</td>
              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmt(deal.jobs)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{deal.acres}</td>
              <td className="px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-14 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${deal.probability}%` }} />
                  </div>
                  <span className="tabular-nums text-muted-foreground w-7 text-right">{deal.probability}%</span>
                </div>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{deal.expectedClose}</td>
              <td className="px-3 py-2 text-muted-foreground">{deal.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main DealsView ───────────────────────────────────────────────────────────

export function DealsView() {
  const { navigateTo } = useAppLayout()
  const [search, setSearch] = useState('')
  const [filterSector, setFilterSector] = useState('All Sectors')
  const [filterStage, setFilterStage] = useState('All Stages')
  const [filterDealStatus, setFilterDealStatus] = useState('All Deal Statuses')
  const [filterPriority, setFilterPriority] = useState('All Priorities')
  const [newDealOpen, setNewDealOpen] = useState(false)

  const resetFilters = () => {
    setSearch('')
    setFilterSector('All Sectors')
    setFilterStage('All Stages')
    setFilterDealStatus('All Deal Statuses')
    setFilterPriority('All Priorities')
  }

  const totalDeals = MOCK_DEALS.length
  const totalPipeline = MOCK_DEALS.filter(d => d.stage !== 'Closed' && d.stage !== 'Lost').reduce((s, d) => s + d.investmentCr, 0)
  const closedValue = MOCK_DEALS.filter(d => d.stage === 'Closed').reduce((s, d) => s + d.investmentCr, 0)
  const closedCount = MOCK_DEALS.filter(d => d.stage === 'Closed').length
  const activeCount = MOCK_DEALS.filter(d => d.stage !== 'Lost').length
  const weightedValue = MOCK_DEALS.filter(d => d.stage !== 'Lost').reduce((s, d) => s + d.investmentCr * d.probability / 100, 0)

  return (
    <div className="flex flex-col gap-2 p-4 h-[calc(100vh-4rem)] lg:h-[calc(100vh-3.5rem)] min-h-0">
      <div className="flex flex-col gap-0 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight leading-none mb-1">Deals</h1>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground hidden lg:block">
            Track deals pipeline and performance.
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2 flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 h-8 w-[160px] md:w-[180px] rounded-md border bg-background text-xs outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
              />
            </div>
            <Select value={filterSector} onValueChange={(v) => setFilterSector(v)}><SelectTrigger className="w-[125px] h-8 text-xs bg-white" data-active={filterSector !== 'All Sectors'}><SelectValue placeholder="Sector" /></SelectTrigger><SelectContent>{DASH_SECTOR_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
            <Select value={filterStage} onValueChange={(v) => setFilterStage(v)}><SelectTrigger className="w-[115px] h-8 text-xs bg-white" data-active={filterStage !== 'All Stages'}><SelectValue placeholder="Stage" /></SelectTrigger><SelectContent>{DASH_STAGE_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
            <Select value={filterDealStatus} onValueChange={(v) => setFilterDealStatus(v)}><SelectTrigger className="w-[125px] h-8 text-xs bg-white" data-active={filterDealStatus !== 'All Deal Statuses'}><SelectValue placeholder="Deal Status" /></SelectTrigger><SelectContent>{DEAL_STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
            <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v)}><SelectTrigger className="w-[115px] h-8 text-xs bg-white" data-active={filterPriority !== 'All Priorities'}><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent>{DASH_PRIORITY_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select>
            {(search || filterSector !== 'All Sectors' || filterStage !== 'All Stages' || filterDealStatus !== 'All Deal Statuses' || filterPriority !== 'All Priorities') && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={resetFilters}><X className="h-3.5 w-3.5" /> Clear</Button>
            )}
            <Button size="sm" className="gap-1.5 shrink-0 h-8 text-xs ml-2" onClick={() => setNewDealOpen(true)}><Plus className="h-4 w-4" /> New Deal</Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Total Deals', value: totalDeals, sub: `${activeCount} active`, icon: Briefcase, color: 'bg-indigo-500', bgClass: 'bg-gradient-to-r from-indigo-50 to-white/50' },
          { label: 'Pipeline Value', value: `₹${fmt(totalPipeline)} Cr`, sub: 'Excl. closed & lost', icon: TrendingUp, color: 'bg-violet-500', bgClass: 'bg-gradient-to-r from-violet-50 to-white/50' },
          { label: 'Weighted Forecast', value: `₹${fmt(Math.round(weightedValue))} Cr`, sub: 'Probability-adjusted', icon: Target, color: 'bg-blue-500', bgClass: 'bg-gradient-to-r from-blue-50 to-white/50' },
          { label: 'Deals Closed', value: closedCount, sub: `₹${fmt(closedValue)} Cr won`, icon: CheckCircle2, color: 'bg-emerald-500', bgClass: 'bg-gradient-to-r from-emerald-50 to-white/50' },
        ].map(s => (
          <Card key={s.label} className={cn("py-2.5 border border-transparent hover:border-slate-300 shadow-sm hover:shadow-md transition-all cursor-pointer", s.bgClass)}>
            <CardContent className="px-3 py-0">
              <div className="flex items-center gap-3">
                <div className={cn('rounded-lg p-2 shrink-0', s.color)}>
                  <s.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">{s.label}</p>
                  <p className="text-lg font-bold tabular-nums leading-tight mt-1">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deals Table */}
      <DealsApplicationsTable 
        search={search}
        filterSector={filterSector}
        filterStage={filterStage}
        filterDealStatus={filterDealStatus}
        filterPriority={filterPriority}
        onNavigate={(id: string) => navigateTo(id as any)} 
      />

      <NewDealDialog open={newDealOpen} onClose={() => setNewDealOpen(false)} />
    </div>
  )
}
