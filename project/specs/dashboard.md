# Dashboard Specification

## Overview
Main dashboard interface providing overview and quick access to tasks with multiple view modes.

## Layout Structure

### Overall Layout
- **Sidebar** (left) - Navigation, quick stats, filters
- **Main Content** (center) - Task views (Kanban/List)
- **Task Detail Panel** (right, optional) - Selected task details

### Responsive Behavior
- Desktop: All three panels visible
- Tablet: Main content + collapsible sidebar
- Mobile: Single column, drawer navigation

## Sidebar

### Navigation Items
- Dashboard (current view)
- Settings (future)
- About (future)

### Quick Stats
- Total tasks
- Tasks in progress
- Tasks due today/overdue
- Completion rate

### Saved Filters (optional)
- Quick filter buttons
- Custom filter creation
- Filter library access

### View Toggles
- Kanban view button
- List view button
- Active view highlighted

## Main Content - Kanban Board View

### Column Structure
5 columns, one per task status:

```
[BACKLOG] | [TODO] | [IN PROGRESS] | [REVIEW] | [DONE]
  (12)       (8)        (3)            (5)        (25)
```

### Column Headers
- Status name (uppercase)
- Task count badge
- Expand/collapse column
- Add task button (+)

### Column Content
- Vertical list of task cards
- Drag handle on each card
- Task cards show:
  - Title (truncated if long)
  - Priority indicator
  - Due date (if set)
  - Status badge
  - Label chips (up to 3, "+N" for more)

### Column Actions
- Add task button at bottom
- Collapse/expand column
- Auto-scroll to show new tasks

### Drag and Drop Behavior
- Drag task to different column
- Reorder within same column
- Visual feedback:
  - Column highlight on hover
  - Ghost card during drag
  - Drop zone indicator
- Auto-save on drop

## Main Content - List View

### List Structure
Single vertical list, sorted by status:
- Top: Backlog, Todo, In Progress, Review (grouped)
- Bottom: Done (separated or at very bottom)
- Newer tasks appear above older tasks in same status

### List Items
Each item shows:
- Expand/collapse toggle (for subtasks)
- Drag handle
- Checkbox (toggle done status)
- Title
- Priority indicator
- Due date
- Status badge
- Labels (up to 3)

### Subtask Indentation
- Visual indentation for subtasks (16px per level)
- Subtasks nested under parent
- Expand/collapse subtasks inline
- Subtasks inherit parent indentation

### List Actions
- Bulk select (checkbox on left)
- Bulk actions (archive, change status, delete)
- Sort options (date, priority, status)
- Show/hide completed tasks

## Task Cards (Shared)

### Card States
- Normal
- Hover (elevation increase)
- Dragging (opacity + elevation)
- Selected (border highlight)
- Blocked (dimmed + lock icon)

### Card Content
**Title**: Truncated at 2 lines, ellipsis
**Priority**: Color-coded indicator
**Due Date**: Calendar icon + date, red if overdue
**Status**: Badge with status color
**Labels**: Small chips, max 3 visible
**Subtasks**: Badge showing "N/N complete" if any

### Card Interactions
- Click to open task detail
- Double-click to edit title inline
- Drag handle to reorder
- Hover for quick actions menu

## Task Detail Panel (Right Sidebar)

### Panel States
- Collapsed: Task title only
- Expanded: Full task details

### Panel Content
- **Header**: Title, status, priority
- **Description**: Rich text editor/viewer
- **Metadata**: Created/updated dates, due date
- **Subtasks Section**: List of subtasks with add button
- **Dependencies Section**: 
  - Blocking tasks (what's blocking me)
  - Dependent tasks (what am I blocking)
- **Actions**: Edit, delete, duplicate buttons
- **Comments** (future)

### Panel Actions
- Close button
- Collapse/expand toggle
- Save/apply changes

## Quick Actions

### Global Quick Actions
- **Keyboard shortcut**: Cmd/Ctrl + K for command palette (future)
- **FAB** (Floating Action Button): Quick add task
- **Search bar**: Top of main content

### Quick Add Task Modal
- Title input (required)
- Status dropdown (default: Backlog)
- Priority dropdown (default: Medium)
- Due date picker
- Labels input
- Save/Cancel buttons

## Filters and Search

### Search Bar
- Full-text search
- Real-time results
- Search in titles and descriptions
- Clear button

### Filter Panel
- Status filter (checkboxes)
- Priority filter (checkboxes)
- Label filter (multi-select)
- Due date range picker
- Show/hide completed toggle
- Apply/Reset buttons

### Filter Persistence
- Save current filter
- Load saved filters
- Delete saved filters

## Empty States

### Empty Board (No Tasks)
- Illustration/icon
- "NO TASKS YET" message
- "CREATE YOUR FIRST TASK" button

### Empty Column
- "NO TASKS IN THIS COLUMN" message
- "ADD TASK" button

### No Search Results
- "NO MATCHING TASKS" message
- "CLEAR FILTERS" button

## Loading States

### Initial Load
- Skeleton cards
- Loading spinner in center
- Smooth fade-in on data load

### Action Loading
- Spinner in buttons during save
- Optimistic UI updates
- Error handling with toast

## Error States

### Task Not Found
- "TASK NOT FOUND" message
- "RETURN TO DASHBOARD" button

### Dependency Error
- "CANNOT COMPLETE DUE TO BLOCKING TASKS" message
- List blocking tasks
- "VIEW BLOCKING TASKS" button

### Storage Error
- "COULD NOT SAVE CHANGES" message
- "RETRY" button
- "RELOAD PAGE" button

## Micro-Interactions

### Hover Effects
- Cards lift slightly
- Buttons glow
- Border color changes to panel teal

### Click Effects
- Button press animation
- Ripple effect (optional)
- Sound feedback (optional, disabled by default)

### Transition Animations
- Smooth card reordering
- Panel slide-in/out
- Modal fade-in
- Status change color transition

### Drag Visual Feedback
- Lift effect on dragged card
- Drop zone highlight
- Column scroll on edge drag
- Snap-to-position on drop

## Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate
- Arrow keys for list navigation
- Escape to close modals/panels

### Screen Reader Support
- ARIA labels for all actions
- Status announcements
- Live regions for updates
- Proper heading hierarchy

### Focus Management
- Visible focus indicators
- Focus trapped in modals
- Focus returns after close
- Skip to main content link

## Performance

### Rendering
- Virtual scroll for long lists (> 100 items)
- Lazy load task descriptions
- Debounce search input
- Throttle scroll events

### Optimizations
- Memoize card components
- Use React.memo for expensive renders
- Optimize drag-drop calculations
- Batch state updates
