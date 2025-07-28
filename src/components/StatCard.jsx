import React from 'react'

export default function StatCard({ title, value, bgColor, iconColor }) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 ${bgColor} rounded-xl`}>
          <div className={`w-6 h-6 ${iconColor} rounded`}></div>
        </div>
      </div>
    </div>
  )
}
