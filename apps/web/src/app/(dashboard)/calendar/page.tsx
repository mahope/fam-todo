'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CalendarView from '@/components/calendar/calendar-view';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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

export default function CalendarPage() {
  const queryClient = useQueryClient();

  // Fetch tasks with deadlines
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'calendar'],
    queryFn: async () => {
      const response = await fetch('/api/tasks?with_deadlines=true', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      return response.json();
    },
  });

  // Handle task click - shows task info (future: detailed modal or navigation)
  const handleTaskClick = (task: Task) => {
    logger.debug('Task clicked in calendar', { taskId: task.id, title: task.title });
    /* 
     * FUTURE ENHANCEMENT: Task detail interaction
     * - Open task detail modal with full information
     * - Or navigate to task edit page: /tasks/${task.id}
     * - Show quick actions: mark complete, edit, delete
     */
    toast.info(`Opgave: ${task.title}`);
  };

  // Handle date click - shows date info (future: quick task creation)
  const handleDateClick = (date: Date) => {
    logger.debug('Date clicked in calendar', { date: date.toISOString() });
    /*
     * FUTURE ENHANCEMENT: Quick task creation
     * - Open task creation modal with pre-filled deadline
     * - Allow selection of list and basic task details
     * - Provide keyboard shortcut for power users
     */
    toast.info(`Dato valgt: ${date.toLocaleDateString('da-DK')}`);
  };

  // Handle task drag and drop to change deadline
  const handleTaskDrop = async (taskId: string, newDate: Date) => {
    try {
      // Update task deadline
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deadline: newDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task deadline');
      }

      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast.success('Opgavens deadline blev opdateret');
    } catch (error) {
      logger.error('Failed to update task deadline in calendar', { error });
      toast.error('Kunne ikke opdatere opgavens deadline');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CalendarView
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onDateClick={handleDateClick}
        onTaskDrop={handleTaskDrop}
      />
    </div>
  );
}