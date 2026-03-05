import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CalendarDays,
  CheckCircle2,
  Search,
  Plus,
  Bell,
  Menu
} from 'lucide-react';
import type { Task, Status } from '../types';
import { useLayout } from '../layouts/DashboardLayout'
import { getTasks, createTask, deleteTask, updateTask } from '../services/taskService'
import { Trash2 } from 'lucide-react'

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Status) => void
}

const TaskCard = ({ task, onDelete, onStatusChange }: TaskCardProps) => {
  const isDone = task.status === 'Done';
  
  const priorityColors = {
    High: 'bg-red-500/10 text-red-400',
    Medium: 'bg-amber-500/10 text-amber-400',
    Low: 'bg-emerald-500/10 text-emerald-400',
  };

  const nextStatus: Record<Status, Status> = {
    'To Do': 'In Progress',
    'In Progress': 'Done',
    'Done': 'To Do'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer ${isDone ? 'opacity-60' : ''}`}
    >
      {!isDone && (
        <div className="flex justify-between items-start mb-3">
          <span className={`${priorityColors[task.priority]} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
            {task.priority}
          </span>
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <h4 className={`text-sm font-semibold group-hover:text-primary transition-colors ${isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
          {task.title}
        </h4>
        {isDone && <CheckCircle2 className="text-emerald-500" size={18} />}
      </div>

      {task.description && !isDone && (
        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {task.status === 'In Progress' && task.progress !== undefined && (
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays size={14} />
          <span>{isDone ? `Completed` : task.dueDate}</span>
        </div>
        <button
          onClick={() => onStatusChange(task.id, nextStatus[task.status as Status])}
          className="text-[10px] font-bold text-primary hover:underline"
        >
          → {nextStatus[task.status as Status]}
        </button>
      </div>
    </motion.div>
  )
}

interface TaskColumnProps {
  status: Status;
  tasks: Task[];
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Status) => void
}

const TaskColumn = ({ status, tasks, onDelete, onStatusChange }: TaskColumnProps) => {
  return (
    <div className="flex-1 min-w-[260px] max-w-[360px] flex flex-col">
      <div className="flex items-center gap-2 mb-4 px-1">
        <h3 className="font-bold text-slate-300">{status}</h3>
        <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full text-xs font-bold">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-4 overflow-y-auto scrollbar-hide pb-6">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  )
}

interface AddTaskModalProps {
  onClose: () => void
  onAdd: (task: { title: string; description: string; priority: string; dueDate: string }) => void
}

const AddTaskModal = ({ onClose, onAdd }: AddTaskModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title, description, priority, dueDate })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-6">Add New Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Task description..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-all"
            >
              Add Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState<Status>('To Do')
  const columns: Status[] = ['To Do', 'In Progress', 'Done']
  const { openMenu } = useLayout()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const data = await getTasks()
      setTasks(data.map((t: any) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        progress: t.progress,
        assignees: t.assignees,
        completedDate: t.updatedAt?.split('T')[0]
      })))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (taskData: {
    title: string
    description: string
    priority: string
    dueDate: string
  }) => {
    try {
      const newTask = await createTask({ ...taskData, status: 'To Do' })
      setTasks(prev => [...prev, {
        id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        progress: newTask.progress,
        assignees: newTask.assignees,
        completedDate: ''
      }])
      setShowAddModal(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleStatusChange = async (id: string, status: Status) => {
    try {
      await updateTask(id, { status })
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-slate-400">Loading tasks...</div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0">
        <div className="flex items-center gap-3 lg:gap-4">
          <button onClick={openMenu} className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
            <Menu size={20} />
          </button>
          <h2 className="text-base lg:text-lg font-bold">My Tasks</h2>
          <div className="hidden sm:block h-4 w-[1px] bg-slate-700"></div>
          <div className="hidden sm:flex gap-2 text-xs font-medium text-slate-500">
            <span className="bg-slate-800 text-slate-200 px-2 py-1 rounded">All Tasks</span>
            <span className="hover:bg-slate-800 px-2 py-1 rounded cursor-pointer transition-colors">Assigned to me</span>
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="bg-slate-800 border-none rounded-lg pl-9 pr-4 py-1.5 text-sm w-48 lg:w-64 focus:ring-2 focus:ring-primary/50 text-slate-200 placeholder:text-slate-500 outline-none"
            />
          </div>
          <button className="text-slate-400 hover:text-white transition-colors p-2">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex border-b border-slate-800 bg-slate-900/50 shrink-0">
        {columns.map(col => {
          const count = tasks.filter(t => t.status === col).length
          return (
            <button
              key={col}
              onClick={() => setActiveTab(col)}
              className={`flex-1 py-3 text-xs font-bold transition-all relative ${
                activeTab === col ? 'text-primary' : 'text-slate-500'
              }`}
            >
              {col}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === col ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-500'
              }`}>{count}</span>
              {activeTab === col && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Task Columns + Floating Button wrapper */}
      <div className="flex-1 relative overflow-hidden">
        {/* Mobile: single column view */}
        <div className="lg:hidden absolute inset-0 overflow-y-auto p-4">
          <div className="space-y-4 pb-24">
            {tasks.filter(t => t.status === activeTab).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="text-4xl mb-3">
                  {activeTab === 'To Do' ? '📋' : activeTab === 'In Progress' ? '⚡' : '✅'}
                </div>
                <p className="text-sm font-medium">No {activeTab} tasks</p>
                <p className="text-xs mt-1 text-slate-600">
                  {activeTab === 'To Do' ? 'Tap + to add a task' : 'Move tasks here as you progress'}
                </p>
              </div>
            ) : (
              tasks.filter(t => t.status === activeTab).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </div>

        {/* Desktop: kanban columns */}
        <div className="hidden lg:block absolute inset-0 overflow-x-auto overflow-y-hidden p-8">
          <div className="flex gap-6 h-full w-full">
            {columns.map(col => (
              <TaskColumn
                key={col}
                status={col}
                tasks={tasks.filter(t => t.status === col)}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 group z-20"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTask}
        />
      )}
    </div>
  )
}