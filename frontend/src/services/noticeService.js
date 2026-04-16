import api from './authService'

export const fetchNotices = () =>
  api.get('/notices').then(r => r.data)

export const createNotice = (data) =>
  api.post('/notices', data).then(r => r.data)

export const deleteNotice = (id) =>
  api.delete(`/notices/${id}`).then(r => r.data)
