import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [companyId, setCompanyId] = useState(null)
  const [form, setForm] = useState({ name: '', rut: '', giro: '', address: '', phone: '', email: '' })
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
      if (!company) return
      setCompanyId(company.id)
      const { data } = await supabase.from('clients').select('*').eq('company_id', company.id).order('created_at')
      setClients(data || [])
    })()
  }, [])

  const addClient = async () => {
    if (!form.name) return
    const { data } = await supabase.from('clients').insert({ ...form, company_id: companyId }).select().single()
    if (data) setClients([...clients, data])
    setForm({ name: '', rut: '', giro: '', address: '', phone: '', email: '' })
  }

  const deleteClient = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clients').delete().eq('id', id)
    setClients(clients.filter(c => c.id !== id))
  }

  const cotizar = (c) => {
    navigate('/quotes/new', { state: { client: c } })
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Clientes Frecuentes</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input placeholder="Empresa / Nombre *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400" />
          <input placeholder="RUT" value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400" />
          <input placeholder="Giro" value={form.giro} onChange={e => setForm({ ...form, giro: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400" />
          <input placeholder="Dirección" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400" />
          <input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400" />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400" />
        </div>
        <button onClick={addClient} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors border-none cursor-pointer">
          Guardar Cliente
        </button>
      </div>

      <div className="space-y-2">
        {clients.map(c => (
          <div key={c.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{c.name}</div>
              <div className="text-xs text-gray-400">{[c.rut, c.giro, c.phone, c.email].filter(Boolean).join(' · ')}</div>
            </div>
            <button onClick={() => cotizar(c)}
              className="text-xs px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg font-medium hover:bg-brand-100 transition-colors border-none cursor-pointer">
              Cotizar
            </button>
            <button onClick={() => deleteClient(c.id)} className="text-xs text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">🗑️</button>
          </div>
        ))}
        {clients.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No hay clientes</p>}
      </div>
    </div>
  )
}
