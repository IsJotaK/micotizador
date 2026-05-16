import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ConfigPage() {
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('companies').select('*').eq('user_id', user.id).single()
      setCompany(data || {})
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('companies').update(company).eq('id', company.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="text-center text-gray-400 py-12 text-sm">Cargando...</div>
  if (!company) return <div className="text-center text-gray-400 py-12 text-sm">Error al cargar configuración</div>

  const Field = ({ label, id, type = 'text' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={company[id] || ''} onChange={e => setCompany({ ...company, [id]: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400 resize-y" rows={3} />
      ) : (
        <input type={type} value={company[id] || ''} onChange={e => setCompany({ ...company, [id]: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400" />
      )}
    </div>
  )

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-bold mb-6">Configuración de la Empresa</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <Field label="Nombre del Negocio" id="name" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="RUT" id="rut" />
          <Field label="Teléfono" id="phone" />
        </div>
        <Field label="Dirección" id="address" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" id="email" type="email" />
          <Field label="Logo (URL)" id="logo" />
        </div>
        <Field label="Condiciones / Notas al pie" id="terms" type="textarea" />
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 border-none cursor-pointer">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        {saved && <span className="text-sm text-brand-600 ml-3">✓ Guardado</span>}
      </div>
    </div>
  )
}
