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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, name')
      if (!error) setCandidates(data)
    }
    fetchCandidates()
  }, [])

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  const getCandidateName = (id) => {
    const candidate = candidates.find((c) => c.id === id)
    return candidate ? candidate.name : '-'
  }

  // Mobile Card View
  const MobileTransactionCard = ({ transaction: t }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-4">
      {/* Header dengan Tanggal dan Jumlah */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium text-slate-800">
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
        </div>
        <div className="text-right">
          <div
            className={`text-sm font-bold ${
              isIncome(t.type_transaction)
                ? 'text-emerald-600'
                : 'text-rose-600'
            }`}
          >
            {isIncome(t.type_transaction) ? '+' : '-'}
            {formatCurrency(Math.abs(t.amount))}
          </div>
          <div className="text-xs text-gray-500">
            {isIncome(t.type_transaction) ? 'Masuk' : 'Keluar'}
          </div>
        </div>
      </div>

      {/* Kategori */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium shadow-sm border ${getTransactionTypeColor(
            t.type_transaction
          )}`}
        >
          {isIncome(t.type_transaction) ? (
            <ArrowUp className="w-3 h-3 mr-1" />
          ) : (
            <ArrowDown className="w-3 h-3 mr-1" />
          )}
          {t.category}
        </span>
      </div>

      {/* Detail Informasi */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="font-medium text-gray-500">Pos:</span>
          <div className="text-slate-700">{t.pos || '-'}</div>
        </div>
        <div>
          <span className="font-medium text-gray-500">Negara:</span>
          <div className="text-slate-700">{t.country || '-'}</div>
        </div>
      </div>

      {/* Catatan */}
      <div className="mb-3">
        <span className="font-medium text-gray-500 text-sm">Catatan:</span>
        <div className="text-slate-700 text-sm mt-1">{t.note || '-'}</div>
      </div>

      {/* Invoice dan Aksi */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <div>
          {t.invoice_url ? (
            <InvoiceViewer url={t.invoice_url} />
          ) : (
            <span className="text-xs text-gray-400">Tidak ada invoice</span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(t)}
            className="text-white bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg flex items-center text-sm shadow"
            title="Edit"
          >
            <PencilSimple className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(t.id)}
            className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-lg flex items-center text-sm shadow"
            title="Hapus"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="rounded-2xl shadow-lg border border-gray-200">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
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
            {transactions.map((t, idx) => (
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

                {/* KANDIDAT
                <td className="px-6 py-4 text-sm text-center text-slate-700">
                  {getCandidateName(t.candidate_id)}
                </td> */}

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
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden p-4">
        {transactions.map((t) => (
          <MobileTransactionCard key={t.id} transaction={t} />
        ))}
      </div>

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