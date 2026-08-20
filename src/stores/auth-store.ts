import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  phone: string | null
  avatar: string | null
  employeeId: string | null
  designation: string | null
  role: {
    id: string
    name: string
    permissions: string[]
  }
}

export interface SessionMeta {
  unreadNotifications: number
  demoMode: boolean
}

interface AuthState {
  user: User | null
  meta: SessionMeta | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  meta: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!data.success) {
        set({ error: data.message || 'Login failed', isLoading: false })
        return
      }
      set({
        user: data.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch {
      set({ error: 'Network error. Please try again.', isLoading: false })
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* ignore */ }
    set({ user: null, meta: null, isAuthenticated: false, error: null })
  },

  checkSession: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data.success && data.data.authenticated) {
        const userData = {
          id: data.data.user.id,
          email: data.data.user.email,
          name: data.data.user.name,
          phone: null,
          avatar: null,
          employeeId: data.data.user.employeeId,
          designation: data.data.user.designation,
          role: {
            id: '',
            name: data.data.user.roleName,
            permissions: data.data.user.permissions,
          },
        }
        set({
          user: userData,
          meta: data.data.meta,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({ user: null, meta: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
