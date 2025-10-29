import { useState } from "react"
import Sidebar from "./sidebar"

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleCloseSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-60 bg-white shadow-lg transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar onLinkClick={handleCloseSidebar} />
      </div>

      {/* Overlay (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col md:ml-60">
        {/* Header (mobile only) */}
        <header className="md:hidden bg-white shadow px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md border border-gray-300"
          >
            ☰
          </button>
          <h1 className="font-semibold text-gray-700">Dashboard</h1>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
