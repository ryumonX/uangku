import { useState } from 'react'
import {
  X, UploadSimple, CalendarBlank, CurrencyDollarSimple,
  Tag, FileText, TrendUp, TrendDown,
} from 'phosphor-react'
import { supabase } from '../services/supabaseClient'
import FilePicker from './FilePicker'

// === Komponen: Tipe Transaksi ===
const TransactionTypeSelector = ({ type, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      <Tag size={14} /> Tipe Transaksi
    </label>
    <div className="grid grid-cols-2 gap-2">
      {['pemasukan', 'pengeluaran'].map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`p-2 rounded-xl border-2 flex items-center justify-center gap-2 text-sm ${
            type === t
              ? t === 'pemasukan'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          {t === 'pemasukan' ? <TrendUp size={16} /> : <TrendDown size={16} />}
          {t === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
        </button>
      ))}
    </div>
  </div>
)

// === Komponen: Pos Selector ===
const PosSelector = ({ type, pos, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      <Tag size={14} /> Pos
    </label>
    <div className="grid grid-cols-2 gap-2">
      {(type === 'pemasukan' ? ['Penempatan', 'Pelatihan'] : ['BSD', 'LPK']).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`p-2 rounded-xl border-2 flex items-center justify-center gap-2 text-sm ${
            pos === item
              ? type === 'pemasukan'
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
)

// === Komponen: Input Field ===
const InputField = ({ label, icon, type = 'text', value, onChange, placeholder, required = false, options = null }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon} {label}
    </label>
    {options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
        required={required}
      >
        <option value="">-- Pilih {label} --</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-2.5 border border-gray-200 rounded-xl text-sm ${type === 'date' ? 'bg-gray-50' : ''}`}
        required={required}
      />
    )}
  </div>
)

// === Komponen Utama: TransactionForm ===
function TransactionForm({ onClose, onSuccess }) {
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    pos: '',
    amount: '',
    category: '',
    note: '',
    country: '',
    type_transaction: 'pengeluaran',
  })

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const updateData = (key, value) => setData((prev) => ({ ...prev, [key]: value }))

  // === Upload file ke Supabase Storage ===
  const uploadFileToSupabase = async () => {
    if (!file) return null

    const fileExt = file.name.split('.').pop()
    const filePath = `invoices/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(filePath, file)

    if (uploadError) throw new Error('Gagal upload file: ' + uploadError.message)

    const { data: publicData } = supabase.storage.from('invoices').getPublicUrl(uploadData.path)
    return publicData?.publicUrl
  }

  // === Submit transaksi ===
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!data.amount || isNaN(+data.amount) || +data.amount <= 0) {
      alert('Jumlah harus angka valid dan lebih dari 0')
      return
    }

    setLoading(true)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (!session || sessionError) throw new Error('Kamu belum login atau sesi habis')

      const invoice_url = await uploadFileToSupabase()

      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        invoice_url,
        user_id: session.user.id,
      }

      const { error: insertError } = await supabase.from('transactions').insert(payload)
      if (insertError) throw new Error(insertError.message)

      alert('Transaksi berhasil disimpan!')
      setData({
        date: new Date().toISOString().split('T')[0],
        pos: '',
        amount: '',
        category: '',
        note: '',
        country: '',
        type_transaction: 'pengeluaran',
      })
      setFile(null)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Terjadi kesalahan saat menyimpan transaksi.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryOptions = () =>
    data.type_transaction === 'pengeluaran'
      ? ['Transfer', 'Cash']
      : ['Agency', 'Kandidat', 'Cabang']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`p-1.5 sm:p-2 rounded-xl ${
                data.type_transaction === 'pemasukan'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {data.type_transaction === 'pemasukan' ? (
                <TrendUp size={18} />
              ) : (
                <TrendDown size={18} />
              )}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          <TransactionTypeSelector
            type={data.type_transaction}
            onChange={(type) => updateData('type_transaction', type)}
          />

          <InputField
            label="Tanggal"
            icon={<CalendarBlank size={14} />}
            type="date"
            value={data.date}
            onChange={(value) => updateData('date', value)}
            required
          />

          <InputField
            label="Negara"
            icon="🌍"
            value={data.country}
            onChange={(value) => updateData('country', value)}
            options={['Turki', 'Kuwait', 'Jepang']}
            required
          />

          <PosSelector
            type={data.type_transaction}
            pos={data.pos}
            onChange={(pos) => updateData('pos', pos)}
          />

          <InputField
            label="Kategori"
            icon={<Tag size={14} />}
            value={data.category}
            onChange={(value) => updateData('category', value)}
            options={getCategoryOptions()}
            required
          />

          <InputField
            label="Jumlah"
            icon={<CurrencyDollarSimple size={14} />}
            type="number"
            value={data.amount}
            onChange={(value) => updateData('amount', value)}
            placeholder="Masukkan jumlah"
            required
          />

          <InputField
            label="Catatan"
            icon={<FileText size={14} />}
            value={data.note}
            onChange={(value) => updateData('note', value)}
            placeholder="Catatan tambahan (opsional)"
          />

          {/* File Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <UploadSimple size={14} /> Bukti Transaksi
            </label>
            <FilePicker onFileChange={setFile} />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 text-sm ${
              loading
                ? 'bg-gray-300 text-gray-500'
                : data.type_transaction === 'pemasukan'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
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
