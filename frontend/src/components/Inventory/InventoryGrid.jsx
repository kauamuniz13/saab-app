import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchContainers, fetchProducts } from '../../services/inventoryService'
import { ZONE_CONFIG, ZONE_LABELS } from '../../constants/zones'
import { fmtDate, fmtRelative } from '../../utils/dateFormatters'
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

/* ── ListRow ── */
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

/* ── InventoryGrid ── */
const InventoryGrid = () => {
  const [containers,        setContainers]        = useState([])
  const [products,          setProducts]          = useState([])
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState('')
  const [search,            setSearch]            = useState('')
  const [selectedContainer, setSelectedContainer] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([fetchContainers(), fetchProducts()])
      .then(([c, p]) => { setContainers(c); setProducts(p) })
      .catch(() => setError('Erro ao carregar inventário. Verifique a ligação ao servidor.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const query = search.trim().toLowerCase()
  const isSearching = query.length > 0

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

  const handleSaved = (updated) => {
    setContainers(prev => prev.map(c => c.id === updated.id ? updated : c))
    setSelectedContainer(null)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Search bar */}
      <div className="flex items-center gap-3 bg-surface border border-border rounded-md px-4">
        <SearchIcon />
        <input
          className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-primary placeholder:text-muted"
          type="text"
          placeholder="Buscar por produto, tipo ou contêiner..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {isSearching && (
          <>
            <span className="text-xs text-secondary whitespace-nowrap">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
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

      {/* Zone-based container view */}
      {!loading && !error && (
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
