import { useEffect, useState } from 'react'
import { Loader2, UserX } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface User {
  id: string; full_name: string; phone_number: string; email: string
  status: string; is_verified: boolean; created_at: string
}

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/admin/users').then(r => { setUsers(r.data); setLoading(false) })
      .catch(() => { toast.error('Failed to load users'); setLoading(false) })
  }
  useEffect(load, [])

  const suspend = async (id: string) => {
    if (!confirm('Suspend this user?')) return
    await api.post(`/admin/users/${id}/suspend`)
    toast.success('User suspended'); load()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Users</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Name','Phone','Email','Status','Joined','Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users yet</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.full_name}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{u.phone_number}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[u.status] || 'bg-gray-100 text-gray-600'}`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {u.status !== 'suspended' && (
                        <button onClick={() => suspend(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Suspend"><UserX className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
