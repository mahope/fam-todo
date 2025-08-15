'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TaskBoard from '@/components/tasks/task-board';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
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

export default function TaskBoardPage() {
  const queryClient = useQueryClient();

  // Fetch all tasks
  const { data: tasksResponse, isLoading } = useQuery({
    queryKey: ['tasks', 'board'],
    queryFn: async () => {
      const response = await fetch('/api/tasks?limit=100', {
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

  // Transform tasks to include status field (derive from completion and other factors)
  const tasks: Task[] = (tasksResponse?.tasks || []).map((task: any) => ({
    ...task,
    status: task.completed 
      ? 'DONE' 
      : task.assignee 
        ? 'IN_PROGRESS' 
        : 'TODO', // Simple status derivation
  }));

  // Handle task status/column movement
  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      // If moving to DONE, mark as completed
      if (newStatus === 'DONE') {
        updates.completed = true;
      } else if (newStatus === 'TODO' || newStatus === 'IN_PROGRESS') {
        updates.completed = false;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast.success('Opgave opdateret');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Kunne ikke opdatere opgave');
    }
  };

  // Handle task completion toggle
  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast.success(completed ? 'Opgave fuldført' : 'Opgave genåbnet');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Kunne ikke opdatere opgave');
    }
  };

  // Handle general task updates
  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast.success('Opgave opdateret');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Kunne ikke opdatere opgave');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Opgave Tavle</h1>
          <p className="text-muted-foreground">
            Træk og slip opgaver mellem kolonner for at ændre deres status
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" asChild>
            <Link href="/tasks">
              <List className="h-4 w-4 mr-2" />
              Liste visning
            </Link>
          </Button>
          <Button asChild>
            <Link href="/tasks/new">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Ny opgave
            </Link>
          </Button>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">At gøre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => t.status === 'TODO' && !t.completed).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">I gang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter(t => t.status === 'IN_PROGRESS' && !t.completed).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Færdig</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'DONE' || t.completed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Board */}
      {tasks.length > 0 ? (
        <TaskBoard
          initialTasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskComplete={handleTaskComplete}
          onTaskUpdate={handleTaskUpdate}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ingen opgaver fundet</CardTitle>
            <CardDescription>
              Opret din første opgave for at komme i gang med opgave tavlen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/tasks/new">
                Opret opgave
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}