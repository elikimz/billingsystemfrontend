import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface AuditLog {
  id: string; admin_user_id: string; action: string; entity_type: string
  entity_id: string; details: string; ip_address: string; created_at: string
}

const actionColor: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  SUSPEND: 'bg-orange-100 text-orange-700',
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/audit-logs').then(r => { setLogs(r.data); setLoading(false) })
      .catch(() => { toast.error('Failed to load audit logs'); setLoading(false) })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Audit Logs</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Action','Entity','Details','IP','Date'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No audit logs yet</td></tr>
                ) : logs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColor[l.action] || 'bg-gray-100 text-gray-600'}`}>{l.action}</span></td>
                    <td className="px-4 py-3 text-gray-700">{l.entity_type}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{l.details || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{l.ip_address || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
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
