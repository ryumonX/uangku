import { useEffect, useState } from 'react'
import { Plus } from 'phosphor-react'
import { supabase } from '../services/supabaseClient'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    masuk: 0,
    keluar: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const session = await supabase.auth.getSession()
      const user = session.data.session?.user
      if (!user) return

      const userId = user.id
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      const { count: totalCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: monthCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('date', startOfMonth)

      const { count: masukCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type_transaction', 'pemasukan')

      const { count: keluarCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type_transaction', 'pengeluaran')

      setStats({
        total: totalCount || 0,
        thisMonth: monthCount || 0,
        masuk: masukCount || 0,
        keluar: keluarCount || 0,
      })
    }

    fetchStats()
  }, [refreshTrigger])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 lg:mb-10">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">
              Kelola transaksi keuangan Anda
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="group relative w-full sm:w-auto px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
          >
            <div className="flex items-center justify-center gap-2 lg:gap-3">
              <Plus className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm sm:text-base lg:text-lg">Tambah Transaksi</span>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <TransactionForm
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setRefreshTrigger((prev) => prev + 1)
              setShowModal(false)
            }}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard title="Total Transaksi" value={stats.total} bgColor="bg-blue-100" iconColor="bg-blue-600" />
          <StatCard title="Bulan Ini" value={stats.thisMonth} bgColor="bg-green-100" iconColor="bg-green-600" />
          <StatCard title="Masuk" value={stats.masuk} bgColor="bg-emerald-100" iconColor="bg-emerald-600" />
          <StatCard title="Keluar" value={stats.keluar} bgColor="bg-rose-100" iconColor="bg-rose-600" />
        </div>

        {/* Transaction List */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200/50">
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">Riwayat Transaksi</h2>
          </div>
          <div className="p-0">
            <TransactionList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  )
}
