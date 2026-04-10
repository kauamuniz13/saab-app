const { Router } = require('express')
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware')
const { createNotice, listNotices, deleteNotice } = require('../controllers/NoticeController')

const router = Router()

router.use(authMiddleware)

router.get('/',       authorizeRoles('ADMIN', 'EXPEDICAO', 'MOTORISTA', 'VENDEDOR'), listNotices)
router.post('/',      authorizeRoles('ADMIN', 'EXPEDICAO'), createNotice)
router.delete('/:id', authorizeRoles('ADMIN', 'EXPEDICAO'), deleteNotice)

module.exports = router
