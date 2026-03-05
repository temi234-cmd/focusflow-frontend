import API from './api';

export async function generateWeeklyDigest(
  name: string,
  tasks: { title: string; status: string; priority: string }[],
  habits: { name: string; streak: number; completedToday: boolean; history: boolean[] }[]
): Promise<string> {
  const completedTasks = tasks.filter(t => t.status === 'Done');
  const pendingTasks = tasks.filter(t => t.status !== 'Done');
  const highPriorityPending = pendingTasks.filter(t => t.priority === 'High');
  const activeHabits = habits.filter(h => h.streak > 0);
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const habitsCompletedToday = habits.filter(h => h.completedToday).length;

  const prompt = `
You are a productivity coach for FocusFlow, an app that helps users manage tasks and habits.
Write a short, encouraging, and personalized weekly digest for ${name}.

Here is their real data:
- Tasks completed: ${completedTasks.length} out of ${tasks.length} total
- Completed task titles: ${completedTasks.map(t => t.title).join(', ') || 'None yet'}
- Pending tasks: ${pendingTasks.length} (${highPriorityPending.length} high priority)
- High priority pending: ${highPriorityPending.map(t => t.title).join(', ') || 'None'}
- Active habits (streak > 0): ${activeHabits.length} out of ${habits.length} total
- Habits with active streaks: ${activeHabits.map(h => `${h.name} (${h.streak} day streak)`).join(', ') || 'None yet'}
- Longest streak: ${longestStreak} days
- Habits completed today: ${habitsCompletedToday} out of ${habits.length}

Guidelines:
- Be specific — mention actual task names or habit names where relevant
- Keep it to 3-4 sentences max
- Be warm, motivating, and honest — if they have pending high priority tasks, gently nudge them
- Do not make up numbers or data that isn't provided above
- Do not use markdown, bullet points or headers — plain conversational text only
`;

  try {
    const { data } = await API.post('/notifications/digest', { prompt });
    return data.text?.trim() || `Great work this week, ${name}! Keep pushing forward.`;
  } catch (error) {
    console.error('Failed to generate weekly digest:', error);
    return `Great work this week, ${name}! Keep pushing forward.`;
  }
}