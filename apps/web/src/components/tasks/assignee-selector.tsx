"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Crown, ShieldCheck, Baby } from "lucide-react";

type FamilyMember = {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  role: 'ADMIN' | 'ADULT' | 'CHILD';
};

interface AssigneeSelectorProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AssigneeSelector({ 
  value, 
  onValueChange, 
  placeholder = "Vælg en person...",
  disabled = false 
}: AssigneeSelectorProps) {
  const api = useApi();

  // Fetch family members
  const { data: members, isLoading } = useQuery({
    queryKey: ["family-members"],
    queryFn: async () => {
      const response = await fetch("/api/family/members", {
        headers: {
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch family members');
      }

      return response.json() as Promise<FamilyMember[]>;
    },
    enabled: api.status === "authenticated",
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
        return User;
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
        return "Admin";
      case 'ADULT':
        return "Voksen";
      case 'CHILD':
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

  const selectedMember = members?.find(m => m.id === value);

  return (
    <Select 
      value={value || ""} 
      onValueChange={(val) => onValueChange(val === "" ? undefined : val)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {selectedMember && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedMember.avatar} alt={selectedMember.displayName} />
                <AvatarFallback className="text-xs">
                  {getInitials(selectedMember.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedMember.displayName}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getRoleColor(selectedMember.role)}`}
              >
                {React.createElement(getRoleIcon(selectedMember.role), { className: "h-3 w-3 mr-1" })}
                {getRoleText(selectedMember.role)}
              </Badge>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Ingen tildelt</span>
          </div>
        </SelectItem>
        {members?.map((member) => {
          const RoleIcon = getRoleIcon(member.role);
          
          return (
            <SelectItem key={member.id} value={member.id}>
              <div className="flex items-center gap-2 w-full">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.avatar} alt={member.displayName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(member.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{member.displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getRoleColor(member.role)}`}
                >
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {getRoleText(member.role)}
                </Badge>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}