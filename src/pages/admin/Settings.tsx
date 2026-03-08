import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Setting { key: string; value: string; scope: string; description: string; is_encrypted: boolean }

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const load = () => {
    api.get('/admin/settings').then(r => { setSettings(r.data); setLoading(false) })
      .catch(() => { toast.error('Failed to load settings'); setLoading(false) })
  }
  useEffect(load, [])

  const handleSave = async (key: string) => {
    setSaving(key)
    try {
      await api.put(`/admin/settings/${key}`, { value: editing[key] })
      toast.success('Setting updated')
      setEditing(e => { const n = {...e}; delete n[key]; return n })
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update setting')
    } finally { setSaving(null) }
  }

  const scopeColor: Record<string, string> = {
    payment: 'bg-green-100 text-green-700',
    sms: 'bg-blue-100 text-blue-700',
    general: 'bg-gray-100 text-gray-600',
    mikrotik: 'bg-purple-100 text-purple-700',
  }

  const grouped = settings.reduce((acc, s) => {
    if (!acc[s.scope]) acc[s.scope] = []
    acc[s.scope].push(s)
    return acc
  }, {} as Record<string, Setting[]>)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([scope, items]) => (
            <div key={scope} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${scopeColor[scope] || 'bg-gray-100 text-gray-600'}`}>{scope}</span>
                <h3 className="font-semibold text-gray-700 capitalize">{scope} Settings</h3>
              </div>
              <div className="p-6 space-y-4">
                {items.map(s => (
                  <div key={s.key} className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{s.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                      {s.description && <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 sm:w-80">
                      <input
                        type={s.is_encrypted ? 'password' : 'text'}
                        value={editing[s.key] !== undefined ? editing[s.key] : (s.value || '')}
                        onChange={e => setEditing(ed => ({...ed, [s.key]: e.target.value}))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editing[s.key] !== undefined && (
                        <button onClick={() => handleSave(s.key)} disabled={saving === s.key} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                          {saving === s.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
