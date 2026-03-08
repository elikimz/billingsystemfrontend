import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Plan {
  id: string; name: string; description: string; price: number
  duration_hours: number; bandwidth_profile: string; device_limit: number
  is_voucher_enabled: boolean; is_active: boolean; status: string; created_at: string
}

const emptyForm = { name: '', description: '', price: '', duration_hours: '', bandwidth_profile: '', device_limit: '1', is_voucher_enabled: true, is_active: true }

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/plans/all')
      .then(r => { setPlans(r.data); setLoading(false) })
      .catch(() => {
        // /plans/all requires auth; fallback to public endpoint
        api.get('/plans/').then(r => { setPlans(r.data); setLoading(false) }).catch(() => setLoading(false))
      })
  }
  useEffect(load, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price), duration_hours: Number(form.duration_hours), device_limit: Number(form.device_limit) }
      if (editId) {
        await api.put(`/plans/${editId}`, payload)
        toast.success('Plan updated')
      } else {
        await api.post('/plans/', payload)
        toast.success('Plan created')
      }
      setShowForm(false); setEditId(null); setForm(emptyForm); load()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save plan')
    } finally { setSaving(false) }
  }

  const handleEdit = (plan: Plan) => {
    setForm({ name: plan.name, description: plan.description || '', price: String(plan.price), duration_hours: String(plan.duration_hours), bandwidth_profile: plan.bandwidth_profile || '', device_limit: String(plan.device_limit), is_voucher_enabled: plan.is_voucher_enabled, is_active: plan.is_active })
    setEditId(plan.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this plan?')) return
    await api.delete(`/plans/${id}`); toast.success('Plan deactivated'); load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Plans & Packages</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit Plan' : 'New Plan'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['name','Plan Name','text',true],['price','Price (KES)','number',true],['duration_hours','Duration (hours)','number',true],['bandwidth_profile','Bandwidth Profile','text',false],['device_limit','Device Limit','number',false]].map(([field,label,type,req]) => (
              <div key={field as string}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label as string}</label>
                <input type={type as string} required={req as boolean} value={(form as any)[field as string]} onChange={e => setForm(f => ({...f, [field as string]: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} /> Active</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_voucher_enabled} onChange={e => setForm(f => ({...f, is_voucher_enabled: e.target.checked}))} /> Voucher Enabled</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name','Price','Duration','Bandwidth','Status','Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{plan.name}</td>
                  <td className="px-4 py-3 text-gray-600">KES {plan.price}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.duration_hours}h</td>
                  <td className="px-4 py-3 text-gray-600">{plan.bandwidth_profile || '—'}</td>
                  <td className="px-4 py-3">
                    {plan.is_active ? <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />Active</span> : <span className="flex items-center gap-1 text-gray-400"><XCircle className="w-4 h-4" />Inactive</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(plan)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(plan.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
