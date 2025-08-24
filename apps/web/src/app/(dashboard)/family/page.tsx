"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Shield, 
  User, 
  Baby,
  Settings,
  Crown,
  Mail,
  Calendar,
  Activity
} from "lucide-react";
// import { useTranslations } from 'next-intl'; // Unused for now
import { InviteMemberDialog } from "@/components/family/invite-member-dialog";
import { PendingInvites } from "@/components/family/pending-invites";

type FamilyMember = {
  id: string;
  displayName: string;
  email: string;
  role: "ADMIN" | "ADULT" | "CHILD";
  avatar?: string;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
  };
  _count: {
    ownedLists: number;
    ownedTasks: number;
    assignedTasks: number;
  };
};

type Family = {
  id: string;
  name: string;
  created_at: string;
};

export default function FamilyPage() {
  // const t = useTranslations('family'); // Unused for now
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const api = useApi();

  // Fetch family information
  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: ["family"],
    queryFn: async () => {
      const response = await api.get<Family>("/api/family");
      return response.data;
    },
    enabled: api.status === "authenticated",
  });

  // Fetch family members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["family-members"],
    queryFn: async () => {
      const response = await api.get<FamilyMember[]>("/api/family/members");
      return response.data || [];
    },
    enabled: api.status === "authenticated",
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return Crown;
      case "ADULT":
        return User;
      case "CHILD":
        return Baby;
      default:
        return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "ADULT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "CHILD":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "ADULT":
        return "Voksen";
      case "CHILD":
        return "Barn";
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("da-DK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Familie
          </h1>
          <p className="text-muted-foreground">
            Administrer familiemedlemmer og roller
          </p>
        </div>
        <Button 
          className="mt-4 sm:mt-0"
          onClick={() => setShowInviteDialog(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Inviter Medlem
        </Button>
      </div>

      {/* Family Info */}
      {familyLoading ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
          </CardContent>
        </Card>
      ) : family ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {family.name}
            </CardTitle>
            <CardDescription>
              Familie oprettet {formatDate(family.created_at)}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {/* Pending Invites */}
      <PendingInvites />

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Familiemedlemmer</CardTitle>
          <CardDescription>
            {members ? `${members.length} medlemmer i familien` : "Indlæser medlemmer..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <div className="space-y-4">
              {members.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.displayName} />
                        <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{member.displayName}</h3>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getRoleColor(member.role)}`}
                          >
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {getRoleText(member.role)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-xs text-muted-foreground space-x-4">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Tilmeldt {formatDate(member.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ingen medlemmer endnu</h3>
              <p className="text-muted-foreground mb-6">
                Inviter familiemedlemmer for at komme i gang
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Inviter Første Medlem
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteMemberDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog}
      />
    </div>
  );
}