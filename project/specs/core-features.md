# Core Features Specification

## Overview
Comprehensive task management system with hierarchical organization, dependencies, and drag-and-drop interactions.

## Task Management

### Task Properties
Each task must support:
- **Title** (required)
- **Description** (rich text via Tiptap)
- **Status** - one of 5 states (see Task Lifecycle)
- **Priority** (low, medium, high, critical)
- **Due date** (optional)
- **Labels/tags** (optional, multiple)
- **Creation date** (auto-generated)
- **Modified date** (auto-updated)
- **Unique ID** (via nanoid)

### Task Lifecycle (Status States)

Tasks flow through 5 states in order:

1. **BACKLOG**
   - Initial state for new tasks
   - Represents "not yet planned"
   - No active work expected

2. **TODO**
   - Tasks ready to be started
   - Planned and prioritized
   - Work can begin

3. **IN PROGRESS**
   - Task is actively being worked on
   - Only one task should be in progress at a time (optional preference)

4. **REVIEW**
   - Work is complete, needs review
   - Awaiting verification/approval
   - Last stop before completion

5. **DONE**
   - Final state
   - Task is complete
   - Archived/removed from active view

### Status Transitions
- Backlog → Todo
- Todo → In Progress
- In Progress → Review
- Review → Done
- Review → In Progress (send back for more work)
- Any state can move backward if needed (with confirmation)

### Subtasks

**Parent-Child Hierarchy**
- Tasks can have unlimited subtasks
- Subtasks are nested under parent tasks
- Visual indentation to show hierarchy
- Subtasks can have their own subtasks (multi-level nesting)

**Subtask Properties**
- Inherits all task properties from parent
- Can have independent status from parent
- Parent task status may be automatically updated based on subtask completion (optional feature)

**Subtask Interactions**
- Create subtask under parent
- Delete subtask
- Reorder subtasks via drag-drop
- Collapse/expand subtask view
- Inline editing for subtask titles

### Dependencies

**Blocking Relationships**
- Task B depends on Task A → Task B cannot move to "In Progress" until Task A is "Done"
- Dependencies are directional (one-way blocking)
- Visual indicators for blocked tasks
- Warnings when attempting to start a blocked task

**Dependency Types**
- **Finish-to-Start**: Default - dependent task cannot start until blocker is done
- Future: Consider Start-to-Start, Finish-to-Finish (optional enhancement)

**Dependency Visualization**
- Show blocking relationships in task detail view
- Badge/indicator on blocked tasks
- List of blocking tasks in task details
- List of dependent tasks in task details

**Dependency Actions**
- Add dependency to task (select from other tasks)
- Remove dependency from task
- View dependency chain (what's blocking me, what am I blocking)
- Resolve dependency conflicts

### Task Actions

**Create Task**
- Quick create button
- Full create form with all properties
- Set initial status (defaults to Backlog)
- Add to specific column (when in Kanban view)

**Edit Task**
- Inline title editing (double-click)
- Full edit modal for all properties
- Status change via dropdown or drag-drop
- Update all properties except ID

**Delete Task**
- Delete single task
- Delete with confirmation
- Cascade delete for subtasks (with option to preserve)
- Cannot delete if other tasks depend on it (with option to remove dependencies first)

**Duplicate Task**
- Create copy of existing task
- New ID generated
- Subtasks copied
- Dependencies NOT copied (must be recreated)

## Drag and Drop

**Kanban Board**
- Drag tasks between status columns
- Reorder tasks within same column
- Visual feedback during drag
- Smooth drop animations

**Task List View**
- Drag to reorder tasks
- Maintain vertical ordering
- Auto-save order changes

**Subtask Reordering**
- Drag subtasks to reorder
- Promote/demote subtask levels (optional)

**Drag States**
- Idle - normal state
- Dragging - visual indicator (elevation, opacity)
- Drop target - highlight where task will land
- Invalid drop - visual rejection

## Task Views

### Kanban Board View
- 5 columns (one per status)
- Tasks displayed as cards
- Horizontal scrolling for many tasks
- Column headers with task counts
- Add task button per column
- Drag tasks between columns

### List View
- Single column
- Tasks sorted by status (newest on top, completed at bottom)
- Expand/collapse subtasks
- Status badges visible
- Bulk actions on multiple tasks

### Task Detail View
- Full task properties display
- Subtasks list
- Dependencies list (blocking + dependent)
- History/timeline (optional)
- Action buttons (edit, delete, duplicate)

## Task Filtering & Search

**Search**
- Search by task title
- Search by description content
- Real-time filtering

**Filters**
- Filter by status
- Filter by priority
- Filter by label/tag
- Filter by due date range
- Filter by completion state (done/not done)

**Saved Filters** (optional)
- Save frequently used filter combinations
- Quick access from sidebar

## Task Metadata (Optional Future Enhancements)

**Attachments**
- Upload files to tasks
- File previews
- Download attachments

**Comments**
- Add comments to tasks
- Comments have timestamps
- Rich text comments

**Time Tracking**
- Track time spent on tasks
- Timer start/stop
- Manual time entry

**Recurring Tasks**
- Set tasks to repeat daily/weekly/etc.
- Auto-generate new tasks
- Template based

## Performance Requirements

- Support 1000+ tasks without lag
- Instant drag-drop responsiveness
- Fast search/filter (< 100ms)
- Smooth animations (60fps)
- Optimized re-renders with React
