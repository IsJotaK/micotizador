import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([])

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
      if (!company) return
      const { data } = await supabase.from('quotes').select('*').eq('company_id', company.id).order('created_at', { ascending: false })
      setQuotes(data || [])
    })()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Cotizaciones</h2>
        <Link to="/quotes/new"
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors no-underline">
          + Nueva
        </Link>
      </div>
      <div className="space-y-2">
        {quotes.map(q => (
          <Link key={q.id} to={`/quotes/${q.id}`}
            className="block bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-brand-300 transition-colors no-underline">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-gray-900">{q.number}</div>
                <div className="text-xs text-gray-500 mt-0.5">{q.client_name} · {new Date(q.date).toLocaleDateString('es-CL')}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">${q.total?.toLocaleString('es-CL')}</div>
                <div className={`text-xs font-medium ${q.status === 'draft' ? 'text-yellow-500' : 'text-green-600'}`}>
                  {q.status === 'draft' ? 'Borrador' : 'Emitida'}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {quotes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">No hay cotizaciones aún</p>
            <Link to="/quotes/new" className="text-sm text-brand-600 font-medium mt-2 inline-block no-underline">
              Crear primera cotización
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
