import { useEffect, useState } from 'react'
import { FunnelSimple, MagnifyingGlass, X } from 'phosphor-react'

export default function TransactionFilters({
  filters,
  categories,
  onChange,
  onReset,
  onSearch,
}) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(localSearch)
    }, 500)

    return () => clearTimeout(timeout)
  }, [localSearch])

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.category !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    localSearch !== ''

  return (
<div className="bg-[#dbeafe]/60 backdrop-blur-md shadow-sm hover:shadow-md transition duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-xl">
            <FunnelSimple className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Filter Transaksi</h3>
            {hasActiveFilters && (
              <p className="text-xs text-blue-600 font-medium">Filter aktif</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <FunnelSimple
            className={`w-5 h-5 text-slate-600 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-sm">
            <FunnelSimple className="w-5 h-5 text-slate-700" />
          </div>
          <h3 className="font-semibold text-slate-800">Filter & Pencarian</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Filter aktif
            </span>
          )}
        </div>
      </div>

      {/* Filters Content */}
      <div
        className={`px-4 lg:px-6 transition-all duration-300 ${
          isExpanded || window.innerWidth >= 1024
            ? 'pb-6'
            : 'pb-0 max-h-0 overflow-hidden lg:max-h-none lg:pb-6'
        }`}
      >
        {/* Search Bar */}
        <div className="mb-4 lg:mb-6">
          <div className="relative group">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari catatan transaksi..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 lg:py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm hover:shadow-md focus:shadow-lg"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipe Transaksi
            </label>
            <select
              value={filters.type}
              onChange={(e) => onChange('type', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">Semua Tipe</option>
              <option value="pemasukan">💰 Pemasukan</option>
              <option value="pengeluaran">💸 Pengeluaran</option>
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Kategori
            </label>
            <select
              value={filters.category}
              onChange={(e) => onChange('category', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange('dateFrom', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange('dateTo', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-slate-600">
            {hasActiveFilters ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Filter sedang diterapkan
              </span>
            ) : (
              'Tidak ada filter aktif'
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-6 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reset Filter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
