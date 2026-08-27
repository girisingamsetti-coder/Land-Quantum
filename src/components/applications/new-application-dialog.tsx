'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Building2, Briefcase, ChevronRight, ChevronLeft,
  Check, Loader2, Plus, Globe, MapPin, Users, Landmark, Wand2, FileText, FileUp, Library, Banknote, TrendingUp, LineChart, Upload, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---- Constants ----

const SECTORS = [
  'Commercial', 'Education', 'Financial Institutions', 'Food Processing',
  'Government Organisations', 'Healthcare', 'Hospitality', 'IT/ITES',
  'Industrial', 'Logistics', 'NGOs', 'Others', 'Pharmaceutical',
  'Political Parties', 'Sports', 'Textiles'
]

const SUB_SECTORS = [
  'Software Development', 'BPO/KPO', 'Data Center', 'R&D', 'Manufacturing', 'Warehousing', 'Retail', 'Other'
]

// ---- Steps ----

const STEPS = [
  { id: 1, label: 'Basic Info', icon: Building2 },
  { id: 2, label: 'Org Profile', icon: Briefcase },
  { id: 3, label: 'Vision & Plan', icon: Globe },
  { id: 4, label: 'Land Details', icon: MapPin },
  { id: 5, label: 'Timeline', icon: Clock },
  { id: 6, label: 'Similar Facilities', icon: Library },
  { id: 7, label: 'Funding', icon: Banknote },
  { id: 8, label: 'Promoter', icon: Users },
  { id: 9, label: 'Key Developments', icon: TrendingUp },
  { id: 10, label: 'Financials', icon: LineChart },
  { id: 11, label: 'DPR Upload', icon: FileText },
]

// ---- Types ----

interface FormData {
  // Common
  sector: string
  subSector: string
  
  // Basic Information
  enquiryName: string
  organizationName: string
  registeredAddress: string
  
  // Organization Profile
  representativeName: string
  designation: string
  contactPhone: string
  contactEmail: string
  
  // Project Vision & Plan
  organizationBackground: string
  projectVision: string
  utilizationPlan: string
  areaAllocation: string
  
  // Land Requirements & Project Details
  landExtent: string
  builtUpArea: string
  proposedInvestmentCr: string
  permanentEmployees: string
  temporaryEmployees: string
  partTimeEmployees: string
  interns: string
  contractualStaff: string
  studentCapacity: string
  
  // Development Timeline
  constructionTimeline: string
  devPlanArea: string[]
  devPlanBuiltUp: string[]
  devPlanInvestment: string[]
  
  // Similar Facilities
  facility1Location: string
  facility1LandArea: string
  facility1BuiltUp: string
  facility1Employees: string
  facility1Investment: string
  facility2Location: string
  facility2LandArea: string
  facility2BuiltUp: string
  facility2Employees: string
  facility2Investment: string
  facility3Location: string
  facility3LandArea: string
  facility3BuiltUp: string
  facility3Employees: string
  facility3Investment: string
  
  // Funding & Additional Details
  projectFunding: string
  specialRequirements: string
  jointVentures: string
  
  // Promoter Details
  promoterName: string
  promoterContact: string
  promoterBackground: string
  promoterQualifications: string
  promoterExperience: string
  promoterRole: string
  
  // Significant Developments
  significantDevelopments: string[]
  significantDevelopmentsDetails: string
  
  // Financials
  finYear1: string
  finYear1NetWorth: string
  finYear1Turnover: string
  finYear1Profit: string
  finYear2: string
  finYear2NetWorth: string
  finYear2Turnover: string
  finYear2Profit: string
  finYear3: string
  finYear3NetWorth: string
  finYear3Turnover: string
  finYear3Profit: string
  gstNumber: string
  panNumber: string
  itrFiled: boolean
  yearsInOperation: string
  projectsCompleted: string
}

const INITIAL_FORM: FormData = {
  sector: '', subSector: '',
  enquiryName: '', organizationName: '', registeredAddress: '',
  representativeName: '', designation: '', contactPhone: '', contactEmail: '',
  organizationBackground: '', projectVision: '', utilizationPlan: '', areaAllocation: '',
  landExtent: '', builtUpArea: '', proposedInvestmentCr: '',
  permanentEmployees: '', temporaryEmployees: '', partTimeEmployees: '',
  interns: '', contractualStaff: '', studentCapacity: '',
  constructionTimeline: '',
  devPlanArea: ['', '', '', ''],
  devPlanBuiltUp: ['', '', '', ''],
  devPlanInvestment: ['', '', '', ''],
  facility1Location: '', facility1LandArea: '', facility1BuiltUp: '', facility1Employees: '', facility1Investment: '',
  facility2Location: '', facility2LandArea: '', facility2BuiltUp: '', facility2Employees: '', facility2Investment: '',
  facility3Location: '', facility3LandArea: '', facility3BuiltUp: '', facility3Employees: '', facility3Investment: '',
  projectFunding: '', specialRequirements: '', jointVentures: '',
  promoterName: '', promoterContact: '', promoterBackground: '', promoterQualifications: '', promoterExperience: '', promoterRole: '',
  significantDevelopments: [], significantDevelopmentsDetails: '',
  finYear1: '', finYear1NetWorth: '', finYear1Turnover: '', finYear1Profit: '',
  finYear2: '', finYear2NetWorth: '', finYear2Turnover: '', finYear2Profit: '',
  finYear3: '', finYear3NetWorth: '', finYear3Turnover: '', finYear3Profit: '',
  gstNumber: '', panNumber: '',
  itrFiled: false, yearsInOperation: '', projectsCompleted: '',
}

// ---- Field helpers ----

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}

// ---- Main dialog ----

interface NewApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (applicationNumber: string) => void
}

export function NewApplicationDialog({ open, onOpenChange, onCreated }: NewApplicationDialogProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)
  const [successApp, setSuccessApp] = useState<string | null>(null)

  const set = (field: keyof FormData, value: string | string[] | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormData]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateStep = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (step === 1) {
      if (!form.enquiryName.trim()) newErrors.enquiryName = 'Required'
      if (!form.organizationName.trim()) newErrors.organizationName = 'Required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const next = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 11))
  }

  const back = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    if (!validateStep()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setSuccessApp(json.data.application.applicationNumber)
        onCreated?.(json.data.application.applicationNumber)
      } else {
        setErrors({ organizationName: json.error || 'Failed to create application' })
      }
    } catch {
      setErrors({ organizationName: 'Network error, please try again' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep(1)
      setForm(INITIAL_FORM)
      setErrors({})
      setSuccessApp(null)
      setSubmitting(false)
    }, 300)
  }

  // ---- Shared Step Components to avoid duplication ----

  const renderBasicInfo = (stepNumber: number) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Field label="Enquiry Name" required>
          <Input id={`enquiry-name-${stepNumber}`} placeholder="Project/Enquiry Name" value={form.enquiryName} onChange={e => set('enquiryName', e.target.value)} className={cn('h-9 text-sm', errors.enquiryName && 'border-destructive')} />
          {errors.enquiryName && <p className="text-[11px] text-destructive">{errors.enquiryName}</p>}
        </Field>
        <Field label="Sector">
          <Select value={form.sector} onValueChange={v => set('sector', v)}>
            <SelectTrigger id={`sector-${stepNumber}`} className="h-9 text-sm bg-muted/20"><SelectValue placeholder="Select sector" /></SelectTrigger>
            <SelectContent>{SECTORS.map(s => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Field label="Sub-Sector">
          <Select value={form.subSector} onValueChange={v => set('subSector', v)}>
            <SelectTrigger id={`subsector-${stepNumber}`} className="h-9 text-sm bg-muted/20"><SelectValue placeholder={form.sector ? "Select sub-sector" : "Select sector first"} /></SelectTrigger>
            <SelectContent>{SUB_SECTORS.map(s => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Applicant/Company Name" required>
        <Input id={`org-name-${stepNumber}`} placeholder="Full legal name" value={form.organizationName} onChange={e => set('organizationName', e.target.value)} className={cn('h-9 text-sm', errors.organizationName && 'border-destructive')} />
        {errors.organizationName && <p className="text-[11px] text-destructive">{errors.organizationName}</p>}
      </Field>
      <Field label="Registered Address">
        <Textarea id={`registered-address-${stepNumber}`} placeholder="Complete registered address" value={form.registeredAddress} onChange={e => set('registeredAddress', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} />
      </Field>
    </div>
  )

  const renderOrgProfile = (stepNumber: number) => (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Organization Profile</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Classification and legal details of the organization</p>
        <div className="border-b pb-4 flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Organization Details</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5 space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Representative Details</h3>
        <Field label="Representative Name">
          <Input id={`rep-name-${stepNumber}`} placeholder="Contact person name" value={form.representativeName} onChange={e => set('representativeName', e.target.value)} className="h-9 text-sm bg-muted/20" />
        </Field>
        <Field label="Designation">
          <Input id={`designation-${stepNumber}`} placeholder="e.g., Managing Director, CEO" value={form.designation} onChange={e => set('designation', e.target.value)} className="h-9 text-sm bg-muted/20" />
        </Field>
        <div className="grid grid-cols-2 gap-6">
          <Field label="Contact Number">
            <Input id={`contact-phone-${stepNumber}`} placeholder="+91 XXXXXXXXXX" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} className="h-9 text-sm bg-muted/20" />
          </Field>
          <Field label="Email Address">
            <Input id={`contact-email-${stepNumber}`} type="email" placeholder="email@example.com" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} className="h-9 text-sm bg-muted/20" />
          </Field>
        </div>
        <div className="border-t pt-4 flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
            <Plus className="h-4 w-4" />
            <span className="text-sm">Additional Contacts</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
        </div>
      </div>
    </div>
  )

  const renderVisionPlan = (stepNumber: number) => (
    <div className="h-full flex flex-col pb-2">
      <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-2 mb-1 shrink-0">
          <Globe className="h-5 w-5 text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Project Vision & Plan</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4 shrink-0">Describe your project vision, utilization plan, and area allocation</p>
        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Background of the Organization</span>
              <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
            </div>
            <Field label="Background (Optional)"><Textarea placeholder="Provide a brief background of the organization..." value={form.organizationBackground || ''} onChange={e => set('organizationBackground', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} /></Field>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Development Plan / Vision of the Project</span>
              <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
            </div>
            <Field label="Project Vision (Optional)"><Textarea placeholder="Describe the development plan or vision of the project..." value={form.projectVision || ''} onChange={e => set('projectVision', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} /></Field>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Utilization Plan of the Area</span>
              <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
            </div>
            <Field label="Utilization Plan (Optional)"><Textarea placeholder="How do you plan to utilize the allocated area?" value={form.utilizationPlan || ''} onChange={e => set('utilizationPlan', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} /></Field>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Area Allocation by Use Type</span>
              <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
            </div>
            <Field label="Area Allocation (Optional)"><Textarea placeholder="Break down area allocation by use type..." value={form.areaAllocation || ''} onChange={e => set('areaAllocation', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} /></Field>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:w-[60.5vw] max-w-[95vw] sm:max-w-[60.5vw] h-[86.9vh] max-h-[86.9vh] flex flex-col p-6 rounded-xl gap-0">
        <DialogHeader className="pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            New Application
          </DialogTitle>
          <DialogDescription className="text-xs">
            Submit a new land allotment application to APCRDA
          </DialogDescription>
        </DialogHeader>

        {successApp ? (
          <div className="flex flex-col items-center justify-center flex-1 py-8 gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-base">Application Submitted!</p>
              <p className="text-sm text-muted-foreground mt-1">Your application number is</p>
              <Badge className="mt-2 text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/10">{successApp}</Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              The application is now in the <strong>Application</strong> stage and assigned to the Lands Officer for review.
            </p>
            <Button className="mt-2" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden mt-4">
            {/* Top Step indicator */}
            <div className="flex items-start w-full mb-6 shrink-0 px-2">
              {STEPS.map((s, idx) => {
                const done = step > s.id
                const active = step === s.id
                const Icon = s.icon
                return (
                  <div key={s.id} className={cn("flex", idx < STEPS.length - 1 && "flex-1")}>
                    <div className="flex flex-col items-center gap-1.5 shrink-0 w-[45px] sm:w-[55px]">
                      <div className={cn(
                        'h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 flex items-center justify-center transition-all z-10 bg-background',
                        done ? 'bg-primary border-primary text-primary-foreground' :
                          active ? 'border-primary text-primary' :
                            'border-muted-foreground/30 text-muted-foreground'
                      )}>
                        {done ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                      </div>
                      <span className={cn(
                        'text-[9px] sm:text-[10px] font-medium text-center leading-tight',
                        active ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={cn(
                        'h-[2px] flex-1 mx-0.5 sm:mx-1 transition-all mt-3.5 sm:mt-4',
                        done ? 'bg-primary' : 'bg-border'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {step === 1 && renderBasicInfo(1)}
              {step === 2 && renderOrgProfile(2)}
              {step === 3 && renderVisionPlan(3)}

              {/* Step 4: Land Requirements & Project Details */}
              {step === 4 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <h3 className="text-lg font-semibold text-foreground mb-6 shrink-0">Land Requirements & Project Details</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-6">
                        <Field label="Land Extent Requested (Acres)"><Input type="number" placeholder="0.00" value={form.landExtent} onChange={e => set('landExtent', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                        <Field label="Proposed Built-up Area (Sq. Ft.)"><Input type="number" placeholder="0.00" value={form.builtUpArea} onChange={e => set('builtUpArea', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                      </div>
                      <Field label="Proposed Investment (₹ Cr)"><Input type="number" placeholder="0.00" value={form.proposedInvestmentCr} onChange={e => set('proposedInvestmentCr', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4 cursor-pointer group">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-sm font-medium text-foreground">Jobs Breakdown</span>
                          </div>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <div className="grid grid-cols-3 gap-6 mb-6">
                          <Field label="Permanent Employees"><Input type="number" placeholder="0" value={form.permanentEmployees} onChange={e => set('permanentEmployees', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <Field label="Temporary Employees"><Input type="number" placeholder="0" value={form.temporaryEmployees} onChange={e => set('temporaryEmployees', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <Field label="Part-Time Employees"><Input type="number" placeholder="0" value={form.partTimeEmployees} onChange={e => set('partTimeEmployees', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <Field label="Interns"><Input type="number" placeholder="0" value={form.interns} onChange={e => set('interns', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <Field label="Contractual Staff"><Input type="number" placeholder="0" value={form.contractualStaff} onChange={e => set('contractualStaff', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <Field label="Student Capacity (Institutions)"><Input type="number" placeholder="0" value={form.studentCapacity} onChange={e => set('studentCapacity', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                        </div>
                        <div className="rounded-md bg-muted/30 p-3 border border-border/50 text-sm">
                          <span className="text-muted-foreground mr-2">Total Committed Jobs:</span>
                          <span className="font-semibold text-foreground">
                            {
                              (parseInt(form.permanentEmployees || '0') +
                                parseInt(form.temporaryEmployees || '0') +
                                parseInt(form.partTimeEmployees || '0') +
                                parseInt(form.interns || '0') +
                                parseInt(form.contractualStaff || '0')).toLocaleString()
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Timeline */}
              {step === 5 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 shrink-0">
                      <Landmark className="h-5 w-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Development Timeline</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 shrink-0">Construction timeline and 4-year development plan</p>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                      <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                        <span className="text-sm font-medium text-foreground">Construction Timeline & Development Plan</span>
                        <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                      </div>
                      <Field label="Time Required for Construction (Optional)">
                        <Input placeholder="e.g., 24 months" value={form.constructionTimeline} onChange={e => set('constructionTimeline', e.target.value)} className="h-9 text-sm bg-muted/20" />
                      </Field>
                      <div className="space-y-4">
                        <p className="text-sm text-foreground">4-Year Development Plan</p>
                        <div className="grid grid-cols-5 gap-4 items-center">
                          <div /> 
                          <div className="text-center text-sm font-medium text-muted-foreground">Year 1</div>
                          <div className="text-center text-sm font-medium text-muted-foreground">Year 2</div>
                          <div className="text-center text-sm font-medium text-muted-foreground">Year 3</div>
                          <div className="text-center text-sm font-medium text-muted-foreground">Year 4</div>
                          <div className="text-sm text-foreground">Area (Acres)</div>
                          {[0, 1, 2, 3].map(i => (
                            <Input key={`area-${i}`} type="number" placeholder="0" value={form.devPlanArea[i]} onChange={e => { const newArr = [...form.devPlanArea]; newArr[i] = e.target.value; set('devPlanArea', newArr) }} className="h-9 text-sm bg-muted/20" />
                          ))}
                          <div className="text-sm text-foreground">Built-Up (Acres)</div>
                          {[0, 1, 2, 3].map(i => (
                            <Input key={`builtup-${i}`} type="number" placeholder="0" value={form.devPlanBuiltUp[i]} onChange={e => { const newArr = [...form.devPlanBuiltUp]; newArr[i] = e.target.value; set('devPlanBuiltUp', newArr) }} className="h-9 text-sm bg-muted/20" />
                          ))}
                          <div className="text-sm text-foreground">Investment (Cr)</div>
                          {[0, 1, 2, 3].map(i => (
                            <Input key={`invest-${i}`} type="number" placeholder="0" value={form.devPlanInvestment[i]} onChange={e => { const newArr = [...form.devPlanInvestment]; newArr[i] = e.target.value; set('devPlanInvestment', newArr) }} className="h-9 text-sm bg-muted/20" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Similar Facilities */}
              {step === 6 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 shrink-0">
                      <Library className="h-5 w-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Similar Facilities <span className="text-muted-foreground font-normal text-sm">(Optional)</span></h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 shrink-0">Details of similar facilities operated by the organization</p>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                      <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                        <span className="text-sm font-medium text-foreground">Similar Facility Details (Optional, up to 3)</span>
                        <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                      </div>
                      
                      {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-6">
                          <h4 className="text-sm font-medium text-foreground">Facility {i} <span className="text-muted-foreground font-normal">(Optional)</span></h4>
                          <div className="grid grid-cols-3 gap-6">
                            <Field label="Location"><Input placeholder="City, State" value={form[`facility${i}Location` as keyof FormData] as string} onChange={e => set(`facility${i}Location` as keyof FormData, e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                            <Field label="Land Area (Acres)"><Input type="number" placeholder="0" value={form[`facility${i}LandArea` as keyof FormData] as string} onChange={e => set(`facility${i}LandArea` as keyof FormData, e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                            <Field label="Built-Up (SFT)"><Input type="number" placeholder="0" value={form[`facility${i}BuiltUp` as keyof FormData] as string} onChange={e => set(`facility${i}BuiltUp` as keyof FormData, e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                            <Field label="No. of Employees"><Input type="number" placeholder="0" value={form[`facility${i}Employees` as keyof FormData] as string} onChange={e => set(`facility${i}Employees` as keyof FormData, e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                            <Field label="Amount Invested (Cr)"><Input type="number" placeholder="0" value={form[`facility${i}Investment` as keyof FormData] as string} onChange={e => set(`facility${i}Investment` as keyof FormData, e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                            <div />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Funding & Additional Details */}
              {step === 7 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 shrink-0">
                      <Banknote className="h-5 w-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Funding & Additional Details</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 shrink-0">Project funding, special requirements, and joint ventures</p>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Funding Breakup</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <Field label="How will this project be funded? (Optional)"><Textarea placeholder="Describe the funding structure (equity, debt, grants, etc.)..." value={form.projectFunding || ''} onChange={e => set('projectFunding', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} /></Field>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Special Requirements</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <Field label="Special Requirements from APCRDA (Optional)"><Textarea placeholder="Any special requirements from APCRDA..." value={form.specialRequirements || ''} onChange={e => set('specialRequirements', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} /></Field>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Joint Ventures</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <Field label="Joint Ventures (if any) (Optional)"><Textarea placeholder="Details of any joint ventures..." value={form.jointVentures || ''} onChange={e => set('jointVentures', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} /></Field>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: Promoter Details */}
              {step === 8 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 shrink-0">
                      <Users className="h-5 w-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Promoter Details</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 shrink-0">Details of the key promoter or decision maker</p>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Promoter Information</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <Field label="Promoter Name (Optional)"><Input placeholder="Full name" value={form.promoterName} onChange={e => set('promoterName', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <Field label="Contact (Optional)"><Input placeholder="+91 XXXXXXXXXX" value={form.promoterContact} onChange={e => set('promoterContact', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                        </div>
                        
                        <Field label="Background (Optional)"><Textarea placeholder="Professional background..." value={form.promoterBackground || ''} onChange={e => set('promoterBackground', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} /></Field>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <Field label="Qualifications (Optional)"><Input placeholder="Educational qualifications" value={form.promoterQualifications} onChange={e => set('promoterQualifications', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <Field label="Experience (Optional)"><Input placeholder="Years / details of experience" value={form.promoterExperience} onChange={e => set('promoterExperience', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                        </div>
                        
                        <Field label="Role in the Project (Optional)"><Input placeholder="e.g., Managing Director, Chief Promoter" value={form.promoterRole} onChange={e => set('promoterRole', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 9: Significant Developments */}
              {step === 9 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 shrink-0">
                      <TrendingUp className="h-5 w-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Significant Developments</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 shrink-0">Recent or planned significant developments</p>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Development Activities</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {['Expansion', 'Modernization', 'New Product Launch', 'Partnerships', 'Technology Adoption', 'Other'].map(activity => (
                            <div key={activity} className="flex items-center space-x-2 border border-border p-3 rounded-md bg-muted/20">
                              <Checkbox 
                                id={`activity-${activity}`} 
                                checked={form.significantDevelopments.includes(activity)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    set('significantDevelopments', [...form.significantDevelopments, activity])
                                  } else {
                                    set('significantDevelopments', form.significantDevelopments.filter(a => a !== activity))
                                  }
                                }}
                              />
                              <label htmlFor={`activity-${activity}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                {activity}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        <Field label="Details of the Developments (Optional)"><Textarea placeholder="Provide details about the selected developments..." value={form.significantDevelopmentsDetails || ''} onChange={e => set('significantDevelopmentsDetails', e.target.value)} className="text-sm resize-none bg-muted/20" rows={3} /></Field>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 10: Financials */}
              {step === 10 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 shrink-0">
                      <LineChart className="h-5 w-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Financials</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 shrink-0">Comprehensive financial information including historical data and credibility analysis</p>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Financial History (Past 3 Years) - Optional</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <p className="text-sm text-muted-foreground">Provide financial data for the past 3 years if available (can be added later)</p>
                        
                        {[1, 2, 3].map(i => (
                          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-4">
                            <h4 className="text-sm font-medium text-foreground">Year {i}</h4>
                            <div className="grid grid-cols-4 gap-6">
                              <Field label="Year"><Input placeholder={i === 1 ? '2023' : i === 2 ? '2022' : '2021'} value={form[`finYear${i}` as keyof FormData] as string} onChange={e => set(`finYear${i}` as keyof FormData, e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                              <Field label="Net Worth (₹ Cr)"><Input type="number" placeholder="0.00" value={form[`finYear${i}NetWorth` as keyof FormData] as string} onChange={e => set(`finYear${i}NetWorth` as keyof FormData, e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                              <Field label="Turnover (₹ Cr)"><Input type="number" placeholder="0.00" value={form[`finYear${i}Turnover` as keyof FormData] as string} onChange={e => set(`finYear${i}Turnover` as keyof FormData, e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                              <Field label="Profit (₹ Cr)"><Input type="number" placeholder="0.00" value={form[`finYear${i}Profit` as keyof FormData] as string} onChange={e => set(`finYear${i}Profit` as keyof FormData, e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Tax Compliance</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <Field label="GST Number"><Input placeholder="GST Number" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <Field label="PAN Number"><Input placeholder="PAN Number" value={form.panNumber} onChange={e => set('panNumber', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <div className="flex items-start space-x-3 border border-border p-3 rounded-md bg-muted/20">
                            <Checkbox 
                              id="itr-filed" 
                              checked={form.itrFiled}
                              onCheckedChange={(checked) => set('itrFiled', !!checked)}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5">
                              <label htmlFor="itr-filed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                ITR Filed (Last 3 Years)
                              </label>
                              <p className="text-xs text-muted-foreground">Check if Income Tax Returns filed for last 3 years</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Operational Track Record</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <Field label="Years in Operation"><Input type="number" placeholder="0" value={form.yearsInOperation} onChange={e => set('yearsInOperation', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                          <Field label="Number of Projects Completed"><Input type="number" placeholder="0" value={form.projectsCompleted} onChange={e => set('projectsCompleted', e.target.value)} className="h-9 text-sm bg-muted/20" /></Field>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 11: Proposal/DPR Document */}
              {step === 11 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 shrink-0">
                      <FileText className="h-5 w-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Proposal/DPR Document</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 shrink-0">Upload the proposal/DPR document that will be submitted with this application.</p>
                    
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/5 p-12">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-foreground/70" />
                      </div>
                      <Button variant="outline" className="mb-2">Choose File</Button>
                      <p className="text-xs text-muted-foreground">PDF or Word document (Max 10MB)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t mt-4 shrink-0 bg-background">
              <Button variant="ghost" size="sm" onClick={step === 1 ? handleClose : back} disabled={submitting} className="gap-1">
                {step > 1 && <ChevronLeft className="h-3.5 w-3.5" />}
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</span>
                {step < STEPS.length ? (
                  <Button size="sm" onClick={next} className="gap-1">
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSubmit} disabled={submitting} className="gap-1.5">
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
