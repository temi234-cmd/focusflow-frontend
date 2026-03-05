import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Activity, 
  Check,
  CheckCheck,
  Bell,
  Menu,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLayout } from '../layouts/DashboardLayout'
import { getHabits, createHabit, updateHabit, deleteHabit } from '../services/habitService'

interface Habit {
  id: string;
  name: string;
  description: string;
  streak: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  history: (boolean | null)[];
  completedToday: boolean;
}

interface AddHabitModalProps {
  onClose: () => void
  onAdd: (habit: { name: string; description: string; iconBg: string; iconColor: string }) => void
}

const AddHabitModal = ({ onClose, onAdd }: AddHabitModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(0)

  const colorOptions = [
    { iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-500', preview: 'bg-indigo-500' },
    { iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', preview: 'bg-emerald-500' },
    { iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500', preview: 'bg-orange-500' },
    { iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500', preview: 'bg-purple-500' },
    { iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500', preview: 'bg-blue-500' },
    { iconBg: 'bg-red-500/10', iconColor: 'text-red-500', preview: 'bg-red-500' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name,
      description,
      iconBg: colorOptions[selectedColor].iconBg,
      iconColor: colorOptions[selectedColor].iconColor
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-6">Add New Habit</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning Meditation"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 10 minutes every morning"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Color</label>
            <div className="flex gap-3">
              {colorOptions.map((color, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedColor(i)}
                  className={`w-8 h-8 rounded-full ${color.preview} transition-all ${
                    selectedColor === i ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-all">
              Add Habit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Habits() {
  const { openMenu } = useLayout()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      const data = await getHabits()
      setHabits(data.map((h: any) => ({
        id: h._id,
        name: h.name,
        description: h.description,
        streak: h.streak,
        icon: <Activity size={24} />,
        iconBg: h.iconBg,
        iconColor: h.iconColor,
        history: h.history,
        completedToday: h.completedToday
      })))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id)
    if (!habit || habit.completedToday) return // prevent toggling if already done

    try {
      // Let backend handle streak + history update
      const updated = await updateHabit(id, { completedToday: true })
      // Sync frontend with what backend returned
      setHabits(prev => prev.map(h => h.id === id ? {
        ...h,
        completedToday: updated.completedToday,
        streak: updated.streak,
        history: updated.history
      } : h))
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddHabit = async (habitData: {
    name: string
    description: string
    iconBg: string
    iconColor: string
  }) => {
    try {
      const newHabit = await createHabit(habitData)
      setHabits(prev => [...prev, {
        id: newHabit._id,
        name: newHabit.name,
        description: newHabit.description,
        streak: 0,
        icon: <Activity size={24} />,
        iconBg: newHabit.iconBg,
        iconColor: newHabit.iconColor,
        history: [null, null, null, null, null, null, null],
        completedToday: false
      }])
      setShowAddModal(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit(id)
      setHabits(prev => prev.filter(h => h.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const activeHabitsCount = habits.filter(h => !h.completedToday).length

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-slate-400">Loading habits...</div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="h-16 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-[#0f111a]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={openMenu} className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
            <Menu size={20} />
          </button>
          <h2 className="text-base lg:text-lg font-bold">Daily Habits</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition-colors p-2">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Daily Habits</h2>
            <p className="text-slate-400 text-sm md:text-base">
              {activeHabitsCount > 0
                ? `You have ${activeHabitsCount} habits to complete today. Keep the streak alive!`
                : habits.length === 0
                ? "No habits yet. Add your first habit!"
                : "All habits completed for today! Great job!"}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
          >
            <Plus size={18} />
            Add Habit
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={() => toggleHabit(habit.id)}
                onDelete={() => handleDeleteHabit(habit.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {habits.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 p-6 md:p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-white">Consistency is Key</h3>
              <p className="text-slate-400 text-sm md:text-base max-w-md">
                Keep going to build lasting habits and earn your streaks!
              </p>
            </div>
            <div className="flex gap-8">
              <Stat label="Longest Streak" value={String(Math.max(...habits.map(h => h.streak), 0))} />
              <div className="w-px h-12 bg-slate-800 hidden md:block"></div>
              <Stat label="Total Habits" value={String(habits.length)} />
            </div>
          </motion.section>
        )}
      </main>

      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddHabit}
        />
      )}
    </div>
  )
}

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onDelete: () => void;
}

function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-slate-900/50 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary/50 transition-all ${
        habit.completedToday ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`size-12 rounded-lg ${habit.iconBg} flex items-center justify-center ${habit.iconColor}`}>
          {habit.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {habit.name} <span className="text-orange-500">🔥 {habit.streak}</span>
          </h3>
          <p className="text-sm text-slate-400">{habit.description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Last 7 Days</p>
        <div className="flex gap-2">
          {habit.history.map((status, i) => {
            const isToday = i === habit.history.length - 1;

            // Completed day
            if (status === true) {
              return (
                <div key={i} className={`size-8 rounded-full flex items-center justify-center text-white ${isToday ? 'bg-emerald-500' : 'bg-primary'}`}>
                  {isToday ? <CheckCheck size={14} strokeWidth={3} /> : <Check size={14} strokeWidth={3} />}
                </div>
              );
            }

            // Missed day (false)
            if (status === false) {
              return <div key={i} className="size-8 rounded-full bg-slate-800 border border-slate-700" />;
            }

            // Today not yet completed (null) — only show TOD on the last circle
            if (isToday) {
              return (
                <div key={i} className="size-8 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center text-primary">
                  <span className="text-[10px] font-bold">TOD</span>
                </div>
              );
            }

            // Past days with no data — show as missed
            return <div key={i} className="size-8 rounded-full bg-slate-800 border border-slate-700" />;
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          disabled={habit.completedToday}
          className={`md:min-w-[120px] px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            habit.completedToday
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
          }`}
        >
          {habit.completedToday ? 'Completed' : 'Mark Done'}
        </button>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-2"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  )
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-black text-primary">{value}</span>
      <span className="text-[10px] uppercase font-bold text-slate-500">{label}</span>
    </div>
  );
}