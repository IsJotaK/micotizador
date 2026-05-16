import { useEffect, useState, createContext, useContext } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import ConfigPage from './pages/ConfigPage'
import ProductsPage from './pages/ProductsPage'
import ClientsPage from './pages/ClientsPage'
import QuotesPage from './pages/QuotesPage'
import NewQuotePage from './pages/NewQuotePage'
import QuotePreviewPage from './pages/QuotePreviewPage'
import Layout from './components/Layout'

export const AuthContext = createContext(null)

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <div className="h-screen flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription?.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUp />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/config" element={<ProtectedRoute><Layout><ConfigPage /></Layout></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Layout><ProductsPage /></Layout></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Layout><ClientsPage /></Layout></ProtectedRoute>} />
        <Route path="/quotes" element={<ProtectedRoute><Layout><QuotesPage /></Layout></ProtectedRoute>} />
        <Route path="/quotes/new" element={<ProtectedRoute><Layout><NewQuotePage /></Layout></ProtectedRoute>} />
        <Route path="/quotes/:id" element={<ProtectedRoute><Layout><QuotePreviewPage /></Layout></ProtectedRoute>} />
      </Routes>
    </AuthContext.Provider>
  )
}
