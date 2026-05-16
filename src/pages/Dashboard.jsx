import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ quotes: 0, products: 0, clients: 0 })

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
      if (!company) return
      const cid = company.id
      const [q, p, cl] = await Promise.all([
        supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('company_id', cid),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('company_id', cid),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('company_id', cid),
      ])
      setStats({ quotes: q.count || 0, products: p.count || 0, clients: cl.count || 0 })
    })()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Panel de Control</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-brand-600">{stats.quotes}</div>
          <div className="text-sm text-gray-500 mt-1">Cotizaciones</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-brand-600">{stats.products}</div>
          <div className="text-sm text-gray-500 mt-1">Productos</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-brand-600">{stats.clients}</div>
          <div className="text-sm text-gray-500 mt-1">Clientes</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/quotes/new" className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 transition-colors no-underline">
          <div className="text-lg font-semibold text-gray-900">Nueva Cotización</div>
          <p className="text-sm text-gray-500 mt-1">Crea una cotización al instante</p>
        </Link>
        <Link to="/quotes" className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 transition-colors no-underline">
          <div className="text-lg font-semibold text-gray-900">Ver Cotizaciones</div>
          <p className="text-sm text-gray-500 mt-1">Historial de cotizaciones emitidas</p>
        </Link>
        <Link to="/products" className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 transition-colors no-underline">
          <div className="text-lg font-semibold text-gray-900">Productos</div>
          <p className="text-sm text-gray-500 mt-1">Administra tu catálogo</p>
        </Link>
        <Link to="/clients" className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 transition-colors no-underline">
          <div className="text-lg font-semibold text-gray-900">Clientes</div>
          <p className="text-sm text-gray-500 mt-1">Tus clientes frecuentes</p>
        </Link>
      </div>
    </div>
  )
}
