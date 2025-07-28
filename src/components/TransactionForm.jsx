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
    pos: '',
    amount: '',
    category: '',
    note: '',
    country: '',
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

      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        invoice_url,
        user_id: user.id,
      }

      const { error: insertError } = await supabase.from('transactions').insert(payload)

      if (insertError) throw new Error(insertError.message)

      alert('Transaksi berhasil disimpan!')
      setData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        note: '',
        pos: '',
        country: '',
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
            <div className={`p-1.5 sm:p-2 rounded-xl ${data.type_transaction === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {data.type_transaction === 'pemasukan' ? <TrendUp size={18} /> : <TrendDown size={18} />}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Tambah {data.type_transaction === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">

          {/* Tipe Transaksi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag size={14} /> Tipe Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setData({ ...data, type_transaction: 'pemasukan', pos: '' })}
                className={`p-2 rounded-xl border-2 flex items-center justify-center gap-2 text-sm ${data.type_transaction === 'pemasukan' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}
              >
                <TrendUp size={16} /> Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setData({ ...data, type_transaction: 'pengeluaran', pos: '' })}
                className={`p-2 rounded-xl border-2 flex items-center justify-center gap-2 text-sm ${data.type_transaction === 'pengeluaran' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}
              >
                <TrendDown size={16} /> Pengeluaran
              </button>
            </div>
          </div>

          {/* Tanggal */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarBlank size={14} /> Tanggal
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              🌍 negara
            </label>
            <select
              value={data.country}
              onChange={(e) => setData({ ...data, country: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
              required
            >
              <option value="">-- Pilih country --</option>
              <option value="Turki">Turki</option>
              <option value="Kuwait">Kuwait</option>
              <option value="country Lain">country Lain</option>
            </select>
          </div>

          {/* Pos as Toggle Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag size={14} /> Pos
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(data.type_transaction === 'pemasukan'
                ? ['Penempatan', 'Pelatihan']
                : ['BSD', 'LPK']
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setData({ ...data, pos: item })}
                  className={`p-2 rounded-xl border-2 flex items-center justify-center gap-2 text-sm
                    ${data.pos === item
                      ? data.type_transaction === 'pemasukan'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600'
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag size={14} /> Kategori
            </label>
            <select
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {data.type_transaction === 'pengeluaran' ? (
                <>
                  <option value="Gaji">Gaji</option>
                  <option value="Operasional">Operasional</option>
                  <option value="CB">CB</option>
                </>
              ) : (
                <>
                  <option value="Agency">Agency</option>
                  <option value="Kandidat">Kandidat</option>
                  <option value="Cabang">Cabang</option>
                </>
              )}
            </select>
          </div>

          {/* Jumlah */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CurrencyDollarSimple size={14} /> Jumlah
            </label>
            <input
              type="number"
              value={data.amount}
              onChange={(e) => setData({ ...data, amount: e.target.value })}
              placeholder="Masukkan jumlah"
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm"
              required
            />
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText size={14} /> Catatan
            </label>
            <input
              type="text"
              value={data.note}
              onChange={(e) => setData({ ...data, note: e.target.value })}
              placeholder="Catatan tambahan (opsional)"
              className="w-full p-2.5 border border-gray-200 rounded-xl text-sm"
            />
          </div>

          {/* Upload Bukti */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <UploadSimple size={14} /> Bukti Transaksi
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${dragActive ? 'border-blue-400 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                {file ? (
                  <div className="text-green-600 flex justify-center items-center gap-2">
                    <UploadSimple size={18} /> {file.name}
                  </div>
                ) : (
                  <>
                    <UploadSimple size={20} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-xs mt-1 text-gray-400">PNG, JPG hingga 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 text-sm ${loading ? 'bg-gray-300 text-gray-500' : data.type_transaction === 'pemasukan' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </>
            ) : (
              <>
                {data.type_transaction === 'pemasukan' ? <TrendUp size={16} /> : <TrendDown size={16} />}
                Simpan {data.type_transaction === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TransactionForm
