"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ListTodo, ShoppingCart, Lock, Eye, Users } from "lucide-react";
import Link from "next/link";

const createListSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  type: z.enum(["generic", "shopping"]),
  visibility: z.enum(["private", "family", "adults"]),
  color: z.string().optional(),
});

type CreateListFormValues = z.infer<typeof createListSchema>;

const LIST_COLORS = [
  { value: "#3b82f6", name: "Blue" },
  { value: "#10b981", name: "Green" },
  { value: "#f59e0b", name: "Yellow" },
  { value: "#ef4444", name: "Red" },
  { value: "#8b5cf6", name: "Purple" },
  { value: "#06b6d4", name: "Cyan" },
  { value: "#f97316", name: "Orange" },
  { value: "#84cc16", name: "Lime" },
];

export default function NewListPage() {
  const router = useRouter();
  const api = useApi();

  const form = useForm<CreateListFormValues>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "generic",
      visibility: "family",
      color: LIST_COLORS[0].value,
    },
  });

  const createListMutation = useMutation({
    mutationFn: async (data: CreateListFormValues) => {
      const response = await api.post("/lists", {
        ...data,
        description: data.description || null,
        color: data.color || null,
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to the new list
      router.push(`/lists/${data[0]?.id || ''}`);
    },
  });

  async function onSubmit(data: CreateListFormValues) {
    createListMutation.mutate(data);
  }

  const selectedType = form.watch("type");
  const selectedVisibility = form.watch("visibility");
  const selectedColor = form.watch("color");

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/lists">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New List</h1>
          <p className="text-muted-foreground">
            Set up a new task or shopping list for your family
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>List Details</CardTitle>
          <CardDescription>
            Configure your list settings and visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Grocery List, Weekend Tasks"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a description for your list..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose list type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="generic">
                            <div className="flex items-center gap-2">
                              <ListTodo className="h-4 w-4" />
                              Task List
                            </div>
                          </SelectItem>
                          <SelectItem value="shopping">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              Shopping List
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedType === "shopping" 
                          ? "Shopping lists have smart categorization and suggestions"
                          : "Task lists are great for organizing to-dos and projects"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Who can see this list?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Private
                            </div>
                          </SelectItem>
                          <SelectItem value="family">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Family
                            </div>
                          </SelectItem>
                          <SelectItem value="adults">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Adults Only
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedVisibility === "private" && "Only you can see and edit this list"}
                        {selectedVisibility === "family" && "All family members can see and edit this list"}
                        {selectedVisibility === "adults" && "Only adult family members can see and edit this list"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Theme</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 flex-wrap">
                        {LIST_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => field.onChange(color.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                              selectedColor === color.value 
                                ? "border-foreground scale-110" 
                                : "border-muted-foreground/30"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose a color to help identify your list
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createListMutation.error && (
                <div className="text-sm text-destructive">
                  {createListMutation.error.message}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={createListMutation.isPending}
                  className="flex-1"
                >
                  {createListMutation.isPending ? "Creating..." : "Create List"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={createListMutation.isPending}
                >
                  <Link href="/lists">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}