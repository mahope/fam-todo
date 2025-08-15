"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Mail, 
  Clock, 
  X, 
  RefreshCw,
  Crown,
  ShieldCheck,
  Baby,
  Calendar
} from "lucide-react";

type PendingInvite = {
  id: string;
  email: string;
  role: 'ADMIN' | 'ADULT' | 'CHILD';
  expires_at: string;
  created_at: string;
  inviter: {
    displayName: string;
    email: string;
  };
  family: {
    name: string;
  };
};

export function PendingInvites() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Fetch pending invites
  const { data: invites, isLoading } = useQuery({
    queryKey: ["family-invites"],
    queryFn: async () => {
      const response = await fetch("/api/family/invites", {
        headers: {
          'Authorization': `Bearer ${api.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invites');
      }

      return response.json() as Promise<PendingInvite[]>;
    },
    enabled: api.status === "authenticated",
  });

  // Cancel invite mutation
  const cancelInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await fetch(`/api/family/invites/${inviteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${api.token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel invite');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-invites"] });
      toast.success("Invitation annulleret");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel invite");
    },
  });

  // Resend invite mutation
  const resendInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await fetch(`/api/family/invites/${inviteId}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resend invite');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-invites"] });
      toast.success("Invitation sendt igen");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to resend invite");
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return Crown;
      case 'ADULT':
        return ShieldCheck;
      case 'CHILD':
        return Baby;
      default:
        return ShieldCheck;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'ADULT':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'CHILD':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return "Administrator";
      case 'ADULT':
        return "Voksen";
      case 'CHILD':
        return "Barn";
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("da-DK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleCancelInvite = (inviteId: string) => {
    if (confirm("Er du sikker på at du vil annullere denne invitation?")) {
      cancelInviteMutation.mutate(inviteId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventende Invitationer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invites || invites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Ventende Invitationer
        </CardTitle>
        <CardDescription>
          {invites.length} invitation(er) venter på svar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invites.map((invite) => {
            const RoleIcon = getRoleIcon(invite.role);
            const expired = isExpired(invite.expires_at);
            
            return (
              <div
                key={invite.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  expired ? 'border-destructive bg-destructive/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Mail className={`h-4 w-4 ${expired ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{invite.email}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getRoleColor(invite.role)}`}
                      >
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {getRoleText(invite.role)}
                      </Badge>
                      {expired && (
                        <Badge variant="destructive" className="text-xs">
                          Udløbet
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Inviteret af {invite.inviter.displayName}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Udløber {formatDate(invite.expires_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!expired && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendInviteMutation.mutate(invite.id)}
                      disabled={resendInviteMutation.isPending}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Send igen
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelInvite(invite.id)}
                    disabled={cancelInviteMutation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}