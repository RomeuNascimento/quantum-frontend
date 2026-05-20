import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: () => !!get().token,

      setToken: (token) => {
        localStorage.setItem('quantum_token', token)
        set({ token })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('quantum_token')
        set({ token: null, user: null })
      },
    }),
    {
      name: 'quantum-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

export default useAuthStore
