import { useState } from "react"
import { Check, X } from "phosphor-react"
import InvoiceViewer from "./InvoiceViewer"
import { supabase } from "../services/supabaseClient" // sesuaikan path

export default function EditTransactionModal({
  editedData,
  setEditedData,
  handleSave,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 animate-fadeIn">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">✏️ Edit Transaksi</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Jumlah
            </label>
            <input
              value={editedData.amount}
              onChange={(e) =>
                setEditedData({ ...editedData, amount: e.target.value })
              }
              type="number"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Kategori Transaksi
            </label>
            <input
              type="text"
              value={editedData.category || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="Contoh: Gaji, Operasional, Pembelian"
            />
          </div>

          {/* Pos */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Pos
            </label>
            <input
              value={editedData.pos}
              onChange={(e) =>
                setEditedData({ ...editedData, pos: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="Contoh: BSD, Pelatihan"
            />
          </div>

          {/* Negara */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Negara
            </label>
            <input
              value={editedData.country}
              onChange={(e) =>
                setEditedData({ ...editedData, country: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="Contoh: Indonesia"
            />
          </div>

          {/* Catatan */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Catatan
            </label>
            <textarea
              value={editedData.note}
              onChange={(e) =>
                setEditedData({ ...editedData, note: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>

          {/* Invoice */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Invoice
            </label>
            <div className="flex flex-col space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {editedData.invoice_url ? (
                <InvoiceViewer url={editedData.invoice_url} />
              ) : (
                <span className="text-xs text-gray-400">Belum ada</span>
              )}
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setEditedData({ ...editedData, invoiceFile: file })
                }}
                className="text-xs text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end mt-8 space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition text-sm flex items-center"
          >
            <X className="w-4 h-4 mr-1" /> Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg text-sm flex items-center"
          >
            <Check className="w-4 h-4 mr-1" /> Simpan
          </button>
        </div>
      </div>
    </div>
  )
}
