import { useState } from 'react'
import {
  X,
  UploadSimple,
  CalendarBlank,
  CurrencyDollarSimple,
  Tag,
  FileText,
  TrendUp,
  TrendDown
} from 'phosphor-react'
import { supabase } from '../services/supabaseClient'


function TransactionForm({ onClose, onSuccess }) {
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    note: '',
    type_transaction: 'pengeluaran'
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
      alert('Jumlah harus angka yang valid dan lebih dari 0')
      return
    }

    setLoading(true)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (!session || sessionError) {
        throw new Error('Kamu belum login atau sesi habis')
      }

      const user = session.user
      let invoice_url = null

      // Upload file kalau ada
      if (file) {
        const fileExt = file.name.split('.').pop()
        const filePath = `invoices/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(filePath, file)

        if (uploadError || !uploadData) {
          throw new Error('Gagal upload file: ' + (uploadError?.message || 'Unknown'))
        }

        const { data: publicData } = supabase.storage
          .from('invoices')
          .getPublicUrl(uploadData.path)

        invoice_url = publicData?.publicUrl || null
      }

      // Siapkan payload
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        invoice_url,
        user_id: user.id,
      }

      // Simpan ke Supabase
      const { error: insertError } = await supabase.from('transactions').insert(payload)

      if (insertError) {
        throw new Error(insertError.message)
      }

      alert('Transaksi berhasil disimpan!')
      setData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        note: '',
        type_transaction: 'pengeluaran'
      })
      setFile(null)
      onSuccess?.() 
      onClose()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Terjadi kesalahan saat menyimpan transaksi')
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 animate-in max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-xl ${data.type === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {data.type === 'pemasukan' ? <TrendUp size={18} className="sm:w-5 sm:h-5" /> : <TrendDown size={18} className="sm:w-5 sm:h-5" />}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Tambah {data.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={18} className="sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Transaction Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag size={14} className="sm:w-4 sm:h-4" />
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setData({ ...data, type_transaction: 'pemasukan' })}
                className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${data.type_transaction === 'pemasukan'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
              >
                <TrendUp size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Pemasukan</span>
                <span className="xs:hidden">Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => setData({ ...data, type_transaction: 'pengeluaran' })}
                className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${data.type_transaction === 'pengeluaran'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
              >
                <TrendDown size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Pengeluaran</span>
                <span className="xs:hidden">Keluar</span>
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarBlank size={14} className="sm:w-4 sm:h-4" />
              Tanggal
            </label>
            <input
              type="date"
              className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm sm:text-base"
              required
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CurrencyDollarSimple size={14} className="sm:w-4 sm:h-4" />
              Jumlah
            </label>
            <input
              type="number"
              placeholder="Masukkan jumlah"
              className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              required
              value={data.amount}
              onChange={(e) => setData({ ...data, amount: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag size={14} className="sm:w-4 sm:h-4" />
              Kategori
            </label>
            <select
              className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              required
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="Kandidat">Kandidat</option>
              <option value="Gaji">Gaji</option>
              <option value="Operasional">Operasional</option>
            </select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText size={14} className="sm:w-4 sm:h-4" />
              Catatan
            </label>
            <input
              type="text"
              placeholder="Catatan tambahan (opsional)"
              className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              value={data.note}
              onChange={(e) => setData({ ...data, note: e.target.value })}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <UploadSimple size={14} className="sm:w-4 sm:h-4" />
              Bukti Transaksi
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 transition-all duration-200 ${dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : file
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <UploadSimple size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <UploadSimple size={20} className="sm:w-6 sm:h-6 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm">
                      <span className="font-medium text-blue-600">Klik untuk upload</span>
                      <span className="hidden xs:inline"> atau drag & drop</span>
                    </p>
                    <p className="text-xs mt-1">PNG, JPG hingga 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : data.type_transaction === 'pemasukan'
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
              }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden xs:inline">Menyimpan...</span>
                <span className="xs:hidden">Simpan...</span>
              </>
            ) : (
              <>
                {data.type_transaction === 'pemasukan' ? <TrendUp size={16} className="sm:w-[18px] sm:h-[18px]" /> : <TrendDown size={16} className="sm:w-[18px] sm:h-[18px]" />}
                <span className="hidden xs:inline">
                  Simpan {data.type_transaction === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
                <span className="xs:hidden">
                  Simpan
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionForm