import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoSaab from '../assets/Logo-saab-S.png'
import ThemeToggle from '../components/ThemeToggle'

const VendedorLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <header className="flex items-center justify-between px-5 py-3 bg-surface border-b border-border shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <img src={logoSaab} alt="SAAB" className="h-8 w-auto object-contain" />
          <span className="text-[0.9375rem] font-bold text-primary">SAAB — Vendedor</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="text-xs text-secondary max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
            {user?.email}
          </span>
          <button
            className="bg-transparent border border-border-input rounded px-3.5 py-1.5 text-xs font-semibold text-secondary cursor-pointer transition-colors duration-150 hover:border-secondary hover:text-primary"
            onClick={() => { logout(); navigate('/login') }}
          >
            Sair
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default VendedorLayout
