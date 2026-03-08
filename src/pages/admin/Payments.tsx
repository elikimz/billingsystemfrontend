import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Payment {
  id: string; user_id: string; plan_id: string; amount: number
  status: string; method: string; phone_number: string
  mpesa_receipt_number: string; checkout_request_id: string; created_at: string
}

const statusColor: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payments/').then(r => { setPayments(r.data); setLoading(false) })
      .catch(() => { toast.error('Failed to load payments'); setLoading(false) })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Records</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Phone','Amount','Method','Status','Receipt','Date'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No payments yet</td></tr>
                ) : payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{p.phone_number || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">KES {p.amount}</td>
                    <td className="px-4 py-3 text-gray-600 uppercase text-xs">{p.method}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.mpesa_receipt_number || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(p.created_at).toLocaleString()}</td>
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
