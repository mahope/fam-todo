"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi, type Task } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm, type TaskFormData } from "@/components/tasks/task-form";
import { ArrowLeft, Edit } from "lucide-react";
import { toast } from "sonner";

type TaskWithSubtasks = Task & {
  assigneeId?: string; // Add for compatibility with form
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
};

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.id as string;
  const taskId = params?.taskId as string;
  
  const api = useApi();
  const queryClient = useQueryClient();

  // Fetch task details
  const { data: task, isLoading: taskLoading, error } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const response = await api.get(`/api/tasks/${taskId}`);

      if (response.error) {
        if (response.status === 404) {
          throw new Error('Task not found');
        }
        throw new Error('Failed to fetch task');
      }

      return response.data as TaskWithSubtasks;
    },
    enabled: api.status === "authenticated" && !!taskId,
  });

  // Fetch subtasks
  const { data: subtasks } = useQuery({
    queryKey: ["task-subtasks", taskId],
    queryFn: async () => {
      const response = await api.get(`/api/tasks/${taskId}/subtasks`);

      if (response.error) {
        return [];
      }

      return response.data;
    },
    enabled: api.status === "authenticated" && !!taskId,
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await api.patch(`/api/tasks/${taskId}`, {
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        priority: data.priority,
        deadline: data.deadline,
        tags: data.tags,
        recurrence: data.recurrence,
        // Note: Subtasks are handled separately through the subtasks API
      });

      if (response.error) {
        throw new Error(response.error || "Failed to update task");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["list-tasks", listId] });
      
      toast.success("Opgave opdateret");
      router.push(`/lists/${listId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task");
    },
  });

  const handleCancel = () => {
    router.push(`/lists/${listId}`);
  };

  const handleSubmit = (data: TaskFormData) => {
    updateTaskMutation.mutate(data);
  };

  if (taskLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Opgave ikke fundet</h1>
          <p className="text-muted-foreground mb-4">
            Opgaven eksisterer ikke eller du har ikke adgang til den.
          </p>
          <Button asChild>
            <Link href={`/lists/${listId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbage til liste
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Prepare initial data for the form
  const initialData: Partial<TaskFormData> = {
    title: task.title,
    description: task.description || "",
    assigneeId: task.assigned_user_id || undefined,
    priority: (task.priority?.toUpperCase() as "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT") || "NONE",
    deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "",
    tags: task.tags || [],
    recurrence: task.recurrence || "NONE",
    subtasks: subtasks || [],
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/lists/${listId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Edit className="h-8 w-8" />
            Rediger Opgave
          </h1>
          <p className="text-muted-foreground">
            Opdater opgavedetaljer og tildeling
          </p>
        </div>
      </div>

      {/* Task Form */}
      <Card>
        <CardHeader>
          <CardTitle>Opgave Information</CardTitle>
          <CardDescription>
            Rediger opgavens detaljer, tildeling og andre indstillinger.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateTaskMutation.isPending}
            submitLabel="Gem Ændringer"
            cancelLabel="Annuller"
          />
        </CardContent>
      </Card>
    </div>
  );
}