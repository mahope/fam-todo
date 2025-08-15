"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/accessible-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Lock, Users, ShieldCheck, Palette } from "lucide-react";

const createFolderSchema = z.object({
  name: z.string().min(1, "Mappenavn er påkrævet").max(100, "Mappenavn må ikke være længere end 100 tegn"),
  visibility: z.enum(["PRIVATE", "FAMILY", "ADULTS"]),
  color: z.string().optional(),
});

type CreateFolderFormData = z.infer<typeof createFolderSchema>;

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorOptions = [
  { value: "#ef4444", name: "Rød" },
  { value: "#f97316", name: "Orange" },
  { value: "#eab308", name: "Gul" },
  { value: "#22c55e", name: "Grøn" },
  { value: "#3b82f6", name: "Blå" },
  { value: "#8b5cf6", name: "Lilla" },
  { value: "#ec4899", name: "Pink" },
  { value: "#6b7280", name: "Grå" },
];

export function CreateFolderDialog({ open, onOpenChange }: CreateFolderDialogProps) {
  const api = useApi();
  const queryClient = useQueryClient();

  const form = useForm<CreateFolderFormData>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: "",
      visibility: "FAMILY",
      color: "",
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: CreateFolderFormData) => {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${api.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create folder");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      form.reset();
      onOpenChange(false);
      toast.success("Mappe oprettet successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create folder");
    },
  });

  const onSubmit = (data: CreateFolderFormData) => {
    createFolderMutation.mutate(data);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PRIVATE":
        return Lock;
      case "ADULTS":
        return ShieldCheck;
      default:
        return Users;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opret Ny Mappe</DialogTitle>
          <DialogDescription>
            Organiser dine lister ved at oprette en ny mappe.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mappenavn</FormLabel>
                  <FormControl>
                    <Input placeholder="Indtast mappenavn..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Synlighed</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg hvem der kan se mappen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRIVATE">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Privat - Kun mig</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="FAMILY">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Familie - Alle familiemedlemmer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ADULTS">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Kun voksne - Voksne og administratorer</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farve (valgfri)</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={field.value === "" ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange("")}
                      className="h-8"
                    >
                      <Palette className="h-3 w-3 mr-1" />
                      Standard
                    </Button>
                    {colorOptions.map((color) => (
                      <Button
                        key={color.value}
                        type="button"
                        variant={field.value === color.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(color.value)}
                        className="h-8 w-8 p-0"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Annuller
              </Button>
              <Button 
                type="submit" 
                disabled={createFolderMutation.isPending}
              >
                {createFolderMutation.isPending ? "Opretter..." : "Opret Mappe"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}