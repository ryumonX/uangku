import { useState, useEffect } from 'react'
import { supabase } from './services/supabaseClient'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {session ? <Dashboard /> : <Login />}
    </div>
  )
}

export default App
