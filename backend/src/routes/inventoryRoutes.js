const { Router } = require('express')
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware')
const {
  listContainers,
  getContainer,
  updateContainer,
  listProducts,
  searchProducts,
  getProductStock,
  createProduct,
  updateProduct,
  deleteProduct,
  getConsolidatedStock,
  lookupGtin,
  createGtinMapping,
  listGtinMappings,
} = require('../controllers/InventoryController')

const router = Router()

router.use(authMiddleware)

/* ── Containers ── */
router.get('/containers',       authorizeRoles('ADMIN', 'EXPEDICAO', 'VENDEDOR'), listContainers)
router.get('/containers/:id',   authorizeRoles('ADMIN', 'EXPEDICAO', 'VENDEDOR'), getContainer)
router.patch('/containers/:id', authorizeRoles('ADMIN'),            updateContainer)

/* ── Products ── */
router.get('/products',             authorizeRoles('ADMIN', 'EXPEDICAO', 'VENDEDOR'), listProducts)
router.get('/products/search',      authorizeRoles('ADMIN', 'EXPEDICAO', 'VENDEDOR'), searchProducts)
router.get('/products/:id/stock',   authorizeRoles('ADMIN', 'VENDEDOR', 'EXPEDICAO'),            getProductStock)
router.post('/products',            authorizeRoles('ADMIN'),            createProduct)
router.patch('/products/:id',       authorizeRoles('ADMIN'),            updateProduct)
router.delete('/products/:id',      authorizeRoles('ADMIN'),            deleteProduct)

/* ── Consolidated Stock ── */
router.get('/stock',                authorizeRoles('ADMIN', 'EXPEDICAO', 'VENDEDOR'), getConsolidatedStock)

/* ── GTIN Mappings ── */
router.get('/gtin',                 authorizeRoles('ADMIN', 'EXPEDICAO'), listGtinMappings)
router.get('/gtin/:gtin',           authorizeRoles('ADMIN', 'EXPEDICAO'), lookupGtin)
router.post('/gtin',                authorizeRoles('ADMIN', 'EXPEDICAO'), createGtinMapping)

module.exports = router
