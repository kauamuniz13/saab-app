const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token      = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.split(' ')[1]
    : null

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado.' })
  }
}

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado.' })
    }
    next()
  }
}

module.exports = { authMiddleware, authorizeRoles }
