import InvoiceViewer from '../InvoiceViewer'
import {
  ArrowDown,
  ArrowUp,
  Check,
  PencilSimple,
  Trash,
  X,
} from 'phosphor-react'

export default function TransactionTable({
  transactions,
  editingId,
  editedData,
  setEditedData,
  setEditingId,
  handleEdit,
  handleSave,
  handleDelete,
  formatCurrency,
  isIncome,
  getTransactionTypeColor,
}) {
  return (
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Kategori</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Invoice</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {transactions.map((t) => (
          <tr key={t.id} className={editingId === t.id ? 'bg-blue-50' : ''}>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900">
                {new Date(t.date).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long' })}
              </div>
            </td>

            <td className="px-6 py-4 text-right">
              {editingId === t.id ? (
                <input
                  value={editedData.amount}
                  onChange={(e) => setEditedData({ ...editedData, amount: e.target.value })}
                  type="number"
                  className="w-full px-2 py-1 border rounded text-right"
                />
              ) : (
                <div className={`text-sm font-bold ${isIncome(t.type_transaction) ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isIncome(t.type_transaction) ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                  <div className="text-xs text-gray-500">
                    {isIncome(t.type_transaction) ? 'Masuk' : 'Keluar'}
                  </div>
                </div>
              )}
            </td>

            <td className="px-6 py-4 text-center">
              {editingId === t.id ? (
                <select
                  value={editedData.category}
                  onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
                  className="px-2 py-1 border rounded"
                >
                  <option value="Kandidat">Kandidat</option>
                  <option value="Gaji">Gaji</option>
                  <option value="Operasional">Operasional</option>
                </select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium border ${getTransactionTypeColor(t.type_transaction)}`}>
                  {isIncome(t.type_transaction)
                    ? <ArrowUp className="w-4 h-4 mr-1" />
                    : <ArrowDown className="w-4 h-4 mr-1" />}
                  {t.category}
                </span>
              )}
            </td>

            <td className="px-6 py-4">
              {editingId === t.id ? (
                <input
                  value={editedData.note}
                  onChange={(e) => setEditedData({ ...editedData, note: e.target.value })}
                  className="w-full px-2 py-1 border rounded"
                />
              ) : (
                <span className="text-sm text-gray-900">{t.note || '-'}</span>
              )}
            </td>

            <td className="px-6 py-4 text-center">
              {t.invoice_url
                ? <InvoiceViewer url={t.invoice_url} />
                : <span className="text-xs text-gray-400">Tidak ada</span>}
            </td>

            <td className="px-6 py-4 text-center">
              {editingId === t.id ? (
                <div className="flex space-x-2 justify-center">
                  <button onClick={handleSave} className="text-white bg-emerald-600 px-3 py-1 rounded flex items-center">
                    <Check className="w-4 h-4 mr-1" /> Simpan
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-gray-600 border border-gray-300 px-3 py-1 rounded flex items-center">
                    <X className="w-4 h-4 mr-1" /> Batal
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2 justify-center">
                  <button onClick={() => handleEdit(t)} className="text-white bg-yellow-500 px-3 py-1 rounded flex items-center">
                    <PencilSimple className="w-4 h-4 mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="text-white bg-red-500 px-3 py-1 rounded flex items-center">
                    <Trash className="w-4 h-4 mr-1" /> Hapus
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
