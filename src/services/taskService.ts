import API from './api'

export const getTasks = async () => {
  const res = await API.get('/tasks')
  return res.data
}

export const createTask = async (task: {
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
}) => {
  const res = await API.post('/tasks', task)
  return res.data
}

export const updateTask = async (id: string, updates: any) => {
  const res = await API.put(`/tasks/${id}`, updates)
  return res.data
}

export const deleteTask = async (id: string) => {
  const res = await API.delete(`/tasks/${id}`)
  return res.data
}