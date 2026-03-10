import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Sparkles, CheckCircle2, RefreshCw, Bell, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from "../lib/utils";
import { generateWeeklyDigest } from "../services/aiservices";
import { useLayout } from '../layouts/DashboardLayout';
import { auth } from '../services/firebase';
import API from '../services/api';
import { subscribeToPush, saveNotificationPrefs } from '../services/notificationService';

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendColor: 'green' | 'blue' | 'yellow';
  icon: React.ReactNode;
  iconBg: string;
}

interface Task {
  _id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
}

interface Habit {
  _id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  history: boolean[];
  createdAt: string;
}

const StatCard = ({ title, value, trend, trendColor, icon, iconBg }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 flex-1 min-w-[280px]"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">{title}</p>
        <div className="flex items-baseline gap-3">
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          <span className={cn(
            "text-xs font-medium",
            trendColor === 'green' ? "text-emerald-400" : trendColor === 'blue' ? "text-indigo-400" : "text-amber-400"
          )}>
            {trend}
          </span>
        </div>
      </div>
      <div className={cn("p-3 rounded-xl", iconBg)}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// Build last-7-days completion chart from tasks
const buildWeeklyData = (tasks: Task[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const dayName = days[date.getDay()];
    const dateStr = date.toDateString();

    const completed = tasks.filter(t =>
      t.status === 'Done' && new Date(t.createdAt).toDateString() === dateStr
    ).length;

    return { name: dayName, value: completed };
  });
};

// Build consistency grid from habits history (7 weeks × 7 days = 49 cells, padded to 84)
const buildConsistencyData = (habits: Habit[]) => {
  return Array.from({ length: 84 }, (_, i) => {
    // Count how many habits had activity on this day slot
    const activeCount = habits.filter(h => h.history[i % 7] === true).length;
    const total = habits.length || 1;
    const ratio = activeCount / total;

    const level = ratio === 0 ? 0 : ratio < 0.33 ? 1 : ratio < 0.66 ? 2 : 3;
    return { id: i, level };
  });
};

// Productivity score: % of tasks done + habit streaks bonus
const calcProductivityScore = (tasks: Task[], habits: Habit[]) => {
  if (tasks.length === 0 && habits.length === 0) return 0;

  const taskScore = tasks.length > 0
    ? (tasks.filter(t => t.status === 'Done').length / tasks.length) * 70
    : 0;

  const avgStreak = habits.length > 0
    ? habits.reduce((sum, h) => sum + h.streak, 0) / habits.length
    : 0;

  const habitBonus = Math.min(avgStreak * 3, 30); // up to 30 points from streaks
  return Math.round(taskScore + habitBonus);
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [digest, setDigest] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('there');
  const [userPhoto, setUserPhoto] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=user');
  const { openMenu } = useLayout();

  // Fetch user info from Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const name = user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'there';
      setUserName(name);
      if (user.photoURL) setUserPhoto(user.photoURL);
      else setUserPhoto(`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`);
    }
  }, []);
useEffect(() => {
  auth.currentUser?.getIdToken().then(token => {
    console.log('TOKEN:', token)
  })
}, [])
  // Fetch tasks and habits from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksRes, habitsRes] = await Promise.all([
          API.get('/tasks'),
          API.get('/habits'),
        ]);
        setTasks(tasksRes.data);
        setHabits(habitsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

const fetchDigest = useCallback(async () => {
  setIsRegenerating(true);
  const text = await generateWeeklyDigest(userName, tasks, habits);
  setDigest(text);
  setIsRegenerating(false);
}, [userName, tasks, habits]);
  useEffect(() => {
    if (userName !== 'there') fetchDigest();
  }, [userName]);

  useEffect(() => {
  const requestPushPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') return;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await subscribeToPush();
      await saveNotificationPrefs({ email: true, push: true, aiDigest: false });
    }
  };

  requestPushPermission();
}, []);
  // Derived stats
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const activeHabits = habits.filter(h => h.streak > 0).length;
  const productivityScore = calcProductivityScore(tasks, habits);
  const weeklyData = buildWeeklyData(tasks);
  const consistencyData = buildConsistencyData(habits);

  // Trends
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const habitsCompletedToday = habits.filter(h => h.completedToday).length;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">
      {/* Top Bar */}
      <div className="h-16 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-[#0f111a]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="text-xs text-slate-500 font-medium flex items-center">
          <button onClick={openMenu} className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg mr-2">
            <Menu size={20} />
          </button>
          Overview / <span className="text-slate-300 ml-1">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition-colors p-2">
            <Bell size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
            <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Greeting */}
      <section>
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1">Hi, {userName} 👋</h2>
        <p className="text-sm lg:text-base text-slate-400">Here's what's happening with your productivity today.</p>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          title="Tasks Completed"
          value={isLoading ? '—' : completedTasks}
          trend={isLoading ? '' : `${inProgressCount} in progress`}
          trendColor="green"
          icon={<CheckCircle2 size={24} className="text-emerald-400" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="Active Habits"
          value={isLoading ? '—' : activeHabits}
          trend={isLoading ? '' : `${habitsCompletedToday} done today`}
          trendColor="blue"
          icon={<Sparkles size={24} className="text-indigo-400" />}
          iconBg="bg-indigo-500/10"
        />
        <StatCard
          title="Productivity Score"
          value={isLoading ? '—' : `${productivityScore}%`}
          trend={isLoading ? '' : productivityScore >= 70 ? '🔥 On fire' : productivityScore >= 40 ? 'Keep going' : 'Just getting started'}
          trendColor="yellow"
          icon={<Zap size={24} className="text-amber-400 fill-amber-400" />}
          iconBg="bg-amber-500/10"
        />
      </section>

      {/* AI Digest */}
      <section className="glass-card p-6 lg:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -mr-32 -mt-32" />
        <div className="flex flex-col sm:flex-row items-start gap-4 lg:gap-6 relative z-10">
          <div className="p-3 lg:p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 shrink-0">
            <Sparkles size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg lg:text-xl font-bold text-white">AI Weekly Digest</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 uppercase tracking-widest">
                Personalized
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={digest}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm lg:text-base text-slate-300 leading-relaxed max-w-3xl"
              >
                {digest || "Analyzing your productivity patterns..."}
              </motion.p>
            </AnimatePresence>
          </div>
          <button
            onClick={fetchDigest}
            disabled={isRegenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <RefreshCw size={16} className={cn(isRegenerating && "animate-spin")} />
            Regenerate
          </button>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Weekly Completion Chart */}
        <div className="glass-card p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <h3 className="text-base lg:text-lg font-bold text-white">Weekly Completion</h3>
            <span className="text-xs text-slate-500 font-medium">Last 7 days</span>
          </div>
          {isLoading ? (
            <div className="h-[200px] lg:h-[240px] flex items-center justify-center text-slate-500 text-sm">
              Loading...
            </div>
          ) : (
            <div className="h-[200px] lg:h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1a1d29', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`${value} tasks`, 'Completed']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#6366f1' : '#312e81'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Consistency Grid */}
        <div className="glass-card p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-base lg:text-lg font-bold text-white">Consistency Grid</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-800" />
                <div className="w-3 h-3 rounded-sm bg-indigo-900" />
                <div className="w-3 h-3 rounded-sm bg-indigo-700" />
                <div className="w-3 h-3 rounded-sm bg-indigo-500" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">More</span>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-1.5 lg:gap-2 mb-6">
            {consistencyData.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "aspect-square rounded-sm transition-colors duration-500",
                  item.level === 0 ? "bg-slate-800" :
                  item.level === 1 ? "bg-indigo-900" :
                  item.level === 2 ? "bg-indigo-700" : "bg-indigo-500"
                )}
              />
            ))}
          </div>
          <p className="text-center text-slate-500 italic text-xs lg:text-sm">
            "Consistency is what transforms average into excellence."
          </p>
        </div>
      </section>
    </div>
  );
}