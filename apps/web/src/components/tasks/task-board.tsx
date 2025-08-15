'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  User, 
  Plus, 
  MoreHorizontal,
  AlertCircle 
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee?: {
    id: string;
    displayName: string;
  };
  list: {
    id: string;
    name: string;
    color?: string;
  };
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

interface TaskBoardProps {
  initialTasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskMove?: (taskId: string, newStatus: string) => void;
  onTaskComplete?: (taskId: string, completed: boolean) => void;
}

// Sortable Task Item Component
function SortableTaskItem({ task, onTaskUpdate, onTaskComplete }: {
  task: Task;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskComplete?: (taskId: string, completed: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-red-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    if (isPast(deadlineDate) && !task.completed) {
      return { color: 'text-red-600', label: 'Overskredet' };
    }
    if (isToday(deadlineDate)) {
      return { color: 'text-yellow-600', label: 'I dag' };
    }
    return { color: 'text-gray-600', label: format(deadlineDate, 'dd. MMM', { locale: da }) };
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const deadlineStatus = getDeadlineStatus(task.deadline);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50'
      )}
      {...attributes}
      {...listeners}
    >
      <Card className="mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
        <CardContent className="p-4">
          {/* Header with priority and completion */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => onTaskComplete?.(task.id, Boolean(checked))}
                className="mt-1"
              />
              <Badge className={cn('text-xs', getPriorityColor(task.priority))}>
                {task.priority?.toLowerCase() || 'low'}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Task title and description */}
          <div className="mb-3">
            <h4 className={cn(
              'font-medium text-sm leading-snug',
              task.completed && 'line-through text-gray-500'
            )}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Subtasks progress */}
          {totalSubtasks > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckSquare className="h-3 w-3" />
                <span>{completedSubtasks}/{totalSubtasks} underopgaver</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer with deadline and assignee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {deadlineStatus && (
                <div className={cn('flex items-center gap-1 text-xs', deadlineStatus.color)}>
                  {isPast(new Date(task.deadline!)) && !task.completed && (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  <Calendar className="h-3 w-3" />
                  <span>{deadlineStatus.label}</span>
                </div>
              )}
            </div>
            {task.assignee && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span>{task.assignee.displayName}</span>
              </div>
            )}
          </div>

          {/* List indicator */}
          <div 
            className="mt-2 h-1 rounded"
            style={{ backgroundColor: task.list.color || '#3b82f6' }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Droppable Column Component
function TaskColumn({ column, onTaskMove }: {
  column: Column;
  onTaskMove?: (taskId: string, newStatus: string) => void;
}) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  return (
    <div className="flex-1 min-w-[300px]">
      <Card className={cn(
        'h-full',
        isDraggedOver && 'bg-blue-50 border-blue-300'
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span className="text-sm font-medium">{column.title}</span>
              <Badge variant="outline" className="text-xs">
                {column.tasks.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <SortableContext
            items={column.tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-[200px] space-y-2">
              {column.tasks.map(task => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onTaskComplete={(taskId, completed) => {
                    // Handle task completion
                    console.log('Complete task:', taskId, completed);
                  }}
                  onTaskUpdate={(taskId, updates) => {
                    // Handle task updates
                    console.log('Update task:', taskId, updates);
                  }}
                />
              ))}
              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-xs">Ingen opgaver</div>
                  <div className="text-xs">Træk en opgave hertil</div>
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TaskBoard({ 
  initialTasks, 
  onTaskUpdate, 
  onTaskMove, 
  onTaskComplete 
}: TaskBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
  // Group tasks by status into columns
  const columns: Column[] = [
    {
      id: 'TODO',
      title: 'At gøre',
      color: '#ef4444',
      tasks: initialTasks.filter(task => task.status === 'TODO' && !task.completed),
    },
    {
      id: 'IN_PROGRESS',
      title: 'I gang',
      color: '#f59e0b',
      tasks: initialTasks.filter(task => task.status === 'IN_PROGRESS' && !task.completed),
    },
    {
      id: 'DONE',
      title: 'Færdig',
      color: '#10b981',
      tasks: initialTasks.filter(task => task.status === 'DONE' || task.completed),
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findTaskById = (id: string): Task | undefined => {
    return initialTasks.find(task => task.id === id);
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event: DragOverEvent) {
    // Handle drag over logic if needed
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find which column the task is being dropped into
    const activeTask = findTaskById(String(activeId));
    if (!activeTask) return;

    // Determine new status based on drop target
    let newStatus: string;
    if (typeof overId === 'string' && ['TODO', 'IN_PROGRESS', 'DONE'].includes(overId)) {
      newStatus = overId;
    } else {
      // Find the column that contains the drop target
      const targetColumn = columns.find(col => 
        col.id === overId || col.tasks.some(task => task.id === overId)
      );
      if (!targetColumn) return;
      newStatus = targetColumn.id;
    }

    // Only update if status actually changed
    if (activeTask.status !== newStatus) {
      onTaskMove?.(String(activeId), newStatus);
    }
  }

  const activeTask = activeId ? findTaskById(String(activeId)) : null;

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              onTaskMove={onTaskMove}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="opacity-90">
              <SortableTaskItem
                task={activeTask}
                onTaskUpdate={onTaskUpdate}
                onTaskComplete={onTaskComplete}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}