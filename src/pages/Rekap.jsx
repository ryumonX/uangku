import { useEffect, useState } from "react"
import { Plus } from "phosphor-react"
import { supabase } from "../services/supabaseClient"
import CandidateList from "../components/recap/candidateList"
import MassUploadModal from "../components/transactionmash-form/transactionmashform"

export default function Rekap() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isMassUploadOpen, setMassUploadOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      const session = await supabase.auth.getSession()
      const user = session.data.session?.user
      if (!user) return
      // kalau butuh, bisa tambahin fetch data summary / stat disini
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
              Rekap
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">
              Kelola transaksi keuangan Anda
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Tombol upload excel */}
            <button
              onClick={() => setMassUploadOpen(true)}
              className="group relative w-full sm:w-auto px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              <div className="flex items-center justify-center gap-2 lg:gap-3">
                <Plus className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-sm sm:text-base lg:text-lg">
                  Upload Excel
                </span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200/50">
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
              Riwayat Transaksi
            </h2>
          </div>
          <div className="p-0">
            <CandidateList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>

      {/* Mass Upload Modal */}
      <MassUploadModal
        open={isMassUploadOpen}
        onClose={() => {
          setMassUploadOpen(false)
          setRefreshTrigger((prev) => prev + 1) // supaya data terbaru ke-refresh
        }}
      />
    </div>
  )
}
