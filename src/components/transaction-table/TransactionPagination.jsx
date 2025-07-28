import { CaretLeft, CaretRight } from 'phosphor-react'

export default function TransactionPagination({
  totalCount,
  currentPage,
  totalPages,
  itemsPerPage,
  startItem,
  endItem,
  getPageNumbers,
  handlePageChange,
}) {
  return (
    <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Info Text */}
        <div className="text-sm text-gray-700 text-center sm:text-left">
          Menampilkan <span className="font-medium">{startItem}</span> sampai{' '}
          <span className="font-medium">{endItem}</span> dari{' '}
          <span className="font-medium">{totalCount}</span> transaksi
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          {/* Prev Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CaretLeft className="w-4 h-4 mr-1" />
            <span className="hidden xs:inline">Sebelumnya</span>
          </button>

          {/* Page Number Buttons */}
          <div className="flex flex-wrap gap-1 justify-center">
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

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden xs:inline">Selanjutnya</span>
            <CaretRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
