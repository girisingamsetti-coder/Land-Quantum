'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft, ChevronRight, CheckCircle2, Circle, Clock, AlertCircle,
  ArrowUpCircle, RotateCcw, XCircle, Building2, User, MapPin, FileText,
  IndianRupee, HardHat, Scale, Gavel, ScrollText, CreditCard, HandshakeIcon,
  KeyRound, Hammer, ClipboardCheck, MessageSquareWarning, FolderOpen,
  History, Shield, Loader2,
} from 'lucide-react'

// ---- Types ----

interface ApplicantData {
  id: string; applicantId: string; organizationName: string; entityType: string
  registrationNumber: string | null; pan: string | null; gst: string | null
  registeredAddress: string | null; contactPerson: string | null
  contactPhone: string | null; contactEmail: string | null
  authorizedRep: string | null; promoterDetails: string | null
  directors: string | null; netWorth: number; previousProjects: string | null
  experience: string | null
}

interface LandParcelData {
  id: string; plotId: string; surveyNumber: string; extentAcres: number
  gisReference: string | null; fsiFar: number; reservePrice: number
  themeCity: string | null; status: string; encumbranceStatus: string
  lpsDisputeStatus: string; litigationStatus: string; roadAlignmentStatus: string
  gisCoordinates: string | null
  zone: { id: string; name: string; code: string } | null
  landUse: { id: string; name: string; code: string } | null
  allotmentMode: { id: string; name: string; code: string } | null
}

interface StageData {
  id: string; stageName: string; stageOrder: number; status: string
  assignedToId: string | null; startedAt: string | null; completedAt: string | null
  slaDays: number; dueDate: string | null; decision: string | null
  remarks: string | null; data: string | null
  assignedTo: { id: string; name: string; designation: string | null } | null
}

interface DPRQuery {
  id: string; query: string; response: string | null; status: string
  createdAt: string; respondedAt: string | null
  raisedBy: { id: string; name: string } | null
}

interface DPRVersion {
  id: string; version: string; status: string; submittedAt: string
  reviewedAt: string | null; approvedAt: string | null; remarks: string | null
  reviewer: { id: string; name: string; designation: string | null } | null
  queries: DPRQuery[]
}

interface EconomicReview {
  id: string; totalScore: number; maxScore: number; percentage: number
  rating: string | null; recommendation: string | null; remarks: string | null
  scores: string | null; status: string
  reviewer: { id: string; name: string; designation: string | null } | null
}

interface Payment {
  id: string; paymentType: string; amountDue: number; amountPaid: number
  dueDate: string | null; paidDate: string | null; transactionRef: string | null
  receiptNumber: string | null; status: string; penaltyAmount: number
  interestAmount: number; refundAmount: number; remarks: string | null
}

interface Grievance {
  id: string; grievanceNumber: string; category: string | null; description: string
  status: string; submittedAt: string; resolvedAt: string | null; response: string | null
  assignedTo: { id: string; name: string } | null
}

interface ProgressUpdate {
  id: string; updateDate: string; physicalProgress: number; financialProgress: number
  remarks: string | null; reportedBy: { id: string; name: string } | null
}

interface ConstructionProject {
  id: string; plannedStartDate: string | null; actualStartDate: string | null
  plannedEndDate: string | null; actualEndDate: string | null
  physicalProgress: number; financialProgress: number; status: string
  remarks: string | null; milestones: string | null
  progressUpdates: ProgressUpdate[]
}

interface WorkflowConfig {
  id: string; stageName: string; stageOrder: number; ownerRole: string | null
  slaDays: number; isOptional: boolean; isActive: boolean
}

interface AuditLog {
  id: string; userId: string | null; userName: string | null
  role: string | null; action: string; module: string | null
  recordId: string | null; remarks: string | null; createdAt: string
}

interface ApplicationData {
  id: string; applicationNumber: string; projectName: string | null
  sector: string | null; projectCategory: string | null
  proposedInvestment: number; employmentCommitment: number
  developmentTimeline: string | null; projectDescription: string | null
  intendedLandUse: string | null; status: string; priority: string
  currentStage: string; slaDueDate: string | null; remarks: string | null
  rejectionReason: string | null; createdAt: string; updatedAt: string
  applicant: ApplicantData
  landParcel: LandParcelData | null
  allotmentMode: { id: string; name: string; code: string } | null
  assignedOfficer: { id: string; name: string; email: string; designation: string | null; department: { name: string } | null } | null
  stages: StageData[]
  dprVersions: DPRVersion[]
  economicReviews: EconomicReview[]
  payments: Payment[]
  grievances: Grievance[]
  governmentOrders: { id: string; goNumber: string; goDate: string | null; status: string; department: string | null; extent: number; landUse: string | null; fsiFar: number; holdingType: string | null; approvedInvestment: number; developmentCommitments: string | null }[]
  lois: { id: string; loiNumber: string; issueDate: string; expiryDate: string | null; acceptanceDate: string | null; investmentCommitment: number; status: string }[]
  agreements: { id: string; agreementNumber: string; agreementType: string | null; executionDate: string | null; registrationDate: string | null; stampDuty: number; registrationFee: number; tenure: string | null; holdingType: string | null; status: string }[]
  possessions: { id: string; certificateNumber: string | null; possessionDate: string | null; surveyNumber: string | null; handoverOfficer: string | null; investorRepresentative: string | null; remarks: string | null; status: string }[]
  buildingPerms: { id: string; permissionNumber: string | null; fsiFar: number; buildingHeight: number; groundCoverage: number; approvalDate: string | null; status: string }[]
  constructions: ConstructionProject[]
  complianceRecords: { id: string; commencementDeadline: string | null; completionDeadline: string | null; lastInspectionDate: string | null; nextInspectionDate: string | null; conditionsCompliant: boolean; utilizationStatus: string; remarks: string | null }[]
  cancellationCases: { id: string; caseNumber: string; initiatedBy: string; reason: string | null; decision: string | null; status: string; noticeDate: string | null; hearingDate: string | null; decisionDate: string | null; refundAmount: number; forfeitureAmount: number }[]
  documents: { id: string; fileName: string; fileType: string | null; fileSize: number; category: string | null; subCategory: string | null; isMandatory: boolean; verificationStatus: string; createdAt: string }[]
}

// ---- Constants ----

const WORKFLOW_STAGES = [
  'Application', 'Eligibility', 'DPR Review', 'Economic Review', 'LASC',
  'GoM', 'Cabinet Sub-Committee', 'Authority Approval', 'Cabinet Approval',
  'Government Order', 'LOI', 'Payment', 'Revised DPR', 'Agreement',
  'Possession', 'Building Permission', 'Construction', 'Compliance',
]

// ---- Helpers ----

function formatINR(amount: number) {
  return `\u20B9${amount.toLocaleString('en-IN')}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusColor(status: string): string {
  switch (status) {
    case 'Approved': case 'Completed': case 'Paid': case 'Compliant': return 'bg-emerald-100 text-emerald-800'
    case 'Under Review': case 'In Progress': case 'Pending': return 'bg-amber-100 text-amber-800'
    case 'Rejected': case 'Failed': case 'Non-Compliant': return 'bg-red-100 text-red-800'
    case 'Deferred': case 'On Hold': return 'bg-orange-100 text-orange-800'
    case 'Submitted': case 'Draft': default: return 'bg-gray-100 text-gray-800'
  }
}

function stageColor(status: string): string {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-800'
    case 'In Progress': case 'Pending Action': return 'bg-amber-100 text-amber-800'
    case 'Returned': return 'bg-orange-100 text-orange-800'
    case 'Rejected': return 'bg-red-100 text-red-800'
    case 'Not Started': default: return 'bg-gray-100 text-gray-700'
  }
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'Critical': return 'bg-red-100 text-red-800'
    case 'High': return 'bg-orange-100 text-orange-800'
    case 'Normal': return 'bg-blue-100 text-blue-800'
    case 'Low': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// ---- Sub-Components ----

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground sm:w-48 shrink-0 font-medium">{label}</span>
      <span className="text-sm flex-1">{value || '—'}</span>
    </div>
  )
}

function DetailCard({ title, description, children, icon: Icon }: {
  title: string; description?: string; children: React.ReactNode
  icon?: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-emerald-600" />}
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </div>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  )
}

// ---- Stage Dialog ----

function StageActionDialog({ open, onOpenChange, stageName, decision, onSubmit, loading }: {
  open: boolean; onOpenChange: (open: boolean) => void
  stageName: string; decision: string
  onSubmit: (remarks: string) => void; loading: boolean
}) {
  const [remarks, setRemarks] = useState('')
  const decisionLabel = decision === 'Approved' ? 'Advance' : decision === 'Returned' ? 'Return' : 'Reject'
  const decisionIcon = decision === 'Approved' ? ArrowUpCircle : decision === 'Returned' ? RotateCcw : XCircle
  const DecisionIcon = decisionIcon

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setRemarks(''); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DecisionIcon className={`h-5 w-5 ${decision === 'Approved' ? 'text-emerald-600' : decision === 'Returned' ? 'text-orange-600' : 'text-red-600'}`} />
            {decisionLabel} Stage: {stageName}
          </DialogTitle>
          <DialogDescription>
            You are about to <strong>{decision.toLowerCase()}</strong> the application at the <strong>{stageName}</strong> stage. This action will be recorded in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <label className="text-sm font-medium mb-1.5 block">Remarks *</label>
          <Textarea
            placeholder={`Enter remarks for ${decision.toLowerCase()} decision...`}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setRemarks(''); onOpenChange(false) }}>Cancel</Button>
          <Button
            variant={decision === 'Approved' ? 'default' : 'destructive'}
            className={decision === 'Returned' ? 'bg-orange-600 hover:bg-orange-700' : undefined}
            disabled={!remarks.trim() || loading}
            onClick={() => onSubmit(remarks.trim())}
          >
            {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {decisionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---- Main Component ----

export function ApplicationDetail() {
  const { viewParams, navigateTo } = useAppLayout()
  const appId = viewParams?.id

  const [app, setApp] = useState<ApplicationData | null>(null)
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Stage dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDecision, setDialogDecision] = useState('Approved')
  const [dialogLoading, setDialogLoading] = useState(false)

  const fetchApplication = useCallback(async () => {
    if (!appId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/applications/${appId}`)
      const json = await res.json()
      if (json.success) {
        setApp(json.data.application)
        setWorkflowConfig(json.data.workflowConfig)
        setAuditLogs(json.data.auditLogs)
      } else {
        setError(json.message || 'Failed to load application')
      }
    } catch {
      setError('Failed to load application')
    } finally {
      setLoading(false)
    }
  }, [appId])

  useEffect(() => {
    fetchApplication()
  }, [fetchApplication])

  const handleStageAction = async (remarks: string) => {
    if (!app) return
    setDialogLoading(true)
    try {
      const res = await fetch(`/api/applications/${app.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageName: app.currentStage, decision: dialogDecision, remarks }),
      })
      const json = await res.json()
      if (json.success) {
        setDialogOpen(false)
        fetchApplication() // refresh
      }
    } catch {
      // silent
    } finally {
      setDialogLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-64" /></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-20" /></CardContent></Card>)}
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-4 w-full mb-4" /><Skeleton className="h-20 w-full" /></CardContent></Card>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold">{error || 'Application not found'}</h3>
        <Button variant="outline" className="mt-4" onClick={() => navigateTo('applications')}>Back to Applications</Button>
      </div>
    )
  }

  // Determine next stage name for dialog title
  const currentStageIdx = WORKFLOW_STAGES.indexOf(app.currentStage)
  const nextStageName = WORKFLOW_STAGES[currentStageIdx + 1]

  return (
    <div className="space-y-4">
      {/* Stage Action Dialog */}
      <StageActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stageName={app.currentStage}
        decision={dialogDecision}
        onSubmit={handleStageAction}
        loading={dialogLoading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-0.5 h-8 w-8" onClick={() => navigateTo('applications')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight ">{app.applicationNumber}</h1>
              <Badge className={`${statusColor(app.status)} hover:${statusColor(app.status)}`}>{app.status}</Badge>
              <Badge className={`${priorityColor(app.priority)} hover:${priorityColor(app.priority)}`}>{app.priority}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {app.projectName} — {app.applicant.organizationName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${stageColor(app.stages.find(s => s.stageName === app.currentStage)?.status ?? 'Not Started')} hover:${stageColor(app.stages.find(s => s.stageName === app.currentStage)?.status ?? 'Not Started')}`}>
            <Clock className="h-3 w-3 mr-1" /> {app.currentStage}
          </Badge>
          {app.status !== 'Rejected' && app.status !== 'Completed' && app.status !== 'Cancelled' && (
            <>
              <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { setDialogDecision('Approved'); setDialogOpen(true) }}>
                <ArrowUpCircle className="h-3.5 w-3.5" /> Advance
              </Button>
              <Button size="sm" variant="outline" className="gap-1 border-orange-400 text-orange-700 hover:bg-orange-50" onClick={() => { setDialogDecision('Returned'); setDialogOpen(true) }}>
                <RotateCcw className="h-3.5 w-3.5" /> Return
              </Button>
              <Button size="sm" variant="outline" className="gap-1 border-red-400 text-red-700 hover:bg-red-50" onClick={() => { setDialogDecision('Rejected'); setDialogOpen(true) }}>
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-xs px-3">Overview</TabsTrigger>
          <TabsTrigger value="applicant" className="text-xs px-3">Applicant</TabsTrigger>
          <TabsTrigger value="land" className="text-xs px-3">Land</TabsTrigger>
          <TabsTrigger value="dpr" className="text-xs px-3">DPR</TabsTrigger>
          <TabsTrigger value="economic" className="text-xs px-3">Economic Review</TabsTrigger>
          <TabsTrigger value="lasc" className="text-xs px-3">LASC</TabsTrigger>
          <TabsTrigger value="gom" className="text-xs px-3">GoM</TabsTrigger>
          <TabsTrigger value="authority" className="text-xs px-3">Authority</TabsTrigger>
          <TabsTrigger value="cabinet" className="text-xs px-3">Cabinet</TabsTrigger>
          <TabsTrigger value="go" className="text-xs px-3">GO</TabsTrigger>
          <TabsTrigger value="loi" className="text-xs px-3">LOI</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs px-3">Payments</TabsTrigger>
          <TabsTrigger value="agreement" className="text-xs px-3">Agreement</TabsTrigger>
          <TabsTrigger value="possession" className="text-xs px-3">Possession</TabsTrigger>
          <TabsTrigger value="building" className="text-xs px-3">Building</TabsTrigger>
          <TabsTrigger value="construction" className="text-xs px-3">Construction</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs px-3">Compliance</TabsTrigger>
          <TabsTrigger value="grievances" className="text-xs px-3">Grievances</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs px-3">Documents</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs px-3">Timeline</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs px-3">Audit</TabsTrigger>
        </TabsList>

        {/* ========== OVERVIEW TAB ========== */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Proposed Investment</p><p className="text-lg font-bold text-emerald-700">{formatINR(app.proposedInvestment)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Employment</p><p className="text-lg font-bold">{app.employmentCommitment.toLocaleString('en-IN')} jobs</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">FSI/FAR</p><p className="text-lg font-bold">{app.landParcel?.fsiFar ?? '—'}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Land Extent</p><p className="text-lg font-bold">{app.landParcel?.extentAcres ?? '—'} acres</p></CardContent></Card>
          </div>

          {/* Stage Progress Stepper */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Workflow Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                {app.stages.map((stage, idx) => {
                  const isCompleted = stage.status === 'Completed'
                  const isCurrent = stage.stageName === app.currentStage
                  const isRejected = stage.status === 'Rejected'
                  const isReturned = stage.status === 'Returned'
                  const config = workflowConfig.find(w => w.stageName === stage.stageName)

                  return (
                    <div key={stage.id} className="flex gap-3 mb-1">
                      {/* Connector line + circle */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                          isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' :
                          isRejected ? 'bg-red-100 border-red-400 text-red-600' :
                          isReturned ? 'bg-orange-100 border-orange-400 text-orange-600' :
                          isCurrent ? 'bg-amber-100 border-amber-500 text-amber-700' :
                          'bg-gray-50 border-gray-300 text-gray-400'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> :
                           isRejected ? <XCircle className="h-4 w-4" /> :
                           isCurrent ? <Clock className="h-4 w-4" /> :
                           <Circle className="h-4 w-4" />}
                        </div>
                        {idx < app.stages.length - 1 && (
                          <div className={`w-0.5 h-8 ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                        )}
                      </div>

                      {/* Stage info */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${isCurrent ? 'text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {stage.stageName}
                          </span>
                          <Badge className={`${stageColor(stage.status)} hover:${stageColor(stage.status)} text-[10px]`}>{stage.status}</Badge>
                          {config?.isOptional && <Badge variant="outline" className="text-[10px]">Optional</Badge>}
                          {stage.decision && <span className="text-[10px] text-muted-foreground">({stage.decision})</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          {stage.assignedTo && <span>{stage.assignedTo.name}</span>}
                          {stage.slaDays > 0 && <span>SLA: {stage.slaDays}d</span>}
                          {stage.completedAt && <span>Completed: {formatDate(stage.completedAt)}</span>}
                          {stage.remarks && <span className="truncate max-w-[200px]" title={stage.remarks}>{stage.remarks}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <DetailCard title="Project Details" icon={FileText}>
              <InfoRow label="Project" value={app.projectName} />
              <InfoRow label="Sector" value={app.sector} />
              <InfoRow label="Category" value={app.projectCategory} />
              <InfoRow label="Allotment Mode" value={app.allotmentMode?.name} />
              <InfoRow label="Description" value={app.projectDescription} />
              <InfoRow label="Development Timeline" value={app.developmentTimeline} />
              <InfoRow label="Intended Land Use" value={app.intendedLandUse} />
              {app.assignedOfficer && <InfoRow label="Assigned Officer" value={`${app.assignedOfficer.name} (${app.assignedOfficer.designation})`} />}
              {app.slaDueDate && <InfoRow label="SLA Due" value={formatDate(app.slaDueDate)} />}
              {app.rejectionReason && <InfoRow label="Rejection Reason" value={<span className="text-red-600">{app.rejectionReason}</span>} />}
            </DetailCard>
            <DetailCard title="Key Dates" icon={Clock}>
              <InfoRow label="Application Date" value={formatDate(app.createdAt)} />
              <InfoRow label="Last Updated" value={formatDate(app.updatedAt)} />
              {app.stages.filter(s => s.completedAt).map(s => (
                <InfoRow key={s.id} label={s.stageName} value={formatDate(s.completedAt)} />
              ))}
            </DetailCard>
          </div>
        </TabsContent>

        {/* ========== APPLICANT TAB ========== */}
        <TabsContent value="applicant">
          <div className="grid md:grid-cols-2 gap-4">
            <DetailCard title="Applicant Details" icon={User}>
              <InfoRow label="Applicant ID" value={<span className=" text-xs">{app.applicant.applicantId}</span>} />
              <InfoRow label="Organization" value={app.applicant.organizationName} />
              <InfoRow label="Entity Type" value={app.applicant.entityType} />
              <InfoRow label="Registration No." value={app.applicant.registrationNumber} />
              <InfoRow label="PAN" value={app.applicant.pan} />
              <InfoRow label="GST" value={app.applicant.gst} />
              <InfoRow label="Experience" value={app.applicant.experience} />
            </DetailCard>
            <DetailCard title="Contact & Financial" icon={Building2}>
              <InfoRow label="Registered Address" value={app.applicant.registeredAddress} />
              <InfoRow label="Contact Person" value={app.applicant.contactPerson} />
              <InfoRow label="Phone" value={app.applicant.contactPhone} />
              <InfoRow label="Email" value={app.applicant.contactEmail} />
              <InfoRow label="Authorized Rep" value={app.applicant.authorizedRep} />
              <InfoRow label="Net Worth" value={formatINR(app.applicant.netWorth)} />
            </DetailCard>
          </div>
        </TabsContent>

        {/* ========== LAND TAB ========== */}
        <TabsContent value="land">
          {app.landParcel ? (
            <div className="grid md:grid-cols-2 gap-4">
              <DetailCard title="Parcel Details" icon={MapPin}>
                <InfoRow label="Plot ID" value={<span className=" text-xs">{app.landParcel.plotId}</span>} />
                <InfoRow label="Survey Number" value={app.landParcel.surveyNumber} />
                <InfoRow label="Extent" value={`${app.landParcel.extentAcres} acres`} />
                <InfoRow label="Theme City" value={app.landParcel.themeCity} />
                <InfoRow label="FSI/FAR" value={String(app.landParcel.fsiFar)} />
                <InfoRow label="Reserve Price" value={formatINR(app.landParcel.reservePrice)} />
                <InfoRow label="Status" value={<Badge className={`${statusColor(app.landParcel.status)} hover:${statusColor(app.landParcel.status)}`}>{app.landParcel.status}</Badge>} />
              </DetailCard>
              <DetailCard title="Zone & Land Use" icon={MapPin}>
                <InfoRow label="Zone" value={app.landParcel.zone ? `${app.landParcel.zone.name} (${app.landParcel.zone.code})` : '—'} />
                <InfoRow label="Land Use" value={app.landParcel.landUse?.name} />
                <InfoRow label="Allotment Mode" value={app.landParcel.allotmentMode?.name} />
                <InfoRow label="GIS Reference" value={app.landParcel.gisReference} />
                <InfoRow label="GIS Coordinates" value={app.landParcel.gisCoordinates ? <span className=" text-xs break-all">{app.landParcel.gisCoordinates}</span> : '—'} />
                <InfoRow label="Encumbrance" value={<Badge className={`${app.landParcel.encumbranceStatus === 'Clear' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} hover:opacity-100`}>{app.landParcel.encumbranceStatus}</Badge>} />
                <InfoRow label="LPS Dispute" value={app.landParcel.lpsDisputeStatus} />
                <InfoRow label="Litigation" value={app.landParcel.litigationStatus} />
                <InfoRow label="Road Alignment" value={app.landParcel.roadAlignmentStatus} />
              </DetailCard>
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No land parcel assigned</CardContent></Card>
          )}
        </TabsContent>

        {/* ========== DPR TAB ========== */}
        <TabsContent value="dpr">
          {app.dprVersions.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No DPR versions submitted yet</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {app.dprVersions.map((dpr) => (
                <Card key={dpr.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Version {dpr.version}</CardTitle>
                      <Badge className={`${statusColor(dpr.status)} hover:${statusColor(dpr.status)}`}>{dpr.status}</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Submitted: {formatDate(dpr.submittedAt)}
                      {dpr.reviewer && <> | Reviewer: {dpr.reviewer.name}</>}
                      {dpr.reviewedAt && <> | Reviewed: {formatDate(dpr.reviewedAt)}</>}
                      {dpr.approvedAt && <> | Approved: {formatDate(dpr.approvedAt)}</>}
                    </CardDescription>
                  </CardHeader>
                  {dpr.remarks && (
                    <CardContent className="pt-0 pb-2"><p className="text-xs text-muted-foreground">{dpr.remarks}</p></CardContent>
                  )}
                  {dpr.queries.length > 0 && (
                    <CardContent className="pt-0">
                      <p className="text-xs font-semibold mb-2">Queries ({dpr.queries.length})</p>
                      <div className="space-y-2">
                        {dpr.queries.map((q) => (
                          <div key={q.id} className="rounded-lg border p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm">{q.query}</p>
                                {q.response && (
                                  <div className="mt-2 pl-3 border-l-2 border-emerald-400">
                                    <p className="text-sm text-muted-foreground">{q.response}</p>
                                  </div>
                                )}
                              </div>
                              <Badge className={`${statusColor(q.status)} hover:${statusColor(q.status)} shrink-0 text-[10px]`}>{q.status}</Badge>
                            </div>
                            <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                              <span>Raised: {formatDate(q.createdAt)} {q.raisedBy && `by ${q.raisedBy.name}`}</span>
                              {q.respondedAt && <span>Responded: {formatDate(q.respondedAt)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========== ECONOMIC REVIEW TAB ========== */}
        <TabsContent value="economic">
          {app.economicReviews.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No economic review conducted yet</CardContent></Card>
          ) : (
            app.economicReviews.map((review) => {
              let scores: { criterion: string; weight: number; maxScore: number; score: number }[] = []
              try { scores = JSON.parse(review.scores ?? '[]') } catch { /* empty */ }

              return (
                <Card key={review.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Economic Review</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusColor(review.status)} hover:${statusColor(review.status)}`}>{review.status}</Badge>
                        {review.rating && <Badge className={`${review.rating === 'Recommended' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} hover:opacity-100`}>{review.rating}</Badge>}
                      </div>
                    </div>
                    {review.reviewer && <CardDescription className="text-xs">Reviewer: {review.reviewer.name} ({review.reviewer.designation})</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Criterion</TableHead>
                          <TableHead className="text-center">Weight</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-center">Max</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scores.map((s, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{s.criterion}</TableCell>
                            <TableCell className="text-center text-sm">{s.weight}%</TableCell>
                            <TableCell className="text-center text-sm font-medium">{s.score}</TableCell>
                            <TableCell className="text-center text-sm text-muted-foreground">{s.maxScore}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold">
                          <TableCell className="text-sm">Total</TableCell>
                          <TableCell className="text-center text-sm">100%</TableCell>
                          <TableCell className="text-center text-sm">{review.totalScore}</TableCell>
                          <TableCell className="text-center text-sm">{review.maxScore}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Score:</span>
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${review.percentage >= 80 ? 'bg-emerald-500' : review.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${review.percentage}%` }} />
                        </div>
                        <span className="text-sm font-bold">{review.percentage}%</span>
                      </div>
                    </div>
                    {review.recommendation && (
                      <p className="mt-2 text-sm text-muted-foreground"><strong>Recommendation:</strong> {review.recommendation}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* ========== COMMITTEE TABS (LASC/GoM/Authority/Cabinet) ========== */}
        {['lasc', 'gom', 'authority', 'cabinet'].map((tab) => {
          const committeeLabels: Record<string, string> = { lasc: 'LASC', gom: 'GoM', authority: 'Authority Approval', cabinet: 'Cabinet Approval' }
          const stage = app.stages.find(s => s.stageName === committeeLabels[tab])
          return (
            <TabsContent key={tab} value={tab}>
              {stage ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{stage.stageName}</CardTitle>
                      <Badge className={`${stageColor(stage.status)} hover:${stageColor(stage.status)}`}>{stage.status}</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {stage.assignedTo && <>Assigned to: {stage.assignedTo.name}</>}
                      {stage.startedAt && <> | Started: {formatDate(stage.startedAt)}</>}
                      {stage.completedAt && <> | Completed: {formatDate(stage.completedAt)}</>}
                      {stage.dueDate && <> | Due: {formatDate(stage.dueDate)}</>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InfoRow label="Decision" value={stage.decision} />
                    <InfoRow label="Remarks" value={stage.remarks} />
                    <InfoRow label="SLA Days" value={`${stage.slaDays} days`} />
                  </CardContent>
                </Card>
              ) : (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No {committeeLabels[tab]} data available</CardContent></Card>
              )}
            </TabsContent>
          )
        })}

        {/* ========== GO TAB ========== */}
        <TabsContent value="go">
          {app.governmentOrders.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No Government Orders issued</CardContent></Card>
          ) : (
            app.governmentOrders.map((go) => (
              <Card key={go.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">GO: {go.goNumber}</CardTitle>
                    <Badge className={`${statusColor(go.status)} hover:${statusColor(go.status)}`}>{go.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <InfoRow label="GO Date" value={formatDate(go.goDate)} />
                  <InfoRow label="Department" value={go.department} />
                  <InfoRow label="Extent" value={`${go.extent} acres`} />
                  <InfoRow label="Land Use" value={go.landUse} />
                  <InfoRow label="FSI/FAR" value={String(go.fsiFar)} />
                  <InfoRow label="Holding Type" value={go.holdingType} />
                  <InfoRow label="Approved Investment" value={formatINR(go.approvedInvestment)} />
                  <InfoRow label="Development Commitments" value={go.developmentCommitments} />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ========== LOI TAB ========== */}
        <TabsContent value="loi">
          {app.lois.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No LOI issued yet</CardContent></Card>
          ) : (
            app.lois.map((loi) => (
              <Card key={loi.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">LOI: {loi.loiNumber}</CardTitle>
                    <Badge className={`${statusColor(loi.status)} hover:${statusColor(loi.status)}`}>{loi.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Issue Date" value={formatDate(loi.issueDate)} />
                  <InfoRow label="Expiry Date" value={formatDate(loi.expiryDate)} />
                  <InfoRow label="Acceptance Date" value={formatDate(loi.acceptanceDate)} />
                  <InfoRow label="Investment Commitment" value={formatINR(loi.investmentCommitment)} />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ========== PAYMENTS TAB ========== */}
        <TabsContent value="payments">
          {app.payments.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No payments recorded</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {app.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm font-medium">{p.paymentType}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{formatINR(p.amountDue)}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{formatINR(p.amountPaid)}</TableCell>
                        <TableCell className="text-sm">{formatDate(p.dueDate)}</TableCell>
                        <TableCell className="text-sm">{formatDate(p.paidDate)}</TableCell>
                        <TableCell className="text-sm  text-xs">{p.receiptNumber ?? '—'}</TableCell>
                        <TableCell><Badge className={`${statusColor(p.status)} hover:${statusColor(p.status)} text-[11px]`}>{p.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ========== AGREEMENT TAB ========== */}
        <TabsContent value="agreement">
          {app.agreements.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No agreement recorded</CardContent></Card>
          ) : (
            app.agreements.map((a) => (
              <Card key={a.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Agreement: {a.agreementNumber}</CardTitle>
                    <Badge className={`${statusColor(a.status)} hover:${statusColor(a.status)}`}>{a.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Type" value={a.agreementType} />
                  <InfoRow label="Execution Date" value={formatDate(a.executionDate)} />
                  <InfoRow label="Registration Date" value={formatDate(a.registrationDate)} />
                  <InfoRow label="Stamp Duty" value={formatINR(a.stampDuty)} />
                  <InfoRow label="Registration Fee" value={formatINR(a.registrationFee)} />
                  <InfoRow label="Tenure" value={a.tenure} />
                  <InfoRow label="Holding Type" value={a.holdingType} />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ========== POSSESSION TAB ========== */}
        <TabsContent value="possession">
          {app.possessions.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No possession records</CardContent></Card>
          ) : (
            app.possessions.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Possession {p.certificateNumber ? `#${p.certificateNumber}` : ''}</CardTitle>
                    <Badge className={`${statusColor(p.status)} hover:${statusColor(p.status)}`}>{p.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Possession Date" value={formatDate(p.possessionDate)} />
                  <InfoRow label="Survey Number" value={p.surveyNumber} />
                  <InfoRow label="Handover Officer" value={p.handoverOfficer} />
                  <InfoRow label="Investor Rep" value={p.investorRepresentative} />
                  <InfoRow label="Remarks" value={p.remarks} />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ========== BUILDING TAB ========== */}
        <TabsContent value="building">
          {app.buildingPerms.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No building permissions</CardContent></Card>
          ) : (
            app.buildingPerms.map((bp) => (
              <Card key={bp.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Building Permission {bp.permissionNumber ? `#${bp.permissionNumber}` : ''}</CardTitle>
                    <Badge className={`${statusColor(bp.status)} hover:${statusColor(bp.status)}`}>{bp.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <InfoRow label="FSI/FAR" value={String(bp.fsiFar)} />
                  <InfoRow label="Building Height" value={`${bp.buildingHeight} m`} />
                  <InfoRow label="Ground Coverage" value={`${bp.groundCoverage}%`} />
                  <InfoRow label="Approval Date" value={formatDate(bp.approvalDate)} />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ========== CONSTRUCTION TAB ========== */}
        <TabsContent value="construction">
          {app.constructions.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No construction projects</CardContent></Card>
          ) : (
            app.constructions.map((c) => (
              <div key={c.id} className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Construction Progress</CardTitle>
                      <Badge className={`${statusColor(c.status)} hover:${statusColor(c.status)}`}>{c.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Physical Progress</span>
                          <span className="text-sm font-bold">{c.physicalProgress}%</span>
                        </div>
                        <Progress value={c.physicalProgress} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Financial Progress</span>
                          <span className="text-sm font-bold">{c.financialProgress}%</span>
                        </div>
                        <Progress value={c.financialProgress} className="h-2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-muted-foreground">Planned Start:</span> {formatDate(c.plannedStartDate)}</div>
                      <div><span className="text-muted-foreground">Actual Start:</span> {formatDate(c.actualStartDate)}</div>
                      <div><span className="text-muted-foreground">Planned End:</span> {formatDate(c.plannedEndDate)}</div>
                      <div><span className="text-muted-foreground">Actual End:</span> {formatDate(c.actualEndDate)}</div>
                    </div>
                    {c.remarks && <p className="text-xs text-muted-foreground">{c.remarks}</p>}
                  </CardContent>
                </Card>

                {/* Progress Updates Timeline */}
                {c.progressUpdates.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Progress Updates</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {c.progressUpdates.map((pu) => (
                          <div key={pu.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <ChevronRight className="h-3 w-3 text-emerald-700" />
                              </div>
                            </div>
                            <div className="flex-1 pb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">{formatDate(pu.updateDate)}</span>
                                {pu.reportedBy && <span className="text-xs text-muted-foreground">by {pu.reportedBy.name}</span>}
                              </div>
                              <div className="flex gap-4 text-xs">
                                <span>Physical: <strong>{pu.physicalProgress}%</strong></span>
                                <span>Financial: <strong>{pu.financialProgress}%</strong></span>
                              </div>
                              {pu.remarks && <p className="text-xs text-muted-foreground mt-1">{pu.remarks}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* ========== COMPLIANCE TAB ========== */}
        <TabsContent value="compliance">
          {app.complianceRecords.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No compliance records</CardContent></Card>
          ) : (
            app.complianceRecords.map((cr) => (
              <Card key={cr.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Compliance Record</CardTitle>
                    <Badge className={`${statusColor(cr.utilizationStatus)} hover:${statusColor(cr.utilizationStatus)}`}>{cr.utilizationStatus}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Commencement Deadline" value={formatDate(cr.commencementDeadline)} />
                  <InfoRow label="Completion Deadline" value={formatDate(cr.completionDeadline)} />
                  <InfoRow label="Last Inspection" value={formatDate(cr.lastInspectionDate)} />
                  <InfoRow label="Next Inspection" value={formatDate(cr.nextInspectionDate)} />
                  <InfoRow label="Conditions Compliant" value={<Badge className={`${cr.conditionsCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} hover:opacity-100`}>{cr.conditionsCompliant ? 'Yes' : 'No'}</Badge>} />
                  <InfoRow label="Remarks" value={cr.remarks} />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ========== GRIEVANCES TAB ========== */}
        <TabsContent value="grievances">
          {app.grievances.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No grievances filed</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {app.grievances.map((g) => (
                <Card key={g.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{g.grievanceNumber}</CardTitle>
                      <Badge className={`${statusColor(g.status)} hover:${statusColor(g.status)}`}>{g.status}</Badge>
                    </div>
                    <CardDescription className="text-xs">Category: {g.category} | Filed: {formatDate(g.submittedAt)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{g.description}</p>
                    {g.response && (
                      <div className="pl-3 border-l-2 border-emerald-400">
                        <p className="text-sm text-muted-foreground">{g.response}</p>
                      </div>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      {g.assignedTo && <span>Assigned: {g.assignedTo.name}</span>}
                      {g.resolvedAt && <span>Resolved: {formatDate(g.resolvedAt)}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========== DOCUMENTS TAB ========== */}
        <TabsContent value="documents">
          {app.documents.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No documents uploaded</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Mandatory</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {app.documents.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-sm font-medium">{d.fileName}</TableCell>
                        <TableCell className="text-xs">{d.category ?? '—'}</TableCell>
                        <TableCell className="text-xs">{d.fileType ?? '—'}</TableCell>
                        <TableCell className="text-xs">{(d.fileSize / 1024).toFixed(1)} KB</TableCell>
                        <TableCell>{d.isMandatory ? <Badge variant="outline" className="text-[10px]">Yes</Badge> : '—'}</TableCell>
                        <TableCell><Badge className={`${statusColor(d.verificationStatus)} hover:${statusColor(d.verificationStatus)} text-[11px]`}>{d.verificationStatus}</Badge></TableCell>
                        <TableCell className="text-xs">{formatDate(d.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ========== TIMELINE TAB ========== */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Stage Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                {app.stages.filter(s => s.status !== 'Not Started').map((stage, idx) => (
                  <div key={stage.id} className="flex gap-3 mb-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        stage.status === 'Completed' ? 'bg-emerald-600 border-emerald-600 text-white' :
                        stage.status === 'Rejected' ? 'bg-red-100 border-red-400 text-red-600' :
                        stage.status === 'Returned' ? 'bg-orange-100 border-orange-400 text-orange-600' :
                        'bg-amber-100 border-amber-500 text-amber-700'
                      }`}>
                        {stage.status === 'Completed' ? <CheckCircle2 className="h-4 w-4" /> :
                         stage.status === 'Rejected' ? <XCircle className="h-4 w-4" /> :
                         <Clock className="h-4 w-4" />}
                      </div>
                      {idx < app.stages.filter(s => s.status !== 'Not Started').length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{stage.stageName}</span>
                        <Badge className={`${stageColor(stage.status)} hover:${stageColor(stage.status)} text-[10px]`}>{stage.status}</Badge>
                        {stage.decision && <span className="text-xs text-muted-foreground">— {stage.decision}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {stage.startedAt && <span>Started: {formatDate(stage.startedAt)}</span>}
                        {stage.completedAt && <span> | Completed: {formatDate(stage.completedAt)}</span>}
                        {stage.remarks && <span className="block mt-0.5">{stage.remarks}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== AUDIT TAB ========== */}
        <TabsContent value="audit">
          {auditLogs.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No audit logs</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(log.createdAt)}</TableCell>
                        <TableCell className="text-sm">{log.userName ?? '—'}</TableCell>
                        <TableCell className="text-xs">{log.role ?? '—'}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{log.action}</Badge></TableCell>
                        <TableCell className="text-xs">{log.module ?? '—'}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{log.remarks ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
