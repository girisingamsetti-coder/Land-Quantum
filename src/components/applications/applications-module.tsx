'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApplicationsList } from './applications-list'
import { MyWorkQueue, CancellationsView } from '@/components/views/simple-views'
import { WorkflowKanban } from '@/components/views/index-kanban'

export function ApplicationsModule() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-sm text-muted-foreground">
          Manage all land allotment applications, view your personal work queue, and track workflow stages.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0">
          <TabsList>
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="queue">My Work Queue</TabsTrigger>
            <TabsTrigger value="kanban">Workflow Board</TabsTrigger>
            <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden mt-4">
          <TabsContent value="all" className="h-full m-0 overflow-y-auto pr-2 pb-8">
            <ApplicationsList hideHeader />
          </TabsContent>

          <TabsContent value="queue" className="h-full m-0 overflow-y-auto pr-2 pb-8">
            <MyWorkQueue hideHeader />
          </TabsContent>

          <TabsContent value="kanban" className="h-full m-0 overflow-hidden pb-4">
            <WorkflowKanban hideHeader />
          </TabsContent>

          <TabsContent value="cancellations" className="h-full m-0 overflow-y-auto pr-2 pb-8">
            <CancellationsView hideHeader />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
