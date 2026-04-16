import { useState } from 'react'
import { updateContainer } from '../../services/inventoryService'
import { ZONE_LABELS, expandLabel } from '../../constants/zones'

const ContainerEditModal = ({ container, products, onClose, onSaved }) => {
  const [productId, setProductId] = useState(
    container.productId != null ? String(container.productId) : ''
  )
  const [quantity, setQuantity] = useState(container.quantity)
  const [unit,     setUnit]     = useState(container.unit || 'caixas')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const handleQuantityChange = (e) => {
    const v = Math.max(0, Math.min(9999, Number(e.target.value)))
    setQuantity(v)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const updated = await updateContainer(container.id, {
        capacity:  container.capacity,
        quantity:  Number(quantity),
        unit:      unit,
        productId: productId === '' ? null : Number(productId),
      })
      onSaved(updated)
    } catch {
      setError('Erro ao guardar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-surface border border-border rounded-md w-full max-w-[420px] flex flex-col shadow-elevated" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.22em] text-red m-0 mb-0.5">Editar Contêiner</p>
            <h2 className="text-lg font-bold text-primary m-0">{expandLabel(container.label)}</h2>
            <p className="text-[0.6875rem] text-secondary uppercase tracking-[0.1em] mt-0.5 m-0">
              {ZONE_LABELS[container.zone] || container.zone}
            </p>
          </div>
          <button
            className="bg-transparent border-none text-muted text-base cursor-pointer px-1.5 py-1 leading-none rounded transition-colors duration-150 hover:text-primary hover:bg-input"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-secondary">Produto</label>
            <select
              className="bg-input border border-border-input rounded px-3 py-2.5 text-sm text-primary w-full outline-none transition-[border-color,box-shadow] duration-150 focus:border-red focus:shadow-[0_0_0_3px_rgba(139,0,0,0.22)] [&_option]:bg-surface"
              value={productId}
              onChange={e => setProductId(e.target.value)}
            >
              <option value="">Sem produto</option>
              {products.map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.name} — {p.type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-secondary">Quantidade</label>
            <div className="flex gap-2">
              <input
                className="bg-input border border-border-input rounded px-3 py-2.5 text-sm text-primary w-full outline-none transition-[border-color,box-shadow] duration-150 focus:border-red focus:shadow-[0_0_0_3px_rgba(139,0,0,0.22)] flex-1"
                type="number"
                min={0}
                max={9999}
                value={quantity}
                onChange={handleQuantityChange}
              />
              <select
                className="bg-input border border-border-input rounded px-3 py-2.5 text-sm text-primary w-full outline-none transition-[border-color,box-shadow] duration-150 focus:border-red focus:shadow-[0_0_0_3px_rgba(139,0,0,0.22)] [&_option]:bg-surface flex-1"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              >
                <option value="caixas">caixas</option>
                <option value="unidades">unidades soltas</option>
              </select>
            </div>
          </div>

          {error && <p className="text-[0.8125rem] text-error m-0">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            className="bg-transparent border border-border-input rounded px-5 py-2.5 text-[0.8125rem] font-semibold text-secondary cursor-pointer transition-[border-color,color] duration-150 hover:enabled:border-muted hover:enabled:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className="bg-red border-none rounded px-6 py-2.5 text-[0.8125rem] font-bold text-on-red cursor-pointer uppercase tracking-[0.05em] transition-colors duration-[180ms] hover:enabled:bg-red-h active:enabled:bg-red-a disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default ContainerEditModal
