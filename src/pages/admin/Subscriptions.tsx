import { useEffect, useState } from 'react'
import { Loader2, XCircle } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Subscription {
  id: string; user_id: string; plan_id: string; status: string
  started_at: string; expires_at: string; payment_reference: string; created_at: string
}

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  suspended: 'bg-orange-100 text-orange-700',
}

export default function Subscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/subscriptions/').then(r => { setSubs(r.data); setLoading(false) })
      .catch(() => { toast.error('Failed to load subscriptions'); setLoading(false) })
  }
  useEffect(load, [])

  const cancel = async (id: string) => {
    if (!confirm('Cancel this subscription?')) return
    await api.post(`/subscriptions/${id}/cancel`)
    toast.success('Subscription cancelled'); load()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Subscriptions</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['User ID','Status','Started','Expires','Reference','Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No subscriptions yet</td></tr>
                ) : subs.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.user_id.slice(0,8)}...</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[s.status] || 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.started_at ? new Date(s.started_at).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.expires_at ? new Date(s.expires_at).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.payment_reference || '—'}</td>
                    <td className="px-4 py-3">
                      {s.status === 'active' && (
                        <button onClick={() => cancel(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel"><XCircle className="w-4 h-4" /></button>
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
