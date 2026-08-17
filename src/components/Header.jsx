import { Menu, Bell, ChevronDown } from 'lucide-react'

export default function Header({ onMenuClick, title }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-700 hidden sm:block">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">JD</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 leading-none">John Doe</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Employee</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </div>
      </div>
    </header>
  )
}
