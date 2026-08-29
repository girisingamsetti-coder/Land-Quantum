'use client'
import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from "sonner"
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Eye,
  X,
  Download,
  Search,
  FileCheck,
  Building2,
  Calendar,
  User,
  HardDrive,
  ShieldCheck,
  FolderOpen,
  Plus,
  Sparkles,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentItem {
  id: string
  name: string
  category: 'Allotment' | 'Technical' | 'Clearance' | 'Financial' | 'Legal' | 'Compliance'
  type: 'PDF' | 'DWG' | 'DOCX' | 'XLSX' | 'JPG'
  fileSize: string
  status: 'Verified' | 'Pending Review' | 'Rejected' | 'Under Inspection'
  uploadedBy: string
  applicant: string
  projectNumber: string
  date: string
  remarks?: string
  version: string
}

// Realistic Government / APCRDA Mock Data
const MOCK_DOCS: DocumentItem[] = [
  {
    id: 'DOC-2024-001',
    name: 'Final Land Allotment Order & Letter of Intent (LOI)',
    category: 'Allotment',
    type: 'PDF',
    fileSize: '3.4 MB',
    status: 'Verified',
    uploadedBy: 'APCRDA Allotment Cell',
    applicant: 'Amaravati Smart Tech Park Ltd',
    projectNumber: 'APCRDA-2024-0001',
    date: '2024-01-15',
    remarks: 'Approved by Competent Authority with full signature seal.',
    version: 'v1.2'
  },
  {
    id: 'DOC-2024-002',
    name: 'Topographical Survey & Site Contour Blueprint',
    category: 'Technical',
    type: 'DWG',
    fileSize: '14.8 MB',
    status: 'Verified',
    uploadedBy: 'L&T Infrastructure Design',
    applicant: 'L&T High-Tech Campus',
    projectNumber: 'APCRDA-2024-0002',
    date: '2024-01-22',
    remarks: 'Geodetic survey mapped to AP State Coordinate Reference Frame.',
    version: 'v2.0'
  },
  {
    id: 'DOC-2024-003',
    name: 'State Level Environmental Impact Assessment (SEIAA) NOC',
    category: 'Clearance',
    type: 'PDF',
    fileSize: '5.2 MB',
    status: 'Verified',
    uploadedBy: 'AP State Pollution Control Board',
    applicant: 'AP Green Hydrogen Facility',
    projectNumber: 'APCRDA-2024-0003',
    date: '2024-02-04',
    remarks: 'Valid for 7 years subject to quarterly green belt compliance audit.',
    version: 'v1.0'
  },
  {
    id: 'DOC-2024-004',
    name: 'Registered 99-Year Development Lease Deed',
    category: 'Legal',
    type: 'PDF',
    fileSize: '8.1 MB',
    status: 'Verified',
    uploadedBy: 'District Registrar Office',
    applicant: 'Krishna Riverfront Logistics Hub',
    projectNumber: 'APCRDA-2024-0004',
    date: '2024-02-12',
    remarks: 'Stamp duty and registration fees reconciled with Treasury.',
    version: 'v1.0'
  },
  {
    id: 'DOC-2024-005',
    name: 'Structural Stability & Seismic Design Certificate',
    category: 'Technical',
    type: 'PDF',
    fileSize: '4.6 MB',
    status: 'Pending Review',
    uploadedBy: 'Mega Urban Developers',
    applicant: 'Amaravati High-Rise Commercial Zone',
    projectNumber: 'APCRDA-2024-0005',
    date: '2024-02-18',
    remarks: 'Awaiting peer review confirmation from IIT Madras Civil Dept.',
    version: 'v1.1'
  },
  {
    id: 'DOC-2024-006',
    name: 'Fire & Emergency Services Clearance Certificate (NOC)',
    category: 'Clearance',
    type: 'PDF',
    fileSize: '2.9 MB',
    status: 'Verified',
    uploadedBy: 'AP Disaster Response & Fire Dept',
    applicant: 'Sri City Amaravati Gateway',
    projectNumber: 'APCRDA-2024-0006',
    date: '2024-02-28',
    remarks: 'Hydrant layout and dual-stairwell compliance confirmed.',
    version: 'v1.0'
  },
  {
    id: 'DOC-2024-007',
    name: 'Upfront Land Value Installment Payment Receipt (Challan)',
    category: 'Financial',
    type: 'PDF',
    fileSize: '1.2 MB',
    status: 'Verified',
    uploadedBy: 'Finance & Accounts Cell',
    applicant: 'Amaravati MedCity Healthcare',
    projectNumber: 'APCRDA-2024-0007',
    date: '2024-03-02',
    remarks: 'Payment of ₹14.50 Cr verified against CFMS Treasury Portal.',
    version: 'v1.0'
  },
  {
    id: 'DOC-2024-008',
    name: 'Soil Bearing Capacity & Geotechnical Investigation Report',
    category: 'Technical',
    type: 'PDF',
    fileSize: '6.7 MB',
    status: 'Under Inspection',
    uploadedBy: 'GeoTech India Consultants',
    applicant: 'Penta Silicon Valley Hub',
    projectNumber: 'APCRDA-2024-0008',
    date: '2024-03-08',
    remarks: 'Field core sampling ongoing at Zone B sector plots.',
    version: 'v0.9'
  },
  {
    id: 'DOC-2024-009',
    name: 'Airport Authority of India (AAI) Height Clearance NOC',
    category: 'Clearance',
    type: 'PDF',
    fileSize: '2.1 MB',
    status: 'Verified',
    uploadedBy: 'Civil Aviation Cell',
    applicant: 'Amaravati Sky Tower Project',
    projectNumber: 'APCRDA-2024-0009',
    date: '2024-03-14',
    remarks: 'Permissible building elevation: Max 120m AMSL.',
    version: 'v1.0'
  },
  {
    id: 'DOC-2024-010',
    name: 'Bank Guarantee for Minimum Capital Investment',
    category: 'Financial',
    type: 'PDF',
    fileSize: '2.5 MB',
    status: 'Rejected',
    uploadedBy: 'Zenith BioPharm Corp',
    applicant: 'Zenith Biotech Park',
    projectNumber: 'APCRDA-2024-0010',
    date: '2024-03-20',
    remarks: 'BG expiry date does not meet mandatory 36-month operational lock-in period.',
    version: 'v1.0'
  },
  {
    id: 'DOC-2024-011',
    name: 'Building Permission & Floor Space Index (FSI) Sanction',
    category: 'Technical',
    type: 'PDF',
    fileSize: '9.3 MB',
    status: 'Verified',
    uploadedBy: 'APCRDA Planning Directorate',
    applicant: 'Apex Logistics Parks India',
    projectNumber: 'APCRDA-2024-0011',
    date: '2024-03-27',
    remarks: 'FAR sanctioned: 2.25 with designated podium parking.',
    version: 'v2.1'
  },
  {
    id: 'DOC-2024-012',
    name: 'Quarterly Project Milestone & Physical Progress Audit',
    category: 'Compliance',
    type: 'DOCX',
    fileSize: '3.8 MB',
    status: 'Pending Review',
    uploadedBy: 'Third-Party Quality Assessor',
    applicant: 'Amaravati Smart Tech Park Ltd',
    projectNumber: 'APCRDA-2024-0001',
    date: '2024-04-05',
    remarks: 'Q1 milestone foundation construction verified at 78% completion.',
    version: 'v1.0'
  },
  {
    id: 'DOC-2024-013',
    name: 'Traffic Impact Study & Ingress/Egress Plan',
    category: 'Technical',
    type: 'PDF',
    fileSize: '11.4 MB',
    status: 'Verified',
    uploadedBy: 'Urban Mobility Consultants',
    applicant: 'Grand Amaravati Mall & Multiplex',
    projectNumber: 'APCRDA-2024-0012',
    date: '2024-04-12',
    remarks: 'Includes dedicated bus bay and multi-level basement routing.',
    version: 'v1.3'
  },
  {
    id: 'DOC-2024-014',
    name: 'Solid Waste Management & Effluent Treatment (ETP) Plan',
    category: 'Compliance',
    type: 'PDF',
    fileSize: '4.9 MB',
    status: 'Pending Review',
    uploadedBy: 'EcoTech Environmental Sol.',
    applicant: 'Amaravati MedCity Healthcare',
    projectNumber: 'APCRDA-2024-0007',
    date: '2024-04-18',
    remarks: 'Zero Liquid Discharge (ZLD) plant specifications under engineering audit.',
    version: 'v1.0'
  },
  {
    id: 'DOC-2024-015',
    name: 'Land Handover Certificate & Demarcation Panchnama',
    category: 'Allotment',
    type: 'PDF',
    fileSize: '3.1 MB',
    status: 'Verified',
    uploadedBy: 'Tahsildar / Competent Authority (LPS)',
    applicant: 'Penta Silicon Valley Hub',
    projectNumber: 'APCRDA-2024-0008',
    date: '2024-04-22',
    remarks: 'Boundary stones fixed on field with DGPS coordinate verification.',
    version: 'v1.0'
  }
]

function statusColor(s: string) {
  if (['Verified'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (['Pending Review'].includes(s)) return 'bg-amber-100 text-amber-700 border-amber-200'
  if (['Under Inspection'].includes(s)) return 'bg-blue-100 text-blue-700 border-blue-200'
  if (['Rejected'].includes(s)) return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

function categoryBadge(category: string) {
  switch (category) {
    case 'Allotment': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    case 'Technical': return 'bg-sky-50 text-sky-700 border-sky-200'
    case 'Clearance': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Financial': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'Legal': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Compliance': return 'bg-rose-50 text-rose-700 border-rose-200'
    default: return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

const WIZARD_DOCS = [
  {
    title: 'LOI Letter',
    desc: 'Allotment terms, financial details, and acceptance annexure.',
    icon: FileText,
    ready: true,
  },
  {
    title: 'Payment Due Notice',
    desc: 'Outstanding payment reminder with bank details.',
    icon: Mail,
    ready: true,
  },
  {
    title: 'Agreement Cover Letter',
    desc: 'Draft agreement with payment and land details.',
    icon: FileText,
    ready: true,
  },
  {
    title: 'Approval Guidelines',
    desc: 'Required clearances and application procedures.',
    icon: CheckCircle2,
    ready: true,
  },
  {
    title: 'Construction Start Notice',
    desc: 'Construction timeline and commencement requirements.',
    icon: AlertCircle,
    ready: true,
  },
]

export function DocumentationView() {
  const [docs, setDocs] = useState<DocumentItem[]>(MOCK_DOCS)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null)
  const [previewDocTitle, setPreviewDocTitle] = useState<string | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedWizardApp, setSelectedWizardApp] = useState('')
  const [applications, setApplications] = useState<any[]>([])
  const [isLoadingApps, setIsLoadingApps] = useState(false)

  useEffect(() => {
    async function fetchApps() {
      if (!isWizardOpen) return;
      setIsLoadingApps(true)
      try {
        const res = await fetch('/api/applications?page=1&pageSize=50')
        const json = await res.json()
        setApplications(json.data?.applications || [])
      } catch (e) {
        console.error("Failed to load applications", e)
      } finally {
        setIsLoadingApps(false)
      }
    }
    fetchApps()
  }, [isWizardOpen])

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const matchesStatus = statusFilter && statusFilter !== 'All' ? d.status === statusFilter : true
      const matchesCategory = categoryFilter && categoryFilter !== 'All' ? d.category === categoryFilter : true
      const matchesSearch = searchQuery
        ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
        : true
      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [statusFilter, categoryFilter, searchQuery])

  const activeFilters = (statusFilter && statusFilter !== 'All' ? 1 : 0) +
    (categoryFilter && categoryFilter !== 'All' ? 1 : 0) +
    (searchQuery ? 1 : 0)

  const summary = useMemo(() => ({
    total: docs.length,
    verified: docs.filter(d => d.status === 'Verified').length,
    pending: docs.filter(d => d.status === 'Pending Review' || d.status === 'Under Inspection').length,
    rejected: docs.filter(d => d.status === 'Rejected').length,
  }), [docs])

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob(["Mock Document Content"], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${previewDocTitle || 'Document'}.pdf`;
    document.body.appendChild(element); 
    element.click();
    toast.info("Download Started", {
      description: "The document is being downloaded.",
    })
  }

  const handleConfirmAndIssue = () => {
    if (!previewDocTitle) return;
    
    let applicantName = 'Auto-Generated Entity'
    let projectNum = 'APCRDA-GEN-001'

    if (selectedWizardApp) {
      const app = applications.find((a: any) => a.id === selectedWizardApp)
      if (app) {
        applicantName = app.applicant?.organizationName || 'Unknown Applicant'
        projectNum = app.applicationNumber
      }
    }

    const newDoc: DocumentItem = {
      id: `DOC-2024-0${docs.length + 1}`,
      name: previewDocTitle,
      category: 'Legal',
      type: 'PDF',
      fileSize: '1.2 MB',
      status: 'Verified',
      uploadedBy: 'System Auto-Generation',
      applicant: applicantName,
      projectNumber: projectNum,
      date: new Date().toISOString().split('T')[0],
      version: 'v1.0'
    }
    setDocs([newDoc, ...docs])
    setPreviewDocTitle(null)
    toast.success("Document Issued Successfully", {
      description: `${previewDocTitle} has been added to the repository against the application.`,
    })
  }

  return (
    <div className="space-y-2 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentation & Regulatory Filings</h1>
          <p className="text-sm text-muted-foreground">
            Centralized digital repository of statutory clearances, land deeds, technical drawings, and compliance certificates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Sparkles className="h-4 w-4 mr-2" /> Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-[60.5vw] max-w-[95vw] sm:max-w-[60.5vw] h-[86.9vh] max-h-[86.9vh] overflow-y-auto rounded-xl gap-2">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-xl">Available Documents</DialogTitle>
                </div>
              </DialogHeader>
              
              <div className="flex flex-col gap-1.5 pb-2">
                <Select value={selectedWizardApp} onValueChange={setSelectedWizardApp}>
                  <SelectTrigger className="w-full bg-white shadow-sm">
                    <SelectValue placeholder="Select Applicant" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingApps ? (
                      <SelectItem value="loading" disabled>Loading applications...</SelectItem>
                    ) : applications.length > 0 ? (
                      applications.map(app => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.applicationNumber} - {app.applicant?.organizationName || 'Unknown'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No applications found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WIZARD_DOCS.map((doc, idx) => (
                  <Card key={idx} className={cn("overflow-hidden border shadow-sm", doc.ready ? "border-slate-200" : "border-slate-200 bg-slate-50/50")}>
                    <CardContent className="p-4 flex flex-col h-full justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-muted-foreground shrink-0">
                              <doc.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className={cn("font-medium text-sm", !doc.ready && "text-muted-foreground")}>{doc.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-snug">{doc.desc}</p>
                            </div>
                          </div>
                        </div>
                        
                        {!doc.ready && doc.missingMsg && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Missing: {doc.missingMsg}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          className={cn("w-full gap-2 h-9 text-xs transition-colors", doc.ready ? "bg-[#1a9b55] hover:bg-[#1a9b55]/90 text-white" : "bg-slate-300 text-white hover:bg-slate-300 cursor-not-allowed")} 
                          disabled={!doc.ready}
                          onClick={() => {
                            setIsWizardOpen(false)
                            setPreviewDocTitle(doc.title)
                          }}
                        >
                          <Eye className="h-4 w-4" /> Create & View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add New
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Documents',
            val: summary.total,
            sub: 'Across all active allotments',
            Icon: FileText,
            border: 'border-slate-200',
            bg: 'bg-gradient-to-r from-slate-50 to-white/50',
            iconBg: 'bg-slate-100',
            iconText: 'text-slate-700',
            valColor: 'text-slate-900',
            filterVal: 'All'
          },
          {
            label: 'Verified & Approved',
            val: summary.verified,
            sub: 'Legally cleared & validated',
            Icon: CheckCircle2,
            border: 'border-emerald-200',
            bg: 'bg-gradient-to-r from-emerald-50 to-white/50',
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-700',
            valColor: 'text-emerald-700',
            filterVal: 'Verified'
          },
          {
            label: 'Under Review / Audit',
            val: summary.pending,
            sub: 'Pending departmental clearance',
            Icon: Clock,
            border: 'border-amber-200',
            bg: 'bg-gradient-to-r from-amber-50 to-white/50',
            iconBg: 'bg-amber-100',
            iconText: 'text-amber-700',
            valColor: 'text-amber-700',
            filterVal: 'Pending Review'
          },
          {
            label: 'Rejected / Discrepancy',
            val: summary.rejected,
            sub: 'Notice issued for re-submission',
            Icon: AlertCircle,
            border: 'border-red-200',
            bg: 'bg-gradient-to-r from-red-50 to-white/50',
            iconBg: 'bg-red-100',
            iconText: 'text-red-700',
            valColor: 'text-red-700',
            filterVal: 'Rejected'
          },
        ].map((s) => (
          <Card
            key={s.label}
            className={cn(
              'border border-transparent cursor-pointer transition-all hover:shadow-md hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-[-1px]',
              s.bg,
              statusFilter === s.filterVal && 'outline outline-1 outline-primary outline-offset-[-1px]'
            )}
            onClick={() => setStatusFilter(statusFilter === s.filterVal ? '' : s.filterVal)}
          >
            <CardContent className="px-3 py-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">{s.label}</p>
                  <p className={cn('text-lg font-bold tabular-nums leading-tight mt-1 truncate', s.valColor)}>{s.val}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
                <div className={cn('rounded-lg p-2 shrink-0 shadow-xs', s.iconBg)}>
                  <s.Icon className={cn('h-3.5 w-3.5', s.iconText)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Toolbar Card */}
      <Card className="p-1.5 border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
          <div className="relative w-full sm:flex-1 mr-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search document title, applicant, ID..."
              className="pl-8 h-8 text-xs bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
            <Select value={categoryFilter || 'All'} onValueChange={(v) => setCategoryFilter(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-white" data-active={!!categoryFilter && categoryFilter !== 'All'}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {['All', 'Allotment', 'Technical', 'Clearance', 'Financial', 'Legal', 'Compliance'].map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat === 'All' ? 'Category' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter || 'All'} onValueChange={(v) => setStatusFilter(v === 'All' ? '' : v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-white" data-active={!!statusFilter && statusFilter !== 'All'}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {['All', 'Verified', 'Pending Review', 'Under Inspection', 'Rejected'].map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s === 'All' ? 'Status' : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-muted-foreground px-2"
                onClick={() => {
                  setStatusFilter('')
                  setCategoryFilter('')
                  setSearchQuery('')
                }}
              >
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="shadow-xs border overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Document Repository</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Showing {filtered.length} of {docs.length} verified statutory filings
              </CardDescription>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Sorted by Latest Submission
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[120px] text-xs font-semibold">Doc ID</TableHead>
                  <TableHead className="min-w-[280px] text-xs font-semibold">Document Title</TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold">Category</TableHead>
                  <TableHead className="min-w-[190px] text-xs font-semibold">Applicant / Project</TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold">Uploaded By</TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold text-center">Format & Size</TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold">Date</TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold text-center">Status</TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold text-right pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                      No documents match the selected filters or search query.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground font-semibold">
                        {d.id}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-start gap-2.5">
                          <FileText className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground leading-tight hover:underline cursor-pointer" onClick={() => setSelectedDoc(d)}>
                              {d.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {d.version} &middot; {d.projectNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-[10px] font-medium', categoryBadge(d.category))}>
                          {d.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-medium text-foreground truncate max-w-[200px]">{d.applicant}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{d.projectNumber}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {d.uploadedBy}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        <span className="font-mono text-[11px] font-semibold bg-muted px-1.5 py-0.5 rounded mr-1">
                          {d.type}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{d.fileSize}</span>
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-muted-foreground font-mono">
                        {d.date}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5 font-medium', statusColor(d.status))}>
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2.5 gap-1 hover:bg-primary hover:text-primary-foreground transition-all"
                            onClick={() => setSelectedDoc(d)}
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Document Inspector Sheet / Drawer */}
      {selectedDoc && (
        <Sheet open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
          <SheetContent side="right" className="w-full sm:max-w-[55vw] p-0 flex flex-col gap-0 border-l bg-background">
            <SheetHeader className="p-5 border-b bg-card text-left flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-[10px]', categoryBadge(selectedDoc.category))}>
                    {selectedDoc.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono font-semibold">{selectedDoc.id}</span>
                </div>
                <SheetTitle className="text-lg font-bold leading-snug">{selectedDoc.name}</SheetTitle>
                <SheetDescription className="text-xs">
                  Applicant: {selectedDoc.applicant} &middot; Project ID: {selectedDoc.projectNumber}
                </SheetDescription>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Document Summary Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/40 p-3 rounded-lg border">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Status
                  </div>
                  <div className="mt-1.5">
                    <Badge variant="outline" className={cn('text-xs font-semibold', statusColor(selectedDoc.status))}>
                      {selectedDoc.status}
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted/40 p-3 rounded-lg border">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <HardDrive className="h-3.5 w-3.5 text-primary" /> Format & Size
                  </div>
                  <p className="text-sm font-semibold mt-1 font-mono">{selectedDoc.type} ({selectedDoc.fileSize})</p>
                </div>

                <div className="bg-muted/40 p-3 rounded-lg border">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Upload Date
                  </div>
                  <p className="text-sm font-semibold mt-1 font-mono">{selectedDoc.date}</p>
                </div>

                <div className="bg-muted/40 p-3 rounded-lg border">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <User className="h-3.5 w-3.5 text-primary" /> Version
                  </div>
                  <p className="text-sm font-semibold mt-1 font-mono">{selectedDoc.version}</p>
                </div>
              </div>

              {/* Departmental Remarks */}
              {selectedDoc.remarks && (
                <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Compliance & Audit Remarks:
                  </p>
                  <p className="text-muted-foreground">{selectedDoc.remarks}</p>
                </div>
              )}

              {/* Document Interactive Preview Frame */}
              <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
                <div className="p-3 bg-muted/50 border-b flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-2">
                    <FileCheck className="h-3.5 w-3.5 text-primary" /> Digital Document Viewer & Validation
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download File
                    </Button>
                  </div>
                </div>

                <div className="h-72 bg-muted/20 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedDoc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      File Hash: SHA-256 (Verified on APCRDA Digital Ledger)
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Official Authenticated Copy &middot; AP State Government
                  </Badge>
                </div>
              </div>

              {/* Meta details list */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filing Authority & Entity Details</h4>
                <div className="border rounded-lg divide-y text-xs">
                  <div className="p-2.5 flex justify-between">
                    <span className="text-muted-foreground">Submitting Department / Entity:</span>
                    <span className="font-medium">{selectedDoc.uploadedBy}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-muted-foreground">Applicant Entity:</span>
                    <span className="font-medium">{selectedDoc.applicant}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-muted-foreground">Associated Land Application:</span>
                    <span className="font-mono font-medium">{selectedDoc.projectNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}


      {/* Document Generation Preview Dialog */}
      <Dialog open={!!previewDocTitle} onOpenChange={(open) => !open && setPreviewDocTitle(null)}>
        <DialogContent className="w-[95vw] sm:w-[60.5vw] max-w-[95vw] sm:max-w-[60.5vw] h-[86.9vh] max-h-[86.9vh] flex flex-col p-0 overflow-hidden rounded-xl">
          <DialogHeader className="p-4 border-b shrink-0 bg-muted/20">
            <DialogTitle className="text-lg">Generated Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-slate-100 flex flex-col items-center justify-center relative p-8">
            {/* Mock A4 Paper container */}
            <div className="w-full max-w-2xl bg-white h-full shadow-md border rounded p-12 overflow-y-auto flex flex-col space-y-6">
              {/* Fake skeleton lines for text */}
              <div className="flex justify-between items-start border-b pb-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full" />
                <div className="w-32 h-4 bg-slate-200 rounded" />
              </div>
              <div className="text-center pb-4">
                <h3 className="font-bold text-xl uppercase tracking-wider">{previewDocTitle}</h3>
              </div>
              <div className="space-y-3 pt-4">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-[90%] bg-slate-100 rounded" />
                <div className="h-3 w-[95%] bg-slate-100 rounded" />
                <div className="h-3 w-[80%] bg-slate-100 rounded" />
              </div>
              <div className="space-y-3 pt-6">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-[85%] bg-slate-100 rounded" />
                <div className="h-3 w-[95%] bg-slate-100 rounded" />
                <div className="h-3 w-[90%] bg-slate-100 rounded" />
              </div>
              <div className="mt-auto pt-12 flex justify-end">
                <div className="text-center space-y-2">
                  <div className="h-12 w-32 bg-slate-100/50 rounded border-b-2 border-slate-300" />
                  <div className="h-3 w-32 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <Button variant="outline" className="bg-white shadow-sm" onClick={() => setPreviewDocTitle(null)}>
                Cancel
              </Button>
              <Button variant="secondary" className="shadow-sm border" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
              <Button className="shadow-sm" onClick={handleConfirmAndIssue}>
                <FileCheck className="h-4 w-4 mr-2" /> Confirm & Issue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
