const { PrismaClient } = require('@prisma/client')

/** Singleton — evita esgotamento do connection pool em ambientes serverless (Vercel) */
const globalForPrisma = globalThis

const prisma = globalForPrisma.__prisma || new PrismaClient()

globalForPrisma.__prisma = prisma

module.exports = prisma
