const { Router } = require('express')
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware')
const { listUsers, createUser, updateUser, createClient } = require('../controllers/UserController')

const router = Router()

router.use(authMiddleware)

router.get('/',      authorizeRoles('ADMIN'), listUsers)
router.post('/',     authorizeRoles('ADMIN'), createUser)
router.patch('/:id', authorizeRoles('ADMIN'), updateUser)
router.post('/clients', authorizeRoles('ADMIN', 'VENDEDOR'), createClient)

module.exports = router
