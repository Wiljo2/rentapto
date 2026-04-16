import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Auth from './pages/Auth'
import MyApartments from './pages/MyApartments'
import AddEdit from './pages/AddEdit'
import Compare from './pages/Compare'

const NAV = [
  { to: '/', label: 'Mis Apartamentos', end: true },
  { to: '/compare', label: 'Comparar' },
]

function Layout({ children, onSignOut, userEmail }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <span className="text-lg">🏢</span>
              <span>RentApto</span>
            </span>
            <nav className="flex gap-1">
              {NAV.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block truncate max-w-40">{userEmail}</span>
            <button
              onClick={onSignOut}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

function ProtectedRoutes({ user, signOut }) {
  return (
    <Layout onSignOut={signOut} userEmail={user.email}>
      <Routes>
        <Route path="/" element={<MyApartments />} />
        <Route path="/apartment/:id" element={<MyApartments />} />
        <Route path="/add" element={<AddEdit />} />
        <Route path="/edit/:id" element={<AddEdit />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  const { user, loading, signOut } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-400 text-sm">Cargando...</div>
    </div>
  )

  return (
    <BrowserRouter>
      {user
        ? <ProtectedRoutes user={user} signOut={signOut} />
        : <Routes><Route path="*" element={<Auth />} /></Routes>
      }
    </BrowserRouter>
  )
}
