import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Plus,
  Trash2,
  Calendar,
  Search,
  Sparkles,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  Menu,
} from "lucide-react";
import { Task, Category, Priority, TaskFilter } from "./types";
import { DEFAULT_CATEGORIES, INITIAL_TASKS } from "./data";
import Confetti from "./components/Confetti";

export default function App() {
  // State variables
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "dueDate" | "priority">("createdAt");
  
  // Confetti trigger
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  // Form input state
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newCategory, setNewCategory] = useState("personal");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Load tasks on initial mount
  useEffect(() => {
    const saved = localStorage.getItem("taskflow_lite_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
    }
  }, []);

  // Save tasks on changes
  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem("taskflow_lite_tasks", JSON.stringify(updatedTasks));
  };

  // Play a beautiful synthesized sound using Web Audio API (completely offline-friendly)
  const playCleanBeep = (freq: number, type: OscillatorType, duration: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked by browser policy before user interaction
    }
  };

  const playSuccessSound = () => {
    playCleanBeep(523.25, "sine", 0.15); // C5
    setTimeout(() => {
      playCleanBeep(659.25, "sine", 0.2); // E5
    }, 80);
  };

  const playDeleteSound = () => {
    playCleanBeep(330, "triangle", 0.15); // E4 down ramp
  };

  const playClickSound = () => {
    playCleanBeep(440, "sine", 0.05); // A4 tap
  };

  // Add a task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrors({ title: "Task title cannot be empty!" });
      return;
    }
    setErrors({});

    const newTask: Task = {
      id: "task-" + Date.now(),
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate || undefined,
      notes: newNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    saveTasks([newTask, ...tasks]);
    playSuccessSound();

    // Reset fields
    setNewTitle("");
    setNewNotes("");
    setNewCategory("personal");
    setNewPriority("medium");
    setNewDueDate("");
    setIsFormExpanded(false);
  };

  // Check / Uncheck task
  const handleToggleComplete = (id: string, isCompletedCurrently: boolean) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    saveTasks(updated);

    if (!isCompletedCurrently) {
      // Newly completed
      playSuccessSound();
      setTriggerConfetti(true);
      setTimeout(() => setTriggerConfetti(false), 200);
    } else {
      playClickSound();
    }
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    playDeleteSound();
  };

  // Clear all completed tasks
  const handleClearCompleted = () => {
    const activeTasks = tasks.filter((t) => !t.completed);
    saveTasks(activeTasks);
    playDeleteSound();
  };

  // Counters
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter & Sort Logic
  const filteredTasks = tasks
    .filter((task) => {
      // Text Search Filter
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status Filter
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "active" && !task.completed) ||
        (selectedFilter === "completed" && task.completed);

      // Category Filter
      const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;

      return matchesSearch && matchesFilter && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "priority") {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      }
      // default: createdAt descending (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-slate-50 relative pb-12">
      {/* Confetti celebration container */}
      <Confetti active={triggerConfetti} />

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-10">
        
        {/* Animated App Banner Header */}
        <header className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-full -mr-6 -mt-6 opacity-60 pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">⚡</span>
                <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-slate-800">
                  Task Flow <span className="text-indigo-600 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Lite</span>
                </h1>
              </div>
              <p className="text-slate-500 text-sm font-sans">
                Keep your thoughts neat & momentum flowin' 🌟
              </p>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-3 py-2 text-center min-w-[70px]">
              <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">Done</div>
              <div className="text-xl font-display font-extrabold text-slate-800">
                {completedCount}<span className="text-xs text-slate-400 font-normal"> / {totalCount}</span>
              </div>
            </div>
          </div>

          {/* Quick Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
              <span>Your Daily Goal Flow</span>
              <span className="font-mono text-indigo-600 font-bold">{completionPercentage}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </header>

        {/* Expandable Form: Add Task */}
        <section className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden mb-6">
          <button
            id="add-task-trigger"
            onClick={() => {
              setIsFormExpanded(!isFormExpanded);
              playClickSound();
            }}
            className="w-full px-6 py-4 flex items-center justify-between font-sans font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none min-h-[48px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Plus className="w-5 h-5" />
              </div>
              <span>Add a new Task...</span>
            </div>
            {isFormExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {isFormExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <form
                  onSubmit={handleAddTask}
                  className="px-6 pb-6 pt-2 border-t border-slate-50 space-y-4"
                >
                  {/* Task Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="task-title-input"
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Brainstorm layout wireframes 🎨"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm min-h-[44px]"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>
                    )}
                  </div>

                  {/* Notes / Subtasks */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">
                      Notes & Guidance (Optional)
                    </label>
                    <textarea
                      id="task-notes-input"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Specify important details, sub-items, or tips..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>

                  {/* Attributes: Category, Priority, Due Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">
                        Category
                      </label>
                      <select
                        id="task-category-select"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-indigo-500 text-sm min-h-[44px]"
                      >
                        {DEFAULT_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority Selection */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">
                        Priority
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                        {(["low", "medium", "high"] as Priority[]).map((p) => {
                          const active = newPriority === p;
                          const colorMap = {
                            low: active ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-200/60",
                            medium: active ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-200/60",
                            high: active ? "bg-rose-500 text-white" : "text-slate-600 hover:bg-slate-200/60",
                          };
                          return (
                            <button
                              id={`priority-${p}-btn`}
                              key={p}
                              type="button"
                              onClick={() => {
                                setNewPriority(p);
                                playClickSound();
                              }}
                              className={`py-1 rounded-lg text-xs font-bold transition-all capitalize focus:outline-none min-h-[32px] ${colorMap[p]}`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">
                        Due Date
                      </label>
                      <div className="relative">
                        <input
                          id="task-due-date"
                          type="date"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-500 text-sm min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Trigger Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      id="save-task-btn"
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-sans font-bold text-sm shadow-sm transition-all flex items-center gap-1.5 touch-action-manipulation min-h-[44px]"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Task Flow</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Segmented Filters & Search Bar */}
        <section className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-tasks-input"
                type="text"
                placeholder="Search flow by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm min-h-[44px]"
              />
            </div>

            {/* Sorting Widget */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-widest font-sans">Sort By</span>
              <select
                id="sort-tasks-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  playClickSound();
                }}
                className="px-3 border border-slate-200 rounded-xl text-slate-600 py-1.5 bg-white text-xs font-semibold focus:outline-none focus:border-indigo-500 min-h-[40px]"
              >
                <option value="createdAt">⏰ Newest Saved</option>
                <option value="dueDate">📅 Target Due Date</option>
                <option value="priority">🔥 High Priority</option>
              </select>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100" />

          {/* Filter Bubbles */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(["all", "active", "completed"] as TaskFilter[]).map((f) => {
                const active = selectedFilter === f;
                const count =
                  f === "all"
                    ? tasks.length
                    : f === "active"
                    ? tasks.filter((t) => !t.completed).length
                    : tasks.filter((t) => t.completed).length;

                return (
                  <button
                    id={`filter-${f}-btn`}
                    key={f}
                    onClick={() => {
                      setSelectedFilter(f);
                      playClickSound();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-sans uppercase transition-all tracking-wider flex items-center gap-1.5 focus:outline-none min-h-[40px] ${
                      active
                        ? "bg-slate-800 text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{f}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Categories Scroll Grid */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 whitespace-nowrap scrollbar-thin">
              <button
                id="cat-all-btn"
                onClick={() => {
                  setSelectedCategory("all");
                  playClickSound();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer select-none min-h-[36px] ${
                  selectedCategory === "all"
                    ? "bg-indigo-600 text-white border-indigo-600 font-extrabold"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>🌍</span>
                <span>All Categories</span>
                <span className={`text-[10px] px-1 rounded-md ${selectedCategory === "all" ? "bg-white/25 text-white" : "bg-slate-200"}`}>
                  {tasks.length}
                </span>
              </button>

              {DEFAULT_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                const taskCount = tasks.filter((t) => t.category === cat.id).length;
                return (
                  <button
                    id={`cat-${cat.id}-btn`}
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      playClickSound();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer select-none min-h-[36px] ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-600 font-extrabold"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1 rounded-md ${active ? "bg-white/25 text-white" : "bg-slate-200"}`}>
                      {taskCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Task Grid / Scroll List */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-display font-bold text-slate-800 text-sm tracking-wide uppercase">
              {selectedFilter === "all" ? "Filtered" : selectedFilter} Task Flow ({filteredTasks.length})
            </h2>
            
            {completedCount > 0 && selectedFilter !== "active" && (
              <button
                id="clear-completed-btn"
                onClick={handleClearCompleted}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors py-1 px-2 hover:bg-rose-50 rounded-lg min-h-[32px] font-sans"
              >
                Clear Checked
              </button>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-3xl p-8 shadow-xs border border-dashed border-slate-200 text-center space-y-3"
                >
                  <div className="text-4xl">🌤️</div>
                  <h3 className="font-sans font-bold text-slate-700 text-base">All Clean! No matches found</h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">
                    There are no tasks here matching your filters. Try adding a brand new flow or tweaking filters above!
                  </p>
                </motion.div>
              ) : (
                filteredTasks.map((task) => {
                  const categoryObj = DEFAULT_CATEGORIES.find((c) => c.id === task.category);
                  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));

                  return (
                    <motion.div
                      id={`task-card-${task.id}`}
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -15 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className={`group bg-white rounded-2xl p-4 shadow-xs border hover:border-indigo-100 transition-all flex items-start gap-4 hover:shadow-sm ${
                        task.completed ? "opacity-65 border-slate-100" : "border-slate-100"
                      }`}
                    >
                      {/* Interactive Circular Checkbox */}
                      <button
                        id={`task-check-${task.id}`}
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors focus:outline-none cursor-pointer min-w-[28px] min-h-[28px] ${
                          task.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50"
                        }`}
                      >
                        {task.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </motion.div>
                        )}
                      </button>

                      {/* Task Info Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start gap-2 justify-between">
                          <h3
                            className={`font-sans text-sm md:text-base font-semibold leading-snug break-words pr-2 ${
                              task.completed
                                ? "text-slate-400 line-through decoration-slate-300 decoration-s-2"
                                : "text-slate-800"
                            }`}
                          >
                            {task.title}
                          </h3>

                          {/* Priority Badge */}
                          <div className="shrink-0 flex items-center">
                            {task.priority === "high" && (
                              <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                                High
                              </span>
                            )}
                            {task.priority === "medium" && (
                              <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                                Medium
                              </span>
                            )}
                            {task.priority === "low" && (
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                                Low
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Notes if present */}
                        {task.notes && (
                          <p
                            className={`text-xs block pr-4 whitespace-pre-wrap break-words ${
                              task.completed ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {task.notes}
                          </p>
                        )}

                        {/* Interactive Meta Badges Row */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* Category Tag */}
                          {categoryObj && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${categoryObj.color} ${categoryObj.textColor}`}
                            >
                              <span>{categoryObj.icon}</span>
                              <span className="hidden xs:inline">{categoryObj.name}</span>
                            </span>
                          )}

                          {/* Due Date Indicator */}
                          {task.dueDate && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                                isOverdue
                                  ? "bg-rose-50 border-rose-200 text-rose-700"
                                  : "bg-slate-100 border-slate-200 text-slate-600"
                              }`}
                            >
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span className="font-mono">
                                {task.dueDate} {isOverdue && "(Overdue)"}
                              </span>
                            </span>
                          )}

                          {/* Created at date */}
                          <span className="text-[9px] font-medium text-slate-400 font-sans flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Delete Operation Button */}
                      <button
                        id={`delete-task-${task.id}`}
                        onClick={() => handleDeleteTask(task.id)}
                        className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer min-w-[32px] min-h-[32px] focus:outline-none"
                        title="Delete task"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Footer Info Accent */}
        <footer className="mt-14 border-t border-slate-200/60 pt-6 text-center space-y-3">
          <div className="flex justify-center items-center gap-1 text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-200 animate-pulse" />
            <span>Stored on Device Locally</span>
          </div>
          <p className="text-slate-400 text-xs font-sans max-w-sm mx-auto leading-relaxed">
            Task Flow Lite saves all tasks to your Android device locally using standard fast local state storage caches.
          </p>
        </footer>

      </div>
    </div>
  );
}
