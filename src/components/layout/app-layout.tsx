'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarRail, SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, FileText, MapPin, CreditCard, HardHat, AlertTriangle,
  Users, Building2, LogOut, Bell, ChevronDown, KanbanSquare, BarChart3,
  Shield, Settings, ScrollText, Map, ClipboardList, MessageSquare,
} from 'lucide-react'

interface AppLayoutProps { children: React.ReactNode }

export type View =
  | 'dashboard' | 'applications' | 'application-detail' | 'workflow-kanban'
  | 'land-parcels' | 'payments' | 'constructions' | 'grievances'
  | 'cancellations' | 'reports' | 'audit-log' | 'notifications'
  | 'users' | 'roles' | 'departments' | 'settings' | 'gis'
  | 'my-work-queue' | 'risk-alerts'

interface LayoutContextType {
  view: View
  setView: (v: View) => void
  viewParams: Record<string, string>
  setViewParams: (p: Record<string, string>) => void
  navigateTo: (view: View, params?: Record<string, string>) => void
  unreadNotifications: number
  setUnreadNotifications: (n: number) => void
}

export const LayoutContext = React.createContext<LayoutContextType>({
  view: 'dashboard', setView: () => {}, viewParams: {}, setViewParams: () => {},
  navigateTo: () => {}, unreadNotifications: 0, setUnreadNotifications: () => {},
})

export { type View }

interface NavItem {
  view: View; label: string; icon: React.ComponentType<{ className?: string }>
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { view: 'my-work-queue', label: 'My Work Queue', icon: ClipboardList },
    ],
  },
  {
    label: 'Applications',
    items: [
      { view: 'applications', label: 'All Applications', icon: FileText },
      { view: 'workflow-kanban', label: 'Workflow Board', icon: KanbanSquare },
      { view: 'cancellations', label: 'Cancellations', icon: ScrollText },
    ],
  },
  {
    label: 'Land & Assets',
    items: [
      { view: 'land-parcels', label: 'Land Inventory', icon: MapPin },
      { view: 'gis', label: 'GIS Map', icon: Map },
    ],
  },
  {
    label: 'Projects',
    items: [
      { view: 'constructions', label: 'Construction', icon: HardHat },
    ],
  },
  {
    label: 'Finance',
    items: [
      { view: 'payments', label: 'Payments', icon: CreditCard },
    ],
  },
  {
    label: 'Services',
    items: [
      { view: 'grievances', label: 'Grievances', icon: MessageSquare },
      { view: 'risk-alerts', label: 'Risk & Alerts', icon: AlertTriangle },
    ],
  },
  {
    label: 'System',
    items: [
      { view: 'users', label: 'Users', icon: Users },
      { view: 'departments', label: 'Departments', icon: Building2 },
      { view: 'reports', label: 'Reports', icon: BarChart3 },
      { view: 'audit-log', label: 'Audit Trail', icon: Shield },
      { view: 'notifications', label: 'Notifications', icon: Bell },
      { view: 'settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, meta } = useAuthStore()
  const [view, setView] = useState<View>('dashboard')
  const [viewParams, setViewParams] = useState<Record<string, string>>({})
  const [unreadNotifications, setUnreadNotifications] = useState(meta?.unreadNotifications ?? 0)

  const navigateTo = (v: View, params?: Record<string, string>) => {
    setView(v)
    if (params) setViewParams(params)
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const viewLabel = view
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <LayoutContext.Provider value={{ view, setView, viewParams, setViewParams, navigateTo, unreadNotifications, setUnreadNotifications }}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-3 pt-4 pb-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="gap-3 rounded-lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Building2 className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="text-sm font-semibold tracking-tight">APCRDA</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Land Portal</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarSeparator className="mx-3" />
          <SidebarContent className="gap-0 px-2 py-1">
            {navGroups.map((group, gi) => (
              <React.Fragment key={group.label}>
                <SidebarGroup>
                  <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-sidebar-group-foreground px-2">
                    {group.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const isActive = view === item.view ||
                          (view === 'application-detail' && item.view === 'applications')
                        return (
                          <SidebarMenuItem key={item.view}>
                            <SidebarMenuButton
                              isActive={isActive}
                              tooltip={item.label}
                              onClick={() => setView(item.view)}
                              className="rounded-md"
                            >
                              <item.icon className="size-4" />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                {gi < navGroups.length - 1 && (
                  <div className="mx-3 my-1 border-t border-border/50" />
                )}
              </React.Fragment>
            ))}
          </SidebarContent>
          <SidebarFooter className="gap-1.5">
            <div className="mx-2">
              <Badge variant="outline" className="w-full justify-center text-[10px] font-medium border-primary/20 text-primary/70 bg-primary/5 hover:bg-primary/5">
                DEMO ENVIRONMENT
              </Badge>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="gap-3 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="text-sm font-medium truncate max-w-[140px]">{user?.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">{user?.role.name}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-5">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold tracking-tight truncate">
                {viewLabel}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setView('notifications')}
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white ring-2 ring-card">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-9 px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[11px] font-medium bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm max-w-[120px] truncate">{user?.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2.5 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    {user?.designation && (
                      <Badge variant="secondary" className="mt-1.5 text-[10px] font-medium">{user.designation}</Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setView('settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/30">
            {children}
          </main>
          <footer className="border-t px-4 py-2.5 bg-card text-center text-[11px] text-muted-foreground">
            APCRDA Land Allotment & Development Management Portal — Demo Environment
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </LayoutContext.Provider>
  )
}

export function useAppLayout() { return React.useContext(LayoutContext) }
