import { create } from 'zustand'
import { persist } from 'zustand/middleware'


export const useSidebarStore = create()(
  persist(
    (set) => ({
      isExpanded: true,
      toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
    }),
    {
      name: 'sidebar-storage',
    }
  )
)