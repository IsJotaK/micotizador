import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const defaultProducts = [
  { name: 'Split 9000 BTU', category: 'Equipos', price: 450000, unit: 'unidad' },
  { name: 'Split 12000 BTU', category: 'Equipos', price: 550000, unit: 'unidad' },
  { name: 'Split 18000 BTU', category: 'Equipos', price: 750000, unit: 'unidad' },
  { name: 'Tubería cobre 1/4"', category: 'Materiales', price: 12000, unit: 'metro' },
  { name: 'Tubería cobre 3/8"', category: 'Materiales', price: 15000, unit: 'metro' },
  { name: 'Cable eléctrico 2x14', category: 'Materiales', price: 5000, unit: 'metro' },
  { name: 'Instalación split básica', category: 'Servicios', price: 80000, unit: 'global' },
  { name: 'Mano de obra adicional', category: 'Servicios', price: 40000, unit: 'hrs' },
]

const unitLabel = (u) => ({ unidad: 'Por unidad', metro: 'Por metro', m2: 'Por m²', kit: 'Por kit', global: 'Global', hrs: 'Por hora' }[u] || u)

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [companyId, setCompanyId] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'Equipos', price: '', unit: 'unidad' })

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
      if (!company) return
      setCompanyId(company.id)
      const { data } = await supabase.from('products').select('*').eq('company_id', company.id).order('created_at')
      setProducts(data && data.length > 0 ? data : [])
      if (!data || data.length === 0) {
        const inserts = defaultProducts.map(p => ({ ...p, company_id: company.id }))
        await supabase.from('products').insert(inserts)
        const { data: reload } = await supabase.from('products').select('*').eq('company_id', company.id).order('created_at')
        setProducts(reload || [])
      }
    })()
  }, [])

  const addProduct = async () => {
    if (!form.name || !form.price) return
    const { data } = await supabase.from('products').insert({ ...form, price: parseInt(form.price), company_id: companyId }).select().single()
    if (data) setProducts([...products, data])
    setForm({ name: '', category: 'Equipos', price: '', unit: 'unidad' })
  }

  const deleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(products.filter(p => p.id !== id))
  }

  const editProduct = async (p) => {
    const name = prompt('Nombre:', p.name)
    if (!name) return
    const price = parseInt(prompt('Precio:', p.price))
    if (!price) return
    const category = prompt('Categoría:', p.category) || p.category
    const unit = prompt('Unidad:', p.unit) || p.unit
    await supabase.from('products').update({ name, price, category, unit }).eq('id', p.id)
    setProducts(products.map(x => x.id === p.id ? { ...x, name, price, category, unit } : x))
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Productos</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
          <input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400 bg-white">
            {['Equipos', 'Materiales', 'Servicios'].map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="number" placeholder="Precio" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400" />
          <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400 bg-white">
            {['unidad', 'metro', 'm2', 'kit', 'global', 'hrs'].map(u => <option key={u} value={u}>{unitLabel(u)}</option>)}
          </select>
        </div>
        <button onClick={addProduct} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors border-none cursor-pointer">
          Agregar
        </button>
      </div>

      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{p.name}</div>
              <div className="text-xs text-gray-400">{p.category} · ${p.price.toLocaleString('es-CL')} · {unitLabel(p.unit)}</div>
            </div>
            <button onClick={() => editProduct(p)} className="text-xs text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer">✏️</button>
            <button onClick={() => deleteProduct(p.id)} className="text-xs text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">🗑️</button>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No hay productos</p>}
      </div>
    </div>
  )
}
