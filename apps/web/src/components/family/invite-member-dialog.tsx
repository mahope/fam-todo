"use client";

import React, { useState } from "react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Mail, Crown, ShieldCheck, Baby } from "lucide-react";

const inviteMemberSchema = z.object({
  email: z.string().email("Ugyldig email adresse").min(1, "Email er påkrævet"),
  role: z.enum(["ADMIN", "ADULT", "CHILD"]),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const api = useApi();
  const queryClient = useQueryClient();

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "ADULT",
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (data: InviteMemberFormData) => {
      const response = await fetch("/api/family/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to invite member");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
      queryClient.invalidateQueries({ queryKey: ["family-invites"] });
      form.reset();
      onOpenChange(false);
      toast.success("Invitation sendt!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  const onSubmit = (data: InviteMemberFormData) => {
    inviteMemberMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return Crown;
      case "ADULT":
        return ShieldCheck;
      case "CHILD":
        return Baby;
      default:
        return ShieldCheck;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Fuld kontrol over familien, kan invitere og administrere alle medlemmer";
      case "ADULT":
        return "Kan se og administrere family- og voksenlister, men ikke børnelister";
      case "CHILD":
        return "Kan kun se family-lister og egne private lister";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Inviter Familiemedlem
          </DialogTitle>
          <DialogDescription>
            Send en invitation til et nyt familiemedlem via email.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Adresse
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="f.eks. familie@example.com"
                      type="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Personen får en invitation på denne email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rolle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg en rolle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-600" />
                          <span>Administrator</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ADULT">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          <span>Voksen</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="CHILD">
                        <div className="flex items-center gap-2">
                          <Baby className="h-4 w-4 text-green-600" />
                          <span>Barn</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {getRoleDescription(field.value)}
                  </FormDescription>
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
                disabled={inviteMemberMutation.isPending}
              >
                {inviteMemberMutation.isPending ? "Sender..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}