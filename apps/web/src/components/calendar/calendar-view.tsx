'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, addWeeks, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { da } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  list: {
    id: string;
    name: string;
    color?: string;
  };
  assignee?: {
    id: string;
    displayName: string;
  };
}

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onDateClick?: (date: Date) => void;
  onTaskDrop?: (taskId: string, newDate: Date) => void;
}

type ViewMode = 'month' | 'week' | 'day';

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskClick,
  onDateClick,
  onTaskDrop,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Filter tasks with deadlines
  const tasksWithDeadlines = useMemo(() => 
    tasks.filter(task => task.deadline && !task.completed)
  , [tasks]);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasksWithDeadlines.filter(task => 
      task.deadline && isSameDay(parseISO(task.deadline), date)
    );
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(prev => addMonths(prev, direction === 'next' ? 1 : -1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, direction === 'next' ? 1 : -1));
        break;
      case 'day':
        setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
        break;
    }
  };

  // Get calendar title
  const getCalendarTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: da });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd. MMM', { locale: da })} - ${format(weekEnd, 'd. MMM yyyy', { locale: da })}`;
      case 'day':
        return format(currentDate, 'EEEE d. MMMM yyyy', { locale: da });
    }
  };

  // Priority colors
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedTask && onTaskDrop) {
      onTaskDrop(draggedTask, date);
    }
    setDraggedTask(null);
  };

  // Task component
  const TaskItem: React.FC<{ task: Task; compact?: boolean }> = ({ task, compact = false }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            onClick={() => onTaskClick?.(task)}
            className={cn(
              'p-1 mb-1 rounded text-xs cursor-pointer border-l-2 bg-white/80 hover:bg-white transition-colors',
              compact ? 'truncate' : 'min-h-[2rem]'
            )}
            style={{ borderLeftColor: task.list.color || '#3b82f6' }}
          >
            <div className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', getPriorityColor(task.priority))} />
              <span className={cn('text-gray-900 font-medium', compact && 'truncate')}>
                {task.title}
              </span>
            </div>
            {!compact && task.assignee && (
              <div className="flex items-center gap-1 mt-1 text-gray-600">
                <User className="w-3 h-3" />
                <span className="text-xs">{task.assignee.displayName}</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">{task.title}</div>
            {task.description && (
              <div className="text-sm text-gray-600">{task.description}</div>
            )}
            <div className="text-xs text-gray-500">
              Liste: {task.list.name}
            </div>
            {task.assignee && (
              <div className="text-xs text-gray-500">
                Tildelt: {task.assignee.displayName}
              </div>
            )}
            {task.deadline && (
              <div className="text-xs text-gray-500">
                <Clock className="w-3 h-3 inline mr-1" />
                {format(parseISO(task.deadline), 'HH:mm')}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="bg-white rounded-lg border">
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b">
          {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIndex) => 
            week.map((day, dayIndex) => {
              const dayTasks = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    'min-h-[120px] p-2 border-r border-b cursor-pointer',
                    'hover:bg-gray-50 transition-colors',
                    !isCurrentMonth && 'bg-gray-50 text-gray-400',
                    isDayToday && 'bg-blue-50'
                  )}
                  onClick={() => onDateClick?.(day)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  <div className={cn(
                    'text-sm font-medium mb-2',
                    isDayToday && 'text-blue-600'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <TaskItem key={task.id} task={task} compact />
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 p-1">
                        +{dayTasks.length - 3} flere
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="bg-white rounded-lg border">
        <div className="grid grid-cols-8 border-b">
          <div className="p-3"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-3 text-center">
              <div className="text-sm font-medium text-gray-500">
                {format(day, 'EEE', { locale: da })}
              </div>
              <div className={cn(
                'text-lg font-semibold',
                isToday(day) && 'text-blue-600'
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8">
          {/* Time slots */}
          <div className="border-r">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="h-16 p-2 border-b text-xs text-gray-500">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map(day => {
            const dayTasks = getTasksForDate(day);
            return (
              <div
                key={day.toISOString()}
                className="border-r"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="h-16 p-1 border-b hover:bg-gray-50">
                    {/* Tasks for this hour would go here */}
                  </div>
                ))}
                {/* All-day tasks */}
                <div className="absolute top-0 left-0 right-0 p-2 space-y-1">
                  {dayTasks.map(task => (
                    <TaskItem key={task.id} task={task} compact />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day view
  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);

    return (
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'EEEE d. MMMM yyyy', { locale: da })}
          </h3>
        </div>

        <div className="flex">
          {/* Time column */}
          <div className="w-20 border-r">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="h-16 p-2 border-b text-sm text-gray-500">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Task column */}
          <div 
            className="flex-1"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, currentDate)}
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="h-16 p-2 border-b hover:bg-gray-50">
                {/* Tasks for this hour would go here */}
              </div>
            ))}
            
            {/* All tasks for the day */}
            <div className="p-4 space-y-2">
              <h4 className="font-medium text-gray-700">Opgaver for dagen</h4>
              {dayTasks.length > 0 ? (
                dayTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))
              ) : (
                <p className="text-gray-500 text-sm">Ingen opgaver planlagt for denne dag</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Kalender</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {getCalendarTitle()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Måned
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Uge
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Dag
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            I dag
          </Button>
        </div>
      </div>

      {/* Calendar content */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Prioritet:</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Høj</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Lav</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Træk opgaver for at ændre deadline
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;