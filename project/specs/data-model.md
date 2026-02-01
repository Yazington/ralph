# Data Model Specification

## Overview
TypeScript interfaces and Zustand store structure for the TODO application.

## TypeScript Interfaces

### Task Interface
```typescript
interface Task {
  id: string;                    // Unique identifier (nanoid)
  title: string;                 // Task title (uppercase)
  description: string;           // Rich text content (Tiptap JSON)
  status: TaskStatus;            // Current status
  priority: Priority;             // Task priority
  dueDate: string | null;        // ISO date string or null
  labels: string[];              // Array of label strings
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  parentId: string | null;       // Parent task ID (for subtasks)
  dependencies: string[];         // Array of task IDs this depends on
  position: number;              // Sort order within status column
}
```

### Task Status Enum
```typescript
enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  REVIEW = 'review',
  DONE = 'done'
}
```

### Priority Enum
```typescript
enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
```

### Task Store State
```typescript
interface TaskStore {
  // Tasks
  tasks: Task[];
  
  // Computed values
  tasksByStatus: Record<TaskStatus, Task[]>;
  tasksByParent: Record<string, Task[]>;  // parentId -> subtasks
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string, cascade: boolean) => void;
  duplicateTask: (id: string) => void;
  
  // Status management
  changeTaskStatus: (id: string, newStatus: TaskStatus) => void;
  
  // Subtask management
  addSubtask: (parentId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'parentId'>) => void;
  deleteSubtask: (subtaskId: string) => void;
  getSubtasks: (parentId: string) => Task[];
  
  // Dependency management
  addDependency: (taskId: string, dependsOnTaskId: string) => void;
  removeDependency: (taskId: string, dependsOnTaskId: string) => void;
  getBlockingTasks: (taskId: string) => Task[];
  getDependentTasks: (taskId: string) => Task[];
  canChangeStatus: (taskId: string, newStatus: TaskStatus) => boolean;
  
  // Reordering
  reorderTask: (taskId: string, newPosition: number) => void;
  moveTaskBetweenColumns: (taskId: string, newStatus: TaskStatus, newPosition: number) => void;
  
  // Filtering
  searchTasks: (query: string) => Task[];
  filterTasks: (filters: TaskFilters) => Task[];
  
  // Persistence
  hydrate: () => void;
  reset: () => void;
}
```

### Task Filters Interface
```typescript
interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  labels?: string[];
  dueDateRange?: {
    start: string;
    end: string;
  };
  includeCompleted?: boolean;
  excludeCompleted?: boolean;
}
```

## Data Relationships

### Task Hierarchy
```
Task (parent)
  ├── Subtask 1
  │   └── Subtask 1.1
  ├── Subtask 2
  └── Subtask 3
```

### Dependency Graph
```
Task A (DONE)
  ↓ blocks
Task B (TODO)
  ↓ blocks
Task C (TODO)
```

## Data Validation Rules

### Task Creation
- Title is required (non-empty)
- Title max length: 200 characters
- Status defaults to BACKLOG
- Priority defaults to MEDIUM
- Due date must be valid ISO date if provided
- Labels must be unique within task
- Dependencies must reference existing task IDs
- Cannot create circular dependencies
- Subtask cannot depend on its own parent

### Task Updates
- Cannot change ID
- updatedAt auto-updates on any change
- Status transitions validated (can't skip states without confirmation)
- Dependency validation on add
- Cannot move subtask to be parent of its own parent

### Task Deletion
- Cascade delete: subtasks deleted with parent
- Non-cascade: subtasks promoted to parent level
- Cannot delete task if it blocks other tasks (unless dependencies removed)

### Dependencies
- No circular dependencies allowed
- Cannot depend on self
- Cannot depend on own descendants (subtasks)
- Task with dependencies cannot move to DONE until blockers are DONE

## Zustand Store Implementation Notes

### Store Structure
- Single store for all tasks
- Computed values derived from main tasks array
- Actions modify main array, derived values update automatically

### Persistence
- Use zustand-persist middleware
- Store in localStorage
- Key: "ralph-tasks"
- Include: all tasks
- Exclude: computed values (re-derived on load)

### Performance Optimizations
- Use Immer for immutable updates
- Memoize derived values
- Optimize search/filter functions
- Batch updates for drag-drop

### Error Handling
- Validation errors throw descriptive messages
- Dependency conflicts return clear feedback
- Invalid operations return error details

## Example Task Data Structure

```typescript
{
  id: "abc123xyz",
  title: "IMPLEMENT FEATURE X",
  description: "<tiptap-json>",
  status: "todo",
  priority: "high",
  dueDate: "2026-02-15T00:00:00.000Z",
  labels: ["frontend", "feature"],
  createdAt: "2026-01-31T10:00:00.000Z",
  updatedAt: "2026-01-31T10:00:00.000Z",
  parentId: null,
  dependencies: ["task-456"],
  position: 0
}
```

## Migration Strategy

### Versioning
- Store version in localStorage metadata
- Migrations defined as functions
- Auto-run migrations on store load

### Future Schema Changes
- Add new fields with defaults
- Rename fields via migration
- Remove deprecated fields via migration
- Support multiple migration steps
