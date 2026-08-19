import { Search, Sun, Bell, Menu } from 'lucide-react'

export default function AdminHeader({ onMenuClick }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <header className="h-16 bg-white border-b border-[#f1f5f9] flex items-center px-4 md:px-6 gap-4 shrink-0">
      <button 
        onClick={onMenuClick} 
        className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-[#64748b]" 
        style={{ background: 'none', border: 'none' }}
      >
        <Menu size={20} />
      </button>

      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
          {greeting}, Admin! 👋
        </p>
        <p className="hidden sm:block text-[12px] text-[#94a3b8] mt-1 truncate">
          Welcome to TravelZync HRM Admin Panel.
        </p>
      </div>

      {/* Search Bar - hidden on mobile, visible on md and up */}
      <div className="hidden md:flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-1.5 w-[220px]">
        <Search size={14} color="#94a3b8" />
        <input 
          placeholder="Search anything..." 
          style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, color: '#374151', flex: 1 }} 
        />
        <span className="text-[10px] text-[#94a3b8] bg-[#e2e8f0] rounded px-1.5 py-0.5">Ctrl+K</span>
      </div>

      {/* Icons */}
      <button className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-[#64748b]" style={{ background: 'none', border: 'none' }}>
        <Sun size={18} />
      </button>

      <div className="relative">
        <button className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-[#64748b]" style={{ background: 'none', border: 'none' }}>
          <Bell size={18} />
        </button>
        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ef4444] color-[#fff] text-[9px] font-bold flex items-center justify-center text-white">
          3
        </span>
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c0392b] to-[#922b21] flex items-center justify-center cursor-pointer border-2 border-[#e2e8f0] shrink-0">
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>AD</span>
      </div>
    </header>
  )
}
