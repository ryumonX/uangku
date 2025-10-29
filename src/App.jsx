import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase } from './services/supabaseClient'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/login'
import Layout from './components/layout'

// Lazy load semua komponen halaman
const Dashboard = lazy(() => import('./pages/dashboard'))
const Rekap = lazy(() => import('./pages/Rekap'))
const Turki = lazy(() => import('./pages/Turki'))
const Kuwait = lazy(() => import('./pages/Kuwait'))
const Jepang = lazy(() => import('./pages/Jepang'))

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

// Loading component untuk Suspense fallback
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
)

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* login page */}
          <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Login />} />

          {/* protected pages with sidebar */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute session={session} loading={loading}>
                <Layout>
                  <Suspense fallback={<PageLoading />}>
                    <Dashboard />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rekap"
            element={
              <ProtectedRoute session={session} loading={loading}>
                <Layout>
                  <Suspense fallback={<PageLoading />}>
                    <Rekap />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/turki"
            element={
              <ProtectedRoute session={session} loading={loading}>
                <Layout>
                  <Suspense fallback={<PageLoading />}>
                    <Turki />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kuwait"
            element={
              <ProtectedRoute session={session} loading={loading}>
                <Layout>
                  <Suspense fallback={<PageLoading />}>
                    <Kuwait />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/jepang"
            element={
              <ProtectedRoute session={session} loading={loading}>
                <Layout>
                  <Suspense fallback={<PageLoading />}>
                    <Jepang />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}