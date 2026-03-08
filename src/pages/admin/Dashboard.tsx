import { useEffect, useState } from 'react'
import { Users, Wifi, CreditCard, Package, Ticket, TrendingUp } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Stats {
  total_users: number
  active_subscriptions: number
  total_revenue: number
  total_payments: number
  active_plans: number
  total_vouchers: number
  redeemed_vouchers: number
}

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => { setStats(r.data); setLoading(false) })
      .catch(() => { toast.error('Failed to load dashboard'); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={stats?.total_users ?? 0} color="bg-blue-500" />
        <StatCard icon={Wifi} label="Active Subscriptions" value={stats?.active_subscriptions ?? 0} color="bg-green-500" />
        <StatCard icon={TrendingUp} label="Total Revenue (KES)" value={`${Number(stats?.total_revenue ?? 0).toLocaleString()}`} color="bg-purple-500" />
        <StatCard icon={CreditCard} label="Total Payments" value={stats?.total_payments ?? 0} color="bg-orange-500" />
        <StatCard icon={Package} label="Active Plans" value={stats?.active_plans ?? 0} color="bg-teal-500" />
        <StatCard icon={Ticket} label="Total Vouchers" value={stats?.total_vouchers ?? 0} color="bg-indigo-500" />
        <StatCard icon={Ticket} label="Redeemed Vouchers" value={stats?.redeemed_vouchers ?? 0} color="bg-pink-500" />
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Plan', href: '/admin/plans' },
            { label: 'View Payments', href: '/admin/payments' },
            { label: 'Generate Vouchers', href: '/admin/vouchers' },
            { label: 'System Settings', href: '/admin/settings' },
          ].map(l => (
            <a key={l.href} href={l.href} className="text-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
