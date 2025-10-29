import { useState, useEffect } from 'react'
import { supabase } from './services/supabaseClient'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/login'
import Dashboard from './pages/dashboard'
import Rekap from './pages/Rekap'
import Turki from './pages/Turki'
import Kuwait from './pages/Kuwait'
import Jepang from './pages/Jepang'

// Komponen ProtectedRoute biar reusable
function ProtectedRoute({ session, loading, children }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ambil session awal
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // listen kalau ada perubahan login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route
            path="/"
            element={session ? <Dashboard /> : <Login />}
          />

          <Route
            path="/rekap"
            element={
              <ProtectedRoute session={session} loading={loading}>
                <Rekap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/turki"
            element={
              <ProtectedRoute session={session} loading={loading}>
                <Turki />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kuwait"
            element={
              <ProtectedRoute session={session} loading={loading}>
                <Kuwait />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jepang"
            element={
              <ProtectedRoute session={session} loading={loading}>
                <Jepang />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </Router>
  )
}

export default App
