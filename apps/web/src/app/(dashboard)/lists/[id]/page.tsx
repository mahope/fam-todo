"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
// import { useRouter } from "next/navigation"; // Unused for now
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi, type List, type Task, type ShoppingItem } from "@/lib/api";
import { useRealtimeSubscription } from "@/lib/realtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ListTodo,
  ShoppingCart,
  User,
  Calendar,
} from "lucide-react";

type TaskWithUser = Task & {
  assigned_user?: { display_name: string };
};

type ShoppingItemWithCategory = ShoppingItem & {
  category_display?: string;
};

export default function ListDetailPage() {
  const params = useParams();
  // const router = useRouter(); // Unused for now
  const listId = params?.id as string;
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  // const [isAddingTask, setIsAddingTask] = useState(false); // Unused for now
  
  const api = useApi();
  const queryClient = useQueryClient();

  // Subscribe to real-time updates
  useRealtimeSubscription("tasks", undefined, api.status === "authenticated");
  useRealtimeSubscription("shopping_items", undefined, api.status === "authenticated");
  useRealtimeSubscription("lists", undefined, api.status === "authenticated");

  // Fetch list details
  const { data: list, isLoading: listLoading } = useQuery({
    queryKey: ["list", listId],
    queryFn: async () => {
      const response = await api.get<List[]>(`/lists?id=eq.${listId}&select=*`);
      return response.data?.[0];
    },
    enabled: api.status === "authenticated" && !!listId,
  });

  // Fetch tasks for regular lists
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["list-tasks", listId, filter],
    queryFn: async () => {
      let endpoint = `/tasks?list_id=eq.${listId}&select=*,assigned_user_id(display_name)&order=sort_index.asc,created_at.desc`;
      
      if (filter === "open") {
        endpoint += "&status=neq.done";
      } else if (filter === "done") {
        endpoint += "&status=eq.done";
      }
      
      const response = await api.get<TaskWithUser[]>(endpoint);
      return response.data || [];
    },
    enabled: api.status === "authenticated" && !!listId && list?.type === "generic",
  });

  // Fetch shopping items for shopping lists
  const { data: shoppingItems, isLoading: shoppingLoading } = useQuery({
    queryKey: ["shopping-items", listId],
    queryFn: async () => {
      const response = await api.get<ShoppingItemWithCategory[]>(
        `/shopping_items?list_id=eq.${listId}&select=*&order=category.asc,sort_index.asc,created_at.desc`
      );
      return response.data || [];
    },
    enabled: api.status === "authenticated" && !!listId && list?.type === "shopping",
  });

  // Add new task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!list) throw new Error("List not found");
      
      if (list.type === "generic") {
        const response = await api.post("/tasks", {
          list_id: listId,
          title: title.trim(),
          status: "open",
          priority: "none",
        });
        
        if (response.error) throw new Error(response.error);
        return response;
      } else {
        const response = await api.post("/shopping_items", {
          list_id: listId,
          name: title.trim(),
        });
        
        if (response.error) throw new Error(response.error);
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-tasks", listId] });
      queryClient.invalidateQueries({ queryKey: ["shopping-items", listId] });
      setNewTaskTitle("");
      setIsAddingTask(false);
    },
  });

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed, isShoppingItem }: { id: string; completed: boolean; isShoppingItem?: boolean }) => {
      if (isShoppingItem) {
        const response = await api.patch(`/shopping_items?id=eq.${id}`, {
          is_purchased: completed,
        });
        if (response.error) throw new Error(response.error);
        return response;
      } else {
        const response = await api.patch(`/tasks?id=eq.${id}`, {
          status: completed ? "done" : "open",
          completed_at: completed ? new Date().toISOString() : null,
        });
        if (response.error) throw new Error(response.error);
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-tasks", listId] });
      queryClient.invalidateQueries({ queryKey: ["shopping-items", listId] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async ({ id, isShoppingItem }: { id: string; isShoppingItem?: boolean }) => {
      if (isShoppingItem) {
        const response = await api.delete(`/shopping_items?id=eq.${id}`);
        if (response.error) throw new Error(response.error);
        return response;
      } else {
        const response = await api.delete(`/tasks?id=eq.${id}`);
        if (response.error) throw new Error(response.error);
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-tasks", listId] });
      queryClient.invalidateQueries({ queryKey: ["shopping-items", listId] });
    },
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTaskMutation.mutate(newTaskTitle);
  };

  const handleToggleTask = (id: string, completed: boolean, isShoppingItem = false) => {
    toggleTaskMutation.mutate({ id, completed, isShoppingItem });
  };

  const handleDeleteTask = (id: string, name: string, isShoppingItem = false) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteTaskMutation.mutate({ id, isShoppingItem });
    }
  };

  if (listLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">Loading list...</div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">List not found</h3>
              <p className="text-muted-foreground mb-4">
                The list you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button asChild>
                <Link href="/lists">Back to Lists</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isShoppingList = list.type === "shopping";
  const items = isShoppingList ? shoppingItems : tasks;
  const isLoading = isShoppingList ? shoppingLoading : tasksLoading;

  const completedItems = items?.filter((item) => 
    isShoppingList ? (item as ShoppingItemWithCategory).is_purchased : (item as TaskWithUser).status === "done"
  ) || [];
  
  const activeItems = items?.filter((item) => 
    isShoppingList ? !(item as ShoppingItemWithCategory).is_purchased : (item as TaskWithUser).status !== "done"
  ) || [];

  const filteredItems = 
    filter === "done" ? completedItems :
    filter === "open" ? activeItems : 
    items || [];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/lists">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isShoppingList ? (
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            ) : (
              <ListTodo className="h-6 w-6 text-muted-foreground" />
            )}
            <h1 className="text-2xl font-bold truncate">{list.name}</h1>
          </div>
          {list.description && (
            <p className="text-muted-foreground">{list.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/lists/${listId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{items?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total {isShoppingList ? "items" : "tasks"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{completedItems.length}</div>
            <div className="text-sm text-muted-foreground">{isShoppingList ? "Purchased" : "Completed"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{activeItems.length}</div>
            <div className="text-sm text-muted-foreground">{isShoppingList ? "To buy" : "Active"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {items?.length ? Math.round((completedItems.length / items.length) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Add new item form */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input
              placeholder={`Add a new ${isShoppingList ? "item" : "task"}...`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              disabled={addTaskMutation.isPending}
            />
            <Button 
              type="submit" 
              disabled={!newTaskTitle.trim() || addTaskMutation.isPending}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      {!isShoppingList && (
        <div className="flex gap-2 mb-4">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("all")}
          >
            All ({items?.length || 0})
          </Button>
          <Button 
            variant={filter === "open" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("open")}
          >
            Active ({activeItems.length})
          </Button>
          <Button 
            variant={filter === "done" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("done")}
          >
            Completed ({completedItems.length})
          </Button>
        </div>
      )}

      {/* Items list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="h-4 w-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded flex-1"></div>
                    <div className="h-4 w-4 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="divide-y">
              {filteredItems.map((item) => {
                const isCompleted = isShoppingList 
                  ? (item as ShoppingItemWithCategory).is_purchased 
                  : (item as TaskWithUser).status === "done";
                
                const title = isShoppingList 
                  ? (item as ShoppingItemWithCategory).name 
                  : (item as TaskWithUser).title;

                return (
                  <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-muted/50">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={(checked) => 
                        handleToggleTask(item.id, !!checked, isShoppingList)
                      }
                      disabled={toggleTaskMutation.isPending}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {title}
                      </div>
                      
                      {!isShoppingList && (item as TaskWithUser).description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {(item as TaskWithUser).description}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        {!isShoppingList && (
                          <>
                            {(item as TaskWithUser).due_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date((item as TaskWithUser).due_at!).toLocaleDateString()}
                              </div>
                            )}
                            {(item as TaskWithUser).assigned_user && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {(item as TaskWithUser).assigned_user?.display_name}
                              </div>
                            )}
                            {(item as TaskWithUser).priority !== "none" && (
                              <div className={`px-2 py-1 rounded-full text-xs ${
                                (item as TaskWithUser).priority === "high" 
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                                  : (item as TaskWithUser).priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}>
                                {(item as TaskWithUser).priority}
                              </div>
                            )}
                          </>
                        )}
                        
                        {isShoppingList && (item as ShoppingItemWithCategory).quantity && (
                          <span>
                            {(item as ShoppingItemWithCategory).quantity} {(item as ShoppingItemWithCategory).unit}
                          </span>
                        )}
                        
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/lists/${listId}/${isShoppingList ? "shopping-items" : "tasks"}/${item.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTask(item.id, title, isShoppingList)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              {isShoppingList ? (
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              ) : (
                <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              )}
              <h3 className="text-lg font-semibold mb-2">
                No {filter === "done" ? "completed" : filter === "open" ? "active" : ""} {isShoppingList ? "items" : "tasks"} yet
              </h3>
              <p className="text-muted-foreground">
                {filter === "all" 
                  ? `Add your first ${isShoppingList ? "item" : "task"} to get started`
                  : `No ${filter === "done" ? "completed" : "active"} ${isShoppingList ? "items" : "tasks"} to show`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}