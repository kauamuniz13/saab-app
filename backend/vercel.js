const express = require('express')
const serverless = require('serverless-http')

const app = express()

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// Importar rotas dinamicamente
const authRoutes = require('./routes/authRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const orderRoutes = require('./routes/orderRoutes')
const routeRoutes = require('./routes/routeRoutes')
const userRoutes = require('./routes/userRoutes')

app.use('/auth', authRoutes)
app.use('/inventory', inventoryRoutes)
app.use('/orders', orderRoutes)
app.use('/routes', routeRoutes)
app.use('/users', userRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

module.exports = serverless(app)
module.exports = app