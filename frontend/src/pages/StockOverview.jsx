import { useState, useEffect, useMemo } from 'react'
import { fetchConsolidatedStock } from '../services/inventoryService'
import { ZONE_LABELS } from '../constants/zones'
import { fmtDate, fmtRelative } from '../utils/dateFormatters'

/* ── Icons ── */
const SearchIcon = () => (
  <svg className="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
  </svg>
)

const ClearIcon = () => (
  <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

/* ── Sort options ── */
const SORT_OPTIONS = [
  { key: 'az',     label: 'A → Z' },
  { key: 'za',     label: 'Z → A' },
  { key: 'recent', label: 'Recente' },
  { key: 'lowest', label: 'Menor Stock' },
]

/* ── Stock health helper ── */
const getStockHealth = (qty) => {
  if (qty === 0) return { color: 'text-error', bg: 'bg-error', dot: 'bg-error', label: 'Sem estoque' }
  if (qty <= 10) return { color: 'text-warn', bg: 'bg-warn', dot: 'bg-warn', label: 'Estoque baixo' }
  return { color: 'text-ok', bg: 'bg-ok', dot: 'bg-ok', label: 'OK' }
}

/* ── ProductRow ── */
const ProductRow = ({ item, expanded, onToggle }) => {
  const health = getStockHealth(item.totalQuantity)

  return (
    <div>
      <div
        className="grid grid-cols-[1fr_auto] sm:grid-cols-[8px_1fr_90px_90px_90px_70px_100px_40px] items-center gap-2 px-5 py-3 border-b border-border last:border-b-0 cursor-pointer transition-colors duration-[120ms] hover:bg-hover"
        onClick={onToggle}
      >
        {/* Health dot — desktop */}
        <span className={`hidden sm:block w-2 h-2 rounded-full ${health.dot}`} title={health.label} />

        {/* Product name */}
        <div className="flex items-center gap-2 min-w-0">
          <span className={`sm:hidden w-2 h-2 rounded-full shrink-0 ${health.dot}`} />
          <span className="text-[0.8125rem] font-medium text-primary truncate">{item.productName}</span>
        </div>

        {/* Type — desktop */}
        <span className="hidden sm:block text-xs text-muted truncate">{item.productType}</span>

        {/* Available — desktop */}
        <span className={`hidden sm:block text-[0.8125rem] font-bold text-right ${health.color}`}>
          {item.totalQuantity}
        </span>

        {/* Reserved — desktop */}
        <span className="hidden sm:block text-[0.8125rem] text-secondary text-right">
          {item.reservedQuantity || 0}
        </span>

        {/* Unit — desktop */}
        <span className="hidden sm:block text-xs text-secondary text-right">{item.unit}</span>

        {/* Modified — desktop */}
        <span className="hidden sm:block text-[0.6875rem] text-muted text-right" title={item.lastUpdatedAt ? fmtDate(item.lastUpdatedAt) : ''}>
          {item.lastUpdatedAt ? fmtRelative(item.lastUpdatedAt) : '—'}
        </span>

        {/* Mobile: qty inline */}
        <span className={`sm:hidden text-sm font-bold text-right ${health.color}`}>
          {item.totalQuantity} {item.unit}
        </span>

        {/* Chevron — desktop */}
        <span className="hidden sm:flex justify-center">
          <svg
            className={`w-4 h-4 text-secondary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {/* Expanded — container breakdown */}
      {expanded && (
        <div className="bg-hover/50 border-b border-border">
          <div className="px-8 py-2">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-muted mb-2">Locais</p>
            {item.containers.map(c => (
              <div key={c.id} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-secondary">
                  {ZONE_LABELS[c.zone] || c.zone} — {c.label}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-primary">{c.quantity} / {c.capacity}</span>
                  {c.updatedAt && (
                    <span className="text-[0.625rem] text-muted whitespace-nowrap" title={fmtDate(c.updatedAt)}>
                      {fmtRelative(c.updatedAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── StockOverview ── */
const StockOverview = () => {
  const [stock,    setStock]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')
  const [sortBy,   setSortBy]   = useState('az')
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    fetchConsolidatedStock()
      .then(setStock)
      .catch(() => setError('Erro ao carregar estoque.'))
      .finally(() => setLoading(false))
  }, [])

  const query = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!query) return stock
    return stock.filter(s => s.productName.toLowerCase().includes(query))
  }, [stock, query])

  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sortBy) {
      case 'za':
        return list.sort((a, b) => b.productName.localeCompare(a.productName))
      case 'recent':
        return list.sort((a, b) => {
          const da = a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0
          const db = b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0
          return db - da
        })
      case 'lowest':
        return list.sort((a, b) => a.totalQuantity - b.totalQuantity)
      default: // az
        return list.sort((a, b) => a.productName.localeCompare(b.productName))
    }
  }, [filtered, sortBy])

  const stats = useMemo(() => ({
    totalProducts: filtered.length,
    totalUnits:    filtered.reduce((s, f) => s + f.totalQuantity, 0),
    lowStock:      filtered.filter(f => f.totalQuantity <= 10).length,
  }), [filtered])

  const toggleExpand = (pid) =>
    setExpanded(prev => ({ ...prev, [pid]: !prev[pid] }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-secondary">A carregar estoque...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-primary m-0">Estoque Geral</h1>
          <p className="text-xs text-secondary m-0 mt-1">
            {stats.totalProducts} produtos | {stats.totalUnits} unidades
            {stats.lowStock > 0 && (
              <span className="text-warn"> | {stats.lowStock} em baixa</span>
            )}
          </p>
        </div>
      </div>

      {/* Sort buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            className={`px-3 py-1.5 text-xs font-semibold rounded border cursor-pointer transition-colors duration-150 ${
              sortBy === opt.key
                ? 'bg-red border-red text-on-red'
                : 'bg-transparent border-border-input text-secondary hover:border-muted hover:text-primary'
            }`}
            onClick={() => setSortBy(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 bg-surface border border-border rounded-md px-4">
        <SearchIcon />
        <input
          className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-primary placeholder:text-muted"
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {query && (
          <>
            <span className="text-xs text-secondary whitespace-nowrap">
              {sorted.length} resultado{sorted.length !== 1 ? 's' : ''}
            </span>
            <button
              className="flex items-center justify-center bg-transparent border-none cursor-pointer p-1 rounded shrink-0 transition-colors duration-150 hover:bg-hover"
              onClick={() => setSearch('')}
              aria-label="Limpar busca"
            >
              <ClearIcon />
            </button>
          </>
        )}
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="bg-surface border border-border rounded-md p-8 text-center">
          <p className="text-sm text-secondary m-0">Nenhum produto em estoque.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-card">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[8px_1fr_90px_90px_90px_70px_100px_40px] gap-2 px-5 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted border-b border-border">
            <span></span>
            <span>Produto</span>
            <span className="text-right">Tipo</span>
            <span className="text-right">Disponível</span>
            <span className="text-right">Em Pedidos</span>
            <span className="text-right">Unidade</span>
            <span className="text-right">Modificado</span>
            <span></span>
          </div>

          {sorted.map(item => (
            <ProductRow
              key={item.productId}
              item={item}
              expanded={!!expanded[item.productId]}
              onToggle={() => toggleExpand(item.productId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default StockOverview
