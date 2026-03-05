import  { useState, useEffect } from 'react';
import { Download, MoreHorizontal, Sun, Menu } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useLayout } from '../layouts/DashboardLayout';
import API from '../services/api';

// --- Types ---
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

// --- Mock data for untracked features (marked as sample) ---
const focusDistribution = [
  { time: 'MOR', values: [80, 40, 100, 60, 10, 30, 90] },
  { time: 'AFT', values: [20, 90, 50, 80, 70, 10, 20] },
  { time: 'EVE', values: [10, 15, 30, 20, 40, 60, 10] },
];

// --- Helpers ---
const getWeekNumber = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
};

const buildProductivityData = (tasks: Task[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const dateStr = date.toDateString();
    const dayName = days[date.getDay()];

    const dayTasks = tasks.filter(t => new Date(t.createdAt).toDateString() === dateStr);
    const done = dayTasks.filter(t => t.status === 'Done').length;
    const total = dayTasks.length || 1;
    const current = Math.round((done / total) * 100);

    // "previous" = shift by 7 days
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 7);
    const prevDateStr = prevDate.toDateString();
    const prevTasks = tasks.filter(t => new Date(t.createdAt).toDateString() === prevDateStr);
    const prevDone = prevTasks.filter(t => t.status === 'Done').length;
    const prevTotal = prevTasks.length || 1;
    const previous = Math.round((prevDone / prevTotal) * 100);

    return { name: dayName, current, previous };
  });
};

const buildWeeklyCompletionData = (tasks: Task[]) => {
  const weekMap: Record<string, { completed: number; total: number }> = {};

  tasks.forEach(t => {
    const date = new Date(t.createdAt);
    const key = `W${getWeekNumber(date)}`;
    if (!weekMap[key]) weekMap[key] = { completed: 0, total: 0 };
    weekMap[key].total += 1;
    if (t.status === 'Done') weekMap[key].completed += 1;
  });

  return Object.entries(weekMap)
    .slice(-6)
    .map(([week, { completed, total }]) => ({
      week,
      completed,
      scheduled: total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }));
};

const buildHabitConsistency = (habits: Habit[]) => {
  return habits.map(h => {
    const total = h.history.length;
    const done = h.history.filter(Boolean).length;
    const value = total > 0 ? Math.round((done / total) * 100) : 0;
    return { name: h.name, value };
  });
};

// --- Sub-components ---
const KPICard = ({ title, value, subValue, trend, trendValue, progress }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-2"
  >
    <div className="flex justify-between items-start">
      <span className="text-sm font-medium text-slate-400">{title}</span>
      <span className={cn(
        "text-xs font-bold px-2 py-0.5 rounded-full",
        trend === 'up' ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"
      )}>
        {trend === 'up' ? '+' : '-'}{trendValue}%
      </span>
    </div>
    <div className="text-2xl sm:text-3xl font-black">
      {value}
      {subValue && <span className="text-base sm:text-lg font-normal text-slate-400 ml-1">{subValue}</span>}
    </div>
    {progress !== undefined ? (
      <div className="w-full bg-primary/20 h-1.5 rounded-full overflow-hidden mt-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-primary h-full rounded-full"
        />
      </div>
    ) : (
      <p className="text-[10px] sm:text-xs text-slate-400 mt-2">{subValue || ' '}</p>
    )}
  </motion.div>
);

const SampleBadge = () => (
  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
    Sample Data
  </span>
);

const Loadingshimmer = () => (
  <div className="animate-pulse h-full w-full bg-primary/5 rounded-xl flex items-center justify-center">
    <span className="text-slate-500 text-sm">Loading...</span>
  </div>
);

// --- Main Component ---
export default function Analytics() {
  const { openMenu } = useLayout();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Derived stats ---
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
  const avgFocusScore = tasks.length > 0
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const longestStreak = habits.length > 0
    ? Math.max(...habits.map(h => h.streak))
    : 0;
  const personalBestHabit = habits.find(h => h.streak === longestStreak);

  const productivityData = buildProductivityData(tasks);
  const taskCompletionData = buildWeeklyCompletionData(tasks);
  const habitConsistency = buildHabitConsistency(habits);

  // Highlight the best week
  const bestWeek = taskCompletionData.reduce(
    (best, w) => (w.rate > (best?.rate ?? 0) ? w : best),
    taskCompletionData[0]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Header */}
      <header className="h-16 border-b border-primary/20 bg-background-dark/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={openMenu} className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg mr-2">
            <Menu size={20} />
          </button>
          <h2 className="text-lg sm:text-xl font-bold truncate">Analytics Overview</h2>
          <span className="hidden xs:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">LIVE</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-primary/20 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/5 transition-colors">
            <Download className="size-4" />
            <span className="hidden xs:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide">

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl border border-primary/20"><Loadingshimmer /></div>
            ))
          ) : (
            <>
              <KPICard
                title="Avg Focus Score"
                value={avgFocusScore}
                subValue="/100"
                trend={avgFocusScore >= 50 ? 'up' : 'down'}
                trendValue={avgFocusScore}
                progress={avgFocusScore}
              />
              <KPICard
                title="Tasks Completed"
                value={completedTasks}
                subValue={`${pendingTasks} pending`}
                trend={completedTasks >= pendingTasks ? 'up' : 'down'}
                trendValue={tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}
              />
              <KPICard
                title="Longest Streak"
                value={longestStreak}
                subValue={personalBestHabit ? `from "${personalBestHabit.name}"` : 'No habits yet'}
                trend={longestStreak > 0 ? 'up' : 'down'}
                trendValue={longestStreak}
              />
              <KPICard
                title="Active Habits"
                value={habits.filter(h => h.streak > 0).length}
                subValue={`${habits.length} total habits`}
                trend={habits.filter(h => h.completedToday).length > 0 ? 'up' : 'down'}
                trendValue={habits.length > 0
                  ? Math.round((habits.filter(h => h.completedToday).length / habits.length) * 100)
                  : 0}
              />
            </>
          )}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Productivity Over Time */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 p-4 sm:p-6 rounded-xl border border-primary/20 bg-primary/5 flex flex-col"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg">Productivity Score Over Time</h3>
                <p className="text-xs text-slate-400">Task completion rate — current vs previous week</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <div className="size-2 rounded-full bg-primary" /> Current
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <div className="size-2 rounded-full bg-slate-400" /> Previous
                </div>
              </div>
            </div>
            <div className="h-48 sm:h-64 w-full">
              {isLoading ? <Loadingshimmer /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productivityData}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6467f2" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6467f2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#101122', border: '1px solid #6467f230', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any) => [`${value}%`, '']}
                    />
                    <Area type="monotone" dataKey="current" stroke="#6467f2" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
                    <Area type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Habit Consistency */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 sm:p-6 rounded-xl border border-primary/20 bg-primary/5"
          >
            <div className="mb-6">
              <h3 className="font-bold text-lg">Habit Consistency</h3>
              <p className="text-xs text-slate-400">Performance by habit type</p>
            </div>
            {isLoading ? <Loadingshimmer /> : habitConsistency.length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-8">No habits yet</p>
            ) : (
              <div className="space-y-6">
                {habitConsistency.map((habit) => (
                  <div key={habit.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="truncate mr-2">{habit.name}</span>
                      <span className="text-primary">{habit.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-primary/10 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${habit.value}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={cn(
                          "h-full rounded-full shadow-[0_0_10px_rgba(100,103,242,0.3)]",
                          habit.value > 80 ? "bg-primary" : habit.value > 60 ? "bg-primary/60" : "bg-primary/40"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Completion by Week */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 rounded-xl border border-primary/20 bg-primary/5"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg">Task Completion by Week</h3>
                <p className="text-xs text-slate-400">Completed tasks per week</p>
              </div>
              <button className="p-1 hover:bg-primary/10 rounded transition-colors">
                <MoreHorizontal className="size-5 text-slate-400" />
              </button>
            </div>
            <div className="h-48 w-full">
              {isLoading ? <Loadingshimmer /> : taskCompletionData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">No task data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskCompletionData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={({ x, y, payload }: any) => (
                      <text x={x} y={y + 10} fill={payload.value === bestWeek?.week ? '#6467f2' : '#94a3b8'} fontSize={10} fontWeight={700} textAnchor="middle">
                        {payload.value}
                      </text>
                    )} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#101122', border: '1px solid #6467f230', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any) => [`${value} tasks`, 'Completed']}
                    />
                    <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                      {taskCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.week === bestWeek?.week ? '#6467f2' : '#6467f240'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Focus Distribution — Sample Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 rounded-xl border border-primary/20 bg-primary/5"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg">Focus Distribution</h3>
                <p className="text-xs text-slate-400">Intensity of work sessions by time of day</p>
              </div>
              <SampleBadge />
            </div>
            <div className="flex flex-col gap-3">
              {focusDistribution.map((row) => (
                <div key={row.time} className="flex items-center gap-4">
                  <span className="w-8 text-[10px] font-bold text-slate-500">{row.time}</span>
                  <div className="flex-1 flex gap-1 sm:gap-2">
                    {row.values.map((val, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex-1 aspect-square rounded-sm"
                        style={{
                          backgroundColor: `rgba(100, 103, 242, ${val / 100})`,
                          boxShadow: val > 80 ? '0 0 10px rgba(100, 103, 242, 0.2)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sun className="size-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Peak Performance</span>
                  <span className="text-xs font-bold">10:00 AM — 1:00 PM</span>
                </div>
              </div>
              <button className="text-xs font-bold text-amber-400 hover:underline transition-all">
                Coming soon
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}