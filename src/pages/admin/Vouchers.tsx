import { useEffect, useState } from 'react'
import { Plus, Loader2, Copy } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Voucher {
  id: string; code: string; plan_id: string; status: string
  expires_at: string; created_at: string; redeemed_at: string
}
interface Plan { id: string; name: string }

const statusColor: Record<string, string> = {
  generated: 'bg-blue-100 text-blue-700',
  redeemed: 'bg-green-100 text-green-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}

export default function Vouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ plan_id: '', quantity: '1', prefix: '' })
  const [generating, setGenerating] = useState(false)

  const load = () => {
    Promise.all([api.get('/vouchers/'), api.get('/plans/')]).then(([v, p]) => {
      setVouchers(v.data); setPlans(p.data); setLoading(false)
    }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.plan_id) { toast.error('Select a plan'); return }
    setGenerating(true)
    try {
      await api.post('/vouchers/generate', { plan_id: form.plan_id, quantity: Number(form.quantity), prefix: form.prefix || undefined })
      toast.success(`${form.quantity} voucher(s) generated`)
      setShowForm(false); setForm({ plan_id: '', quantity: '1', prefix: '' }); load()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate vouchers')
    } finally { setGenerating(false) }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied!')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Vouchers</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Generate Vouchers
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Generate Vouchers</h3>
          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select value={form.plan_id} onChange={e => setForm(f => ({...f, plan_id: e.target.value}))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select plan...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" min="1" max="100" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prefix (optional)</label>
              <input type="text" value={form.prefix} onChange={e => setForm(f => ({...f, prefix: e.target.value.toUpperCase()}))} placeholder="e.g. VIP" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" disabled={generating} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2">
                {generating && <Loader2 className="w-4 h-4 animate-spin" />} Generate
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Code','Status','Expires','Redeemed At','Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vouchers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No vouchers yet</td></tr>
                ) : vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-gray-800">{v.code}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[v.status] || 'bg-gray-100 text-gray-600'}`}>{v.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{v.expires_at ? new Date(v.expires_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{v.redeemed_at ? new Date(v.redeemed_at).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => copyCode(v.code)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="Copy code"><Copy className="w-4 h-4" /></button>
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
