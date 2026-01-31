# Research Progress

## Date: 2026-01-31

### Discoveries about recurrence rules:
- Researched rrule.js library for iCalendar RFC recurrence rule implementation.
- Found examples for daily, weekly, monthly, yearly frequencies with interval, end date, byWeekDay.
- Need to integrate rrule.js with date-fns for date manipulation.
- Added rrule.js to NEEDS.md as a dependency for recurrence.

### Progress:
- Created recurrence.ts with validation and basic next occurrence calculation.
- Updated task-utils.ts to validate recurrence rules and reminders.
- Added exports to domain_types/index.ts.
- Wrote unit tests for recurrence validation and next occurrence.
- Updated task tests with recurrence and reminder validation.
- Extended REQUIREMENTS.md with error handling, performance metrics, and data integrity sections.
- Defined repository pattern interface (Repository, TaskRepository, DataStore).
- Implemented InMemoryTaskRepository with full CRUD and query methods.
- Wrote integration tests for data layer covering all repository methods and error handling.

## Date: 2025-01-31

### Discoveries from TODO app research:

1. **Popular TODO apps**: Todoist, TickTick, Microsoft To Do, Apple Reminders, Things, Google Tasks, Trello, Notion, Any.do, Taskity.ai.
2. **Key features**:
   - Task creation with due dates, reminders, recurrence, subtasks, tags, priority levels.
   - Multiple views: list, calendar, kanban, daily/weekly planner, Eisenhower matrix.
   - Cross-platform sync and offline support.
   - Collaboration features: shared lists, assign tasks, comments.
   - Integration with calendars (Google, Outlook, Apple).
   - Natural language input for quick task creation.
   - AI features: task suggestions, naming, summarization.
   - Focus tools: Pomodoro timer, habit tracking.
   - Customizable UI: dark/light theme, color coding, font size.
   - Accessibility: screen reader support, keyboard shortcuts.

3. **UX best practices**:
   - Keep it simple and intuitive (KISS).
   - Provide clear focus and help users get things done.
   - Use familiar UI patterns (Material Design recommended).
   - Ensure visual and functional consistency.
   - Provide onboarding tutorials.
   - Support task snoozing, shifting to next day.
   - Progress visualization (completion percentage, streaks).

4. **Technical stack**: Vite, React, Tailwind CSS, shadcn/ui, TypeScript, Zustand/Context, IndexedDB/localStorage, Vitest, Playwright.

5. **Domain types defined**: Task, Subtask, User, Category, RecurrenceRule, Reminder.

### Architectural Patterns Discovered:

**State Management**:
- Use `useState` for simple local state, `useReducer` for complex local logic.
- Context API suitable for low-frequency global state (theme, auth).
- For shared high-frequency state (tasks, UI state), consider Zustand (lightweight) or Redux Toolkit.
- React Query (TanStack Query) for async server state (if we add backend sync).
- Keep state close to where it's used; lift only when necessary.

**Data Persistence**:
- IndexedDB recommended for complex data structures, large datasets, offline support.
- localStorage suitable for small simple data (user preferences).
- Consider libraries like `idb-keyval` or `localForage` for simpler IndexedDB API.
- Offline-first architecture: store tasks locally, sync when online.

**UI Components**:
- shadcn/ui provides accessible, customizable components.
- Tailwind CSS v4 with OKLCH colors for modern theming.
- Use React Hook Form for form handling with Zod validation.

**Testing**:
- Unit tests with Vitest for domain logic.
- Component tests with React Testing Library.
- E2E tests with Playwright for critical user flows.

### Progress Made:
- Updated REQUIREMENTS.md with detailed specifications.
- Created domain types (Task, Subtask, User, Category).
- Wrote utility functions for task validation and completion calculation.
- Created unit tests for domain logic.
- Created NEEDS.md listing additional dependencies.

### Next Steps:
- Research recurrence rule algorithms and implement utility functions.
- Define data persistence interface (repository pattern).
- Create mock UI components using shadcn/ui for prototyping.
- Write integration tests for data layer.
- Update requirements with error handling and performance metrics.