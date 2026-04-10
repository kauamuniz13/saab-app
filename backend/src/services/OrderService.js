const prisma = require('../lib/prisma')

const INCLUDE_FULL = {
  client: { select: { id: true, email: true } },
  items:  {
    include: {
      product:    true,
      container:  true,
      boxWeights: { orderBy: { boxNumber: 'asc' } },
    }
  },
}

/* ── Depot fallback (Orlando, FL) ── */
const DEFAULT_GEO = { address: '6843 Conway Rd Ste 120, Orlando, FL 32812', lat: 28.4626, lon: -81.3305 }

/* ── Staleness guard — rejects updates whose timestamp predates the last status change ── */
const assertNotStale = (order, clientTimestamp) => {
  if (!clientTimestamp || !order.lastStatusAt) return
  const clientDate = new Date(clientTimestamp)
  if (clientDate < order.lastStatusAt) {
    throw Object.assign(
      new Error('Atualização rejeitada: dados desatualizados. Recarregue o pedido e tente novamente.'),
      { status: 409 }
    )
  }
}

/* ── Create ── */
const createOrder = async ({ clientId, clientName, address: inputAddress, items, updatedById }) => {
  return prisma.$transaction(async (tx) => {
    const itemsToCreate = []
    let totalBoxes = 0

    for (const item of items) {
      const containers = await tx.container.findMany({
        where: { productId: item.productId },
        orderBy: { label: 'asc' },
      })

      const totalAvailable = containers.reduce((s, c) => s + c.quantity, 0)

      if (totalAvailable < item.quantity) {
        const productName = containers[0]?.product?.name ?? `#${item.productId}`
        throw Object.assign(
          new Error(`Stock insuficiente para produto ${productName}. Disponível: ${totalAvailable} cxs. Solicitado: ${item.quantity} cxs.`),
          { status: 422 }
        )
      }

      let remaining = item.quantity
      for (const container of containers) {
        if (remaining <= 0) break
        const take = Math.min(remaining, container.quantity)
        if (take <= 0) continue

        await tx.container.update({
          where: { id: container.id },
          data:  { quantity: { decrement: take }, updatedById },
        })

        itemsToCreate.push({
          containerId: container.id,
          productId:   item.productId,
          quantity:    take,
          priceType:   item.priceType || 'PER_LB',
          pricePerLb:  item.pricePerLb ?? null,
          pricePerBox: item.pricePerBox ?? null,
        })

        remaining -= take
      }

      totalBoxes += item.quantity
    }

    // Resolve endereço: usa o fornecido no pedido, ou busca do cadastro do cliente, ou usa default
    let address = DEFAULT_GEO.address
    let lat = DEFAULT_GEO.lat
    let lon = DEFAULT_GEO.lon

    if (inputAddress) {
      address = inputAddress
    } else if (clientId) {
      const client = await tx.user.findUnique({
        where:  { id: clientId },
        select: { address: true, lat: true, lon: true },
      })
      if (client) {
        address = client.address || address
        lat = client.lat ?? lat
        lon = client.lon ?? lon
      }
    }

    return tx.order.create({
      data: {
        clientId,
        clientName,
        status:     'PENDING',
        totalBoxes,
        address,
        lat,
        lon,
        updatedById,
        items:      { create: itemsToCreate },
      },
      include: INCLUDE_FULL,
    })
  })
}

/* ── List (paginado) ── */
const listOrders = (filters = {}, { page = 1, limit = 50 } = {}) => {
  const take = Math.min(Math.max(1, Number(limit)), 200)
  const skip = (Math.max(1, Number(page)) - 1) * take

  return prisma.order.findMany({
    where:   filters,
    orderBy: { createdAt: 'desc' },
    include: INCLUDE_FULL,
    take,
    skip,
  })
}

/* ── Get by ID ── */
const getOrderById = (id) =>
  prisma.order.findUnique({
    where:   { id: Number(id) },
    include: INCLUDE_FULL,
  })

/* ── Deliver ── */
const deliverOrder = async (id, { deliveredById, lastStatusAt: clientTs } = {}) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: Number(id) } })

    if (!order) {
      throw Object.assign(new Error('Pedido não encontrado.'), { status: 404 })
    }

    assertNotStale(order, clientTs)

    if (order.status !== 'IN_TRANSIT') {
      throw Object.assign(
        new Error(`Pedido só pode ser entregue com status IN_TRANSIT. Status atual: "${order.status}".`),
        { status: 422 }
      )
    }

    const now = new Date()
    const data = {
      status:       'DELIVERED',
      deliveredAt:  now,
      lastStatusAt: now,
    }

    if (deliveredById) {
      data.deliveredById = Number(deliveredById)
      data.updatedById   = Number(deliveredById)
    }

    return tx.order.update({
      where: { id: Number(id) },
      data,
      include: INCLUDE_FULL,
    })
  })
}

/* ── Confirm (PENDING → CONFIRMED) ── */
const confirmOrder = async (id, userId, { lastStatusAt: clientTs } = {}) => {
  const order = await prisma.order.findUnique({ where: { id: Number(id) } })

  if (!order) {
    throw Object.assign(new Error('Pedido não encontrado.'), { status: 404 })
  }

  assertNotStale(order, clientTs)

  if (order.status !== 'PENDING') {
    throw Object.assign(
      new Error('Só é possível confirmar pedidos com status PENDING.'),
      { status: 400 }
    )
  }

  const now = new Date()
  return prisma.order.update({
    where:   { id: Number(id) },
    data:    { status: 'CONFIRMED', lastStatusAt: now, updatedById: Number(userId) },
    include: INCLUDE_FULL,
  })
}

/* ── Cancel (PENDING | CONFIRMED → CANCELLED) ── */
const cancelOrder = async (id, userId, { lastStatusAt: clientTs } = {}) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    })

    if (order) assertNotStale(order, clientTs)

    if (!order) {
      throw Object.assign(new Error('Pedido não encontrado.'), { status: 404 })
    }

    if (order.status === 'DELIVERED') {
      throw Object.assign(
        new Error('Pedidos já entregues não podem ser cancelados.'),
        { status: 400 }
      )
    }

    if (order.status === 'CANCELLED') {
      throw Object.assign(new Error('Pedido já está cancelado.'), { status: 400 })
    }

    // Devolver stock aos containers
    for (const item of order.items) {
      await tx.container.update({
        where: { id: item.containerId },
        data:  {
          quantity:    { increment: item.quantity },
          updatedById: userId ? Number(userId) : undefined,
        },
      })
    }

    const now = new Date()
    return tx.order.update({
      where:   { id: Number(id) },
      data:    { status: 'CANCELLED', lastStatusAt: now, updatedById: Number(userId) },
      include: INCLUDE_FULL,
    })
  })
}

/* ── Separate (CONFIRMED → SEPARATING) ── */
const separateOrder = async (id, userId, { lastStatusAt: clientTs } = {}) => {
  const order = await prisma.order.findUnique({ where: { id: Number(id) } })

  if (!order) {
    throw Object.assign(new Error('Pedido não encontrado.'), { status: 404 })
  }

  assertNotStale(order, clientTs)

  if (order.status !== 'CONFIRMED') {
    throw Object.assign(
      new Error('Só é possível iniciar separação em pedidos com status CONFIRMED.'),
      { status: 409 }
    )
  }

  const now = new Date()
  return prisma.order.update({
    where:   { id: Number(id) },
    data:    { status: 'SEPARATING', separatedById: Number(userId), separatedAt: now, lastStatusAt: now, updatedById: Number(userId) },
    include: INCLUDE_FULL,
  })
}

/* ── Pack (SEPARATING → READY) ── */
const packOrder = async (id, userId, itemWeights, { lastStatusAt: clientTs } = {}) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    })

    if (!order) {
      throw Object.assign(new Error('Pedido não encontrado.'), { status: 404 })
    }

    assertNotStale(order, clientTs)

    if (order.status !== 'SEPARATING') {
      throw Object.assign(
        new Error('Só é possível embalar pedidos com status SEPARATING.'),
        { status: 409 }
      )
    }
    let totalWeightLb = 0
    const orderItemIds = new Set(order.items.map(i => i.id))

    if (Array.isArray(itemWeights)) {
      for (const iw of itemWeights) {
        if (!orderItemIds.has(iw.orderItemId)) {
          throw Object.assign(
            new Error(`orderItemId ${iw.orderItemId} não pertence ao pedido #${id}.`),
            { status: 400 }
          )
        }

        // Apagar boxWeights existentes (permite re-submissão)
        await tx.boxWeight.deleteMany({ where: { orderItemId: iw.orderItemId } })

        // Criar boxWeights
        if (Array.isArray(iw.boxWeights) && iw.boxWeights.length > 0) {
          await tx.boxWeight.createMany({
            data: iw.boxWeights.map(bw => ({
              orderItemId: iw.orderItemId,
              boxNumber:   bw.boxNumber,
              weightLb:    bw.weightLb,
              ...(bw.expiryDate && { expiryDate: new Date(bw.expiryDate) }),
              ...(bw.batch && { batch: bw.batch }),
              updatedById: Number(userId),
            })),
          })
        }

        // Calcular peso total do item
        const itemWeightLb = (iw.boxWeights || []).reduce((s, bw) => s + (bw.weightLb || 0), 0)

        await tx.orderItem.update({
          where: { id: iw.orderItemId },
          data:  { weightLb: itemWeightLb },
        })

        totalWeightLb += itemWeightLb
      }
    }

    // Somar peso dos items que não foram enviados em itemWeights (PER_BOX sem boxWeights)
    const updatedItems = await tx.orderItem.findMany({ where: { orderId: Number(id) } })
    const finalWeightLb = updatedItems.reduce((s, i) => s + Number(i.weightLb), 0)

    return tx.order.update({
      where: { id: Number(id) },
      data:  {
        status:       'READY',
        packedById:   Number(userId),
        packedAt:     new Date(),
        weightLb:     finalWeightLb,
        lastStatusAt: new Date(),
        updatedById:  Number(userId),
      },
      include: INCLUDE_FULL,
    })
  })
}

/* ── Load (READY → IN_TRANSIT) ── */
const loadOrder = async (id, userId, { lastStatusAt: clientTs } = {}) => {
  const order = await prisma.order.findUnique({ where: { id: Number(id) } })

  if (!order) {
    throw Object.assign(new Error('Pedido não encontrado.'), { status: 404 })
  }

  assertNotStale(order, clientTs)

  if (order.status !== 'READY') {
    throw Object.assign(
      new Error('Só é possível carregar pedidos com status READY.'),
      { status: 409 }
    )
  }

  const now = new Date()
  return prisma.order.update({
    where:   { id: Number(id) },
    data:    { status: 'IN_TRANSIT', loadedAt: now, lastStatusAt: now, updatedById: Number(userId) },
    include: INCLUDE_FULL,
  })
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  deliverOrder,
  confirmOrder,
  cancelOrder,
  separateOrder,
  packOrder,
  loadOrder,
}
