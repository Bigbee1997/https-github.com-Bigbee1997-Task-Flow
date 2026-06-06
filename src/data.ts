import { Category, Task } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "personal", name: "Personal", icon: "🏡", color: "bg-emerald-100 border-emerald-200", textColor: "text-emerald-700" },
  { id: "work", name: "Work & Study", icon: "🎯", color: "bg-indigo-100 border-indigo-200", textColor: "text-indigo-700" },
  { id: "shopping", name: "Shopping", icon: "🛒", color: "bg-amber-100 border-amber-200", textColor: "text-amber-700" },
  { id: "health", name: "Health & Care", icon: "🥦", color: "bg-rose-100 border-rose-200", textColor: "text-rose-700" },
  { id: "ideas", name: "Ideas & Projects", icon: "🧠", color: "bg-purple-100 border-purple-200", textColor: "text-purple-700" },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Welcome to Task Flow Lite! 👋",
    completed: false,
    priority: "medium",
    category: "personal",
    dueDate: new Date().toISOString().split("T")[0],
    notes: "Tap the checkbox on the left to finish a task, or tap the delete button on the right to remove it.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Plan delicious weekly groceries 🛒",
    completed: false,
    priority: "low",
    category: "shopping",
    notes: "Add veggies, spinach, almond milk, and whole grains to the shopping list.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "task-3",
    title: "Implement Android package configuration",
    completed: true,
    priority: "high",
    category: "work",
    dueDate: new Date().toISOString().split("T")[0],
    notes: "Set up build.gradle, configure WebView, enable local storage & DOM Storage features, and check compiling.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  }
];
