export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string; // Tailwind bg color class
  textColor: string; // Tailwind text color class
}

export type TaskFilter = 'all' | 'active' | 'completed';
