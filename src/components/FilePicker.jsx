import { useRef, useState } from 'react'
import {
  Camera,
  Image,
  UploadSimple,
  X,
  Check,
} from 'phosphor-react'

export default function FilePicker({ onFileChange }) {
  const [file, setFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile)
      onFileChange?.(selectedFile)
    }
  }

  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileChange(selectedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileChange(droppedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
    onFileChange?.(null)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Fungsi aman supaya tombol tidak trigger form submit
  const safeClick = (e, ref) => {
    e.preventDefault()
    e.stopPropagation()
    ref.current?.click()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          {!file ? (
            <>
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <UploadSimple className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-1">
                      Seret dan lepas gambar di sini
                    </p>
                    <p className="text-sm text-gray-500">
                      atau pilih dari opsi di bawah
                    </p>
                  </div>
                </div>
              </div>

              {/* Tombol aksi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button
                  type="button"
                  onClick={(e) => safeClick(e, cameraInputRef)}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Camera className="w-5 h-5" />
                  <span className="font-medium">Ambil Foto</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => safeClick(e, galleryInputRef)}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Image className="w-5 h-5" />
                  <span className="font-medium">Pilih dari Galeri</span>
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-600">
                <span className="font-medium">Format:</span> JPG, PNG, WebP<br />
                <span className="font-medium">Maksimal:</span> 10MB
              </div>
            </>
          ) : (
            <>
              {/* File preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">File berhasil dipilih</span>
                </div>

                <div className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full max-h-96 object-contain rounded-xl border border-gray-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      Hapus File
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => safeClick(e, cameraInputRef)}
                    className="flex-1 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Ambil Foto Lain
                  </button>
                  <button
                    type="button"
                    onClick={(e) => safeClick(e, galleryInputRef)}
                    className="flex-1 px-4 py-2 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Pilih Lain
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Hidden Inputs */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleInputChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
