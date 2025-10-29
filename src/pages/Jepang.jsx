import { useEffect, useState } from "react"
import { Plus } from "phosphor-react"
import { supabase } from "../services/supabaseClient"
import CandidateList from "../components/jepang/candidateList"
import TransactionForm from "../components/TransactionForm"
import MassUploadModal from "../components/jepang/transactionmashform"

export default function Jepang() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isMassUploadOpen, setMassUploadOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      const session = await supabase.auth.getSession()
      const user = session.data.session?.user
      if (!user) return
    }
    fetchStats()
  }, [refreshTrigger])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-x-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6 mb-6 lg:mb-10">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-indigo-600 bg-clip-text text-transparent">
              Jepang
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-lg font-medium">
              Kelola transaksi keuangan Anda
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-4">
            {/* Upload Excel */}
            <button
              onClick={() => setMassUploadOpen(true)}
              className="group w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-3 lg:px-7 lg:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-sm sm:text-base">Upload Excel</span>
              </div>
            </button>

            {/* Tambah Transaksi */}
            <button
              onClick={() => setShowModal(true)}
              className="group w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-3 lg:px-7 lg:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-sm sm:text-base">Tambah Transaksi</span>
              </div>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-2 sm:p-4 md:p-6">
          <CandidateList refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Modal Tambah Transaksi */}
      {showModal && (
        <TransactionForm
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setRefreshTrigger((prev) => prev + 1)
            setShowModal(false)
          }}
        />
      )}

      {/* Modal Mass Upload */}
      <MassUploadModal
        open={isMassUploadOpen}
        onClose={() => {
          setMassUploadOpen(false)
          setRefreshTrigger((prev) => prev + 1)
        }}
      />
    </div>
  )
}
