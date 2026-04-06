import { useState, useEffect, useCallback } from 'react'
import { registerUser, fetchUsers } from '../../services/authService'

const ROLES  = ['CLIENTE', 'MOTORISTA']
const EMPTY  = { email: '', password: '', role: 'CLIENTE' }

const ROLE_LABEL = { CLIENTE: 'Cliente', MOTORISTA: 'Motorista', ADMIN: 'Admin' }

const ROLE_BADGE_CLASSES = {
  CLIENTE:   'bg-info-bg text-info',
  MOTORISTA: 'bg-warn-bg text-warn',
  ADMIN:     'bg-error-bg text-error',
}

const ClientPanel = () => {
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [open,       setOpen]       = useState(true)

  const [form,       setForm]       = useState(EMPTY)
  const [adding,     setAdding]     = useState(false)
  const [addError,   setAddError]   = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setFetchError('')
    fetchUsers()
      .then(setUsers)
      .catch(() => setFetchError('Erro ao carregar utilizadores.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')

    if (!form.email.trim()) { setAddError('Email e obrigatorio.'); return }
    if (form.password.length < 6) { setAddError('A password deve ter pelo menos 6 caracteres.'); return }

    setAdding(true)
    try {
      const user = await registerUser({
        email:    form.email.trim(),
        password: form.password,
        role:     form.role,
      })
      setAddSuccess(`Utilizador "${user.email}" criado com sucesso.`)
      setForm(EMPTY)
      load()
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Erro ao criar utilizador.'
      setAddError(msg)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">

      <button className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none border-b border-border cursor-pointer text-left gap-4 hover:bg-hover transition-colors duration-150" onClick={() => setOpen(o => !o)}>
        <span className="flex flex-col gap-0.5">
          <span className="text-[0.9375rem] font-bold text-primary">Gestao de Utilizadores</span>
        </span>
        <span className={`text-base text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>&#x25BE;</span>
      </button>

      {open && (
        <div className="p-5 flex flex-col gap-5">

          {/* -- Add form -- */}
          <form className="flex flex-col" onSubmit={handleAdd}>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted mb-2 mt-0">Novo Utilizador</p>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_auto] gap-2.5 items-center">
              <input
                className="bg-input border border-border-input rounded py-2 px-3 text-[0.8125rem] text-primary w-full outline-none transition-all duration-150 placeholder:text-muted focus:border-red focus:ring-[3px] focus:ring-red/20"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              <input
                className="bg-input border border-border-input rounded py-2 px-3 text-[0.8125rem] text-primary w-full outline-none transition-all duration-150 placeholder:text-muted focus:border-red focus:ring-[3px] focus:ring-red/20"
                type="password"
                placeholder="Password (min. 6 chars)"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <select
                className="bg-input border border-border-input rounded py-2 px-3 text-[0.8125rem] text-primary w-full outline-none transition-all duration-150 focus:border-red focus:ring-[3px] focus:ring-red/20"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <button className="bg-red hover:bg-red-h active:bg-red-a border-none rounded py-2 px-4 text-[0.8125rem] font-bold text-on-red cursor-pointer whitespace-nowrap uppercase tracking-[0.05em] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed" type="submit" disabled={adding}>
                {adding ? 'A criar...' : '+ Criar'}
              </button>
            </div>
            {addError   && <p className="text-[0.8125rem] text-error mt-1.5 mb-0">{addError}</p>}
            {addSuccess && <p className="text-[0.8125rem] text-ok mt-1.5 mb-0">{addSuccess}</p>}
          </form>

          {/* -- Table -- */}
          {loading ? (
            <p className="text-center py-8 text-sm text-muted m-0">A carregar utilizadores...</p>
          ) : fetchError ? (
            <p className="text-center py-8 text-sm text-error m-0">{fetchError}</p>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted m-0">Sem utilizadores registados.</p>
          ) : (
            <div className="border border-border rounded-md overflow-hidden overflow-x-auto">
              <table className="w-full border-collapse text-[0.8125rem]">
                <thead className="bg-hover">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted border-b border-border whitespace-nowrap">Email</th>
                    <th className="px-4 py-2.5 text-left text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted border-b border-border whitespace-nowrap">Role</th>
                    <th className="px-4 py-2.5 text-left text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted border-b border-border whitespace-nowrap">Data de Registo</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-hover [&:last-child_td]:border-b-0">
                      <td className="px-4 py-3 text-primary border-b border-border align-middle font-medium">{u.email}</td>
                      <td className="px-4 py-3 text-primary border-b border-border align-middle">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-[0.05em] ${ROLE_BADGE_CLASSES[u.role] ?? ''}`}>
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary text-xs border-b border-border align-middle">
                        {new Date(u.createdAt).toLocaleDateString('pt-PT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default ClientPanel
