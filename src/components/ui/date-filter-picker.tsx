'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X, Check as CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DatePreset = 'overall' | 'today' | 'yesterday' | 'last7' | 'last30' | 'custom'

export interface DateFilterValue {
  preset: DatePreset
  startDate: Date | null
  endDate: Date | null
  label: string
}

interface DateFilterPickerProps {
  value?: DateFilterValue
  defaultValue?: DateFilterValue
  onChange?: (value: DateFilterValue) => void
  onClear?: () => void
  className?: string
  align?: 'start' | 'center' | 'end'
  baseDate?: Date
  trigger?: React.ReactNode
  variant?: 'select' | 'pill'
}

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'overall', label: 'Overall' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7', label: 'Last 7 Days' },
  { id: 'last30', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom' },
]

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Default reference anchor is August 2026 to align with project mock data and timeline
export const DEFAULT_ANCHOR_DATE = new Date(2026, 7, 22) // Aug 22, 2026

export function calculatePresetRange(preset: DatePreset, baseDate: Date = DEFAULT_ANCHOR_DATE): { start: Date | null; end: Date | null; label: string } {
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())

  switch (preset) {
    case 'overall':
      return { start: null, end: null, label: 'Overall' }
    case 'today':
      return { start: today, end: today, label: 'Today' }
    case 'yesterday': {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return { start: y, end: y, label: 'Yesterday' }
    }
    case 'last7': {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      return { start, end: today, label: 'Last 7 Days' }
    }
    case 'last30': {
      const start = new Date(today)
      start.setDate(start.getDate() - 29)
      return { start, end: today, label: 'Last 30 Days' }
    }
    case 'custom':
    default:
      return { start: null, end: null, label: 'Custom' }
  }
}

function formatDateDisplay(d: Date): string {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

function formatDateRangeLabel(preset: DatePreset, start: Date | null, end: Date | null): string {
  if (preset === 'overall' || (!start && !end)) return 'Overall'
  if (preset === 'today') return 'Today'
  if (preset === 'yesterday') return 'Yesterday'
  if (preset === 'last7') return 'Last 7 Days'
  if (preset === 'last30') return 'Last 30 Days'
  if (start && end) {
    if (start.getTime() === end.getTime()) {
      return formatDateDisplay(start)
    }
    return `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`
  }
  if (start) return `From ${formatDateDisplay(start)}`
  return 'Custom'
}

function isSameDay(d1: Date | null, d2: Date | null): boolean {
  if (!d1 || !d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function isDateInRange(target: Date, start: Date | null, end: Date | null): boolean {
  if (!start) return false
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  if (!end) return t === s
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return t >= s && t <= e
}

export function DateFilterPicker({
  value,
  defaultValue = { preset: 'overall', startDate: null, endDate: null, label: 'Date' },
  onChange,
  onClear,
  className,
  align = 'end',
  baseDate = DEFAULT_ANCHOR_DATE,
  trigger,
  variant = 'select'
}: DateFilterPickerProps) {
  const [open, setOpen] = useState(false)
  const [appliedState, setAppliedState] = useState<DateFilterValue>(value || defaultValue)

  // Internal draft state when modal/popover is open
  const [draftPreset, setDraftPreset] = useState<DatePreset>(appliedState.preset)
  const [draftStart, setDraftStart] = useState<Date | null>(appliedState.startDate)
  const [draftEnd, setDraftEnd] = useState<Date | null>(appliedState.endDate)

  // Calendar month/year navigation state
  const [navYear, setNavYear] = useState<number>(() => {
    if (appliedState.startDate) return appliedState.startDate.getFullYear()
    return baseDate.getFullYear()
  })
  const [navMonth, setNavMonth] = useState<number>(() => {
    if (appliedState.startDate) return appliedState.startDate.getMonth()
    return baseDate.getMonth()
  })

  // Sync when value prop changes externally
  useEffect(() => {
    if (value) {
      setAppliedState(value)
    }
  }, [value])

  // When popover opens, initialize draft state from applied state
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const current = value || appliedState
      setDraftPreset(current.preset)
      setDraftStart(current.startDate)
      setDraftEnd(current.endDate)
      if (current.startDate) {
        setNavYear(current.startDate.getFullYear())
        setNavMonth(current.startDate.getMonth())
      } else {
        setNavYear(baseDate.getFullYear())
        setNavMonth(baseDate.getMonth())
      }
    }
    setOpen(isOpen)
  }

  // Handle clicking a Preset on the left
  const handleSelectPreset = (preset: DatePreset) => {
    setDraftPreset(preset)
    if (preset === 'overall') {
      setDraftStart(null)
      setDraftEnd(null)
    } else if (preset === 'custom') {
      // Keep existing custom dates if any
    } else {
      const { start, end } = calculatePresetRange(preset, baseDate)
      setDraftStart(start)
      setDraftEnd(end)
      if (start) {
        setNavYear(start.getFullYear())
        setNavMonth(start.getMonth())
      }
    }
  }

  // Handle clicking a Date cell on the calendar
  const handleSelectDate = (date: Date) => {
    setDraftPreset('custom')
    if (!draftStart || (draftStart && draftEnd)) {
      // First click: start new selection
      setDraftStart(date)
      setDraftEnd(null)
    } else if (draftStart && !draftEnd) {
      // Second click: set end date
      if (date.getTime() < draftStart.getTime()) {
        setDraftEnd(draftStart)
        setDraftStart(date)
      } else {
        setDraftEnd(date)
      }
    }
  }

  // Prev / Next Month Navigation
  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11)
      setNavYear(y => y - 1)
    } else {
      setNavMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0)
      setNavYear(y => y + 1)
    } else {
      setNavMonth(m => m + 1)
    }
  }

  // Cancel action
  const handleCancel = () => {
    setOpen(false)
  }

  // Apply action
  const handleApply = () => {
    let finalStart = draftStart
    let finalEnd = draftEnd

    if (draftPreset !== 'custom' && draftPreset !== 'overall') {
      const r = calculatePresetRange(draftPreset, baseDate)
      finalStart = r.start
      finalEnd = r.end
    } else if (draftPreset === 'overall') {
      finalStart = null
      finalEnd = null
    } else if (draftPreset === 'custom') {
      if (draftStart && !draftEnd) {
        finalEnd = draftStart
      }
    }

    const label = formatDateRangeLabel(draftPreset, finalStart, finalEnd)
    const newVal: DateFilterValue = {
      preset: draftPreset,
      startDate: finalStart,
      endDate: finalEnd,
      label
    }

    setAppliedState(newVal)
    onChange?.(newVal)
    setOpen(false)
  }

  // Generate calendar days for current month view (including preceding/trailing days for standard 7x5 or 7x6 grid)
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(navYear, navMonth, 1)
    const lastDayOfMonth = new Date(navYear, navMonth + 1, 0)
    const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sun, 1 = Mon, ...
    const daysInMonth = lastDayOfMonth.getDate()

    const days: { date: Date; isCurrentMonth: boolean; dayNum: number }[] = []

    // Preceding month days
    const prevMonthLastDay = new Date(navYear, navMonth, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      days.push({
        date: new Date(navYear, navMonth - 1, d),
        isCurrentMonth: false,
        dayNum: d
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(navYear, navMonth, d),
        isCurrentMonth: true,
        dayNum: d
      })
    }

    // Trailing month days (fill up to complete the 35 or 42 grid)
    const totalCells = days.length <= 35 ? 35 : 42
    const remaining = totalCells - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(navYear, navMonth + 1, d),
        isCurrentMonth: false,
        dayNum: d
      })
    }

    return days
  }, [navYear, navMonth])

  const isFilterActive = appliedState.preset !== 'overall' && (appliedState.startDate !== null || appliedState.preset !== 'custom')
  const displayLabel = appliedState.preset === 'overall' ? 'Date' : appliedState.label

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : variant === 'pill' ? (
          <button
            type="button"
            className={cn(
              "relative flex items-center gap-1.5 bg-background dark:bg-card border shadow-xs rounded-full px-2.5 sm:px-3.5 py-1.5 text-[11px] hover:bg-muted/60 transition-all cursor-pointer select-none",
              isFilterActive ? "border-primary/60 text-primary bg-primary/[0.04] dark:bg-primary/[0.08]" : "border-border text-foreground/80",
              className
            )}
          >
            <CalendarIcon className={cn("h-3.5 w-3.5", isFilterActive ? 'text-primary' : 'text-teal-600 dark:text-teal-400')} />
            <span className={cn("font-semibold", isFilterActive ? 'text-primary' : 'text-foreground/85')}>
              {displayLabel}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            data-slot="select-trigger"
            data-active={isFilterActive}
            className={cn(
              "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1.5 text-xs whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-8 cursor-pointer",
              "data-[active=true]:border-primary data-[active=true]:ring-1 data-[active=true]:ring-primary",
              className
            )}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <CalendarIcon className={cn("h-3.5 w-3.5 shrink-0", isFilterActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn("truncate", isFilterActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                {displayLabel}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1 opacity-60" />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={6}
        className="w-[410px] max-w-[96vw] p-3.5 rounded-2xl border border-slate-200/90 dark:border-border/90 bg-white dark:bg-card shadow-2xl z-50 text-card-foreground animate-in fade-in-0 zoom-in-95"
      >
        {/* Main 2-Column Area: Presets Left | Calendar Right */}
        <div className="flex gap-3.5 items-start">
          {/* Left Column: Preset Stack */}
          <div className="w-[110px] shrink-0 flex flex-col gap-1.5">
            {PRESETS.map((p) => {
              const isSelected = draftPreset === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={cn(
                    "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-xs outline-hidden select-none transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground text-foreground"
                  )}
                >
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <CheckIcon className="h-4 w-4" />}
                  </span>
                  <span>{p.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Column: Interactive Calendar */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Calendar Header with Navigation */}
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="h-7 w-7 rounded-lg border border-slate-200 dark:border-border flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted/60 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="font-bold text-sm text-slate-800 dark:text-foreground text-center">
                {MONTH_NAMES[navMonth]} {navYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="h-7 w-7 rounded-lg border border-slate-200 dark:border-border flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted/60 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center py-1">
              {DAYS_OF_WEEK.map((day) => (
                <span key={day} className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((item, idx) => {
                const isStart = isSameDay(item.date, draftStart)
                const isEnd = isSameDay(item.date, draftEnd)
                const isSelectedEndpoint = isStart || isEnd
                const inRange = isDateInRange(item.date, draftStart, draftEnd) && !isSelectedEndpoint

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDate(item.date)}
                    className={cn(
                      "h-7 w-full rounded-md border flex items-center justify-center text-xs font-medium transition-all cursor-pointer select-none",
                      isSelectedEndpoint && "bg-[#4f46e5] hover:bg-[#4338ca] text-white border-[#4f46e5] font-bold shadow-xs",
                      inRange && "bg-[#eff2fe] dark:bg-indigo-950/70 text-[#4338ca] dark:text-indigo-200 border-[#c7d2fe] dark:border-indigo-800 font-semibold",
                      !isSelectedEndpoint && !inRange && item.isCurrentMonth && "border-slate-200/80 dark:border-border/80 text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-muted/60",
                      !isSelectedEndpoint && !inRange && !item.isCurrentMonth && "border-slate-200/40 dark:border-border/40 text-slate-400/70 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-muted/30"
                    )}
                  >
                    {item.dayNum}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions: Cancel & Apply */}
        <div className="border-t border-slate-100 dark:border-border/60 pt-3 mt-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="h-8 px-4 text-xs font-semibold rounded-lg border border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-foreground shadow-2xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="h-8 px-5 text-xs font-bold rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-sm transition-all cursor-pointer"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
