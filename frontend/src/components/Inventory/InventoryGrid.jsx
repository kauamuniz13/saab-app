import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchContainers, fetchProducts } from '../../services/inventoryService'
import { ZONE_CONFIG, SUBZONE_LABELS, expandLabel } from '../../constants/zones'
import ContainerEditModal from './ContainerEditModal'
import styles from './InventoryGrid.module.css'

/* ── Icons ── */
const SearchIcon = () => (
  <svg className={styles.searchIcon} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
  </svg>
)

const ClearIcon = () => (
  <svg className={styles.clearIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ChevronIcon = ({ open }) => (
  <svg
    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
)

/* ── ContainerCard ── */
const ContainerCard = ({ container, highlighted, onClick }) => {
  const { label, quantity, product } = container

  return (
    <div
      className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      title="Clique para editar"
    >
      <div className={styles.cardHead}>
        <span className={styles.cardLabel}>{expandLabel(label)}</span>
      </div>

      {product ? (
        <>
          <p className={styles.productName}>{product.name}</p>
          <p className={styles.productType}>{product.type}</p>
        </>
      ) : (
        <p className={styles.emptySlot}>Sem produto</p>
      )}

      <span className={styles.quantityLabel}>{quantity} cxs</span>
    </div>
  )
}

/* ── ContainerGrid — renders a grid of cards ── */
const ContainerGrid = ({ containers, isHighlighted, onSelect }) => (
  <div className={styles.grid}>
    {containers.map(c => (
      <ContainerCard
        key={c.id}
        container={c}
        highlighted={isHighlighted(c)}
        onClick={() => onSelect(c)}
      />
    ))}
  </div>
)

/* ── ZoneSection — collapsible zone panel ── */
const ZoneSection = ({ zone, containers, isHighlighted, onSelect, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={styles.zoneSection}>
      <button className={styles.zoneToggle} onClick={() => setOpen(o => !o)}>
        <div className={styles.zoneToggleLeft}>
          <span className={styles.zoneName}>{zone.label}</span>
          <span className={styles.zoneStats}>
            {containers.length} slots
          </span>
        </div>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className={styles.zoneBody}>
          <ContainerGrid
            containers={containers}
            isHighlighted={isHighlighted}
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  )
}

/* ── WarehouseZoneSection — containers grouped by prefix (31, 32, 33, 36) ── */
const WAREHOUSE_ORDER = ['CT36', 'CT33', 'CT32', 'CT31']
const WAREHOUSE_LABELS = {
  CT36: 'Container 36',
  CT33: 'Container 33',
  CT32: 'Container 32',
  CT31: 'Container 31',
}

const WarehouseZoneSection = ({ containers, isHighlighted, onSelect, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen)

  const grouped = useMemo(() => {
    const map = {}
    for (const c of containers) {
      const match = c.label.match(/^([A-Z]+\d*)/)
      const prefix = match ? match[1] : 'OTHER'
      if (!map[prefix]) map[prefix] = []
      map[prefix].push(c)
    }
    return map
  }, [containers])

  return (
    <div className={styles.zoneSection}>
      <button className={styles.zoneToggle} onClick={() => setOpen(o => !o)}>
        <div className={styles.zoneToggleLeft}>
          <span className={styles.zoneName}>Warehouse</span>
          <span className={styles.zoneStats}>
            {containers.length} slots
          </span>
        </div>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className={styles.zoneBody}>
          {WAREHOUSE_ORDER.map(prefix => {
            const sub = grouped[prefix]
            if (!sub?.length) return null
            return (
              <div key={prefix} className={styles.subZoneBlock}>
                <div className={styles.subZoneHeader}>
                  <span className={styles.subZoneName}>{WAREHOUSE_LABELS[prefix]}</span>
                  <span className={styles.subZoneStats}>
                    {sub.length} slots
                  </span>
                </div>
                <ContainerGrid
                  containers={sub}
                  isHighlighted={isHighlighted}
                  onSelect={onSelect}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── SecosZoneSection — zone with sub-division headers ── */
const SecosZoneSection = ({ containers, isHighlighted, onSelect, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen)

  const grouped = useMemo(() => {
    const map = {}
    for (const c of containers) {
      const sub = c.subZone || 'OTHER'
      if (!map[sub]) map[sub] = []
      map[sub].push(c)
    }
    return map
  }, [containers])

  const subZoneOrder = ['NASSIF', 'SAAB', 'BEBIDAS']

  return (
    <div className={styles.zoneSection}>
      <button className={styles.zoneToggle} onClick={() => setOpen(o => !o)}>
        <div className={styles.zoneToggleLeft}>
          <span className={styles.zoneName}>Secos</span>
          <span className={styles.zoneStats}>
            {containers.length} slots
          </span>
        </div>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className={styles.zoneBody}>
          {subZoneOrder.map(sub => {
            const subContainers = grouped[sub]
            if (!subContainers?.length) return null
            return (
              <div key={sub} className={styles.subZoneBlock}>
                <div className={styles.subZoneHeader}>
                  <span className={styles.subZoneName}>{SUBZONE_LABELS[sub]}</span>
                  <span className={styles.subZoneStats}>
                    {subContainers.length} slots
                  </span>
                </div>
                <ContainerGrid
                  containers={subContainers}
                  isHighlighted={isHighlighted}
                  onSelect={onSelect}
                />
              </div>
            )
          })}
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

  const matchesQuery = useCallback((c) =>
    c.product?.name.toLowerCase().includes(query) ||
    c.product?.type.toLowerCase().includes(query) ||
    c.label.toLowerCase().includes(query)
  , [query])

  const isSearching = query.length > 0

  const filtered = useMemo(() =>
    isSearching ? containers.filter(matchesQuery) : []
  , [isSearching, containers, matchesQuery])

  /* Group containers by zone — merge CAMARA_FRIA_FORA into CAMARA_FRIA */
  const grouped = useMemo(() => {
    const map = {}
    for (const c of containers) {
      let key = c.zone || 'CONTAINERS'
      if (key === 'CAMARA_FRIA_FORA') key = 'CAMARA_FRIA'
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
    <div className={styles.wrapper}>

      {/* Search bar */}
      <div className={styles.searchBar}>
        <SearchIcon />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por produto, tipo ou contêiner…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {isSearching && (
          <>
            <span className={styles.searchCount}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
            <button
              className={styles.clearBtn}
              onClick={() => setSearch('')}
              aria-label="Limpar busca"
            >
              <ClearIcon />
            </button>
          </>
        )}
      </div>

      {/* States */}
      {loading && <p className={styles.stateBox}>A carregar contêineres…</p>}
      {!loading && error && <p className={`${styles.stateBox} ${styles.error}`}>{error}</p>}

      {/* Search results */}
      {!loading && !error && isSearching && (
        <div className={styles.searchResults}>
          {filtered.length === 0 ? (
            <p className={styles.stateBox}>Nenhum resultado para "{search.trim()}"</p>
          ) : (
            <div className={styles.resultsGrid}>
              {filtered.map(c => (
                <ContainerCard
                  key={c.id}
                  container={c}
                  highlighted={false}
                  onClick={() => setSelectedContainer(c)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Zone sections (hidden during search) */}
      {!loading && !error && !isSearching && ZONE_CONFIG.map(zone => {
        const zoneContainers = grouped[zone.key] || []
        if (zoneContainers.length === 0) return null

        if (zone.key === 'SECOS') {
          return (
            <SecosZoneSection
              key={zone.key}
              containers={zoneContainers}
              isHighlighted={() => false}
              onSelect={setSelectedContainer}
              defaultOpen={true}
            />
          )
        }

        if (zone.key === 'CONTAINERS') {
          return (
            <WarehouseZoneSection
              key={zone.key}
              containers={zoneContainers}
              isHighlighted={() => false}
              onSelect={setSelectedContainer}
              defaultOpen={true}
            />
          )
        }

        return (
          <ZoneSection
            key={zone.key}
            zone={zone}
            containers={zoneContainers}
            isHighlighted={() => false}
            onSelect={setSelectedContainer}
            defaultOpen={true}
          />
        )
      })}

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
