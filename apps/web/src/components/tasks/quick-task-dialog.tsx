"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/accessible-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssigneeSelector } from "./assignee-selector";
import { toast } from "sonner";
import { ListTodo, ShoppingCart, Plus } from "lucide-react";

interface QuickTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId?: string;
}

type List = {
  id: string;
  name: string;
  listType: 'TODO' | 'SHOPPING';
  visibility: 'PRIVATE' | 'FAMILY' | 'ADULTS';
};

export function QuickTaskDialog({ open, onOpenChange, listId }: QuickTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedListId, setSelectedListId] = useState(listId || "");
  const [assigneeId, setAssigneeId] = useState<string | undefined>();
  
  const api = useApi();
  const queryClient = useQueryClient();

  // Fetch lists if no specific list is provided
  const { data: lists } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const response = await fetch("/api/lists", {
        headers: {
          'Authorization': `Bearer ${api.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }

      return response.json() as Promise<List[]>;
    },
    enabled: api.status === "authenticated" && !listId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; listId: string; assigneeId?: string }) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${api.token}`,
        },
        body: JSON.stringify({
          title: data.title,
          listId: data.listId,
          assigneeId: data.assigneeId,
          priority: "NONE",
          completed: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["list-tasks"] });
      
      // Reset form
      setTitle("");
      setAssigneeId(undefined);
      if (!listId) setSelectedListId("");
      
      onOpenChange(false);
      toast.success("Opgave oprettet");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Titel er påkrævet");
      return;
    }

    const targetListId = listId || selectedListId;
    if (!targetListId) {
      toast.error("Vælg en liste");
      return;
    }

    createTaskMutation.mutate({
      title: title.trim(),
      listId: targetListId,
      assigneeId,
    });
  };

  const handleClose = () => {
    setTitle("");
    setAssigneeId(undefined);
    if (!listId) setSelectedListId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hurtig Opgave</DialogTitle>
          <DialogDescription>
            Opret en ny opgave hurtigt med de vigtigste detaljer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              placeholder="Hvad skal der gøres?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* List selection (only if no specific list provided) */}
          {!listId && (
            <div className="space-y-2">
              <Label>Liste *</Label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger>
                  <SelectValue placeholder="Vælg en liste..." />
                </SelectTrigger>
                <SelectContent>
                  {lists?.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <div className="flex items-center gap-2">
                        {list.listType === 'SHOPPING' ? (
                          <ShoppingCart className="h-4 w-4" />
                        ) : (
                          <ListTodo className="h-4 w-4" />
                        )}
                        <span>{list.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({list.visibility.toLowerCase()})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Tildelt til</Label>
            <AssigneeSelector
              value={assigneeId}
              onValueChange={setAssigneeId}
              placeholder="Vælg person (valgfri)..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuller
            </Button>
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending || !title.trim()}
            >
              {createTaskMutation.isPending ? (
                "Opretter..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Opret
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}