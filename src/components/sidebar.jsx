import { Link, useLocation } from "react-router-dom"

export default function Sidebar({ onLinkClick }) {
  const location = useLocation()

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Turki", path: "/turki" },
    { name: "Kuwait", path: "/kuwait" },
    { name: "Jepang", path: "/jepang" },
  ]

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200 shadow-xl">
      {/* Header */}
      <div className="px-5 py-5 border-b border-slate-800">
        <h2 className="text-xl font-bold text-emerald-400 tracking-wide">
          DTJA Admin
        </h2>
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onLinkClick}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
                }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        © 2025 Dwi Tunggal Jaya Abadi
      </div>
    </div>
  )
}
