import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Upload, Calendar, Brain, MessageSquare, LogOut, BookOpen
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Material', icon: Upload },
  { to: '/planner', label: 'Study Planner', icon: Calendar },
  { to: '/quiz', label: 'AI Quiz', icon: Brain },
  { to: '/chat', label: 'Ask AI', icon: MessageSquare },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">AI Study</h1>
              <p className="text-xs text-gray-500">Planner</p>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-3 mx-4 mt-4 bg-primary-50 rounded-lg">
          <p className="font-semibold text-primary-800 text-sm">{user?.name}</p>
          <p className="text-xs text-primary-600 truncate">{user?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 mt-6 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                       text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-5xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
