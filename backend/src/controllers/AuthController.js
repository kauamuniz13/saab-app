const jwt         = require('jsonwebtoken')
const UserService = require('../services/UserService')

/* ── Login ── */
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e password são obrigatórios.' })
  }

  try {
    const user = await UserService.findByEmail(email.trim().toLowerCase())

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' })
    }

    const bcrypt = require('bcrypt')
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' })
    }

    const payload = { sub: user.id, email: user.email, role: user.role }
    const token   = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    })

    return res.status(200).json({ token })
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno ao autenticar.' })
  }
}

/* ── Register — apenas ADMIN ── */
const register = async (req, res) => {
  const { email, password, role, address, lat, lon } = req.body

  try {
    const user = await UserService.createUser({ email, password, role, address, lat, lon })
    return res.status(201).json(user)
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message })
  }
}

/* ── List users — apenas ADMIN ── */
const listUsers = async (req, res) => {
  try {
    const { role } = req.query
    const users = await UserService.listUsers(role || undefined)
    return res.json(users)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

module.exports = { login, register, listUsers }
