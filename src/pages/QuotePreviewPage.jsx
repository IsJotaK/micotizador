import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const fmt = (n) => (n || 0).toLocaleString('es-CL')
const unitLabel = (u) => ({ unidad: 'Por unidad', metro: 'Por metro', m2: 'Por m²', kit: 'Por kit', global: 'Global', hrs: 'Por hora' }[u] || u)

export default function QuotePreviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState(null)
  const [company, setCompany] = useState(null)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const comp = await supabase.from('companies').select('*').eq('user_id', user.id).single()
      setCompany(comp.data)
      const { data } = await supabase.from('quotes').select('*').eq('id', id).single()
      setQuote(data)
    })()
  }, [id])

  const handlePrint = () => window.print()

  const handleEmail = () => {
    if (!quote || !company) return
    const subj = encodeURIComponent('Cotización ' + quote.number + ' - ' + company.name)
    const body = encodeURIComponent(
      `Estimado/a,\n\nAdjunto cotización ${quote.number} de ${company.name}.\n\nQuedo atento a cualquier consulta.\n\nSaludos,\n${company.name}\n${company.phone || ''}`
    )
    window.open(`mailto:${quote.client_email}?subject=${subj}&body=${body}`, '_blank')
  }

  const handleCopy = () => {
    if (!quote) return
    let text = `*COTIZACIÓN ${company?.name || 'Mi Negocio'}*\n${quote.number}\nCliente: ${quote.client_name}\n`
    text += `━━━━━━━━━━━━━━━━━━━━\n`
    ;(quote.items || []).forEach(i => { text += `${i.name} x${i.qty} = $${fmt(i.price * i.qty)}\n` })
    text += `━━━━━━━━━━━━━━━━━━━━\nSubtotal: $${fmt(quote.subtotal)}\nIVA 19%: $${fmt(quote.iva)}\n*Total: $${fmt(quote.total)}*\n`
    text += `━━━━━━━━━━━━━━━━━━━━\n${company?.name} · ${company?.phone || ''}`
    navigator.clipboard.writeText(text).then(() => alert('Cotización copiada al portapapeles'))
  }

  if (!quote || !company) return <div className="text-center text-gray-400 py-12 text-sm">Cargando...</div>

  const items = quote.items || []

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 no-print flex-wrap">
        <button onClick={() => navigate('/quotes')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 transition-colors border-none cursor-pointer text-gray-600">
          ← Volver
        </button>
        <button onClick={handlePrint} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors border-none cursor-pointer">
          📄 Descargar PDF
        </button>
        <button onClick={handleEmail} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors border-none cursor-pointer">
          ✉️ Enviar Email
        </button>
        <button onClick={handleCopy} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors border-none cursor-pointer">
          📋 Copiar
        </button>
      </div>

      {/* Preview */}
      <div className="max-w-[800px] mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        {/* Header */}
        <div className="p-6 sm:p-8 flex justify-between items-start border-b-[3px] border-brand-500 print:p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🏢</div>
            <div>
              <h1 className="text-lg font-bold">{company.name}</h1>
              <p className="text-xs text-gray-500">{company.rut ? 'RUT: ' + company.rut : ''}{company.rut && company.address ? ' · ' : ''}{company.address || ''}</p>
              <p className="text-xs text-gray-500">{company.phone ? 'Tel: ' + company.phone : ''}{company.phone && company.email ? ' · ' : ''}{company.email ? company.email : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">{quote.number}</div>
            <div className="text-xs text-gray-500 mt-0.5">{new Date(quote.date).toLocaleDateString('es-CL')}</div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 sm:p-6 border-b border-gray-200 print:p-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Cliente</span>
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <span><strong>{quote.client_name}</strong></span>
              <span><strong>{quote.number}</strong></span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <span>{quote.client_rut ? 'RUT: ' + quote.client_rut : ''}</span>
              <span>Fecha: {new Date(quote.date).toLocaleDateString('es-CL')}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <span>{quote.client_giro ? 'Giro: ' + quote.client_giro : ''}</span>
              <span>Válida hasta: {new Date(quote.valid_until).toLocaleDateString('es-CL')}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <span>{quote.client_address || ''}</span>
              <span></span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <span>{quote.client_phone ? 'Tel: ' + quote.client_phone : ''}</span>
              <span></span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <span>{quote.client_email ? 'Email: ' + quote.client_email : ''}</span>
              <span>{quote.client_project ? 'Proyecto: ' + quote.client_project : ''}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-4 sm:px-6 print:px-4">
          <table className="w-full border-collapse my-3 text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wide border-b-2 border-gray-200">
                <th className="text-left py-2 pr-2">Producto / Servicio</th>
                <th className="text-right py-2 px-2">Cant</th>
                <th className="text-right py-2 px-2">P. Unitario</th>
                <th className="text-right py-2 pl-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 pr-2">
                    <span className="font-medium">{i.name}</span>
                  </td>
                  <td className="text-right py-2 px-2">{i.qty}</td>
                  <td className="text-right py-2 px-2">${fmt(i.price)}</td>
                  <td className="text-right py-2 pl-2 font-bold text-brand-600">${fmt(i.price * i.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-4 sm:px-6 text-right mb-3 print:px-4">
          <div className="flex justify-end gap-6 text-sm text-gray-500"><span>Subtotal</span><span className="w-24 text-right">${fmt(quote.subtotal)}</span></div>
          <div className="flex justify-end gap-6 text-sm text-gray-500 mt-1"><span>IVA 19%</span><span className="w-24 text-right">${fmt(quote.iva)}</span></div>
          <div className="flex justify-end gap-6 text-lg font-bold mt-2 pt-2 border-t-2 border-gray-900">
            <span>Total</span>
            <span className="w-24 text-right text-brand-600">${fmt(quote.total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs text-gray-500 print:p-4">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Condiciones</h4>
            <p>{company.terms || 'Válida por 15 días.'}</p>
          </div>
          <div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <strong className="text-gray-700">{company.name}</strong>
              {company.rut ? <><br />RUT: {company.rut}</> : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
