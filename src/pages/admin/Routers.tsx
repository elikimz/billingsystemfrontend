import { useEffect, useState } from 'react'
import { Plus, Loader2, Router as RouterIcon, CheckCircle, XCircle } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Router {
  id: string; name: string; ip_address: string; location: string
  is_active: boolean; model: string; created_at: string
}

const emptyForm = { name: '', ip_address: '', location: '', model: '', is_active: true }

export default function Routers() {
  const [routers, setRouters] = useState<Router[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    api.get('/admin/routers').then(r => { setRouters(r.data); setLoading(false) })
      .catch(() => { toast.error('Failed to load routers'); setLoading(false) })
  }
  useEffect(load, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/admin/routers', form)
      toast.success('Router added')
      setShowForm(false); setForm(emptyForm); load()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add router')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Routers / Access Points</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Router
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">New Router</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['name','Router Name',true],['ip_address','IP Address',true],['location','Location',false],['model','Model',false]].map(([field,label,req]) => (
              <div key={field as string}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label as string}</label>
                <input type="text" required={req as boolean} value={(form as any)[field as string]} onChange={e => setForm(f => ({...f, [field as string]: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} /> Active</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add Router
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : routers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <RouterIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No routers configured yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name','IP Address','Location','Model','Status','Added'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {routers.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{r.ip_address}</td>
                  <td className="px-4 py-3 text-gray-500">{r.location || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{r.model || '—'}</td>
                  <td className="px-4 py-3">
                    {r.is_active
                      ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-3 h-3" />Active</span>
                      : <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircle className="w-3 h-3" />Inactive</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
