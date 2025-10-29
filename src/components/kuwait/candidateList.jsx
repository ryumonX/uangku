// components/CandidateList.tsx
import { useEffect, useState } from "react"
import { supabase } from "../../services/supabaseClient"
import TransactionFilters from "../TransactionFilters"
import TransactionHeader from "../transaction-table/TransactionHeader"
import TransactionPagination from "../transaction-table/TransactionPagination"
import CandidateTable from "./candidateTable"
import EmptyState from "../transaction-table/EmptyState"
export default function CandidateList({ refreshTrigger }) {
  const [transactions, setTransactions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editedData, setEditedData] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage] = useState(10)

  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])

  // ✅ kandidat
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState("")

  const [filters, setFilters] = useState({
    type: "all",
    category: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    pos: "",
    country: "",
  })

  const fetchCandidates = async () => {
    const { data, error } = await supabase.from("candidates").select("id, name")
    if (!error && data) setCandidates(data)
  }

  const fetchCategories = async () => {
    const user = (await supabase.auth.getUser()).data.user
    let query = supabase.from("transactions").select("category").eq("user_id", user.id)

    if (selectedCandidate) {
      query = query.eq("candidate_id", selectedCandidate)
    }

    const { data } = await query
    const uniqueCategories = [...new Set(data?.map((t) => t.category).filter(Boolean))]
    setCategories(uniqueCategories)
  }

  const fetchData = async (page = 1, currentFilters = filters) => {
    const user = (await supabase.auth.getUser()).data.user
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)

    if (selectedCandidate) {
      query = query.eq("candidate_id", selectedCandidate)
    }

    if (currentFilters.type !== "all") {
      query = query.eq("type_transaction", currentFilters.type)
    }
    if (currentFilters.category) query = query.eq("category", currentFilters.category)
    if (currentFilters.dateFrom) query = query.gte("date", currentFilters.dateFrom)
    if (currentFilters.dateTo) query = query.lte("date", currentFilters.dateTo)
    if (currentFilters.search) query = query.ilike("note", `%${currentFilters.search}%`)
    if (currentFilters.pos) query = query.eq("pos", currentFilters.pos)
    if (currentFilters.country) query = query.eq("country", currentFilters.country)

    const { count } = await query
    const { data, error } = await query.order("date", { ascending: false }).range(from, to)

    if (!error) {
      setTransactions(data || [])
      setTotalCount(count || 0)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Hapus transaksi ini?")) {
      await supabase.from("transactions").delete().eq("id", id)
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
    let invoiceUrl = editedData.invoice_url || null

    if (editedData.invoiceFile) {
      const file = editedData.invoiceFile
      const filePath = `invoices/${editingId}-${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error("Upload invoice gagal:", uploadError)
        return
      }

      const { data } = supabase.storage.from("invoices").getPublicUrl(filePath)
      invoiceUrl = data.publicUrl
    }

    const { error } = await supabase
      .from("transactions")
      .update({
        amount: parseFloat(editedData.amount),
        note: editedData.note,
        category: editedData.category,
        type_transaction: editedData.type_transaction,
        pos: editedData.pos || null,
        country: editedData.country || null,
        date: editedData.date || null,
        invoice_url: invoiceUrl,
      })
      .eq("id", editingId)

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
      type: "all",
      category: "",
      dateFrom: "",
      dateTo: "",
      search: "",
      country: "",
      pos: "",
    }
    setFilters(resetFilters)
    setCurrentPage(1)
    fetchData(1, resetFilters)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const isIncome = (type) => (type?.toLowerCase() || "") === "pemasukan"

  const getTransactionTypeColor = (type) => {
    const t = type?.toLowerCase() || ""
    return t === "pemasukan"
      ? "text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm"
      : "text-rose-700 bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200 shadow-sm"
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

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) rangeWithDots.push(1, "...")
    else rangeWithDots.push(1)

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) rangeWithDots.push("...", totalPages)
    else rangeWithDots.push(totalPages)

    return rangeWithDots.filter(
      (item, idx, arr) => (arr.indexOf(item) === idx && item !== 1) || idx === 0
    )
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchData(currentPage)
  }, [refreshTrigger, selectedCandidate])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden h-full flex flex-col">
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

          <div className="overflow-x-auto flex-1">
            <CandidateTable
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
    </div>
  )

}
