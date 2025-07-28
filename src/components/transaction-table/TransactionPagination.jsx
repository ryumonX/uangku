import { CaretLeft, CaretRight } from 'phosphor-react'

export default function TransactionPagination({
  totalCount, currentPage, totalPages, itemsPerPage, startItem, endItem,
  getPageNumbers, handlePageChange
}) {
  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Menampilkan <span className="font-medium">{startItem}</span> sampai{' '}
          <span className="font-medium">{endItem}</span> dari{' '}
          <span className="font-medium">{totalCount}</span> transaksi
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CaretLeft className="w-4 h-4 mr-1" />
            Sebelumnya
          </button>

          <div className="flex space-x-1">
            {getPageNumbers().map((pageNum, index) =>
              pageNum === '...' ? (
                <span key={index} className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? 'bg-slate-800 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selanjutnya
            <CaretRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
