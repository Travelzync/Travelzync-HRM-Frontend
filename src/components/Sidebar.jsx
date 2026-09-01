import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import logoImg from '../assets/logo.jpg'

export default function Sidebar({ navItems, isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-30 flex flex-col
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:border-r lg:border-gray-100
        `}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <img
              src={logoImg}
              alt="TravelZync Logo"
              className="w-8 h-8 rounded-lg object-cover shrink-0 shadow-sm"
            />
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">TravelZync</p>
              <p className="text-[10px] text-red-500 font-medium tracking-wide uppercase mt-0.5">HRM</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">© 2025 TravelZync HRM</p>
        </div>
      </aside>
    </>
  )
}
