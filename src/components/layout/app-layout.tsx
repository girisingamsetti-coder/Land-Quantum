'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/stores/auth-store'
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarRail, SidebarSeparator,
  SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LayoutDashboard, FileText, MapPin, CreditCard, HardHat, AlertTriangle,
  Users, Building2, LogOut, Bell, BarChart3, KanbanSquare,
  Shield, Settings, ScrollText, Map, ClipboardList, MessageSquare,
  Check, Circle, Clock, X, SlidersHorizontal,
  Moon, Sun, UserCircle, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppLayoutProps { children: React.ReactNode }

export type View =
  | 'dashboard' | 'applications' | 'application-detail' | 'workflow-kanban'
  | 'land-parcels' | 'building-permits' | 'payments' | 'constructions' | 'grievances'
  | 'cancellations' | 'reports' | 'audit-log'
  | 'users' | 'roles' | 'departments' | 'settings' | 'gis'
  | 'my-work-queue' | 'risk-alerts'

export interface GlobalFilters {
  zone: string
  status: string
  dateRange: string
}

interface LayoutContextType {
  view: View
  setView: (v: View) => void
  viewParams: Record<string, string>
  setViewParams: (p: Record<string, string>) => void
  navigateTo: (view: View, params?: Record<string, string>) => void
  unreadNotifications: number
  setUnreadNotifications: (n: number) => void
  globalFilters: GlobalFilters
  setGlobalFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>
}

export const LayoutContext = React.createContext<LayoutContextType>({
  view: 'dashboard', setView: () => { }, viewParams: {}, setViewParams: () => { },
  navigateTo: () => { }, unreadNotifications: 0, setUnreadNotifications: () => { },
  globalFilters: { zone: '', status: '', dateRange: '' }, setGlobalFilters: () => { },
})

export { type View }

interface NavItem {
  view: View; label: string; icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'applications', label: 'Applications', icon: FileText },
  { view: 'land-parcels', label: 'Land Inventory', icon: MapPin },
  { view: 'building-permits', label: 'Building Permits', icon: ClipboardList },
  { view: 'constructions', label: 'Construction', icon: HardHat },
  { view: 'payments', label: 'Payments', icon: CreditCard },
  { view: 'grievances', label: 'Grievances', icon: MessageSquare },
  { view: 'risk-alerts', label: 'Risk & Alerts', icon: AlertTriangle },
  { view: 'reports', label: 'Reports', icon: BarChart3 },
  { view: 'settings', label: 'Settings', icon: Settings },
]

const viewDescriptions: Record<string, string> = {
  dashboard: 'Overview of key metrics and alerts',
  applications: 'View and manage all land allotment applications',
  'workflow-kanban': 'Visual workflow board for application stages',
  'application-detail': 'Application details and processing',
  'land-parcels': 'Browse and manage land parcels inventory',
  'building-permits': 'Manage building permits in Amaravati',
  gis: 'Interactive map of land parcels',
  constructions: 'Monitor construction progress and compliance',
  payments: 'Track payments, invoices, and revenue',
  grievances: 'Handle investor grievances and appeals',
  cancellations: 'Track cancellation and resumption cases',
  'risk-alerts': 'Automated risk identification and escalations',
  users: 'Manage system users and permissions',
  departments: 'Organization structure and roles',
  reports: 'Comprehensive analytics and reports',
  'audit-log': 'Immutable record of all system actions',
  settings: 'Configure workflow, SLA, and system settings',
  'my-work-queue': 'Pending tasks assigned to you',
}

interface Notification {
  id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string
}

const ZONES = ['All Zones', 'Zone A — Core', 'Zone B — Growth', 'Zone C — Industrial', 'Zone D — Residential']
const DATE_RANGES = ['All Time', 'Today', 'This Week', 'This Month', 'This Quarter', 'This Year']
const STATUS_OPTIONS: Record<string, string[]> = {
  applications: ['All Statuses', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'On Hold'],
  'land-parcels': ['All Statuses', 'Published', 'Allotted', 'Under Application', 'Reserved', 'On Hold'],
  'building-permits': ['All Statuses', 'Approved', 'Under Review', 'Rejected'],
  payments: ['All Statuses', 'Paid', 'Partially Paid', 'Pending', 'Overdue'],
  constructions: ['All Statuses', 'Not Started', 'In Progress', 'Delayed', 'Completed'],
  grievances: ['All Statuses', 'Open', 'In Progress', 'Resolved', 'Closed'],
  cancellations: ['All Statuses', 'Open', 'Notice Issued', 'Decision Made', 'Completed', 'Cancelled'],
}

function GlobalFilterBar({ view, filters, setFilters }: {
  view: View; filters: GlobalFilters; setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>
}) {
  const [showFilters, setShowFilters] = useState(false)
  const activeCount = [filters.zone, filters.status, filters.dateRange].filter(Boolean).length

  const hideOnViews: View[] = ['dashboard', 'settings', 'reports', 'audit-log', 'users', 'departments', 'gis', 'application-detail', 'workflow-kanban']
  if (hideOnViews.includes(view)) return null

  const currentStatuses = STATUS_OPTIONS[view] || []
  const clearFilters = () => setFilters({ zone: '', status: '', dateRange: '' })

  return (
    <div className="border-b bg-card/60 backdrop-blur-sm">
      <div className="px-5 py-2 flex items-center gap-3">
        <Button
          variant={showFilters ? 'secondary' : 'ghost'}
          size="sm"
          className={cn('h-7 gap-1.5 text-xs', showFilters && 'bg-primary/10 text-primary border-primary/20')}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-3 w-3" />
          Filters
          {activeCount > 0 && (
            <Badge className="h-4 min-w-4 px-1 text-[10px] rounded-full ml-0.5">{activeCount}</Badge>
          )}
        </Button>

        {!showFilters && activeCount > 0 && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            {filters.zone && (
              <Badge variant="secondary" className="text-[10px] gap-1 pr-1 shrink-0">
                {filters.zone} <button onClick={() => setFilters(p => ({ ...p, zone: '' }))}><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="text-[10px] gap-1 pr-1 shrink-0">
                {filters.status} <button onClick={() => setFilters(p => ({ ...p, status: '' }))}><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="secondary" className="text-[10px] gap-1 pr-1 shrink-0">
                {filters.dateRange} <button onClick={() => setFilters(p => ({ ...p, dateRange: '' }))}><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-destructive shrink-0" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="px-5 pb-3 flex flex-wrap items-center gap-2 animate-in slide-in-from-top-1 duration-150">
          <Select value={filters.zone || ZONES[0]} onValueChange={v => setFilters(p => ({ ...p, zone: v === ZONES[0] ? '' : v }))}>
            <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Zone" /></SelectTrigger>
            <SelectContent>{ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
          </Select>

          {currentStatuses.length > 0 && (
            <Select value={filters.status || STATUS_OPTIONS[view][0]} onValueChange={v => setFilters(p => ({ ...p, status: v === STATUS_OPTIONS[view][0] ? '' : v }))}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{currentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          )}

          <Select value={filters.dateRange || DATE_RANGES[0]} onValueChange={v => setFilters(p => ({ ...p, dateRange: v === DATE_RANGES[0] ? '' : v }))}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Date Range" /></SelectTrigger>
            <SelectContent>{DATE_RANGES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>

          {activeCount > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={clearFilters}>
              <X className="h-3 w-3" /> Clear filters ({activeCount})
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Custom rail that embeds the collapse toggle on the sidebar/content separator
function SidebarRailWithTrigger() {
  const { state, toggleSidebar } = useSidebar()
  return (
    <>
      <SidebarRail />
      {/* Floating collapse button centered on the rail separator */}
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-200',
          // When expanded sidebar is ~16rem wide; when collapsed ~3rem wide (icon mode)
          state === 'expanded' ? '-right-3.5' : '-right-3.5',
        )}
        style={{ right: '-14px' }}
      >
        <button
          onClick={toggleSidebar}
          className={cn(
            'h-7 w-7 rounded-full border bg-background shadow-md',
            'hover:bg-accent hover:text-accent-foreground',
            'flex items-center justify-center',
            'transition-all duration-200',
          )}
        >
          {state === 'expanded' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="sr-only">Toggle Sidebar</span>
        </button>
      </div>
    </>
  )
}

export function AppLayout({ children }: AppLayoutProps) {

  const { user, logout, meta } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>('dashboard')
  const [viewParams, setViewParams] = useState<Record<string, string>>({})
  const [unreadNotifications, setUnreadNotifications] = useState(meta?.unreadNotifications ?? 0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({ zone: '', status: '', dateRange: '' })

  const navigateTo = (v: View, params?: Record<string, string>) => {
    setView(v)
    if (params) setViewParams(params)
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const json = await res.json()
      if (json.success) {
        setNotifications(json.data.notifications.slice(0, 8))
        setUnreadNotifications(json.data.unread)
      }
    } catch { /* silent */ }
  }

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { fetchNotifications() }, [])

  const markAllRead = async () => {
    const ids = notifications.filter(n => !n.isRead).map(n => n.id)
    if (ids.length === 0) return
    try {
      await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadNotifications(0)
    } catch { /* silent */ }
  }

  const notifIcon = (type: string) => {
    switch (type) {
      case 'stage': return <Check className="h-3.5 w-3.5 text-teal-600" />
      case 'assignment': return <Circle className="h-3.5 w-3.5 text-violet-600" />
      case 'sla': return <Clock className="h-3.5 w-3.5 text-amber-600" />
      default: return <Bell className="h-3.5 w-3.5 text-slate-500" />
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <LayoutContext.Provider value={{ view, setView, viewParams, setViewParams, navigateTo, unreadNotifications, setUnreadNotifications, globalFilters, setGlobalFilters }}>
      <SidebarProvider>
        <Sidebar collapsible="icon" variant="floating">
          {/* Logo Header */}
          <SidebarHeader className="px-3 pt-4 pb-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="gap-3 rounded-lg">
                  <Image
                    src="/logo.png"
                    alt="Land Quantum"
                    width={32}
                    height={32}
                    className="rounded-md shrink-0"
                  />
                  <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
                    <span className="text-sm font-semibold tracking-tight">Land Quantum</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Management Portal</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarSeparator className="mx-3" />

          {/* Flat Nav List */}
          <SidebarContent className="px-2 py-1">
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = view === item.view ||
                  (view === 'application-detail' && item.view === 'applications')
                const IconComp = item.icon
                return (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      onClick={() => setView(item.view)}
                      className="rounded-md"
                    >
                      {IconComp && <IconComp className="size-4" />}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>

          {/* Footer - Notification, Dark Mode, Profile */}
          <SidebarFooter className="gap-0.5">
            <SidebarSeparator />
            <SidebarMenu>
              {/* Notification Bell */}
              <SidebarMenuItem>
                <Popover open={notifOpen} onOpenChange={setNotifOpen}>
                  <PopoverTrigger asChild>
                    <SidebarMenuButton tooltip="Notifications">
                      <div className="relative">
                        <Bell className="size-4" />
                        {unreadNotifications > 0 && (
                          <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-primary-foreground">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                          </span>
                        )}
                      </div>
                      <span>Notifications</span>
                    </SidebarMenuButton>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" className="w-80 p-0">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        {unreadNotifications > 0 && (
                          <Badge className="text-[10px] h-5 px-1.5">{unreadNotifications} new</Badge>
                        )}
                      </div>
                      {unreadNotifications > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="max-h-[320px]">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell className="h-6 w-6 mx-auto text-muted-foreground/50" />
                          <p className="text-xs text-muted-foreground mt-2">No notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/[0.03]' : ''}`}
                            >
                              <div className="mt-0.5 rounded-full bg-muted p-1.5 shrink-0">
                                {notifIcon(n.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs leading-snug ${!n.isRead ? 'font-medium' : 'text-muted-foreground'}`}>{n.title}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                                <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(n.createdAt)}</p>
                              </div>
                              {!n.isRead && <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>

              {/* Dark Mode Toggle */}
              {mounted && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Profile Dropdown */}
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton tooltip="Profile">
                      <UserCircle className="size-4" />
                      <span>{user?.name}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-52">
                    <div className="px-2.5 py-2 flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        {user?.designation && (
                          <Badge variant="secondary" className="mt-1 text-[10px] font-medium">{user.designation}</Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" /> Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" /> Calendar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          {/* Invisible rail — collapse button is on the separator instead */}
          <SidebarRailWithTrigger />
        </Sidebar>

        <SidebarInset className="min-w-0 w-full">
          {/* Main Content */}
          <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto pt-0 pb-6 md:pb-8 px-0 bg-muted/30">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </LayoutContext.Provider>
  )
}

export function useAppLayout() { return React.useContext(LayoutContext) }
