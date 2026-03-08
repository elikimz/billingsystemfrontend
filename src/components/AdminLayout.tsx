import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, CreditCard, Ticket,
  MessageSquare, Settings, LogOut, Wifi, Menu, FileText, Router
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/plans', icon: Package, label: 'Plans' },
  { path: '/admin/subscriptions', icon: Wifi, label: 'Subscriptions' },
  { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/vouchers', icon: Ticket, label: 'Vouchers' },
  { path: '/admin/routers', icon: Router, label: 'Routers' },
  { path: '/admin/sms-logs', icon: MessageSquare, label: 'SMS Logs' },
  { path: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">HotSpot Admin</p>
            <p className="text-xs text-gray-400 capitalize">{admin?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2 truncate">{admin?.full_name}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0">
        <div className="w-64 fixed inset-y-0">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-gray-800 capitalize">
            {navItems.find(n => n.path === location.pathname)?.label || 'Admin'}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
