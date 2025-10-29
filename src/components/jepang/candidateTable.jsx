import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, PencilSimple, Trash } from 'phosphor-react'
import InvoiceViewer from '../InvoiceViewer'
import EditTransactionModal from '../EditTransactionModal'
import { supabase } from '../../services/supabaseClient'

export default function TransactionTable({
  transactions,
  editingId,
  setEditingId,
  handleEdit,
  handleSave,
  handleDelete,
  formatCurrency,
  isIncome,
  getTransactionTypeColor,
  editedData,
  setEditedData,
}) {
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, name')
      if (!error) setCandidates(data)
    }
    fetchCandidates()
  }, [])

  const getCandidateName = (id) => {
    const candidate = candidates.find((c) => c.id === id)
    return candidate ? candidate.name : '-'
  }

  // 🟢 Filter hanya transaksi Jepang
  const filteredTransactions = transactions.filter(
    (t) => t.country?.toLowerCase() === 'jepang'
  )

  return (
    <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200">
      <table className="w-full border-collapse">
        {/* HEADER */}
        <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
          <tr>
            {[
              'Tanggal',
              'Jumlah',
              'Kategori',
              'Pos',
              'Negara',
              // 'Kandidat',
              'Catatan',
              'Invoice',
              'Aksi',
            ].map((h) => (
              <th
                key={h}
                className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y divide-gray-200 bg-white">
          {filteredTransactions.map((t, idx) => (
            <tr
              key={t.id}
              className={`${
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              } hover:bg-slate-100 transition`}
            >
              {/* TANGGAL */}
              <td className="px-6 py-4 text-sm text-slate-800 text-left">
                <div className="font-medium">
                  {new Date(t.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(t.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                  })}
                </div>
              </td>

              {/* JUMLAH */}
              <td className="px-6 py-4 text-right">
                <div
                  className={`text-sm font-bold ${
                    isIncome(t.type_transaction)
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {isIncome(t.type_transaction) ? '+' : '-'}
                  {formatCurrency(Math.abs(t.amount))}
                  <div className="text-xs text-gray-500 mt-1">
                    {isIncome(t.type_transaction) ? 'Masuk' : 'Keluar'}
                  </div>
                </div>
              </td>

              {/* KATEGORI */}
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium shadow-sm border ${getTransactionTypeColor(
                    t.type_transaction
                  )}`}
                >
                  {isIncome(t.type_transaction) ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {t.category}
                </span>
              </td>

              {/* POS */}
              <td className="px-6 py-4 text-sm text-center text-slate-700">
                {t.pos || '-'}
              </td>

              {/* NEGARA */}
              <td className="px-6 py-4 text-sm text-center text-slate-700">
                {t.country || '-'}
              </td>

              {/* CATATAN */}
              <td className="px-6 py-4 text-sm">
                <span className="text-slate-700">{t.note || '-'}</span>
              </td>

              {/* INVOICE */}
              <td className="px-6 py-4 text-center">
                {t.invoice_url ? (
                  <InvoiceViewer url={t.invoice_url} />
                ) : (
                  <span className="text-xs text-gray-400">Tidak ada</span>
                )}
              </td>

              {/* AKSI */}
              <td className="px-6 py-4 text-center">
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={() => handleEdit(t)}
                    className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg flex items-center text-sm shadow"
                  >
                    <PencilSimple className="w-4 h-4 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg flex items-center text-sm shadow"
                  >
                    <Trash className="w-4 h-4 mr-1" /> Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {editingId && (
        <EditTransactionModal
          editedData={editedData}
          setEditedData={setEditedData}
          handleSave={handleSave}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}
