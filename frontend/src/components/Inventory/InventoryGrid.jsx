import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchContainers, fetchProducts, fetchConsolidatedStock } from '../../services/inventoryService'
import { ZONE_CONFIG, ZONE_LABELS } from '../../constants/zones'
import ContainerEditModal from './ContainerEditModal'

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

const ChevronIcon = ({ open }) => (
  <svg
    className={`w-[1.125rem] h-[1.125rem] text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.147l-3.167 1.056 1.056-3.167a4.5 4.5 0 011.147-1.89l12.884-12.88z" />
  </svg>
)

const SortIcon = ({ active, direction }) => (
  <svg className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? 'text-primary' : 'text-muted'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    {direction === 'asc'
      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
      : <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
    }
  </svg>
)

/* ── Date formatting ── */
const fmtDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const fmtRelative = (dateStr) => {
  if (!dateStr) return ''
  const now = new Date()
  const d = new Date(dateStr)
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h atrás`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d atrás`
  return fmtDate(dateStr)
}

/* ── ListRow (Por Local view) ── */
const ListRow = ({ container, onClick }) => {
  const { label, quantity, product, unit, updatedAt } = container
  const qtyLabel = unit || 'caixas'

  return (
    <div className="flex items-center gap-4 py-3 px-4 bg-surface border border-border rounded-md transition-colors duration-150 hover:bg-hover hover:border-border-input">
      <div className="flex-none w-[70px] text-left">
        <span className="inline-block text-[0.8125rem] font-semibold text-primary bg-red/15 py-1 px-2 rounded border border-red/40">{quantity} {qtyLabel}</span>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {product ? (
          <span className="text-[0.8125rem] font-semibold text-primary whitespace-nowrap overflow-hidden text-ellipsis">{product.name}</span>
        ) : (
          <span className="text-[0.8125rem] text-muted italic">Sem produto</span>
        )}
      </div>
      {updatedAt && (
        <span className="hidden sm:block text-[0.625rem] text-muted whitespace-nowrap" title={fmtDate(updatedAt)}>
          {fmtRelative(updatedAt)}
        </span>
      )}
      <div className="flex-none">
        <button
          className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold uppercase text-primary bg-transparent border border-border rounded cursor-pointer transition-all duration-200 hover:bg-input hover:border-[#555]"
          onClick={onClick}
          title="Editar quantidade/produto"
        >
          <EditIcon /> Editar
        </button>
      </div>
    </div>
  )
}

/* ── ContainerList ── */
const ContainerList = ({ containers, onSelect }) => (
  <div className="flex flex-col gap-2">
    {containers.map(c => (
      <ListRow key={c.id} container={c} onClick={() => onSelect(c)} />
    ))}
  </div>
)

/* ── ZoneSection — collapsible zone panel ── */
const ZoneSection = ({ zone, containers, onSelect, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-surface border border-border rounded-md">
      <button
        className="flex items-center justify-between w-full py-4 px-5 bg-transparent border-none rounded-md cursor-pointer text-left transition-colors duration-150 hover:bg-hover"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex flex-col gap-[0.2rem]">
          <span className="text-[0.9375rem] font-bold text-primary uppercase tracking-wide">{zone.label}</span>
          <span className="text-[0.6875rem] text-secondary tracking-[0.02em]">
            {containers.length} itens
          </span>
        </div>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-5">
          <ContainerList containers={containers} onSelect={onSelect} />
        </div>
      )}
    </div>
  )
}

/* ── ProductRow (Por Produto view) ── */
const ProductRow = ({ item, expanded, onToggle }) => (
  <div>
    <div
      className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_100px_90px_130px_40px] items-center gap-2 px-5 py-3 border-b border-border last:border-b-0 cursor-pointer transition-colors duration-[120ms] hover:bg-hover"
      onClick={onToggle}
    >
      <span className="text-[0.8125rem] font-medium text-primary">{item.productName}</span>
      <span className="hidden sm:block text-[0.8125rem] font-bold text-primary text-right">{item.totalQuantity}</span>
      <span className="hidden sm:block text-xs text-secondary text-right">{item.unit}</span>
      <span className="hidden sm:block text-[0.6875rem] text-muted text-right" title={item.lastUpdatedAt ? fmtDate(item.lastUpdatedAt) : ''}>
        {item.lastUpdatedAt ? fmtRelative(item.lastUpdatedAt) : '—'}
      </span>
      {/* Mobile qty */}
      <span className="sm:hidden text-sm font-bold text-primary text-right">{item.totalQuantity} {item.unit}</span>
      <span className="hidden sm:flex justify-center">
        <svg
          className={`w-4 h-4 text-secondary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>

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

/* ── InventoryGrid ── */
const InventoryGrid = () => {
  const [containers,        setContainers]        = useState([])
  const [products,          setProducts]          = useState([])
  const [stock,             setStock]             = useState([])
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState('')
  const [search,            setSearch]            = useState('')
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [viewMode,          setViewMode]          = useState('local')   // 'local' | 'product'
  const [sortBy,            setSortBy]            = useState('name')    // 'name' | 'date'
  const [expanded,          setExpanded]          = useState({})

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([fetchContainers(), fetchProducts(), fetchConsolidatedStock()])
      .then(([c, p, s]) => { setContainers(c); setProducts(p); setStock(s) })
      .catch(() => setError('Erro ao carregar inventário. Verifique a ligação ao servidor.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const query = search.trim().toLowerCase()
  const isSearching = query.length > 0

  /* ── Por Local ── */
  const matchesQuery = useCallback((c) =>
    c.product?.name.toLowerCase().includes(query) ||
    c.product?.type?.toLowerCase().includes(query) ||
    c.label.toLowerCase().includes(query)
  , [query])

  const filtered = useMemo(() =>
    isSearching ? containers.filter(matchesQuery) : []
  , [isSearching, containers, matchesQuery])

  const filteredGrouped = useMemo(() => {
    if (!isSearching) return {}
    const map = {}
    for (const c of filtered) {
      const key = c.zone || 'SECOS'
      if (!map[key]) map[key] = []
      map[key].push(c)
    }
    return map
  }, [isSearching, filtered])

  const grouped = useMemo(() => {
    const map = {}
    for (const c of containers) {
      const key = c.zone || 'SECOS'
      if (!map[key]) map[key] = []
      map[key].push(c)
    }
    return map
  }, [containers])

  /* ── Por Produto ── */
  const filteredStock = useMemo(() => {
    let list = stock
    if (query) {
      list = list.filter(s => s.productName.toLowerCase().includes(query))
    }
    if (sortBy === 'date') {
      list = [...list].sort((a, b) => {
        const da = a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0
        const db = b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0
        return db - da // mais recente primeiro
      })
    }
    // 'name' já vem ordenado do backend
    return list
  }, [stock, query, sortBy])

  const totalItems = filteredStock.reduce((s, f) => s + f.totalQuantity, 0)

  const toggleExpand = (pid) =>
    setExpanded(prev => ({ ...prev, [pid]: !prev[pid] }))

  const handleSaved = (updated) => {
    setContainers(prev => prev.map(c => c.id === updated.id ? updated : c))
    setSelectedContainer(null)
    // Recarregar stock consolidado
    fetchConsolidatedStock().then(setStock).catch(() => {})
  }

  const toggleSort = () => setSortBy(prev => prev === 'name' ? 'date' : 'name')

  return (
    <div className="flex flex-col gap-5">

      {/* View toggle + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex border border-border-input rounded overflow-hidden">
          <button
            className={`px-4 py-2 text-xs font-semibold cursor-pointer transition-[background-color,color] duration-150 border-none ${viewMode === 'local' ? 'bg-red text-on-red' : 'bg-transparent text-muted hover:text-primary'}`}
            onClick={() => setViewMode('local')}
          >
            Por Local
          </button>
          <button
            className={`px-4 py-2 text-xs font-semibold cursor-pointer transition-[background-color,color] duration-150 border-l border-border-input ${viewMode === 'product' ? 'bg-red text-on-red' : 'bg-transparent text-muted hover:text-primary'}`}
            onClick={() => setViewMode('product')}
          >
            Por Produto
          </button>
        </div>

        {viewMode === 'product' && (
          <div className="flex items-center gap-3">
            <p className="text-xs text-secondary m-0">
              {filteredStock.length} produtos | {totalItems} unidades
            </p>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-transparent border border-border-input rounded cursor-pointer transition-colors duration-150 hover:border-muted hover:text-primary text-secondary"
              onClick={toggleSort}
              title={sortBy === 'name' ? 'Ordenar por modificação' : 'Ordenar por nome'}
            >
              <SortIcon active={sortBy === 'date'} direction="desc" />
              {sortBy === 'name' ? 'A → Z' : 'Recente'}
            </button>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 bg-surface border border-border rounded-md px-4">
        <SearchIcon />
        <input
          className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-primary placeholder:text-muted"
          type="text"
          placeholder={viewMode === 'local' ? 'Buscar por produto, tipo ou contêiner…' : 'Buscar produto…'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {isSearching && (
          <>
            <span className="text-xs text-secondary whitespace-nowrap">
              {viewMode === 'local'
                ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`
                : `${filteredStock.length} produto${filteredStock.length !== 1 ? 's' : ''}`
              }
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

      {/* States */}
      {loading && <p className="py-12 px-4 text-center text-muted text-sm">A carregar inventário…</p>}
      {!loading && error && <p className="py-12 px-4 text-center text-error text-sm">{error}</p>}

      {/* ════════ VIEW: POR LOCAL ════════ */}
      {!loading && !error && viewMode === 'local' && (
        <>
          {/* Search results grouped by zone */}
          {isSearching && (
            <div className="flex flex-col gap-3.5">
              {filtered.length === 0 ? (
                <p className="py-12 px-4 text-center text-muted text-sm">Nenhum resultado para "{search.trim()}"</p>
              ) : (
                ZONE_CONFIG.map(zone => {
                  const zoneContainers = filteredGrouped[zone.key]
                  if (!zoneContainers || zoneContainers.length === 0) return null
                  return (
                    <ZoneSection
                      key={zone.key}
                      zone={zone}
                      containers={zoneContainers}
                      onSelect={setSelectedContainer}
                      defaultOpen={false}
                    />
                  )
                })
              )}
            </div>
          )}

          {/* Zone sections (default) */}
          {!isSearching && ZONE_CONFIG.map(zone => {
            const zoneContainers = grouped[zone.key] || []
            if (zoneContainers.length === 0) return null
            return (
              <ZoneSection
                key={zone.key}
                zone={zone}
                containers={zoneContainers}
                onSelect={setSelectedContainer}
                defaultOpen={false}
              />
            )
          })}
        </>
      )}

      {/* ════════ VIEW: POR PRODUTO ════════ */}
      {!loading && !error && viewMode === 'product' && (
        <>
          {filteredStock.length === 0 ? (
            <div className="bg-surface border border-border rounded-md p-8 text-center">
              <p className="text-sm text-secondary m-0">Nenhum produto em estoque.</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-md overflow-hidden shadow-card">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-[1fr_100px_90px_130px_40px] gap-2 px-5 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted border-b border-border">
                <span>Produto</span>
                <span className="text-right">Quantidade</span>
                <span className="text-right">Unidade</span>
                <span className="text-right">Modificado</span>
                <span></span>
              </div>

              {filteredStock.map(item => (
                <ProductRow
                  key={item.productId}
                  item={item}
                  expanded={!!expanded[item.productId]}
                  onToggle={() => toggleExpand(item.productId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      {selectedContainer && (
        <ContainerEditModal
          container={selectedContainer}
          products={products}
          onClose={() => setSelectedContainer(null)}
          onSaved={handleSaved}
        />
      )}

    </div>
  )
}

export default InventoryGrid
