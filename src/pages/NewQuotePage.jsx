import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const fmt = (n) => (n || 0).toLocaleString('es-CL')

export default function NewQuotePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [company, setCompany] = useState(null)
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [client, setClient] = useState({ name: '', rut: '', giro: '', address: '', phone: '', email: '', project: '' })
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (location.state?.client) {
      const c = location.state.client
      setClient({ name: c.name || '', rut: c.rut || '', giro: c.giro || '', address: c.address || '', phone: c.phone || '', email: c.email || '', project: '' })
    }
  }, [location.state])

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: comp } = await supabase.from('companies').select('*').eq('user_id', user.id).single()
      if (!comp) return
      setCompany(comp)
      const [p, cl] = await Promise.all([
        supabase.from('products').select('*').eq('company_id', comp.id).order('created_at'),
        supabase.from('clients').select('*').eq('company_id', comp.id).order('created_at'),
      ])
      setProducts(p.data || [])
      setClients(cl.data || [])
    })()
  }, [])

  const addItem = (product) => {
    const ex = items.find(i => i.product_id === product.id)
    if (ex) {
      setItems(items.map(i => i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i))
    } else {
      setItems([...items, { product_id: product.id, name: product.name, qty: 1, price: product.price }])
    }
  }

  const setQty = (productId, val) => {
    const n = parseInt(val)
    if (isNaN(n) || n <= 0) {
      setItems(items.filter(i => i.product_id !== productId))
    } else {
      setItems(items.map(i => i.product_id === productId ? { ...i, qty: n } : i))
    }
  }

  const changeQty = (productId, delta) => {
    const item = items.find(i => i.product_id === productId)
    if (!item) return
    const n = item.qty + delta
    if (n <= 0) {
      setItems(items.filter(i => i.product_id !== productId))
    } else {
      setItems(items.map(i => i.product_id === productId ? { ...i, qty: n } : i))
    }
  }

  const removeItem = (productId) => setItems(items.filter(i => i.product_id !== productId))

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const iva = Math.round(subtotal * 0.19)
  const total = subtotal + iva

  const filteredProducts = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  )
  const grouped = {}
  filteredProducts.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = []
    grouped[p.category].push(p)
  })

  const handleSave = async () => {
    if (!client.name || !client.email) { alert('El nombre y email del cliente son obligatorios'); return }
    if (items.length === 0) { alert('Agrega al menos un producto'); return }
    setSaving(true)
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = now.getFullYear()
    const { count } = await supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('company_id', company.id)
    const num = `COT-${yyyy}${mm}${dd}-${String((count || 0) + 1).padStart(4, '0')}`
    const validUntil = new Date(now); validUntil.setDate(validUntil.getDate() + 15)

    const { data } = await supabase.from('quotes').insert({
      company_id: company.id,
      number: num,
      client_name: client.name,
      client_rut: client.rut,
      client_giro: client.giro,
      client_address: client.address,
      client_phone: client.phone,
      client_email: client.email,
      client_project: client.project,
      date: now.toISOString().split('T')[0],
      valid_until: validUntil.toISOString().split('T')[0],
      subtotal, iva, total,
      items,
      status: 'issued',
    }).select().single()

    setSaving(false)
    if (data) navigate(`/quotes/${data.id}`)
  }

  return (
    <div className="h-full">
      <h2 className="text-xl font-bold mb-4">Nueva Cotización</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* LEFT */}
        <div className="space-y-4">
          {/* Company mini */}
          {company && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">🏢</div>
              <div>
                <div className="font-bold text-sm">{company.name}</div>
                <div className="text-xs text-gray-400">{[company.rut, company.phone].filter(Boolean).join(' · ')}</div>
              </div>
            </div>
          )}

          {/* Client */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold mb-3">Datos del Cliente</h3>
            {clients.length > 0 && (
              <select onChange={e => {
                const c = clients.find(x => x.id === e.target.value)
                if (c) setClient({ name: c.name, rut: c.rut, giro: c.giro, address: c.address, phone: c.phone, email: c.email, project: client.project })
              }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400 bg-white mb-3">
                <option value="">— Cliente frecuente —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[{ k: 'name', p: 'Nombre *' }, { k: 'rut', p: 'RUT' }, { k: 'giro', p: 'Giro' }, { k: 'address', p: 'Dirección' }, { k: 'phone', p: 'Teléfono' }, { k: 'email', p: 'Email *' }].map(f => (
                <input key={f.k} placeholder={f.p} value={client[f.k]} onChange={e => setClient({ ...client, [f.k]: e.target.value })}
                  className={`px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400 ${f.k === 'name' || f.k === 'address' ? 'sm:col-span-2' : ''}`} />
              ))}
              <input placeholder="Proyecto / Obra" value={client.project} onChange={e => setClient({ ...client, project: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400 sm:col-span-2" />
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold mb-3">Productos</h3>
            <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-400 mb-3" />
            <div className="max-h-80 overflow-y-auto space-y-1">
              {Object.entries(grouped).map(([cat, prods]) => (
                <div key={cat}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1 py-1.5">{cat}</div>
                  {prods.map(p => (
                    <div key={p.id} onClick={() => addItem(p)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-brand-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.unit === 'unidad' ? '' : `(${p.unit})`}</div>
                      </div>
                      <div className="text-sm font-bold text-brand-600">${fmt(p.price)}</div>
                      <button onClick={(e) => { e.stopPropagation(); addItem(p) }}
                        className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 text-lg font-bold flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors border-none cursor-pointer">+</button>
                    </div>
                  ))}
                </div>
              ))}
              {Object.keys(grouped).length === 0 && <p className="text-sm text-gray-400 text-center py-6">Sin resultados</p>}
            </div>
          </div>
        </div>

        {/* RIGHT - Live Preview */}
        <div className="xl:sticky xl:top-6 self-start">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b-2 border-brand-500">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">🏢</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{company?.name || 'Mi Negocio'}</div>
                  <div className="text-xs text-gray-400">{company?.rut || ''}</div>
                </div>
                <div className="text-xs text-gray-400 text-right whitespace-nowrap">COT-PREVIEW</div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <strong>Cliente:</strong> {client.name || '—'}{client.rut ? ` · ${client.rut}` : ''}
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-[1fr_70px_70px_70px] gap-1 text-xs font-bold text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-200">
                <span>Producto</span>
                <span className="text-right">Cant.</span>
                <span className="text-right">Precio</span>
                <span className="text-right">Total</span>
              </div>
              <div className="min-h-[80px]">
                {items.map(i => (
                  <div key={i.product_id} className="grid grid-cols-[1fr_70px_70px_70px] gap-1 py-2 border-b border-gray-100 text-sm items-center">
                    <span className="font-medium">{i.name}</span>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => changeQty(i.product_id, -1)}
                        className="w-5 h-5 rounded-full border border-gray-200 text-xs font-bold bg-white flex items-center justify-center hover:border-brand-400 cursor-pointer leading-none">−</button>
                      <input type="number" min="1" value={i.qty} onChange={e => setQty(i.product_id, e.target.value)}
                        className="w-8 text-center border border-gray-200 rounded text-xs font-bold outline-none focus:border-brand-400" />
                      <button onClick={() => changeQty(i.product_id, 1)}
                        className="w-5 h-5 rounded-full border border-gray-200 text-xs font-bold bg-white flex items-center justify-center hover:border-brand-400 cursor-pointer leading-none">+</button>
                      <button onClick={() => removeItem(i.product_id)}
                        className="text-red-400 text-xs bg-transparent border-none cursor-pointer">✕</button>
                    </div>
                    <span className="text-right">${fmt(i.price)}</span>
                    <span className="text-right font-bold">${fmt(i.price * i.qty)}</span>
                  </div>
                ))}
                {items.length === 0 && <div className="text-center py-6 text-xs text-gray-400">Agrega productos desde la lista</div>}
              </div>
              <div className="border-t-2 border-gray-200 pt-2 mt-1 space-y-1">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>IVA 19%</span><span>${fmt(iva)}</span></div>
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2"><span>Total</span><span className="text-brand-600">${fmt(total)}</span></div>
              </div>
            </div>

            <div className="p-4 flex gap-2 border-t border-gray-100">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 border-none cursor-pointer">
                {saving ? 'Guardando...' : 'Generar Cotización'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
