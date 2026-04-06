import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoSaab from '../assets/Logo-saab-S.png'
import ThemeToggle from '../components/ThemeToggle'

/* ── Icons ── */
const navIconCls = 'w-[1.125rem] h-[1.125rem] shrink-0 opacity-80'

const IconDashboard = () => (
  <svg className={navIconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25
         a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z
         M3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18
         a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z
         M13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25
         A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z
         M13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18
         A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
)

const IconOrders = () => (
  <svg className={navIconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
         M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2
         m-6 9l2 2 4-4" />
  </svg>
)

const IconContainers = () => (
  <svg className={navIconCls} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622
         a2.25 2.25 0 01-2.247-2.118L3.75 7.5
         M10 11.25h4
         M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5
         c0-.621-.504-1.125-1.125-1.125H3.375
         c-.621 0-1.125.504-1.125 1.125v1.5
         c0 .621.504 1.125 1.125 1.125z" />
  </svg>
)

const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5
         A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15
         M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
)

const NAV_ITEMS = [
  { key: 'dashboard',  label: 'Dashboard',   Icon: IconDashboard,  path: '/expedicao/dashboard'  },
  { key: 'orders',     label: 'Pedidos',      Icon: IconOrders,     path: '/expedicao/orders'     },
]

const PAGE_TITLES = {
  dashboard:  'Dashboard',
  orders:     'Fila de Pedidos',
}

const ExpedicaoLayout = () => {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'EX'

  const activeKey = (() => {
    if (location.pathname.startsWith('/expedicao/orders'))     return 'orders'
    return 'dashboard'
  })()

  return (
    <div className="flex flex-col md:flex-row min-h-[100svh] bg-page">

      {/* ── Sidebar ── */}
      <aside className="w-full md:w-[220px] md:min-w-[220px] bg-sidebar border-b md:border-b-0 md:border-r border-border-sidebar flex flex-col">
        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-1 px-5 py-3.5 md:pt-6 md:pb-5 border-b border-border-sidebar">
          <img src={logoSaab} alt="SAAB" className="h-10 w-auto max-w-[120px] object-contain object-left" />
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-secondary md:mt-2">Expedição</p>
        </div>

        <nav className="flex-1 flex flex-row md:flex-col gap-0.5 p-2 md:py-4 md:px-0 overflow-x-auto md:overflow-x-visible">
          {NAV_ITEMS.map(({ key, label, Icon, path }) => (
            <button
              key={key}
              className={`flex items-center gap-3 px-4 md:px-5 py-2 md:py-3 text-sm font-medium text-nav
                border-b-[3px] md:border-b-0 md:border-l-[3px] border-transparent
                whitespace-nowrap md:whitespace-normal w-full text-left cursor-pointer
                bg-transparent transition-[background-color,color,border-color] duration-150
                hover:bg-sidebar-hover hover:text-nav-hover hover:border-b-border-input md:hover:border-b-transparent md:hover:border-l-border-input
                ${activeKey === key
                  ? 'bg-sidebar-active !text-primary !border-b-red md:!border-b-transparent md:!border-l-red'
                  : ''
                }`}
              onClick={() => navigate(path)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden md:block px-5 py-4 border-t border-border-sidebar mt-auto">
          <button
            className="flex items-center gap-3 w-full bg-transparent border-none px-3 py-2.5 text-[0.8125rem] text-secondary cursor-pointer transition-[color,background-color] duration-150 rounded hover:text-error hover:bg-error-bg"
            onClick={handleLogout}
          >
            <IconLogout />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
          <h2 className="text-[0.9rem] font-semibold text-primary m-0">{PAGE_TITLES[activeKey]}</h2>
          <div className="flex items-center gap-2 text-[0.8rem] text-secondary">
            <ThemeToggle />
            <span>{user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-avatar-bg border border-red flex items-center justify-center text-xs font-bold text-avatar-tx shrink-0">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default ExpedicaoLayout
