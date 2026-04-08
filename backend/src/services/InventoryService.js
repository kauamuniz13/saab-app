const prisma = require('../lib/prisma')

/* ── Containers ── */

const getAllContainers = ({ zone } = {}) =>
  prisma.container.findMany({
    where:   zone ? { zone } : undefined,
    orderBy: [{ zone: 'asc' }, { label: 'asc' }],
    include: { product: true },
  })

const getContainerById = (id) =>
  prisma.container.findUnique({
    where: { id: Number(id) },
    include: { product: true },
  })

const updateContainer = (id, data) =>
  prisma.container.update({
    where: { id: Number(id) },
    data,
    include: { product: true },
  })

/* ── Products ── */

const getAllProducts = ({ includeInactive = false } = {}) =>
  prisma.product.findMany({
    where:   includeInactive ? undefined : { active: true },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  })

const searchProducts = (query) =>
  prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: [{ name: 'asc' }],
    take: 20,
  })

const getProductStock = async (productId) => {
  const containers = await prisma.container.findMany({
    where: { productId: Number(productId) },
    select: { id: true, label: true, zone: true, quantity: true, capacity: true }
  })
  const total = containers.reduce((s, c) => s + c.quantity, 0)
  return { productId: Number(productId), totalBoxes: total, containers }
}

const createProduct = ({ name, type, priceType, pricePerLb, pricePerBox, pricePerUnit }) =>
  prisma.product.create({ 
    data: { 
      name, 
      type, 
      active: true,
      ...(priceType && { priceType }),
      ...(pricePerLb !== undefined && { pricePerLb: Number(pricePerLb) }),
      ...(pricePerBox !== undefined && { pricePerBox: Number(pricePerBox) }),
      ...(pricePerUnit !== undefined && { pricePerUnit: Number(pricePerUnit) }),
    } 
  })

const updateProduct = (id, data) =>
  prisma.product.update({ 
    where: { id: Number(id) }, 
    data: {
      ...data,
      ...(data.pricePerLb !== undefined && { pricePerLb: Number(data.pricePerLb) }),
      ...(data.pricePerBox !== undefined && { pricePerBox: Number(data.pricePerBox) }),
      ...(data.pricePerUnit !== undefined && { pricePerUnit: Number(data.pricePerUnit) }),
    }
  })

const deleteProduct = async (id) => {
  const numId = Number(id)

  const [inContainers, inActiveOrders] = await Promise.all([
    prisma.container.count({ where: { productId: numId, quantity: { gt: 0 } } }),
    prisma.orderItem.count({
      where: {
        productId: numId,
        order: { status: { notIn: ['CANCELLED', 'DELIVERED'] } },
      },
    }),
  ])

  if (inContainers > 0 || inActiveOrders > 0) {
    const err = new Error('Produto em uso')
    err.statusCode = 409
    throw err
  }

  return prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { productId: numId } })
    await tx.container.updateMany({ where: { productId: numId }, data: { productId: null } })
    return tx.product.delete({ where: { id: numId } })
  })
}

module.exports = {
  getAllContainers,
  getContainerById,
  updateContainer,
  getAllProducts,
  searchProducts,
  getProductStock,
  createProduct,
  updateProduct,
  deleteProduct,
}
