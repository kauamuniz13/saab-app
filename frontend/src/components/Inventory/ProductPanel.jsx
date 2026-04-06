import { useState, useEffect, useCallback } from 'react'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/inventoryService'

const TYPES    = ['Bovino', 'Suíno', 'Frango', 'Cordeiro', 'Outro']
const EMPTY    = { name: '', type: 'Bovino' }

const inputCls = 'bg-input border border-border-input rounded px-3 py-2 text-[0.8125rem] text-primary w-full outline-none transition-[border-color,box-shadow] duration-150 focus:border-red focus:shadow-[0_0_0_3px_rgba(139,0,0,0.22)] placeholder:text-muted'
const selectCls = `${inputCls} [&_option]:bg-surface`

/* ── ProductPanel ── */
const ProductPanel = () => {
  const [products,     setProducts]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [fetchError,   setFetchError]   = useState('')
  const [open,         setOpen]         = useState(true)

  /* Add form */
  const [form,         setForm]         = useState(EMPTY)
  const [adding,       setAdding]       = useState(false)
  const [addError,     setAddError]     = useState('')

  /* Inline edit */
  const [editId,       setEditId]       = useState(null)
  const [editForm,     setEditForm]     = useState({})
  const [saving,       setSaving]       = useState(false)
  const [editError,    setEditError]    = useState('')

  /* Delete feedback */
  const [deleteError,  setDeleteError]  = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setFetchError('')
    fetchProducts()
      .then(setProducts)
      .catch(() => setFetchError('Erro ao carregar produtos.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  /* ── Add ── */
  const handleAdd = async (e) => {
    e.preventDefault()
    setAddError('')
    if (!form.name.trim()) { setAddError('Nome é obrigatório.'); return }
    setAdding(true)
    try {
      await createProduct({
        name: form.name.trim(),
        type: form.type,
      })
      setForm(EMPTY)
      load()
    } catch {
      setAddError('Erro ao criar produto. Tente novamente.')
    } finally {
      setAdding(false)
    }
  }

  /* ── Edit ── */
  const startEdit = (p) => {
    setEditId(p.id)
    setEditForm({ name: p.name, type: p.type })
    setEditError('')
    setDeleteError('')
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditForm({})
    setEditError('')
  }

  const handleSaveEdit = async () => {
    setEditError('')
    if (!editForm.name?.trim()) { setEditError('Nome é obrigatório.'); return }
    setSaving(true)
    try {
      await updateProduct(editId, {
        name: editForm.name.trim(),
        type: editForm.type,
      })
      cancelEdit()
      load()
    } catch {
      setEditError('Erro ao guardar.')
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete ── */
  const handleDelete = async (id) => {
    setDeleteError('')
    try {
      await deleteProduct(id)
      load()
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Erro ao apagar produto.'
      setDeleteError(msg)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">

      {/* Toggle header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none border-b border-border cursor-pointer text-left gap-4 transition-colors duration-150 hover:bg-hover"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[0.9375rem] font-bold text-primary">Gestão de Produtos</span>
        </span>
        <span className={`text-base text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="p-5 flex flex-col gap-5">

          {/* ── Add form ── */}
          <form className="flex flex-col" onSubmit={handleAdd}>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted m-0 mb-2">Novo Produto</p>
            <div className="grid grid-cols-[1fr_140px_140px_auto] gap-2.5 items-center max-md:grid-cols-1">
              <input
                className={inputCls}
                placeholder="Nome do produto"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <select
                className={selectCls}
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                className="bg-red border-none rounded px-4 py-2 text-[0.8125rem] font-bold text-on-red cursor-pointer whitespace-nowrap uppercase tracking-[0.05em] transition-colors duration-[180ms] hover:enabled:bg-red-h active:enabled:bg-red-a disabled:opacity-40 disabled:cursor-not-allowed"
                type="submit"
                disabled={adding}
              >
                {adding ? 'A adicionar…' : '+ Adicionar'}
              </button>
            </div>
            {addError && <p className="text-[0.8125rem] text-error mt-1.5 m-0">{addError}</p>}
          </form>

          {/* Delete error banner */}
          {deleteError && (
            <div className="bg-error-bg border border-red-light rounded px-3.5 py-2.5 text-[0.8125rem] text-error">{deleteError}</div>
          )}

          {/* ── Table ── */}
          {loading ? (
            <p className="text-center py-8 text-sm text-muted m-0">A carregar produtos…</p>
          ) : fetchError ? (
            <p className="text-center py-8 text-sm text-error m-0">{fetchError}</p>
          ) : products.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted m-0">Sem produtos registados.</p>
          ) : (
            <div className="border border-border rounded-md overflow-hidden overflow-x-auto">
              <table className="w-full border-collapse text-[0.8125rem]">
                <thead>
                  <tr className="bg-hover">
                    <th className="px-4 py-2.5 text-left text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted border-b border-border whitespace-nowrap">Nome</th>
                    <th className="px-4 py-2.5 text-left text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted border-b border-border whitespace-nowrap">Tipo</th>
                    <th className="px-4 py-2.5 text-left text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted border-b border-border whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    editId === p.id ? (

                      /* ── Edit row ── */
                      <tr key={p.id} className="!bg-page">
                        <td className="px-3 py-2 text-primary border-b border-border align-middle">
                          <input
                            className={inputCls}
                            value={editForm.name}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          />
                        </td>
                        <td className="px-3 py-2 text-primary border-b border-border align-middle">
                          <select
                            className={selectCls}
                            value={editForm.type}
                            onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                          >
                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-primary border-b border-border align-middle">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              className="bg-red border-none rounded px-3.5 py-1 text-xs font-bold text-on-red cursor-pointer transition-colors duration-[180ms] hover:enabled:bg-red-h disabled:opacity-40 disabled:cursor-not-allowed"
                              onClick={handleSaveEdit}
                              disabled={saving}
                            >
                              {saving ? '…' : 'Guardar'}
                            </button>
                            <button
                              className="bg-transparent border border-border-input rounded px-3 py-1 text-xs font-semibold text-muted cursor-pointer transition-[border-color,color] duration-150 hover:enabled:border-muted hover:enabled:text-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                              onClick={cancelEdit}
                              disabled={saving}
                            >
                              Cancelar
                            </button>
                            {editError && (
                              <span className="text-xs text-error">{editError}</span>
                            )}
                          </div>
                        </td>
                      </tr>

                    ) : (

                      /* ── Normal row ── */
                      <tr key={p.id} className="hover:bg-hover [&:last-child_td]:border-b-0">
                        <td className="px-4 py-3 text-primary border-b border-border align-middle font-semibold">{p.name}</td>
                        <td className="px-4 py-3 text-primary border-b border-border align-middle">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold bg-hover text-secondary border border-border">{p.type}</span>
                        </td>
                        <td className="px-4 py-3 text-primary border-b border-border align-middle">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              className="bg-transparent border border-border-input rounded px-3 py-1 text-xs font-semibold text-secondary cursor-pointer transition-[border-color,color] duration-150 hover:border-muted hover:text-primary"
                              onClick={() => startEdit(p)}
                            >
                              Editar
                            </button>
                            <button
                              className="bg-transparent border border-red-light rounded px-3 py-1 text-xs font-semibold text-red cursor-pointer transition-[background-color,color] duration-150 hover:bg-red-light hover:text-red"
                              onClick={() => handleDelete(p.id)}
                            >
                              Apagar
                            </button>
                          </div>
                        </td>
                      </tr>

                    )
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

export default ProductPanel
