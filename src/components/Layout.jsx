import { Link, useLocation } from 'react-router-dom'
import { Calculator, MessageSquare, FileText, Settings, Home, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const Layout = ({ children }) => {
  const location = useLocation()
  const { darkMode, toggleDarkMode } = useTheme()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/calculator', label: 'Calc', icon: Calculator },
    { path: '/bank-statement', label: 'Bank', icon: FileText },
    { path: '/ai-chat', label: 'AI', icon: MessageSquare },
    { path: '/config', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile-First Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Tax Calculator</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nigeria 2025</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation (Mobile App Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom z-50">
        <div className="flex justify-around items-center px-2 py-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <Icon className={`h-5 w-5 ${isActive ? '' : 'opacity-60'}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content with bottom padding for nav */}
      <main className="pb-20 px-4 py-6 max-w-md mx-auto">
        {children}
      </main>
    </div>
  )
}

export default Layout
