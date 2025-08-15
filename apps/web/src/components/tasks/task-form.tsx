"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AssigneeSelector } from "./assignee-selector";
import { 
  Calendar,
  Clock,
  Flag,
  Tag,
  User,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Circle
} from "lucide-react";

const taskFormSchema = z.object({
  title: z.string().min(1, "Titel er påkrævet").max(200, "Titel må ikke være længere end 200 tegn"),
  description: z.string().max(1000, "Beskrivelse må ikke være længere end 1000 tegn").optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]).default("NONE"),
  deadline: z.string().optional(),
  tags: z.array(z.string()).default([]),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).default("NONE"),
  subtasks: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Subtask titel er påkrævet"),
    completed: z.boolean().default(false),
  })).default([]),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Gem",
  cancelLabel = "Annuller"
}: TaskFormProps) {
  const [newTag, setNewTag] = useState("");
  const [newSubtask, setNewSubtask] = useState("");

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assigneeId: undefined,
      priority: "NONE",
      deadline: "",
      tags: [],
      recurrence: "NONE",
      subtasks: [],
      ...initialData,
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    // Remove empty tags and subtasks
    const cleanedData = {
      ...data,
      tags: data.tags.filter(tag => tag.trim().length > 0),
      subtasks: data.subtasks.filter(subtask => subtask.title.trim().length > 0),
      deadline: data.deadline && data.deadline.trim() ? data.deadline : undefined,
    };
    onSubmit(cleanedData);
  };

  const addTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const currentSubtasks = form.getValues("subtasks");
      form.setValue("subtasks", [
        ...currentSubtasks,
        {
          id: `temp-${Date.now()}`,
          title: newSubtask.trim(),
          completed: false,
        }
      ]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    const currentSubtasks = form.getValues("subtasks");
    form.setValue("subtasks", currentSubtasks.filter((_, i) => i !== index));
  };

  const toggleSubtask = (index: number) => {
    const currentSubtasks = form.getValues("subtasks");
    const updatedSubtasks = currentSubtasks.map((subtask, i) => 
      i === index ? { ...subtask, completed: !subtask.completed } : subtask
    );
    form.setValue("subtasks", updatedSubtasks);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return AlertCircle;
      case "HIGH":
        return Flag;
      case "MEDIUM":
        return Circle;
      case "LOW":
        return Circle;
      default:
        return Circle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600";
      case "HIGH":
        return "text-orange-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Hvad skal der gøres?"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tilføj flere detaljer..."
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assignee */}
          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <User className="h-4 w-4 inline mr-1" />
                  Tildelt til
                </FormLabel>
                <FormControl>
                  <AssigneeSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Vælg person..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Flag className="h-4 w-4 inline mr-1" />
                  Prioritet
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg prioritet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      { value: "NONE", label: "Ingen", color: "text-gray-600" },
                      { value: "LOW", label: "Lav", color: "text-blue-600" },
                      { value: "MEDIUM", label: "Medium", color: "text-yellow-600" },
                      { value: "HIGH", label: "Høj", color: "text-orange-600" },
                      { value: "URGENT", label: "Akut", color: "text-red-600" },
                    ].map(priority => {
                      const Icon = getPriorityIcon(priority.value);
                      return (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${priority.color}`} />
                            <span>{priority.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deadline */}
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Deadline
                </FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Valgfri deadline for opgaven
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recurrence */}
          <FormField
            control={form.control}
            name="recurrence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Clock className="h-4 w-4 inline mr-1" />
                  Gentagelse
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg gentagelse" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NONE">Ingen gentagelse</SelectItem>
                    <SelectItem value="DAILY">Dagligt</SelectItem>
                    <SelectItem value="WEEKLY">Ugentligt</SelectItem>
                    <SelectItem value="MONTHLY">Månedligt</SelectItem>
                    <SelectItem value="YEARLY">Årligt</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Tag className="h-4 w-4 inline mr-1" />
                Tags
              </FormLabel>
              <div className="space-y-2">
                {field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Tilføj tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <FormDescription>
                Tryk Enter eller klik + for at tilføje et tag
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subtasks */}
        <FormField
          control={form.control}
          name="subtasks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                Underopgaver
              </FormLabel>
              <div className="space-y-2">
                {field.value.length > 0 && (
                  <div className="space-y-2">
                    {field.value.map((subtask, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => toggleSubtask(index)}
                        />
                        <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {subtask.title}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubtask(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Tilføj underopgave..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtask();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSubtask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <FormDescription>
                Opdel store opgaver i mindre dele
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit buttons */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Gemmer..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}