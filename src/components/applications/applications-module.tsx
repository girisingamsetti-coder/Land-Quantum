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
    <div className="flex-1 w-full flex flex-col space-y-1 p-4 md:p-6 pb-0 md:pb-0 bg-muted/30 pt-4">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground hidden lg:block">
            Manage all land allotment applications, view your personal work queue, and track workflow stages.
          </p>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <div className="relative w-40">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 h-8 text-xs bg-white" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
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
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50 hover:border-red-300" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}

            <Button
              size="sm"
              className="gap-1.5 shrink-0 h-8 text-xs ml-2"
              onClick={() => setShowNewDialog(true)}
            >
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col gap-0 overflow-hidden">
        <TabsList className="flex items-center gap-2 bg-transparent p-0 w-full justify-start border-b pb-1 mb-0 rounded-none h-auto">
          <TabsTrigger value="all" className="border bg-gradient-to-l from-blue-50 to-white/50 rounded-md px-4 py-1.5 text-sm font-bold h-[38px] shadow-sm transition-all text-slate-600 hover:text-foreground">
            <LayoutGrid className="w-4 h-4 mr-2 text-blue-600" /> <b>All Applications</b>
          </TabsTrigger>
          <TabsTrigger value="queue" className="border bg-gradient-to-l from-emerald-50 to-white/50 rounded-md px-4 py-1.5 text-sm font-bold h-[38px] shadow-sm transition-all text-slate-600 hover:text-foreground">
            <Inbox className="w-4 h-4 mr-2 text-emerald-600" /> <b>Work Queue</b>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="border bg-gradient-to-l from-amber-50 to-white/50 rounded-md px-4 py-1.5 text-sm font-bold h-[38px] shadow-sm transition-all text-slate-600 hover:text-foreground">
            <Kanban className="w-4 h-4 mr-2 text-amber-600" /> <b>Stage View</b>
          </TabsTrigger>
          <TabsTrigger value="cancellations" className="border bg-gradient-to-l from-purple-50 to-white/50 rounded-md px-4 py-1.5 text-sm font-bold h-[38px] shadow-sm transition-all text-slate-600 hover:text-foreground">
            <Ban className="w-4 h-4 mr-2 text-purple-600" /> <b>Cancellations</b>
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-hidden mt-0">
          <TabsContent value="all" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden ${activeTab !== 'all' ? 'hidden' : ''}`}>
            <ApplicationsList key={listKey} hideHeader search={search} status={status} stage={stage} sector={sector} />
          </TabsContent>

          <TabsContent value="queue" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden ${activeTab !== 'queue' ? 'hidden' : ''}`}>
            <ApplicationsList key={`queue-${listKey}`} viewType="queue" hideHeader search={search} status={status} stage={stage} sector={sector} />
          </TabsContent>

          <TabsContent value="kanban" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden pb-2 ${activeTab !== 'kanban' ? 'hidden' : ''}`}>
            <WorkflowKanban hideHeader />
          </TabsContent>

          <TabsContent value="cancellations" forceMount className={`flex-1 w-full flex flex-col m-0 overflow-hidden ${activeTab !== 'cancellations' ? 'hidden' : ''}`}>
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

