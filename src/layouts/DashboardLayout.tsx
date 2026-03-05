import { useState, createContext, useContext } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  CheckSquare,
  RefreshCw,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  X,
  Menu,
} from 'lucide-react'
import { auth } from '../services/firebase'
import { signOut } from 'firebase/auth'

export const LayoutContext = createContext({ openMenu: () => {} })
export const useLayout = () => useContext(LayoutContext)

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: RefreshCw, label: 'Habits', path: '/habits' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
]

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      window.location.href = '/'
    } catch (error) {
      console.error(error)
    }
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap size={24} className="text-white fill-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">FocusFlow</h1>
      </div>

      <nav className="flex-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <div
              key={item.path}
              onClick={() => { navigate(item.path); setIsMobileMenuOpen(false) }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group ${
                active
                  ? 'text-indigo-400 bg-indigo-500/10 border-r-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={active ? 'text-indigo-400' : ''} />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
          )
        })}
      </nav>

      <div className="p-4 mt-auto space-y-1">
        <div
          onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false) }}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <Settings size={20} />
          <span className="font-medium text-sm">Settings</span>
        </div>
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </div>
      </div>
    </>
  )

  return (
    <LayoutContext.Provider value={{ openMenu: () => setIsMobileMenuOpen(true) }}>
      <div className="flex h-screen bg-[#0f111a] overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-[#141621] border-r border-white/5 flex-col">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-[#141621] z-[70] flex flex-col lg:hidden border-r border-white/5 shadow-2xl"
              >
                <div className="absolute top-4 right-4">
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-2">
                    <X size={24} />
                  </button>
                </div>
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </LayoutContext.Provider>
  )
}