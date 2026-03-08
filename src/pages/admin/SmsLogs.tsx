import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface SMSLog {
  id: string; phone_number: string; message: string; status: string
  provider: string; failure_reason: string; sent_at: string; created_at: string
}

const statusColor: Record<string, string> = {
  sent: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  delivered: 'bg-blue-100 text-blue-700',
}

export default function SmsLogs() {
  const [logs, setLogs] = useState<SMSLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/sms-logs').then(r => { setLogs(r.data); setLoading(false) })
      .catch(() => { toast.error('Failed to load SMS logs'); setLoading(false) })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">SMS Logs</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Phone','Message','Status','Provider','Sent At'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No SMS logs yet</td></tr>
                ) : logs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{l.phone_number}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{l.message}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[l.status] || 'bg-gray-100 text-gray-600'}`}>{l.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{l.provider || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{l.sent_at ? new Date(l.sent_at).toLocaleString() : '—'}</td>
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
