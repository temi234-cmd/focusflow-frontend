import API from './api'

export const getHabits = async () => {
  const res = await API.get('/habits')
  return res.data
}

export const createHabit = async (habit: {
  name: string
  description?: string
  iconBg?: string
  iconColor?: string
}) => {
  const res = await API.post('/habits', habit)
  return res.data
}

export const updateHabit = async (id: string, updates: any) => {
  const res = await API.put(`/habits/${id}`, updates)
  return res.data
}

export const deleteHabit = async (id: string) => {
  const res = await API.delete(`/habits/${id}`)
  return res.data
}