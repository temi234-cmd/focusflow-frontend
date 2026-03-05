export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  assignees: string[];
  progress?: number;
  completedDate?: string;
}

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Update Brand Guidelines',
    description: 'Ensure all assets match the new 2024 color palette and font pairings.',
    priority: 'High',
    status: 'To Do',
    dueDate: 'Oct 24',
    assignees: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=faces'
    ]
  },
  {
    id: '2',
    title: 'Q4 Product Roadmap',
    priority: 'Medium',
    status: 'To Do',
    dueDate: 'Oct 28',
    assignees: []
  },
  {
    id: '3',
    title: 'Internal Dashboard UI',
    priority: 'Low',
    status: 'In Progress',
    dueDate: 'Today',
    progress: 66,
    assignees: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=faces']
  },
  {
    id: '4',
    title: 'Onboarding Flow Redesign',
    priority: 'Medium',
    status: 'Done',
    dueDate: 'Oct 20',
    completedDate: 'Oct 20',
    assignees: []
  }
];