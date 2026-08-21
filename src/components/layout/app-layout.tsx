'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarMenuSub,
  SidebarMenuSubButton, SidebarMenuSubItem,
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
  Shield, Settings, ScrollText, Map, ClipboardList, FolderOpen, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  view: View; label: string; icon: React.ComponentType<{ className?: string }>; children?: { view: View; label: string }[]
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { view: 'my-work-queue', label: 'My Work Queue', icon: ClipboardList },
      { view: 'risk-alerts', label: 'Risk & Alerts', icon: AlertTriangle },
    ],
  },
  {
    label: 'Workflow',
    items: [
      { view: 'applications', label: 'Applications', icon: FileText },
      { view: 'workflow-kanban', label: 'Workflow Board', icon: KanbanSquare },
    ],
  },
  {
    label: 'Land & Infrastructure',
    items: [
      { view: 'land-parcels', label: 'Land Inventory', icon: MapPin },
      { view: 'gis', label: 'GIS Map', icon: Map },
      { view: 'constructions', label: 'Construction', icon: HardHat },
    ],
  },
  {
    label: 'Finance & Legal',
    items: [
      { view: 'payments', label: 'Payments', icon: CreditCard },
      { view: 'grievances', label: 'Grievances', icon: AlertTriangle },
      { view: 'cancellations', label: 'Cancellations', icon: ScrollText },
    ],
  },
  {
    label: 'Administration',
    items: [
      { view: 'reports', label: 'Reports', icon: BarChart3 },
      { view: 'audit-log', label: 'Audit Trail', icon: Shield },
      { view: 'notifications', label: 'Notifications', icon: Bell },
      { view: 'users', label: 'Users', icon: Users },
      { view: 'departments', label: 'Departments', icon: Building2 },
      { view: 'settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, meta } = useAuthStore()
  const [view, setView] = useState<View>('dashboard')
  const [viewParams, setViewParams] = useState<Record<string, string>>({})
  const [unreadNotifications, setUnreadNotifications] = useState(meta?.unreadNotifications ?? 0)
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Overview')

  const navigateTo = (v: View, params?: Record<string, string>) => {
    setView(v)
    if (params) setViewParams(params)
  }

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <LayoutContext.Provider value={{ view, setView, viewParams, setViewParams, navigateTo, unreadNotifications, setUnreadNotifications }}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="gap-3">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
                    <Building2 className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">APCRDA</span>
                    <span className="text-xs text-muted-foreground">Land Portal</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent className="px-2">
            {navGroups.map(group => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel
                  className="cursor-pointer select-none hover:text-foreground"
                  onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{group.label}</span>
                    <ChevronRight className={cn('h-3 w-3 transition-transform', expandedGroup === group.label && 'rotate-90')} />
                  </div>
                </SidebarGroupLabel>
                {(expandedGroup === group.label) && (
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.view}>
                          <SidebarMenuButton
                            isActive={view === item.view || (view === 'application-detail' && item.view === 'applications')}
                            tooltip={item.label}
                            onClick={() => setView(item.view)}
                          >
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <div className="mx-2 mb-1">
              <Badge variant="outline" className="w-full justify-center text-[10px] border-amber-500 text-amber-700 bg-amber-50">
                DEMO ENVIRONMENT
              </Badge>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-medium bg-emerald-100 text-emerald-800">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="text-sm font-medium truncate max-w-[140px]">{user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.role.name}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-white">
            <div className="flex-1">
              <h2 className="text-sm font-medium text-muted-foreground capitalize">
                {view.replace(/-/g, ' ')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setView('notifications')}>
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-emerald-100 text-emerald-800">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm max-w-[120px] truncate">{user?.name}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    {user?.designation && <Badge variant="secondary" className="mt-1 text-[10px]">{user.designation}</Badge>}
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
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50/50">
            {children}
          </main>
          <footer className="border-t px-4 py-3 bg-white text-center text-xs text-muted-foreground">
            APCRDA Land Allotment & Development Management Portal — Demo Environment — All data is for demonstration purposes only
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </LayoutContext.Provider>
  )
}

export function useAppLayout() { return React.useContext(LayoutContext) }
