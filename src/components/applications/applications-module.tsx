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
  'All', 'IT & ITES', 'Real Estate', 'Healthcare', 'Education',
  'Hospitality & Tourism', 'Manufacturing', 'Financial Services', 'Retail',
  'Logistics', 'Energy', 'Agriculture', 'Media & Entertainment',
]

export function ApplicationsModule() {
  const [activeTab, setActiveTab] = useState('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [listKey, setListKey] = useState(0)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('All')
  const [stage, setStage] = useState('All')
  const [sector, setSector] = useState('All')

  const handleSearch = () => {
    setSearch(searchInput)
  }

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatus('All')
    setStage('All')
    setSector('All')
  }

  const hasFilters = searchInput.trim() !== '' || search.trim() !== '' || status !== 'All' || stage !== 'All' || sector !== 'All'

  const handleCreated = () => {
    // Refresh the applications list
    setListKey(k => k + 1)
  }

  return (
    <div className="flex-1 w-full flex flex-col space-y-1 px-2 py-4 md:px-2 pb-0 md:pb-0 bg-muted/30 pt-4">
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

      {/* Filter Toolbar Card */}
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
              <SelectTrigger className="w-[120px] h-8 text-xs bg-white" data-active={sector !== 'All'}>
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTOR_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s === 'All' ? 'Sector' : s}</SelectItem>)}
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col gap-0 overflow-hidden">
        <TabsList className="flex items-center gap-2 bg-transparent p-0 w-full justify-start border-b pb-1 mb-0 rounded-none h-auto">
          <TabsTrigger value="all" className="border border-slate-200/60 bg-white/60 data-[state=active]:bg-white data-[state=active]:border-slate-300 data-[state=active]:shadow-md rounded-md px-4 py-1.5 text-sm font-bold h-[38px] shadow-sm transition-all text-slate-500 hover:text-slate-900">
            <LayoutGrid className="w-4 h-4 mr-2 text-blue-500" /> <b>All Applications</b>
          </TabsTrigger>
          <TabsTrigger value="queue" className="border border-slate-200/60 bg-white/60 data-[state=active]:bg-white data-[state=active]:border-slate-300 data-[state=active]:shadow-md rounded-md px-4 py-1.5 text-sm font-bold h-[38px] shadow-sm transition-all text-slate-500 hover:text-slate-900">
            <Inbox className="w-4 h-4 mr-2 text-emerald-500" /> <b>Work Queue</b>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="border border-slate-200/60 bg-white/60 data-[state=active]:bg-white data-[state=active]:border-slate-300 data-[state=active]:shadow-md rounded-md px-4 py-1.5 text-sm font-bold h-[38px] shadow-sm transition-all text-slate-500 hover:text-slate-900">
            <Kanban className="w-4 h-4 mr-2 text-amber-500" /> <b>Stage View</b>
          </TabsTrigger>
          <TabsTrigger value="cancellations" className="border border-slate-200/60 bg-white/60 data-[state=active]:bg-white data-[state=active]:border-slate-300 data-[state=active]:shadow-md rounded-md px-4 py-1.5 text-sm font-bold h-[38px] shadow-sm transition-all text-slate-500 hover:text-slate-900">
            <Ban className="w-4 h-4 mr-2 text-purple-500" /> <b>Cancellations</b>
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 flex flex-col min-h-0 mt-0">
          <TabsContent value="all" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden min-h-0 ${activeTab !== 'all' ? 'hidden' : ''}`}>
            <ApplicationsList key={listKey} hideHeader search={search} status={status} stage={stage} sector={sector} />
          </TabsContent>

          <TabsContent value="queue" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden min-h-0 ${activeTab !== 'queue' ? 'hidden' : ''}`}>
            <ApplicationsList key={`queue-${listKey}`} viewType="queue" hideHeader search={search} status={status} stage={stage} sector={sector} />
          </TabsContent>

          <TabsContent value="kanban" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden min-h-0 pb-2 ${activeTab !== 'kanban' ? 'hidden' : ''}`}>
            <WorkflowKanban hideHeader />
          </TabsContent>

          <TabsContent value="cancellations" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden min-h-0 ${activeTab !== 'cancellations' ? 'hidden' : ''}`}>
            <ApplicationsList key={`cancellations-${listKey}`} viewType="cancellations" hideHeader search={search} status={status} stage={stage} sector={sector} />
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

