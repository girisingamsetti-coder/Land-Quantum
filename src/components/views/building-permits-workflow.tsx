'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, FileText, UploadCloud, IndianRupee, MessageSquare, ArrowRight, User, Users, ChevronRight, Activity, ArrowDown, CircleDot } from 'lucide-react'

// Define the steps of the workflow
const workflowSteps = [
  {
    id: 'step-1',
    title: 'LTP Initiates Application',
    actor: 'Licensed Technical Personnel (LTP)',
    icon: <User className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    actions: [
      { label: 'Creates new building permit application', status: 'done' },
      { label: 'Uploads Architectural Drawings', status: 'done' }
    ]
  },
  {
    id: 'step-2',
    title: 'Automated Scrutiny',
    actor: 'System',
    icon: <Activity className="w-5 h-5" />,
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700',
    actions: [
      { label: 'Scrutiny Report generated for LTP review', status: 'done' },
      { label: 'If Scrutiny fails, LTP re-uploads drawings', status: 'warning' },
      { label: 'On Pass, LTP uploads required NOCs & documents', status: 'done' }
    ]
  },
  {
    id: 'step-3',
    title: 'Fee Generation & Payment',
    actor: 'System / LTP',
    icon: <IndianRupee className="w-5 h-5" />,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    actions: [
      { label: 'Fees calculated automatically based on Fee Structure', status: 'done' },
      { label: 'Payment completed via Gateway in LTP login', status: 'done' }
    ]
  },
  {
    id: 'step-4',
    title: 'Technical Scrutiny',
    actor: 'Town Planning Associate (TPA)',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
    actions: [
      { label: 'Technical Scrutiny report submitted by TPA', status: 'pending' },
      { label: 'Can raise Document Shortfall or Fee Shortfall', status: 'info' },
      { label: 'Forwards application to ZAD/ZDD', status: 'pending' }
    ]
  },
  {
    id: 'step-5',
    title: 'Zonal Level Review',
    actor: 'ZAD / ZDD',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    actions: [
      { label: 'Reviews application and TPA report', status: 'pending' },
      { label: 'Can raise Shortfall or Approve to next level', status: 'info' }
    ]
  },
  {
    id: 'step-6',
    title: 'Joint Director Review',
    actor: 'Zonal Joint Director (ZJD)',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    actions: [
      { label: 'Can raise Shortfall or Approve', status: 'pending' },
      { label: 'Can raise Fee Shortfall or report to next level', status: 'info' }
    ]
  },
  {
    id: 'step-7',
    title: 'Directorate Review',
    actor: 'Director (DP)',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-800',
    actions: [
      { label: 'Can raise Shortfall or Approve', status: 'pending' },
      { label: 'Shortfall can be raised or reported to next level', status: 'info' }
    ]
  },
  {
    id: 'step-8',
    title: 'Executive Approval',
    actor: 'Additional Commissioner / Commissioner',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary',
    borderColor: 'border-primary/30 dark:border-primary/30',
    actions: [
      { label: 'Additional Commissioner Review & Recommendation', status: 'pending' },
      { label: 'Final Approval by Commissioner', status: 'pending' }
    ]
  }
]

export function BuildingPermitsWorkflow() {
  return (
    <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border">
        <div>
          <h2 className="text-lg font-bold">LTP Login Approval Workflow</h2>
          <p className="text-sm text-muted-foreground mt-1">Standard operating procedure for building permit approvals.</p>
        </div>
        <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium text-foreground shrink-0">
          <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
          SMS Alerts sent at every stage
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto w-full mt-4">
        {/* Vertical Line Connector */}
        <div className="absolute left-[23px] top-4 bottom-10 w-0.5 bg-border z-0 md:left-1/2 md:-ml-[1px]" />

        <div className="flex flex-col gap-6">
          {workflowSteps.map((step, index) => {
            const isEven = index % 2 === 0
            return (
              <div key={step.id} className="relative z-10 flex flex-col md:flex-row items-start gap-4 md:gap-8 group">
                
                {/* Desktop Left Side (Empty or Content) */}
                <div className={`hidden md:flex flex-1 ${isEven ? 'justify-end text-right' : 'order-last'}`}>
                  {isEven && (
                    <div className="pt-2 pr-4">
                      <h3 className="font-semibold text-base">{step.title}</h3>
                      <p className="text-xs text-muted-foreground font-medium flex items-center justify-end gap-1.5 mt-1">
                        {step.actor}
                      </p>
                    </div>
                  )}
                </div>

                {/* Center Icon */}
                <div className={`shrink-0 w-12 h-12 rounded-full border-4 border-background flex items-center justify-center shadow-sm ${step.color} md:order-none ${isEven ? 'md:mr-0' : 'md:ml-0'} transition-transform group-hover:scale-110 duration-300`}>
                  {step.icon}
                </div>

                {/* Right Side (Content for mobile, alternating for desktop) */}
                <div className={`flex-1 w-full ${!isEven ? 'md:order-none' : ''}`}>
                  <Card className={`border shadow-sm transition-all hover:shadow-md ${step.borderColor}`}>
                    <CardHeader className="p-4 pb-2 md:hidden">
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <p className="text-xs text-muted-foreground font-medium">{step.actor}</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 md:pt-4">
                      {/* Desktop Title for Odd Items */}
                      {!isEven && (
                        <div className="hidden md:block mb-3 pb-2 border-b border-border/50">
                          <h3 className="font-semibold text-base">{step.title}</h3>
                          <p className="text-xs text-muted-foreground font-medium">{step.actor}</p>
                        </div>
                      )}
                      
                      <ul className="space-y-2.5">
                        {step.actions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm leading-tight">
                            {action.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                            {action.status === 'pending' && <CircleDot className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                            {action.status === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                            {action.status === 'info' && <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                            <span className={action.status === 'pending' ? 'text-muted-foreground' : 'text-foreground/90'}>
                              {action.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
