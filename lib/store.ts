import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserRole = 'USER' | 'STAFF' | 'ADMIN' | null

interface UserState {
  // User
  isLoggedIn: boolean
  role: UserRole
  name: string | null
  email: string | null
  ticketsUrl: string

  // Actions
  setUser: (data: { role: UserRole; name: string | null; email: string | null }) => void
  clearUser: () => void

  // UI
  navDrawerOpen: boolean
  toggleNavDrawer: () => void
  setNavDrawer: (open: boolean) => void
}

const DEFAULT_TICKETS_URL = '/user/dashboard'

function getTicketsUrlForRole(role: UserRole): string {
  if (!role) return DEFAULT_TICKETS_URL
  switch (role) {
    case 'ADMIN': return '/admin/dashboard'
    case 'STAFF': return '/staff/dashboard'
    default: return DEFAULT_TICKETS_URL
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // User
      isLoggedIn: false,
      role: null,
      name: null,
      email: null,
      ticketsUrl: DEFAULT_TICKETS_URL,

      setUser: (data) =>
        set({
          isLoggedIn: true,
          role: data.role,
          name: data.name,
          email: data.email,
          ticketsUrl: getTicketsUrlForRole(data.role),
        }),

      clearUser: () =>
        set({
          isLoggedIn: false,
          role: null,
          name: null,
          email: null,
          ticketsUrl: DEFAULT_TICKETS_URL,
        }),

      // UI
      navDrawerOpen: false,
      toggleNavDrawer: () => set((s) => ({ navDrawerOpen: !s.navDrawerOpen })),
      setNavDrawer: (open) => set({ navDrawerOpen: open }),
    }),
    {
      name: 'fader-store',
      // Only persist user data, not UI state
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        role: state.role,
        name: state.name,
        email: state.email,
        ticketsUrl: state.ticketsUrl,
      }),
    }
  )
)
