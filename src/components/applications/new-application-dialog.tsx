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
  Building2, User, Briefcase, ChevronRight, ChevronLeft,
  Check, Loader2, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---- Constants ----

const ENTITY_TYPES = [
  'Individual', 'Proprietorship', 'Partnership', 'LLP', 'Trust',
  'Society', 'Pvt Ltd', 'Public Ltd', 'PSU', 'Govt Dept', 'Semi-Govt', 'Consortium',
]

const SECTORS = [
  'IT & ITES', 'Real Estate', 'Healthcare', 'Education',
  'Hospitality & Tourism', 'Manufacturing', 'Financial Services', 'Retail',
  'Logistics', 'Energy', 'Agriculture', 'Media & Entertainment',
]

const PRIORITIES = ['Low', 'Normal', 'High', 'Critical']

// ---- Steps ----

const STEPS = [
  { id: 1, label: 'Applicant', icon: Building2 },
  { id: 2, label: 'Project', icon: Briefcase },
  { id: 3, label: 'Contact', icon: User },
]

// ---- Types ----

interface FormData {
  // Step 1 – Applicant
  organizationName: string
  entityType: string
  // Step 2 – Project
  projectName: string
  sector: string
  proposedInvestment: string
  employmentCommitment: string
  projectDescription: string
  developmentTimeline: string
  intendedLandUse: string
  priority: string
  // Step 3 – Contact
  contactPerson: string
  contactPhone: string
  contactEmail: string
}

const INITIAL_FORM: FormData = {
  organizationName: '', entityType: '',
  projectName: '', sector: '', proposedInvestment: '', employmentCommitment: '',
  projectDescription: '', developmentTimeline: '', intendedLandUse: '', priority: 'Normal',
  contactPerson: '', contactPhone: '', contactEmail: '',
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
      if (!form.organizationName.trim()) newErrors.organizationName = 'Required'
      if (!form.entityType) newErrors.entityType = 'Required'
    }
    if (step === 2) {
      if (!form.projectName.trim()) newErrors.projectName = 'Required'
      if (!form.sector) newErrors.sector = 'Required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const next = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 3))
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
      <DialogContent className="max-w-3xl flex flex-col min-h-[550px]">
        <DialogHeader>
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
          <div className="flex flex-col flex-1">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-0 mb-6 shrink-0">
              {STEPS.map((s, idx) => {
                const done = step > s.id
                const active = step === s.id
                const Icon = s.icon
                return (
                  <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                        done ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                      )}>
                        {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={cn('text-[10px] font-medium', active ? 'text-primary' : 'text-muted-foreground')}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={cn(
                        'h-px w-16 mb-4 mx-2 transition-all',
                        done ? 'bg-emerald-500' : 'bg-border',
                      )} />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto px-1">
              {/* Step 1: Applicant */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Organisation / Applicant Name" required>
                    <Input
                      id="org-name"
                      placeholder="e.g. Sunrise Techpark Pvt Ltd"
                      value={form.organizationName}
                      onChange={e => set('organizationName', e.target.value)}
                      className={cn('h-9 text-sm', errors.organizationName && 'border-destructive')}
                    />
                    {errors.organizationName && <p className="text-[11px] text-destructive">{errors.organizationName}</p>}
                  </Field>

                  <Field label="Entity Type" required>
                    <Select value={form.entityType} onValueChange={v => set('entityType', v)}>
                      <SelectTrigger id="entity-type" className={cn('h-9 text-sm', errors.entityType && 'border-destructive')}>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENTITY_TYPES.map(t => (
                          <SelectItem key={t} value={t} className="text-sm">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.entityType && <p className="text-[11px] text-destructive">{errors.entityType}</p>}
                  </Field>
                </div>
              )}

              {/* Step 2: Project */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <Field label="Project Name" required>
                      <Input
                        id="project-name"
                        placeholder="e.g. Sunrise IT Park Phase 1"
                        value={form.projectName}
                        onChange={e => set('projectName', e.target.value)}
                        className={cn('h-9 text-sm', errors.projectName && 'border-destructive')}
                      />
                      {errors.projectName && <p className="text-[11px] text-destructive">{errors.projectName}</p>}
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Sector" required>
                        <Select value={form.sector} onValueChange={v => set('sector', v)}>
                          <SelectTrigger id="sector" className={cn('h-9 text-sm', errors.sector && 'border-destructive')}>
                            <SelectValue placeholder="Select sector" />
                          </SelectTrigger>
                          <SelectContent>
                            {SECTORS.map(s => (
                              <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.sector && <p className="text-[11px] text-destructive">{errors.sector}</p>}
                      </Field>

                      <Field label="Priority">
                        <Select value={form.priority} onValueChange={v => set('priority', v)}>
                          <SelectTrigger id="priority" className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map(p => (
                              <SelectItem key={p} value={p} className="text-sm">{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Field label="Proposed Investment (₹)">
                      <Input
                        id="investment"
                        type="number"
                        placeholder="e.g. 50000000"
                        value={form.proposedInvestment}
                        onChange={e => set('proposedInvestment', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </Field>
                    <Field label="Employment Commitment">
                      <Input
                        id="employment"
                        type="number"
                        placeholder="e.g. 500"
                        value={form.employmentCommitment}
                        onChange={e => set('employmentCommitment', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Field label="Development Timeline">
                      <Input
                        id="timeline"
                        placeholder="e.g. 3 years"
                        value={form.developmentTimeline}
                        onChange={e => set('developmentTimeline', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </Field>
                    <Field label="Intended Land Use">
                      <Input
                        id="land-use"
                        placeholder="e.g. IT Park, Mixed Use"
                        value={form.intendedLandUse}
                        onChange={e => set('intendedLandUse', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </Field>
                  </div>

                  <Field label="Project Description">
                    <Textarea
                      id="description"
                      placeholder="Brief description of the project..."
                      value={form.projectDescription}
                      onChange={e => set('projectDescription', e.target.value)}
                      className="text-sm resize-none"
                      rows={3}
                    />
                  </Field>
                </div>
              )}

              {/* Step 3: Contact */}
              {step === 3 && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Field label="Contact Person">
                      <Input
                        id="contact-person"
                        placeholder="e.g. Rajesh Kumar"
                        value={form.contactPerson}
                        onChange={e => set('contactPerson', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </Field>
                    <Field label="Phone Number">
                      <Input
                        id="contact-phone"
                        placeholder="e.g. +91-9876543210"
                        value={form.contactPhone}
                        onChange={e => set('contactPhone', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </Field>
                    <Field label="Email Address">
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="e.g. contact@company.in"
                        value={form.contactEmail}
                        onChange={e => set('contactEmail', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </Field>
                  </div>

                  {/* Summary card */}
                  <div>
                    <div className="rounded-lg border bg-muted/40 p-4 space-y-2 h-full flex flex-col">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 shrink-0">Summary</p>
                      <div className="space-y-2 flex-1">
                        <SummaryRow label="Organisation" value={form.organizationName} />
                        <SummaryRow label="Entity" value={form.entityType} />
                        <SummaryRow label="Project" value={form.projectName} />
                        <SummaryRow label="Sector" value={form.sector} />
                        <SummaryRow label="Priority" value={form.priority} />
                        {form.proposedInvestment && (
                          <SummaryRow label="Investment" value={`₹${parseFloat(form.proposedInvestment).toLocaleString('en-IN')}`} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 border-t mt-2">
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
