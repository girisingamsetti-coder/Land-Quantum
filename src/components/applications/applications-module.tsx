'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { LayoutGrid, Inbox, Kanban, Ban, Search, X } from 'lucide-react'
import { ApplicationsList } from './applications-list'
import { NewApplicationDialog } from './new-application-dialog'
import { MyWorkQueue, CancellationsView } from '@/components/views/simple-views'
import { WorkflowKanban } from '@/components/views/index-kanban'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
const STATUS_OPTIONS = ['All', 'Draft', 'Submitted', 'Under Review', 'Clarification Required', 'Approved', 'Rejected', 'Deferred', 'Withdrawn', 'Cancelled', 'Completed']
const STAGE_OPTIONS = [
  'All', 'Application', 'Eligibility', 'DPR Review', 'Economic Review', 'LASC',
  'GoM', 'Cabinet Sub-Committee', 'Authority Approval', 'Cabinet Approval',
  'Government Order', 'LOI', 'Payment', 'Revised DPR', 'Agreement',
  'Possession', 'Building Permission', 'Construction', 'Compliance',
]
const SECTOR_OPTIONS = [
  'All Sectors', 'Commercial', 'Education', 'Financial Institutions',
  'Food Processing', 'Government Organisations', 'Healthcare', 'Hospitality',
  'IT/ITES', 'Industrial', 'Logistics', 'NGOs', 'Others',
  'Pharmaceutical', 'Political Parties', 'Sports', 'Textiles',
]

export function ApplicationsModule() {
  const [activeTab, setActiveTab] = useState('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [listKey, setListKey] = useState(0)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('All')
  const [stage, setStage] = useState('All')
  const [sector, setSector] = useState('All Sectors')

  const handleSearch = () => {
    setSearch(searchInput)
  }

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatus('All')
    setStage('All')
    setSector('All Sectors')
  }

  const hasFilters = searchInput.trim() !== '' || search.trim() !== '' || status !== 'All' || stage !== 'All' || (sector !== 'All' && sector !== 'All Sectors')

  const handleCreated = () => {
    // Refresh the applications list
    setListKey(k => k + 1)
  }

  const filterUI = (
    <Card className="p-1.5 border shadow-sm mb-2 mt-2">
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-between">
        <div className="relative w-full sm:flex-1 mr-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8 h-8 text-xs bg-white w-full" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[120px] h-8 text-xs bg-white" data-active={status !== 'All'}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s === 'All' ? 'Status' : s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-white" data-active={stage !== 'All'}>
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              {STAGE_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s === 'All' ? 'Stage' : s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-white" data-active={sector !== 'All' && sector !== 'All Sectors'}>
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              {SECTOR_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground px-2" onClick={resetFilters}>
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="flex-1 w-full flex flex-col space-y-1">
      <div className="flex flex-col gap-0 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground hidden lg:block">
            Manage all land allotment applications, view your personal work queue, and track workflow stages.
          </p>
          <div className="flex items-center justify-end ml-auto">
            <Button
              size="sm"
              className="gap-1.5 shrink-0 h-8 text-xs"
              onClick={() => setShowNewDialog(true)}
            >
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col gap-0 overflow-hidden">
        <TabsList className="flex items-center gap-1.5 sm:gap-2 bg-transparent p-0 w-full justify-start border-b pb-1.5 mb-2.5 rounded-none h-auto overflow-x-auto scrollbar-none flex-nowrap">
          <TabsTrigger value="all" className="shrink-0 border border-slate-200/60 bg-white/60 data-[state=active]:bg-white data-[state=active]:border-slate-300 data-[state=active]:shadow-md rounded-md px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold h-[36px] sm:h-[38px] shadow-sm transition-all text-slate-500 hover:text-slate-900">
            <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-500 shrink-0" /> <span>All Applications</span>
          </TabsTrigger>
          <TabsTrigger value="queue" className="shrink-0 border border-slate-200/60 bg-white/60 data-[state=active]:bg-white data-[state=active]:border-slate-300 data-[state=active]:shadow-md rounded-md px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold h-[36px] sm:h-[38px] shadow-sm transition-all text-slate-500 hover:text-slate-900">
            <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-500 shrink-0" /> <span>Work Queue</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="shrink-0 border border-slate-200/60 bg-white/60 data-[state=active]:bg-white data-[state=active]:border-slate-300 data-[state=active]:shadow-md rounded-md px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold h-[36px] sm:h-[38px] shadow-sm transition-all text-slate-500 hover:text-slate-900">
            <Kanban className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-amber-500 shrink-0" /> <span>Stage View</span>
          </TabsTrigger>
          <TabsTrigger value="cancellations" className="shrink-0 border border-slate-200/60 bg-white/60 data-[state=active]:bg-white data-[state=active]:border-slate-300 data-[state=active]:shadow-md rounded-md px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold h-[36px] sm:h-[38px] shadow-sm transition-all text-slate-500 hover:text-slate-900">
            <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-purple-500 shrink-0" /> <span>Cancellations</span>
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 flex flex-col min-h-0 mt-0">
          <TabsContent value="all" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden min-h-0 ${activeTab !== 'all' ? 'hidden' : ''}`}>
            <ApplicationsList key={listKey} hideHeader search={search} status={status} stage={stage} sector={sector} filterNode={filterUI} />
          </TabsContent>

          <TabsContent value="queue" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden min-h-0 ${activeTab !== 'queue' ? 'hidden' : ''}`}>
            <ApplicationsList key={`queue-${listKey}`} viewType="queue" hideHeader search={search} status={status} stage={stage} sector={sector} filterNode={filterUI} />
          </TabsContent>

          <TabsContent value="kanban" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden min-h-0 pb-2 ${activeTab !== 'kanban' ? 'hidden' : ''}`}>
            <WorkflowKanban hideHeader />
          </TabsContent>

          <TabsContent value="cancellations" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden min-h-0 ${activeTab !== 'cancellations' ? 'hidden' : ''}`}>
            <ApplicationsList key={`cancellations-${listKey}`} viewType="cancellations" hideHeader search={search} status={status} stage={stage} sector={sector} filterNode={filterUI} />
          </TabsContent>
        </div>
      </Tabs>

      <NewApplicationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onCreated={handleCreated}
      />
    </div>
  )
}

