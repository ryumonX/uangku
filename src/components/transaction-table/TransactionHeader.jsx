import { FunnelSimple, Receipt } from 'phosphor-react'

export default function TransactionHeader({ showFilters, setShowFilters }) {
  return (
    <div className="px-6 py-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <Receipt className="w-6 h-6 mr-2" /> Riwayat Transaksi
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <FunnelSimple className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>
    </div>
  )
}
