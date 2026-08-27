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
import { Badge } from '@/components/ui/badge'
import {
  Building2, Briefcase, ChevronRight, ChevronLeft,
  Check, Loader2, Plus, Globe, MapPin, Users
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
  { id: 4, label: 'Land & Details', icon: MapPin },
]

// ---- Types ----

interface FormData {
  // Step 1 – Basic Information
  enquiryName: string
  sector: string
  subSector: string
  organizationName: string
  registeredAddress: string
  // Step 2 – Organization Profile
  representativeName: string
  designation: string
  contactPhone: string
  contactEmail: string
  // Step 3 – Project Vision & Plan
  organizationBackground: string
  projectVision: string
  utilizationPlan: string
  areaAllocation: string
  // Step 4 – Land Requirements & Project Details
  landExtent: string
  builtUpArea: string
  proposedInvestmentCr: string
  permanentEmployees: string
  temporaryEmployees: string
  partTimeEmployees: string
  interns: string
  contractualStaff: string
  studentCapacity: string
}

const INITIAL_FORM: FormData = {
  enquiryName: '', sector: '', subSector: '', organizationName: '', registeredAddress: '',
  representativeName: '', designation: '', contactPhone: '', contactEmail: '',
  organizationBackground: '', projectVision: '', utilizationPlan: '', areaAllocation: '',
  landExtent: '', builtUpArea: '', proposedInvestmentCr: '',
  permanentEmployees: '', temporaryEmployees: '', partTimeEmployees: '',
  interns: '', contractualStaff: '', studentCapacity: '',
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

  const set = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
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
    if (validateStep()) setStep(s => Math.min(s + 1, 4))
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

        {/* Success state */}
        {successApp ? (
          <div className="flex flex-col items-center justify-center flex-1 py-8 gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-base">Application Submitted!</p>
              <p className="text-sm text-muted-foreground mt-1">Your application number is</p>
              <Badge className="mt-2 text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/10">
                {successApp}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              The application is now in the <strong>Application</strong> stage and assigned to the Lands Officer for review.
            </p>
            <Button className="mt-2" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden mt-4">
            {/* Top Step indicator */}
            <div className="flex items-center justify-center gap-0 mb-6 shrink-0 px-4">
              {STEPS.map((s, idx) => {
                const done = step > s.id
                const active = step === s.id
                const Icon = s.icon
                return (
                  <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn(
                        'h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all',
                        done ? 'bg-primary border-primary text-primary-foreground' :
                          active ? 'border-primary text-primary bg-background' :
                            'border-muted-foreground/30 text-muted-foreground bg-background'
                      )}>
                        {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span className={cn('text-xs font-medium w-[80px] text-center leading-tight', active ? 'text-foreground' : 'text-muted-foreground')}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={cn(
                        'h-[2px] w-10 sm:w-16 md:w-24 -mt-6 mx-2 transition-all',
                        done ? 'bg-primary' : 'bg-border'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Field label="Enquiry Name" required>
                      <Input
                        id="enquiry-name"
                        placeholder="Project/Enquiry Name"
                        value={form.enquiryName}
                        onChange={e => set('enquiryName', e.target.value)}
                        className={cn('h-9 text-sm', errors.enquiryName && 'border-destructive')}
                      />
                      {errors.enquiryName && <p className="text-[11px] text-destructive">{errors.enquiryName}</p>}
                    </Field>

                    <Field label="Sector">
                      <Select value={form.sector} onValueChange={v => set('sector', v)}>
                        <SelectTrigger id="sector" className="h-9 text-sm bg-muted/20">
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTORS.map(s => (
                            <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Field label="Sub-Sector">
                      <Select value={form.subSector} onValueChange={v => set('subSector', v)}>
                        <SelectTrigger id="subsector" className="h-9 text-sm bg-muted/20">
                          <SelectValue placeholder={form.sector ? "Select sub-sector" : "Select sector first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {SUB_SECTORS.map(s => (
                            <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <Field label="Applicant/Company Name" required>
                    <Input
                      id="org-name"
                      placeholder="Full legal name"
                      value={form.organizationName}
                      onChange={e => set('organizationName', e.target.value)}
                      className={cn('h-9 text-sm', errors.organizationName && 'border-destructive')}
                    />
                    {errors.organizationName && <p className="text-[11px] text-destructive">{errors.organizationName}</p>}
                  </Field>

                  <Field label="Registered Address">
                    <Textarea
                      id="registered-address"
                      placeholder="Complete registered address"
                      value={form.registeredAddress}
                      onChange={e => set('registeredAddress', e.target.value)}
                      className="text-sm resize-none bg-muted/20"
                      rows={3}
                    />
                  </Field>
                </div>
              )}

              {/* Step 2: Organization Profile */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Organization Profile Card */}
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

                  {/* Representative Details Card */}
                  <div className="rounded-lg border border-border bg-card p-5 space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">Representative Details</h3>

                    <Field label="Representative Name">
                      <Input
                        id="rep-name"
                        placeholder="Contact person name"
                        value={form.representativeName}
                        onChange={e => set('representativeName', e.target.value)}
                        className="h-9 text-sm bg-muted/20"
                      />
                    </Field>

                    <Field label="Designation">
                      <Input
                        id="designation"
                        placeholder="e.g., Managing Director, CEO"
                        value={form.designation}
                        onChange={e => set('designation', e.target.value)}
                        className="h-9 text-sm bg-muted/20"
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-6">
                      <Field label="Contact Number">
                        <Input
                          id="contact-phone"
                          placeholder="+91 XXXXXXXXXX"
                          value={form.contactPhone}
                          onChange={e => set('contactPhone', e.target.value)}
                          className="h-9 text-sm bg-muted/20"
                        />
                      </Field>
                      <Field label="Email Address">
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="email@example.com"
                          value={form.contactEmail}
                          onChange={e => set('contactEmail', e.target.value)}
                          className="h-9 text-sm bg-muted/20"
                        />
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
              )}

              {/* Step 3: Project Vision & Plan */}
              {step === 3 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 shrink-0">
                      <Globe className="h-5 w-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Project Vision & Plan</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 shrink-0">Describe your project vision, utilization plan, and area allocation</p>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                      {/* Background */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Background of the Organization</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <Field label="Background (Optional)">
                          <Textarea
                            id="org-background"
                            placeholder="Provide a brief background of the organization..."
                            value={form.organizationBackground || ''}
                            onChange={e => set('organizationBackground', e.target.value)}
                            className="text-sm resize-none bg-muted/20"
                            rows={3}
                          />
                        </Field>
                      </div>

                      {/* Vision */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Development Plan / Vision of the Project</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <Field label="Project Vision (Optional)">
                          <Textarea
                            id="project-vision"
                            placeholder="Describe the development plan or vision of the project..."
                            value={form.projectVision || ''}
                            onChange={e => set('projectVision', e.target.value)}
                            className="text-sm resize-none bg-muted/20"
                            rows={3}
                          />
                        </Field>
                      </div>

                      {/* Utilization Plan */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Utilization Plan of the Area</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <Field label="Utilization Plan (Optional)">
                          <Textarea
                            id="utilization-plan"
                            placeholder="How do you plan to utilize the allocated area?"
                            value={form.utilizationPlan || ''}
                            onChange={e => set('utilizationPlan', e.target.value)}
                            className="text-sm resize-none bg-muted/20"
                            rows={3}
                          />
                        </Field>
                      </div>

                      {/* Area Allocation */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 cursor-pointer group">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Area Allocation by Use Type</span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                        <Field label="Area Allocation (Optional)">
                          <Textarea
                            id="area-allocation"
                            placeholder="Break down area allocation by use type (e.g., manufacturing, office, warehouse, green space)..."
                            value={form.areaAllocation || ''}
                            onChange={e => set('areaAllocation', e.target.value)}
                            className="text-sm resize-none bg-muted/20"
                            rows={3}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Land Requirements & Project Details */}
              {step === 4 && (
                <div className="h-full flex flex-col pb-2">
                  <div className="rounded-lg border border-border bg-card p-5 flex flex-col flex-1 overflow-hidden">
                    <h3 className="text-lg font-semibold text-foreground mb-6 shrink-0">Land Requirements & Project Details</h3>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-6">
                        <Field label="Land Extent Requested (Acres)">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={form.landExtent}
                            onChange={e => set('landExtent', e.target.value)}
                            className="h-9 text-sm bg-muted/20"
                          />
                        </Field>
                        <Field label="Proposed Built-up Area (Sq. Ft.)">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={form.builtUpArea}
                            onChange={e => set('builtUpArea', e.target.value)}
                            className="h-9 text-sm bg-muted/20"
                          />
                        </Field>
                      </div>

                      <Field label="Proposed Investment (₹ Cr)">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={form.proposedInvestmentCr}
                          onChange={e => set('proposedInvestmentCr', e.target.value)}
                          className="h-9 text-sm bg-muted/20"
                        />
                      </Field>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4 cursor-pointer group">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-sm font-medium text-foreground">Jobs Breakdown</span>
                          </div>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-6">
                          <Field label="Permanent Employees">
                            <Input type="number" placeholder="0" value={form.permanentEmployees} onChange={e => set('permanentEmployees', e.target.value)} className="h-9 text-sm bg-muted/20" />
                          </Field>
                          <Field label="Temporary Employees">
                            <Input type="number" placeholder="0" value={form.temporaryEmployees} onChange={e => set('temporaryEmployees', e.target.value)} className="h-9 text-sm bg-muted/20" />
                          </Field>
                          <Field label="Part-Time Employees">
                            <Input type="number" placeholder="0" value={form.partTimeEmployees} onChange={e => set('partTimeEmployees', e.target.value)} className="h-9 text-sm bg-muted/20" />
                          </Field>
                          <Field label="Interns">
                            <Input type="number" placeholder="0" value={form.interns} onChange={e => set('interns', e.target.value)} className="h-9 text-sm bg-muted/20" />
                          </Field>
                          <Field label="Contractual Staff">
                            <Input type="number" placeholder="0" value={form.contractualStaff} onChange={e => set('contractualStaff', e.target.value)} className="h-9 text-sm bg-muted/20" />
                          </Field>
                          <Field label="Student Capacity (Institutions)">
                            <Input type="number" placeholder="0" value={form.studentCapacity} onChange={e => set('studentCapacity', e.target.value)} className="h-9 text-sm bg-muted/20" />
                          </Field>
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
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t mt-4 shrink-0 bg-background">
              <Button
                variant="ghost"
                size="sm"
                onClick={step === 1 ? handleClose : back}
                disabled={submitting}
                className="gap-1"
              >
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
