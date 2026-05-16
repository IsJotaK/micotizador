import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const nav = [
  { to: '/dashboard', label: 'Inicio', icon: '📊' },
  { to: '/quotes/new', label: 'Nueva Cotización', icon: '➕' },
  { to: '/quotes', label: 'Cotizaciones', icon: '📄' },
  { to: '/products', label: 'Productos', icon: '📦' },
  { to: '/clients', label: 'Clientes', icon: '👥' },
  { to: '/config', label: 'Config', icon: '⚙️' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="text-lg font-bold text-brand-600 no-underline">
            MiCotizador
          </Link>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="w-56 bg-white border-r border-gray-200 hidden lg:flex flex-col gap-1 p-3 no-print">
          {nav.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors ${
                location.pathname === to
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {children}
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex no-print z-50">
        {nav.filter(n => n.to !== '/quotes/new').map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center py-2 text-xs no-underline ${
              location.pathname === to ? 'text-brand-600' : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span className="mt-0.5">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
