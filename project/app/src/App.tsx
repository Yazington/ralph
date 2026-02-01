import { useEffect, useMemo, useState, type ComponentProps } from 'react'
import { Filter, LayoutGrid, List, Plus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Panel,
} from '@/components/ui/card'
import { Chip } from '@/components/ui/chip'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTaskStore } from '@/store/task-store'
import { createTasksByStatus } from '@/store/task-store.utils'
import { Priority, TaskStatus, type Task } from '@/types/tasks'

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>['variant']>

const STATUS_ORDER: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.REVIEW,
  TaskStatus.DONE,
]

const STATUS_META: Record<
  TaskStatus,
  { label: string; badgeVariant: BadgeVariant; badgeClassName?: string }
> = {
  [TaskStatus.BACKLOG]: { label: 'BACKLOG', badgeVariant: 'secondary' },
  [TaskStatus.TODO]: { label: 'TODO', badgeVariant: 'info' },
  [TaskStatus.IN_PROGRESS]: { label: 'IN PROGRESS', badgeVariant: 'warning' },
  [TaskStatus.REVIEW]: {
    label: 'REVIEW',
    badgeVariant: 'default',
    badgeClassName: 'bg-status-review text-white',
  },
  [TaskStatus.DONE]: { label: 'DONE', badgeVariant: 'success' },
}

const PRIORITY_META: Record<Priority, { label: string; badgeVariant: BadgeVariant }> = {
  [Priority.LOW]: { label: 'LOW', badgeVariant: 'secondary' },
  [Priority.MEDIUM]: { label: 'MEDIUM', badgeVariant: 'info' },
  [Priority.HIGH]: { label: 'HIGH', badgeVariant: 'warning' },
  [Priority.CRITICAL]: { label: 'CRITICAL', badgeVariant: 'destructive' },
}

const seedTasks: Task[] = [
  {
    id: 'task-001',
    title: 'ALIGN DESIGN TOKENS',
    description: 'REFINE CORE COLOR SCALES',
    status: TaskStatus.BACKLOG,
    priority: Priority.MEDIUM,
    dueDate: null,
    labels: ['DESIGN', 'TOKENS'],
    createdAt: '2026-01-31T08:00:00.000Z',
    updatedAt: '2026-01-31T08:00:00.000Z',
    parentId: null,
    dependencies: [],
    position: 0,
  },
  {
    id: 'task-002',
    title: 'DRAFT EMPTY STATES',
    description: 'OUTLINE EMPTY BOARD COPY',
    status: TaskStatus.BACKLOG,
    priority: Priority.LOW,
    dueDate: null,
    labels: ['COPY', 'UX'],
    createdAt: '2026-01-31T09:00:00.000Z',
    updatedAt: '2026-01-31T09:00:00.000Z',
    parentId: null,
    dependencies: [],
    position: 1,
  },
  {
    id: 'task-003',
    title: 'BUILD TASK CARD',
    description: 'ASSEMBLE CARD LAYOUT',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    dueDate: '2026-02-12T00:00:00.000Z',
    labels: ['UI', 'KANBAN'],
    createdAt: '2026-01-31T10:00:00.000Z',
    updatedAt: '2026-01-31T10:00:00.000Z',
    parentId: null,
    dependencies: [],
    position: 0,
  },
  {
    id: 'task-004',
    title: 'WIRE FILTER BAR',
    description: 'CONNECT SEARCH + STATUS FILTER',
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    dueDate: null,
    labels: ['FILTERS'],
    createdAt: '2026-01-31T11:00:00.000Z',
    updatedAt: '2026-01-31T11:00:00.000Z',
    parentId: null,
    dependencies: [],
    position: 1,
  },
  {
    id: 'task-005',
    title: 'INTEGRATE STATUS FLOW',
    description: 'ENFORCE STATUS TRANSITIONS',
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.CRITICAL,
    dueDate: '2026-02-08T00:00:00.000Z',
    labels: ['STATE', 'FLOW'],
    createdAt: '2026-01-31T12:00:00.000Z',
    updatedAt: '2026-01-31T12:00:00.000Z',
    parentId: null,
    dependencies: [],
    position: 0,
  },
  {
    id: 'task-006',
    title: 'REVIEW DEPENDENCY RULES',
    description: 'CHECK BLOCKING LOGIC',
    status: TaskStatus.REVIEW,
    priority: Priority.HIGH,
    dueDate: '2026-02-09T00:00:00.000Z',
    labels: ['VALIDATION'],
    createdAt: '2026-01-31T13:00:00.000Z',
    updatedAt: '2026-01-31T13:00:00.000Z',
    parentId: null,
    dependencies: [],
    position: 0,
  },
  {
    id: 'task-007',
    title: 'SHIP BASE DASHBOARD',
    description: 'LAYOUT + COMPONENTS READY',
    status: TaskStatus.DONE,
    priority: Priority.MEDIUM,
    dueDate: '2026-02-01T00:00:00.000Z',
    labels: ['FOUNDATION', 'LAYOUT'],
    createdAt: '2026-01-31T14:00:00.000Z',
    updatedAt: '2026-01-31T14:00:00.000Z',
    parentId: null,
    dependencies: [],
    position: 0,
  },
]

const formatDueDate = (dueDate: string | null) => {
  if (!dueDate) {
    return 'NO DUE DATE'
  }

  return `DUE ${dueDate.slice(0, 10)}`
}

const getActiveStatusLabel = (statusFilter: TaskStatus | 'all') => {
  if (statusFilter === 'all') {
    return 'ALL STATUSES'
  }

  return STATUS_META[statusFilter].label
}

function TaskCard({ task }: { task: Task }) {
  const statusMeta = STATUS_META[task.status]
  const priorityMeta = PRIORITY_META[task.priority]
  const labels = task.labels.length > 0 ? task.labels : ['NO LABELS']

  return (
    <Card variant="hover" padding="panel" className="gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <CardTitle className="text-sm tracking-[0.08em]">
            {task.title}
          </CardTitle>
          <CardDescription className="text-xs">
            {task.description}
          </CardDescription>
        </div>
        <Badge
          variant={statusMeta.badgeVariant}
          className={statusMeta.badgeClassName}
        >
          {statusMeta.label}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant={priorityMeta.badgeVariant}>{priorityMeta.label}</Badge>
        <span className="text-muted-foreground">
          {formatDueDate(task.dueDate)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {labels.slice(0, 3).map((label) => (
          <Chip key={label} variant="outline">
            {label.toUpperCase()}
          </Chip>
        ))}
        {labels.length > 3 && (
          <Chip variant="secondary">+{labels.length - 3}</Chip>
        )}
      </div>
    </Card>
  )
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card padding="panel" className="gap-2">
      <CardDescription className="text-xs">{label}</CardDescription>
      <div className="text-lg font-semibold tracking-[0.08em]">{value}</div>
      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
    </Card>
  )
}

function StatusColumn({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
  const statusMeta = STATUS_META[status]
  const visibleTasks = tasks.slice(0, 2)

  return (
    <Card padding="none" className="min-h-[360px] gap-4">
      <CardHeader className="border-b border-border/20">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm tracking-[0.12em]">
            {statusMeta.label}
          </CardTitle>
          <Badge variant="outline" className="border-border/40 text-muted-foreground">
            {tasks.length}
          </Badge>
        </div>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`ADD ${statusMeta.label} TASK`}
          >
            <Plus className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {visibleTasks.length > 0 ? (
          visibleTasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <Panel className="border-border/30 border-dashed bg-card/50 text-xs text-muted-foreground">
            NO TASKS IN THIS COLUMN
          </Panel>
        )}
        {tasks.length > visibleTasks.length ? (
          <Button variant="secondary" size="xs" className="w-full">
            VIEW {tasks.length - visibleTasks.length} MORE
          </Button>
        ) : null}
      </CardContent>
      <CardFooter className="border-t border-border/20">
        <Button variant="secondary" size="sm" className="w-full">
          ADD TASK
        </Button>
      </CardFooter>
    </Card>
  )
}

function App() {
  const tasks = useTaskStore((state) => state.tasks)
  const tasksByStatus = useTaskStore((state) => state.tasksByStatus)
  const setTasks = useTaskStore((state) => state.setTasks)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  useEffect(() => {
    document.title = 'RALPH TASKS'
  }, [])

  useEffect(() => {
    if (tasks.length === 0) {
      setTasks(seedTasks)
    }
  }, [setTasks, tasks.length])

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery)
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter, tasks])

  const filteredTasksByStatus = useMemo(
    () => createTasksByStatus(filteredTasks),
    [filteredTasks]
  )

  const totalTasks = tasks.length
  const doneTasks = tasksByStatus[TaskStatus.DONE]?.length ?? 0
  const inProgressTasks = tasksByStatus[TaskStatus.IN_PROGRESS]?.length ?? 0
  const dueSoonTasks = tasks.filter(
    (task) => task.dueDate && task.status !== TaskStatus.DONE
  ).length
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const activeStatusLabel = getActiveStatusLabel(statusFilter)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(19,46,44,0.55)_0%,_rgba(9,11,13,0)_55%)]"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 animate-in fade-in duration-700">
          <Panel className="flex flex-col gap-4 border-border/30 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">RALPH OS</Badge>
                <Badge variant="outline" className="border-border/40 text-muted-foreground">
                  SHOWING {filteredTasks.length} OF {totalTasks}
                </Badge>
                <span>SEED MODE ACTIVE</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-[0.2em]">
                  TASK COMMAND CENTER
                </h1>
                <p className="text-xs text-muted-foreground">
                  SHADCN/UI + ZUSTAND PREVIEW WITH LIVE FILTERS
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button>
                <Plus className="size-4" />
                NEW TASK
              </Button>
              <Button variant="secondary">IMPORT</Button>
              <Button variant="outline">SYNC</Button>
            </div>
          </Panel>
          <Panel className="grid gap-4 border-border/30 md:grid-cols-[1.6fr_1fr_1fr] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="space-y-2">
              <Label htmlFor="task-search">SEARCH</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="task-search"
                  placeholder="SEARCH TASKS"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">STATUS FILTER</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as TaskStatus | 'all')
                }
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="ALL STATUSES" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL STATUSES</SelectItem>
                  {STATUS_ORDER.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-mode">VIEW MODE</Label>
              <Select
                value={viewMode}
                onValueChange={(value) => setViewMode(value as 'kanban' | 'list')}
              >
                <SelectTrigger id="view-mode">
                  <SelectValue placeholder="KANBAN" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="size-3" />
                      KANBAN
                    </span>
                  </SelectItem>
                  <SelectItem value="list">
                    <span className="flex items-center gap-2">
                      <List className="size-3" />
                      LIST
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Panel>
        </header>
        <main className="grid gap-6 lg:grid-cols-[280px_1fr] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <aside className="flex flex-col gap-4">
            <Panel className="space-y-4 border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Filter className="size-4" />
                  QUICK STATS
                </div>
                <Badge variant="outline" className="border-border/40 text-muted-foreground">
                  {completionRate}% DONE
                </Badge>
              </div>
              <div className="grid gap-3">
                <StatTile label="TOTAL TASKS" value={`${totalTasks}`} hint="ALL STATUSES" />
                <StatTile
                  label="IN PROGRESS"
                  value={`${inProgressTasks}`}
                  hint="ACTIVE FOCUS"
                />
                <StatTile label="DONE" value={`${doneTasks}`} hint="ARCHIVED" />
                <StatTile
                  label="DUE SOON"
                  value={`${dueSoonTasks}`}
                  hint="NEEDS REVIEW"
                />
              </div>
            </Panel>
            <Panel className="space-y-3 border-border/30">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">ACTIVE FILTERS</div>
                <Badge variant="secondary">{viewMode.toUpperCase()}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip
                  variant="secondary"
                  removable
                  onRemove={() => setStatusFilter('all')}
                >
                  STATUS: {activeStatusLabel}
                </Chip>
                <Chip
                  variant="outline"
                  removable
                  onRemove={() => setQuery('')}
                >
                  QUERY: {query.trim() ? query.toUpperCase() : 'ALL'}
                </Chip>
              </div>
            </Panel>
          </aside>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {STATUS_ORDER.map((status) => (
              <StatusColumn
                key={status}
                status={status}
                tasks={filteredTasksByStatus[status] ?? []}
              />
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
