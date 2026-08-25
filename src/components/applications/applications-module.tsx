'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ApplicationsList } from './applications-list'
import { NewApplicationDialog } from './new-application-dialog'
import { MyWorkQueue, CancellationsView } from '@/components/views/simple-views'
import { WorkflowKanban } from '@/components/views/index-kanban'

export function ApplicationsModule() {
  const [activeTab, setActiveTab] = useState('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [listKey, setListKey] = useState(0)

  const handleCreated = () => {
    // Refresh the applications list
    setListKey(k => k + 1)
  }

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex items-start justify-between gap-2 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">
            Manage all land allotment applications, view your personal work queue, and track workflow stages.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0 mt-1"
          onClick={() => setShowNewDialog(true)}
        >
          <Plus className="h-4 w-4" />
          New Application
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden mt-0">
          <TabsContent value="all" forceMount className={`h-full m-0 overflow-y-auto pr-2 pb-8 ${activeTab !== 'all' ? 'hidden' : ''}`}>
            <ApplicationsList key={listKey} hideHeader tabsControl={
              <TabsList>
                <TabsTrigger value="all">All Applications</TabsTrigger>
                <TabsTrigger value="queue">Work Queue</TabsTrigger>
                <TabsTrigger value="kanban">Stage View</TabsTrigger>
                <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
              </TabsList>
            } />
          </TabsContent>

          <TabsContent value="queue" forceMount className={`h-full m-0 overflow-y-auto pr-2 pb-8 ${activeTab !== 'queue' ? 'hidden' : ''}`}>
            <MyWorkQueue hideHeader tabsControl={
              <TabsList>
                <TabsTrigger value="all">All Applications</TabsTrigger>
                <TabsTrigger value="queue">Work Queue</TabsTrigger>
                <TabsTrigger value="kanban">Stage View</TabsTrigger>
                <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
              </TabsList>
            } />
          </TabsContent>

          <TabsContent value="kanban" forceMount className={`h-full m-0 overflow-hidden pb-4 ${activeTab !== 'kanban' ? 'hidden' : ''}`}>
            <WorkflowKanban hideHeader tabsControl={
              <TabsList>
                <TabsTrigger value="all">All Applications</TabsTrigger>
                <TabsTrigger value="queue">Work Queue</TabsTrigger>
                <TabsTrigger value="kanban">Stage View</TabsTrigger>
                <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
              </TabsList>
            } />
          </TabsContent>

          <TabsContent value="cancellations" forceMount className={`h-full m-0 overflow-y-auto pr-2 pb-8 ${activeTab !== 'cancellations' ? 'hidden' : ''}`}>
            <CancellationsView hideHeader tabsControl={
              <TabsList>
                <TabsTrigger value="all">All Applications</TabsTrigger>
                <TabsTrigger value="queue">Work Queue</TabsTrigger>
                <TabsTrigger value="kanban">Stage View</TabsTrigger>
                <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
              </TabsList>
            } />
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

