// components/TransactionList.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import TransactionFilters from './TransactionFilters'
import TransactionHeader from './transaction-table/TransactionHeader'
import TransactionPagination from './transaction-table/TransactionPagination'
import TransactionTable from './transaction-table/TransactionTable'
import EmptyState from './transaction-table/EmptyState'

export default function TransactionList({ refreshTrigger }) {
  const [transactions, setTransactions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editedData, setEditedData] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage] = useState(10)

  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])

  const [filters, setFilters] = useState({
    type: 'all', category: '', dateFrom: '', dateTo: '', search: '', pos: '', country: '',
  })

  const fetchCategories = async () => {
    const user = (await supabase.auth.getUser()).data.user
    const { data } = await supabase
      .from('transactions')
      .select('category')
      .eq('user_id', user.id)

    const uniqueCategories = [...new Set(data?.map(t => t.category).filter(Boolean))]
    setCategories(uniqueCategories)
  }

  const fetchData = async (page = 1, currentFilters = filters) => {
    const user = (await supabase.auth.getUser()).data.user
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (currentFilters.type !== 'all') {
      query = query.eq('type_transaction', currentFilters.type)
    }

    if (currentFilters.category) query = query.eq('category', currentFilters.category)
    if (currentFilters.dateFrom) query = query.gte('date', currentFilters.dateFrom)
    if (currentFilters.dateTo) query = query.lte('date', currentFilters.dateTo)
    if (currentFilters.search) query = query.ilike('note', `%${currentFilters.search}%`)
    if (currentFilters.pos) query = query.eq('pos', currentFilters.pos)
    if (currentFilters.country) query = query.eq('country', currentFilters.country)


    const { count } = await query
    const { data, error } = await query.order('date', { ascending: false }).range(from, to)

    if (!error) {
      setTransactions(data || [])
      setTotalCount(count || 0)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Hapus transaksi ini?')) {
      await supabase.from('transactions').delete().eq('id', id)
      const newTotal = totalCount - 1
      const maxPage = Math.ceil(newTotal / itemsPerPage)
      const targetPage = currentPage > maxPage ? maxPage : currentPage
      setCurrentPage(targetPage)
      fetchData(targetPage)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditedData(item)
  }

  const handleSave = async () => {
    const { error } = await supabase
      .from('transactions')
      .update({
        amount: parseFloat(editedData.amount),
        note: editedData.note,
        category: editedData.category,
        type_transaction: editedData.type_transaction,
        pos: editedData.pos || null,
        country: editedData.country || null,
      })
      .eq('id', editingId)

    if (!error) {
      setEditingId(null)
      fetchData(currentPage)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setCurrentPage(1)
    fetchData(1, newFilters)
  }

  const handleSearchUpdate = (value) => {
    const updated = { ...filters, search: value }
    setFilters(updated)
    setCurrentPage(1)
    fetchData(1, updated)
  }

  const resetFilters = () => {
    const resetFilters = {
      type: 'all', category: '', dateFrom: '', dateTo: '', search: '', country: '', pos: '',
    }
    setFilters(resetFilters)
    setCurrentPage(1)
    fetchData(1, resetFilters)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount)
  }

  const isIncome = (type) => (type?.toLowerCase() || '') === 'pemasukan'

  const getTransactionTypeColor = (type) => {
    const t = type?.toLowerCase() || ''
    return t === 'pemasukan'
      ? 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm'
      : 'text-rose-700 bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200 shadow-sm'
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalCount)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchData(page)
  }

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) rangeWithDots.push(1, '...')
    else rangeWithDots.push(1)

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) rangeWithDots.push('...', totalPages)
    else rangeWithDots.push(totalPages)

    return rangeWithDots.filter((item, idx, arr) => arr.indexOf(item) === idx && item !== 1 || idx === 0)
  }

  useEffect(() => {
    fetchCategories()
    fetchData(currentPage)
  }, [refreshTrigger])

  return (
    <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <TransactionHeader showFilters={showFilters} setShowFilters={setShowFilters} />
        {showFilters && (
          <TransactionFilters
            filters={filters}
            categories={categories}
            onChange={handleFilterChange}
            onReset={resetFilters}
            onSearch={handleSearchUpdate}
          />
        )}

        <div className="overflow-x-auto">
          <TransactionTable
            transactions={transactions}
            editingId={editingId}
            editedData={editedData}
            setEditedData={setEditedData}
            setEditingId={setEditingId}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleDelete={handleDelete}
            formatCurrency={formatCurrency}
            isIncome={isIncome}
            getTransactionTypeColor={getTransactionTypeColor}
          />
        </div>

        {transactions.length === 0 && <EmptyState filters={filters} />}

        {totalCount > 0 && (
          <TransactionPagination
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            startItem={startItem}
            endItem={endItem}
            getPageNumbers={getPageNumbers}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}
