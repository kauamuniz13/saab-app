import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import logoSaab from '../assets/Logo-saab-S.png'

const ROLE_REDIRECT = {
  ADMIN:     '/admin/dashboard',
  EXPEDICAO: '/expedicao/dashboard',
  MOTORISTA: '/motorista/routes',
  VENDEDOR:  '/vendedor/orders',
}

const Login = () => {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Preencha o email e a password.')
      return
    }

    setLoading(true)
    try {
      const role = await login(email, password)
      navigate(ROLE_REDIRECT[role] || '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao autenticar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-page flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] flex flex-col items-center gap-10">

        <div className="flex flex-col items-center gap-2">
          <img src={logoSaab} alt="SAAB" className="h-20 sm:h-24 w-auto object-contain" />
          <h1 className="text-[1.75rem] sm:text-[2rem] font-extrabold text-primary m-0 tracking-[0.08em]">SAAB</h1>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary m-0">Gestão Logística</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full bg-surface border border-border rounded-xl px-8 py-10 sm:p-10 flex flex-col gap-6 shadow-elevated" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[0.8125rem] font-semibold text-secondary">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-input border border-border-input rounded-lg py-3.5 px-4 text-base text-primary outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-muted focus:border-red focus:ring-2 focus:ring-red/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[0.8125rem] font-semibold text-secondary">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduza a sua password"
              className="w-full bg-input border border-border-input rounded-lg py-3.5 px-4 text-base text-primary outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-muted focus:border-red focus:ring-2 focus:ring-red/20"
            />
          </div>

          {error && <p className="bg-error-bg border border-error/30 rounded-lg py-3 px-4 text-sm text-error leading-[1.45] m-0">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-red border-none rounded-lg py-[0.9375rem] px-4 text-base font-bold text-on-red tracking-[0.03em] uppercase cursor-pointer transition-colors duration-[180ms] flex items-center justify-center gap-2 mt-1 hover:enabled:bg-red-h active:enabled:bg-red-a disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <svg className="w-[1.125rem] h-[1.125rem] animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                  <path fill="currentColor" opacity="0.75"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                A entrar...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-muted text-center">SAAB &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}

export default Login
