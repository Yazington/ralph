import { useState, useRef, useEffect } from 'react';
import {
  Task,
  TaskFilter,
  createTask,
  addTask,
  updateTask,
  toggleTaskCompletion,
  filterTasks,
  deriveEmptyState,
} from '@domain/task-domain';
import {
  planComposerKeyAction,
  planCheckboxToggle,
  deriveFocusRing,
} from '@domain/interactions';
import { reorderTasksByDrag, deriveStackedTaskPlan } from '@domain/drag-and-drop';
import { planFontLoading } from '@domain/typography';
import { loadFontsFromPlan } from './typography/load-fonts';
import {
  deriveInputFeedback,
  scheduleDeletionWithUndo,
} from '@domain/feedback-state';

const fontPlans = planFontLoading();

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

interface ComposerProps {
  onAddTask: (title: string) => void;
  attemptedEmptySubmit: boolean;
  onResetAttempt: () => void;
}

function Composer({ onAddTask, attemptedEmptySubmit, onResetAttempt }: ComposerProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusRing = deriveFocusRing(isFocused);
  const inputFeedback = deriveInputFeedback(value, attemptedEmptySubmit);

  const handleSubmit = () => {
    if (!inputFeedback.canSubmit) {
      return;
    }
    const plan = planComposerKeyAction('Enter', value);
    if (plan.shouldSubmit && plan.trimmedValue) {
      onAddTask(plan.trimmedValue);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (attemptedEmptySubmit) {
      onResetAttempt();
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 border-b border-[#2B2C2D66]">
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Add a new task..."
            className="w-full bg-[#0B1013] text-[#B5D7CD] placeholder-[#6A8F96] rounded-lg px-4 py-3 outline-none transition-all duration-200"
            style={{
              border: inputFeedback.kind === 'inputError'
                ? '1px solid #7299A2'
                : focusRing.visible
                ? `2px solid ${focusRing.color}`
                : '1px solid #2B2C2D',
              boxShadow: inputFeedback.kind === 'inputError'
                ? `0 0 0 2px #7299A240`
                : focusRing.visible
                ? `0 0 0 ${focusRing.offsetPx}px ${focusRing.color}40`
                : 'none',
            }}
          />
          {inputFeedback.kind === 'inputError' && inputFeedback.helperText && (
            <p className="mt-2 text-sm text-[#6A8F96]">{inputFeedback.helperText}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!inputFeedback.canSubmit}
          className="px-6 py-3 bg-[#132E2C] text-[#B5D7CD] rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#132E2C80] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7299A2]"
        >
          Add
        </button>
      </div>
    </div>
  );
}

interface TodoItemProps {
  task: Task;
  stackOffsetPx: number;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
  onDragOver: (e: React.DragEvent, taskId: string) => void;
  onDrop: (taskId: string) => void;
  isDragging: boolean;
}

function TodoItem({
  task,
  stackOffsetPx,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [isFocused, setIsFocused] = useState(false);

  const focusRing = deriveFocusRing(isFocused);

  const handleToggle = () => {
    const plan = planCheckboxToggle(task, getTimestamp());
    if (plan.nextCompleted !== plan.currentCompleted) {
      onToggleComplete(task.id);
    }
  };

  const handleEditSubmit = () => {
    if (editValue.trim()) {
      onEditTask(task.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(task.title);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(e, task.id);
  };

  const handleDrop = () => {
    onDrop(task.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex items-center gap-4 p-4 border-b border-[#2B2C2D66] transition-all duration-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{
        marginBottom: stackOffsetPx > 0 ? `${stackOffsetPx}px` : 0,
        backgroundColor: task.completed ? '#0B101380' : 'transparent',
      }}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
        className="w-6 h-6 rounded border-[#2B2C2D] accent-[#7299A2] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7299A2]"
      />

      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus
            className="w-full bg-[#0B1013] text-[#B5D7CD] rounded-lg px-4 py-2 outline-none"
            style={{
              border: focusRing.visible ? `2px solid ${focusRing.color}` : '1px solid #2B2C2D',
            }}
          />
        ) : (
          <span
            className={`text-lg ${task.completed ? 'line-through text-[#588391]' : 'text-[#B5D7CD]'}`}
          >
            {task.title}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          setIsEditing(true);
          setEditValue(task.title);
        }}
        className="p-2 text-[#6A8F96] hover:text-[#B5D7CD] transition-colors rounded-lg hover:bg-[#0B1013] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7299A2]"
        aria-label="Edit task"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onDeleteTask(task.id)}
        className="p-2 text-[#6A8F96] hover:text-[#B5D7CD] transition-colors rounded-lg hover:bg-[#0B1013] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7299A2]"
        aria-label="Delete task"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}

interface FooterProps {
  filter: TaskFilter;
  activeCount: number;
  onFilterChange: (filter: TaskFilter) => void;
}

function Footer({ filter, activeCount, onFilterChange }: FooterProps) {
  const filters: { key: TaskFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex items-center justify-between p-4 text-sm text-[#6A8F96] border-t border-[#2B2C2D66]">
      <span>{activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining</span>
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`px-3 py-1 rounded-lg transition-all duration-200 ${
              filter === f.key
                ? 'bg-[#132E2C] text-[#B5D7CD]'
                : 'text-[#6A8F96] hover:text-[#B5D7CD] hover:bg-[#0B1013]'
            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7299A2]`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

function Toast({ message, onUndo, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#101D1E] border border-[#2B2C2D] rounded-lg px-4 py-3 flex items-center gap-4 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
      <span className="text-sm text-[#B5D7CD]">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="text-sm text-[#7299A2] hover:text-[#B5D7CD] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7299A2]"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="text-sm text-[#6A8F96] hover:text-[#B5D7CD] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7299A2]"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [attemptedEmptySubmit, setAttemptedEmptySubmit] = useState(false);
  const [activeToast, setActiveToast] = useState<{ message: string; taskSnapshot: Task } | null>(null);

  useEffect(() => {
    void loadFontsFromPlan(fontPlans);
  }, []);

  const filteredTasks = filterTasks(tasks, filter);
  const activeTasks = tasks.filter((t) => !t.completed);
  const emptyState = deriveEmptyState(tasks, filter);
  const stackedPlan = deriveStackedTaskPlan(filteredTasks);

  const handleToggleComplete = (taskId: string) => {
    const updated = toggleTaskCompletion(tasks, taskId, getTimestamp());
    const reordered = updated.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return a.order - b.order;
    }).map((task, index) => ({ ...task, order: index }));
    setTasks(reordered);
  };

  const handleEditTask = (taskId: string, newTitle: string) => {
    const updated = updateTask(tasks, taskId, { title: newTitle, updatedAt: getTimestamp() });
    setTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const deletionPlan = scheduleDeletionWithUndo(tasks, taskId, getTimestamp());
    setTasks(deletionPlan.nextTasks);

    if (deletionPlan.toast.taskSnapshot) {
      setActiveToast({
        message: deletionPlan.toast.message,
        taskSnapshot: deletionPlan.toast.taskSnapshot,
      });
    }
  };

  const handleUndo = () => {
    if (activeToast?.taskSnapshot) {
      setTasks((prev) => {
        const updated = addTask(prev, activeToast.taskSnapshot);
        return updated.sort((a, b) => {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          return a.order - b.order;
        }).map((task, index) => ({ ...task, order: index }));
      });
      setActiveToast(null);
    }
  };

  const handleDismissToast = () => {
    setActiveToast(null);
  };

  const handleAddTask = (title: string) => {
    const newTask = createTask({
      id: generateId(),
      title,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
      order: tasks.length,
    });
    setTasks(addTask(tasks, newTask));
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === taskId) return;
  };

  const handleDrop = (targetTaskId: string) => {
    if (!draggedTaskId) return;

    const targetIndex = filteredTasks.findIndex((t) => t.id === targetTaskId);
    if (targetIndex === -1) return;

    const result = reorderTasksByDrag(filteredTasks, draggedTaskId, targetIndex);
    if (result.changed) {
      setTasks(result.tasks);
    }

    setDraggedTaskId(null);
  };

  return (
    <main className="min-h-screen bg-[#090B0D] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-[#2B2C2D] bg-[#0B1013] shadow-xl overflow-hidden">
        <header className="p-6 border-b border-[#2B2C2D66]">
          <h1 className="text-3xl font-semibold text-[#B5D7CD]">Calm Tasks</h1>
          <p className="text-[#6A8F96] mt-2">A tranquil place to organize your day</p>
        </header>

        <Composer
          onAddTask={handleAddTask}
          attemptedEmptySubmit={attemptedEmptySubmit}
          onResetAttempt={() => setAttemptedEmptySubmit(false)}
        />

        {emptyState ? (
          <div className="p-8 text-center">
            <p className="text-[#6A8F96] text-lg mb-4">{emptyState.message}</p>
            {emptyState.sampleTask && (
              <div className="bg-[#0B1013] border border-[#2B2C2D66] rounded-lg p-4 inline-block">
                <p className="text-[#B5D7CD]">{emptyState.sampleTask.title}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#2B2C2D66]">
            {filteredTasks.map((task) => {
              const descriptor = stackedPlan.descriptors.find((d) => d.id === task.id);
              return (
                <TodoItem
                  key={task.id}
                  task={task}
                  stackOffsetPx={descriptor?.offsetPx ?? 0}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={draggedTaskId === task.id}
                />
              );
            })}
          </div>
        )}

        <Footer filter={filter} activeCount={activeTasks.length} onFilterChange={setFilter} />
      </div>

      {activeToast && (
        <Toast
          message={activeToast.message}
          onUndo={handleUndo}
          onDismiss={handleDismissToast}
        />
      )}
    </main>
  );
}
