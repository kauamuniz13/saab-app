import { useState, useEffect } from 'react'
import { fetchMyOrders, openInvoice } from '../services/orderService'

/* ── Status config ── */
const STATUS_LABEL = {
  PENDING:    'Pendente',
  CONFIRMED:  'Confirmado',
  SEPARATING: 'Em Separação',
  READY:      'Pronto',
  IN_TRANSIT: 'Em Trânsito',
  DELIVERED:  'Entregue',
  CANCELLED:  'Cancelado',
}

const STATUS_CLASSES = {
  PENDING:    'bg-warn-bg text-warn',
  CONFIRMED:  'bg-info-bg text-info',
  SEPARATING: 'bg-info-bg text-info',
  READY:      'bg-info-bg text-info',
  IN_TRANSIT: 'bg-info-bg text-info',
  DELIVERED:  'bg-ok-bg text-ok',
  CANCELLED:  'bg-error-bg text-error',
}

/* ── Icons ── */
const IconPdf = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5
         A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25
         m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25
         c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25
         a9 9 0 00-9-9z" />
  </svg>
)

/* ── OrderCard (mobile) ── */
const OrderCard = ({ order, status, products }) => (
  <div className="bg-surface border border-border rounded-md p-4 flex flex-col gap-2.5 shadow-card">
    <div className="flex items-center justify-between gap-2">
      <span className="font-semibold text-primary">#{order.id}</span>
      <span className={`inline-flex items-center gap-1 text-[0.6875rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_CLASSES[status] ?? ''}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {STATUS_LABEL[status] ?? status}
      </span>
    </div>
    <p className="text-[0.8125rem] text-secondary m-0 overflow-hidden text-ellipsis whitespace-nowrap">{products}</p>
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted">
        {new Date(order.createdAt).toLocaleDateString('pt-PT')}
      </span>
      <span className="text-xs text-muted">
        {order.totalBoxes} cxs
        {order.weightLb ? ` · ${Number(order.weightLb).toFixed(1)} lbs` : ''}
      </span>
    </div>
    <div className="flex items-center gap-2">
      {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
        <button
          className="inline-flex items-center gap-1.5 bg-transparent border border-border rounded px-3 py-1.5 text-xs font-semibold text-secondary cursor-pointer whitespace-nowrap transition-colors hover:border-error hover:text-error"
          onClick={() => openInvoice(order.id)}
        >
          <IconPdf /> Fatura
        </button>
      )}
    </div>
  </div>
)

/* ── ClientOrders ── */
const ClientOrders = () => {
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setError('Erro ao carregar pedidos.'))
      .finally(() => setLoading(false))
  }, [])

  const getProducts = (order) =>
    order.items
      ?.map(i => i.product?.name ?? '—')
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(', ') ?? '—'

  return (
    <div className="p-6 flex flex-col gap-6">

      <div className="flex flex-col gap-1">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.22em] text-red m-0">Os Meus Pedidos</p>
        <h1 className="text-xl font-bold text-primary m-0">Histórico de Pedidos</h1>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-center py-12 px-4 text-muted text-sm bg-surface border border-border rounded-md">A carregar pedidos…</p>}
      {!loading && error && <p className="text-center py-12 px-4 text-error text-sm bg-surface border border-border rounded-md">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="text-center py-12 px-4 text-muted text-sm bg-surface border border-border rounded-md">Nenhum pedido registado.</p>
      )}

      {/* Desktop table */}
      {!loading && !error && orders.length > 0 && (
        <div className="hidden md:block bg-surface border border-border rounded-md overflow-hidden shadow-card">
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className="w-full border-collapse text-[0.8125rem]">
              <thead className="bg-hover border-b border-border">
                <tr>
                  {['Nº Pedido','Data','Produto(s)','Caixas','Peso','Status','Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[0.6875rem] font-bold uppercase tracking-wide text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const status = order.status ?? 'PENDING'
                  const products = getProducts(order)

                  return (
                    <tr key={order.id} className="group">
                      <td className="px-4 py-3.5 text-primary border-b border-border align-middle group-last:border-b-0 group-hover:bg-hover font-semibold">#{order.id}</td>
                      <td className="px-4 py-3.5 text-primary border-b border-border align-middle group-last:border-b-0 group-hover:bg-hover">{new Date(order.createdAt).toLocaleDateString('pt-PT')}</td>
                      <td className="px-4 py-3.5 text-primary border-b border-border align-middle group-last:border-b-0 group-hover:bg-hover">{products}</td>
                      <td className="px-4 py-3.5 text-primary border-b border-border align-middle group-last:border-b-0 group-hover:bg-hover">{order.totalBoxes}</td>
                      <td className="px-4 py-3.5 text-primary border-b border-border align-middle group-last:border-b-0 group-hover:bg-hover">{order.weightLb ? `${Number(order.weightLb).toFixed(1)} lbs` : '—'}</td>
                      <td className="px-4 py-3.5 text-primary border-b border-border align-middle group-last:border-b-0 group-hover:bg-hover">
                        <span className={`inline-flex items-center gap-1 text-[0.6875rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_CLASSES[status] ?? ''}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {STATUS_LABEL[status] ?? status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-primary border-b border-border align-middle group-last:border-b-0 group-hover:bg-hover">
                        <div className="flex items-center gap-2">
                          {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
                            <button
                              className="inline-flex items-center gap-1.5 bg-transparent border border-border rounded px-3 py-1.5 text-xs font-semibold text-secondary cursor-pointer whitespace-nowrap transition-colors hover:border-error hover:text-error"
                              onClick={() => openInvoice(order.id)}
                            >
                              <IconPdf />
                              Fatura
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      {!loading && !error && orders.length > 0 && (
        <div className="flex md:hidden flex-col gap-3">
          {orders.map(order => {
            const status = order.status ?? 'PENDING'
            return (
              <OrderCard
                key={order.id}
                order={order}
                status={status}
                products={getProducts(order)}
              />
            )
          })}
        </div>
      )}

    </div>
  )
}

export default ClientOrders
