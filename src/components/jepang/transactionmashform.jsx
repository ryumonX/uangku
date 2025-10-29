import { useState } from "react"
import * as XLSX from "xlsx"
import { supabase } from "../../services/supabaseClient"

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
        {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

// 🧮 Convert Excel date (handle serial, string, dan "01-May-25")
function excelDateToJSDate(value) {
  if (!value) return null

  // ✅ Jika angka (serial Excel)
  if (typeof value === "number") {
    const utc_days = Math.floor(value - 25569)
    const utc_value = utc_days * 86400
    const date_info = new Date(utc_value * 1000)
    return date_info.toISOString().split("T")[0]
  }

  // ✅ Jika format teks seperti "01-May-25" atau "5-Jul-24"
  if (typeof value === "string") {
    const match = value.match(/^(\d{1,2})[-\/ ]([A-Za-z]+)[-\/ ](\d{2,4})$/)
    if (match) {
      const day = parseInt(match[1])
      const monthStr = match[2].toLowerCase()
      const year = match[3].length === 2 ? `20${match[3]}` : match[3]
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      }
      const month = months[monthStr.slice(0, 3)]
      if (month !== undefined) {
        const date = new Date(year, month, day)
        return date.toISOString().split("T")[0]
      }
    }

    // ✅ Fallback parse normal
    const parsed = new Date(value)
    if (!isNaN(parsed)) return parsed.toISOString().split("T")[0]
  }

  return null
}

// 💰 Convert "Rp 5.000.000" → 5000000
function parseRupiah(value) {
  if (!value) return 0
  return Number(String(value).replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0
}

export default function MassUploadModal({ open, onClose }) {
  const [rows, setRows] = useState([])
  const [negara, setNegara] = useState("Jepang")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // 📂 Baca file Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" })

      if (!jsonData.length) {
        alert("File kosong atau format salah")
        return
      }

      // 🔄 Mapping kolom Excel → Field database
      const mapped = jsonData.map((r) => {
        const tanggal =
          excelDateToJSDate(r["TANGGAL"]) ||
          excelDateToJSDate(r["Tanggal"]) ||
          excelDateToJSDate(r["DATE"]) ||
          ""

        const pemasukan = parseRupiah(r["PEMASUKAN"]) || 0
        const pengeluaran = parseRupiah(r["PENGELUARAN"]) || 0

        const tipe =
          pemasukan > 0
            ? "pemasukan"
            : pengeluaran > 0
              ? "pengeluaran"
              : "lainnya"

        const jumlah = pemasukan || pengeluaran || 0

        return {
          Tanggal: tanggal,
          Keterangan:
            r["TRANSAKSI"] ||
            r["Transaksi"] ||
            r["KETERANGAN"] ||
            r["Keterangan"] ||
            "",
          Pos: r["KET."] || r["Ket"] || r["POS"] || "",
          Category:
            r["CARA PEMBAYARAN"] ||
            r["Cara Pembayaran"] ||
            r["Metode"] ||
            "",
          Jumlah: jumlah,
          Tipe: tipe,
        }
      })

      setRows(mapped)
    } catch (err) {
      console.error(err)
      alert(
        "❌ Gagal membaca file Excel. Pastikan kolom: TANGGAL, TRANSAKSI, PEMASUKAN, PENGELUARAN, KET, dan CARA PEMBAYARAN ada."
      )
    }
  }

  // 💾 Simpan ke Supabase
  const handleSave = async () => {
    if (!rows.length) return alert("Belum ada data dari Excel")
    if (!negara) return alert("Pilih negara terlebih dahulu")

    setLoading(true)
    setProgress(0)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError || !session) throw new Error("Belum login / sesi habis")

      const trxData = rows.map((row) => ({
        date: row["Tanggal"] || new Date().toISOString().split("T")[0], // ambil dari Excel
        pos: row["Pos"] || null,
        amount: parseFloat(row["Jumlah"] || 0),
        category: row["Category"] || null, // ✅ masuk ke kategori (cara pembayaran)
        note: row["Keterangan"] || null,
        country: negara,
        type_transaction: row["Tipe"]?.toLowerCase() || "lainnya",
        user_id: session.user.id,
      }))

      const chunkSize = 200
      for (let i = 0; i < trxData.length; i += chunkSize) {
        const chunk = trxData.slice(i, i + chunkSize)
        const { error: trxError } = await supabase.from("transactions").insert(chunk)
        if (trxError) throw trxError
        setProgress(Math.round(((i + chunk.length) / trxData.length) * 100))
      }

      alert("✅ Semua data berhasil disimpan!")
      setRows([])
      setNegara("")
      onClose()
    } catch (err) {
      console.error(err)
      alert("❌ Gagal simpan: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Mass Upload Transaksi">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="mb-4 block w-full text-sm"
      />

      {rows.length > 0 && (
        <>
          {/* Pilih Negara */}
          <div className="mb-4 flex items-center gap-3">
            <label className="font-medium">Pilih Negara:</label>
            <select
              value={negara}
              onChange={(e) => setNegara(e.target.value)}
              className="border rounded p-2"
            >
              <option value="">-- Pilih Negara --</option>
              {["Kuwait", "Jepang", "Turki"].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto max-h-60 border rounded-lg mb-4">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {Object.keys(rows[0]).map((key) => (
                    <th key={key} className="p-2 border">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="p-2 border">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <div className="text-center py-2 text-gray-500 text-sm">
                + {rows.length - 10} data lainnya
              </div>
            )}
          </div>

          {loading && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-medium ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? `Menyimpan... ${progress}%` : "Simpan ke Database"}
          </button>
        </>
      )}
    </Modal>
  )
}
