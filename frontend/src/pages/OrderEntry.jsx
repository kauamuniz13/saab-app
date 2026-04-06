import { useState, useEffect, useMemo } from 'react'
import { fetchProducts, fetchProductStock } from '../services/inventoryService'
import { createOrder } from '../services/orderService'
import { fetchClients, createClient } from '../services/userService'
import { useAuth } from '../context/AuthContext'

/* ── Helpers ── */
const CATEGORIES = [
  'Bovino', 'Suíno', 'Aves', 'Miúdos', 'Laticínios',
  'Congelados', 'Secos', 'Bebidas', 'Outros',
]

const fmt = (n) =>
  Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
    <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
  </svg>
)

const IconTrash = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ width: '0.875rem', height: '0.875rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166
         m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084
         a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0
         a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165
         m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201
         a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916
         m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
)

/* ── OrderEntry ── */
const OrderEntry = () => {
  const { user }     = useAuth()

  const [products,   setProducts]   = useState([])
  const [clients,    setClients]   = useState([])
  const [loading,    setLoading]    = useState(true)

  const [clientId,   setClientId]   = useState('')
  const [clientName, setClientName] = useState('')
  const [productId,  setProductId]  = useState('')
  const [quantity,   setQuantity]   = useState('')
  const [priceType,  setPriceType]  = useState('PER_LB')
  const [price,      setPrice]      = useState('')

  // Stock info for selected product
  const [stock,      setStock]      = useState(null)
  const [stockLoading, setStockLoading] = useState(false)

  // Cart
  const [cart,       setCart]       = useState([])

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  useEffect(() => {
    Promise.all([fetchProducts(), fetchClients()])
      .then(([prods, cls]) => { setProducts(prods); setClients(cls) })
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  // Fetch stock when product changes
  useEffect(() => {
    if (!productId) { setStock(null); return }
    setStockLoading(true)
    fetchProductStock(productId)
      .then(setStock)
      .catch(() => setStock(null))
      .finally(() => setStockLoading(false))
  }, [productId])

  // Available stock considering cart
  const effectiveStock = useMemo(() => {
    if (!stock) return 0
    const cartQty = cart
      .filter(item => item.productId === Number(productId))
      .reduce((s, item) => s + item.quantity, 0)
    return stock.totalBoxes - cartQty
  }, [stock, cart, productId])

  const selectedProduct = useMemo(
    () => products.find(p => p.id === Number(productId)) || null,
    [products, productId]
  )

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = {}
    for (const cat of CATEGORIES) {
      const prods = products.filter(p => p.type === cat && p.active !== false)
      if (prods.length > 0) grouped[cat] = prods
    }
    // 'Outros' catch-all
    const knownTypes = new Set(CATEGORIES)
    const other = products.filter(p => !knownTypes.has(p.type) && p.active !== false)
    if (other.length > 0) {
      grouped['Outros'] = [...(grouped['Outros'] || []), ...other]
    }
    return grouped
  }, [products])

  const qty       = Number(quantity)
  const qtyValid  = Number.isInteger(qty) && qty > 0 && qty <= effectiveStock
  const priceNum  = parseFloat(price)
  const priceValid = !isNaN(priceNum) && priceNum > 0
  const canAdd    = productId && qtyValid && priceValid

  // Cart totals
  const cartTotals = useMemo(() => ({
    boxes: cart.reduce((s, i) => s + i.quantity, 0),
    items: cart.length,
  }), [cart])

  const canSubmit = clientId && cart.length > 0 && !submitting

  const handleAddItem = () => {
    if (!canAdd) return
    setError('')
    setSuccess('')

    const product = products.find(p => p.id === Number(productId))
    setCart(prev => [...prev, {
      productId:   Number(productId),
      quantity:    qty,
      priceType,
      pricePerLb:  priceType === 'PER_LB'  ? priceNum : null,
      pricePerBox: priceType === 'PER_BOX' ? priceNum : null,
      // Display data
      productName: product.name,
      productType: product.type,
    }])

    setProductId('')
    setQuantity('')
    setPrice('')
  }

  const handleCreateClient = async () => {
    const name = prompt('Nome do novo cliente:')
    if (!name?.trim()) return
    
    try {
      const newClient = await createClient({ name: name.trim() })
      setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)))
      setClientId(String(newClient.id))
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar cliente.')
    }
  }

  const handleRemoveItem = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!canSubmit) return

    setSubmitting(true)
    try {
      const order = await createOrder({
        clientId: Number(clientId),
        items: cart.map(({ productId, quantity, priceType, pricePerLb, pricePerBox }) => ({
          productId, quantity, priceType, pricePerLb, pricePerBox,
        })),
      })

      setSuccess(`Pedido #${order.id} criado com sucesso (${cart.length} ${cart.length === 1 ? 'item' : 'itens'}) — Status: PENDENTE`)
      setCart([])
      setProductId('')
      setQuantity('')
      setPrice('')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6">

      <div className="flex flex-col gap-5 md:flex-row md:items-start">

        {/* ── Form card ── */}
        <div className="bg-surface border border-border rounded-[6px] p-6 flex-1 flex flex-col gap-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted m-0 mb-5">Adicionar Produto</p>

          <div className="flex flex-col gap-[1.125rem]">

            {/* Cliente */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-secondary">Loja / Cliente</label>
                <button
                  type="button"
                  className="text-xs text-red hover:underline cursor-pointer bg-transparent border-none p-0"
                  onClick={handleCreateClient}
                >
                  + Novo Cliente
                </button>
              </div>
              <select
                className="bg-input border border-border-input rounded text-sm text-primary outline-none w-full py-[0.7rem] px-[0.875rem] appearance-none transition-[border-color,box-shadow] duration-[180ms] focus:border-red focus:ring-2 focus:ring-red/20 disabled:opacity-40 disabled:cursor-not-allowed"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                disabled={loading}
              >
                <option value="">Selecione um cliente…</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Produto */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-secondary">Produto</label>
              <select
                className="bg-input border border-border-input rounded text-sm text-primary outline-none w-full py-[0.7rem] px-[0.875rem] appearance-none transition-[border-color,box-shadow] duration-[180ms] focus:border-red focus:ring-2 focus:ring-red/20 disabled:opacity-40 disabled:cursor-not-allowed"
                value={productId}
                onChange={e => { setProductId(e.target.value); setQuantity('') }}
                disabled={loading}
              >
                <option value="">Selecione um produto…</option>
                {Object.entries(productsByCategory).map(([cat, prods]) => (
                  <optgroup key={cat} label={cat}>
                    {prods.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {productId && !stockLoading && stock && (
                <p className={`text-xs m-0 py-1.5 px-2.5 rounded bg-hover border border-border ${effectiveStock === 0 ? 'text-error' : effectiveStock <= 20 ? 'text-warn' : 'text-ok'}`}>
                  Stock disponível: {effectiveStock} cxs
                  {effectiveStock <= 20 && effectiveStock > 0 ? ' — Stock baixo' : ''}
                </p>
              )}
              {stockLoading && (
                <p className="text-xs m-0 py-1.5 px-2.5 rounded bg-hover border border-border">A verificar stock...</p>
              )}
            </div>

            {/* Quantidade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-secondary">Quantidade (caixas)</label>
              <input
                className="bg-input border border-border-input rounded text-sm text-primary outline-none w-full py-[0.7rem] px-[0.875rem] appearance-none transition-[border-color,box-shadow] duration-[180ms] focus:border-red focus:ring-2 focus:ring-red/20 placeholder:text-muted disabled:opacity-40 disabled:cursor-not-allowed"
                type="number"
                min="1"
                max={effectiveStock || undefined}
                step="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder={effectiveStock ? `Máx. ${effectiveStock}` : '—'}
                disabled={!productId || loading}
              />
            </div>

            {/* Tipo de preço + Preço */}
            <div className="flex gap-3 [&>*]:flex-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-secondary">Tipo de Preço</label>
                <select
                  className="bg-input border border-border-input rounded text-sm text-primary outline-none w-full py-[0.7rem] px-[0.875rem] appearance-none transition-[border-color,box-shadow] duration-[180ms] focus:border-red focus:ring-2 focus:ring-red/20"
                  value={priceType}
                  onChange={e => setPriceType(e.target.value)}
                >
                  <option value="PER_LB">Por Libra (lb)</option>
                  <option value="PER_BOX">Por Caixa</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-secondary">
                  {priceType === 'PER_LB' ? 'Preço/lb ($)' : 'Preço/cx ($)'}
                </label>
                <input
                  className="bg-input border border-border-input rounded text-sm text-primary outline-none w-full py-[0.7rem] px-[0.875rem] appearance-none transition-[border-color,box-shadow] duration-[180ms] focus:border-red focus:ring-2 focus:ring-red/20 placeholder:text-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>

            {quantity && !qtyValid && productId && (
              <p className="text-[0.8125rem] py-3 px-4 rounded m-0 leading-[1.45] bg-error-bg border border-red/45 text-error">
                {qty <= 0
                  ? 'A quantidade deve ser maior que zero.'
                  : `Stock insuficiente. Máximo disponível: ${effectiveStock} cxs.`}
              </p>
            )}

            <button
              type="button"
              className="w-full bg-transparent border-2 border-dashed border-border-input rounded py-3 px-4 text-[0.8125rem] font-bold uppercase tracking-[0.05em] text-secondary cursor-pointer transition-[border-color,color] duration-[180ms] hover:enabled:border-red hover:enabled:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={handleAddItem}
              disabled={!canAdd}
            >
              + Adicionar ao Pedido
            </button>
          </div>

          {/* ── Cart ── */}
          {cart.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted m-0">
                Itens no Pedido ({cart.length})
              </p>
              <div className="flex flex-col gap-2">
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 bg-hover border border-border rounded py-2.5 px-3.5">
                    <div className="flex flex-col gap-[0.15rem] min-w-0">
                      <span className="text-[0.8125rem] font-semibold text-primary whitespace-nowrap overflow-hidden text-ellipsis">{item.productName}</span>
                      <span className="text-[0.6875rem] text-secondary">
                        {item.quantity} cxs · {item.priceType === 'PER_LB'
                          ? `${fmt(item.pricePerLb)}/lb`
                          : `${fmt(item.pricePerBox)}/cx`}
                      </span>
                    </div>
                    <button
                      className="bg-transparent border-none text-muted cursor-pointer p-1.5 rounded flex shrink-0 transition-[color,background-color] duration-150 hover:text-error hover:bg-error-bg"
                      onClick={() => handleRemoveItem(i)}
                      aria-label="Remover item"
                    >
                      <IconTrash />
                    </button>
                  </div>
                ))}
              </div>

              {error   && <p className="text-[0.8125rem] py-3 px-4 rounded m-0 leading-[1.45] bg-error-bg border border-red/45 text-error">{error}</p>}
              {success && <p className="text-[0.8125rem] py-3 px-4 rounded m-0 leading-[1.45] bg-ok-bg border border-ok/35 text-ok">{success}</p>}

              <button
                className="mt-2 w-full bg-red hover:bg-red-h active:bg-red-a text-on-red font-bold uppercase border-none rounded py-[0.8125rem] px-4 text-sm tracking-[0.05em] cursor-pointer transition-colors duration-[180ms] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {submitting ? <><Spinner /> A processar…</> : `Confirmar Pedido (${cart.length} ${cart.length === 1 ? 'item' : 'itens'})`}
              </button>
            </div>
          )}

          {cart.length === 0 && error && <p className="text-[0.8125rem] py-3 px-4 rounded m-0 leading-[1.45] bg-error-bg border border-red/45 text-error">{error}</p>}
          {cart.length === 0 && success && <p className="text-[0.8125rem] py-3 px-4 rounded m-0 leading-[1.45] bg-ok-bg border border-ok/35 text-ok">{success}</p>}
        </div>

        {/* ── Summary card ── */}
        <div className="bg-surface border border-border rounded-[6px] p-6 w-full md:w-[280px] md:shrink-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted m-0 mb-5">Resumo</p>

          <div className="flex justify-between items-baseline py-2 border-b border-border text-[0.8125rem] text-secondary [&>span:last-child]:text-primary [&>span:last-child]:font-semibold">
            <span>Loja / Cliente</span>
            <span>{clientId ? clients.find(c => c.id === Number(clientId))?.name || '—' : '—'}</span>
          </div>

          <div className="flex justify-between items-baseline py-2 border-b border-border text-[0.8125rem] text-secondary [&>span:last-child]:text-primary [&>span:last-child]:font-semibold">
            <span>Itens</span>
            <span>{cart.length > 0 ? cart.length : '—'}</span>
          </div>

          {cart.map((item, i) => (
            <div key={i} className="flex justify-between items-baseline py-2 border-b border-border text-[0.8125rem] text-secondary last:border-b-0 [&>span:last-child]:text-primary [&>span:last-child]:font-semibold">
              <span className="text-xs max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">{item.productName}</span>
              <span>{item.quantity} cxs</span>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-border flex justify-between items-baseline text-sm font-bold text-primary [&>span:last-child]:text-lg [&>span:last-child]:text-primary">
            <span>Total caixas</span>
            <span>{cartTotals.boxes > 0 ? `${cartTotals.boxes} cxs` : '—'}</span>
          </div>
        </div>

      </div>

    </div>
  )
}

export default OrderEntry
