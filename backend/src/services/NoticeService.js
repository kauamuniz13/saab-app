const prisma = require('../lib/prisma')

const createNotice = (title, body, expiresAt, userId) =>
  prisma.notice.create({
    data: {
      title: title.trim(),
      body: body.trim(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdById: Number(userId),
    },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  })

const listNotices = () =>
  prisma.notice.findMany({
    where: {
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  })

const deleteNotice = async (id, userId, userRole) => {
  const notice = await prisma.notice.findUnique({ where: { id: Number(id) } })
  if (!notice) {
    const err = new Error('Aviso não encontrado.')
    err.status = 404
    throw err
  }
  if (userRole !== 'ADMIN' && notice.createdById !== Number(userId)) {
    const err = new Error('Sem permissão para apagar este aviso.')
    err.status = 403
    throw err
  }
  return prisma.notice.delete({ where: { id: Number(id) } })
}

module.exports = { createNotice, listNotices, deleteNotice }
