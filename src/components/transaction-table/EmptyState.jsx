import { Receipt } from 'phosphor-react'

export default function EmptyState({ filters }) {
  const isFiltered = Object.values(filters).some(v => v && v !== 'all')

  return (
    <div className="text-center py-12">
      <Receipt className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        {isFiltered ? 'Tidak ada transaksi yang sesuai filter' : 'Belum ada transaksi'}
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        {isFiltered
          ? 'Coba ubah filter atau reset untuk melihat semua transaksi.'
          : 'Tambahkan transaksi pertama Anda untuk mulai mengelola keuangan.'}
      </p>
    </div>
  )
}
