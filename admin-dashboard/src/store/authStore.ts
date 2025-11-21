import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  employeeId?: string
  department?: string
  jobTitle?: string
  biometricEnrolled: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

// Custom storage using cookies
const cookieStorage = {
  getItem: (name: string) => {
    const value = Cookies.get(name)
    return value || null
  },
  setItem: (name: string, value: string) => {
    Cookies.set(name, value, { expires: 7 }) // 7 days
  },
  removeItem: (name: string) => {
    Cookies.remove(name)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        Cookies.remove('auth-storage')
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
)

