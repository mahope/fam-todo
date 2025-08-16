"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Folder, 
  FolderPlus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ListTodo, 
  Lock, 
  Users, 
  Eye,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { CreateFolderDialog } from "./create-folder-dialog";

type FolderType = {
  id: string;
  name: string;
  color?: string;
  visibility: 'PRIVATE' | 'FAMILY' | 'ADULTS';
  ownerId: string;
  owner: {
    id: string;
    displayName: string;
  };
  _count: {
    lists: number;
  };
  created_at: string;
  updated_at: string;
};

export function FolderList() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const api = useApi();
  const queryClient = useQueryClient();

  // Fetch folders
  const { data: folders, isLoading, error } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const response = await fetch("/api/folders", {
        headers: {
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      return response.json() as Promise<FolderType[]>;
    },
    enabled: api.status === "authenticated",
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete folder');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success("Mappe slettet successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete folder");
    },
  });

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return Lock;
      case 'ADULTS':
        return ShieldCheck;
      default:
        return Users;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case 'ADULTS':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return "Privat";
      case 'ADULTS':
        return "Kun voksne";
      default:
        return "Familie";
    }
  };

  const handleDeleteFolder = async (folder: FolderType) => {
    if (folder._count.lists > 0) {
      toast.error("Kan ikke slette mappe med lister. Flyt eller slet listerne først.");
      return;
    }

    if (confirm(`Er du sikker på at du vil slette mappen "${folder.name}"?`)) {
      deleteFolderMutation.mutate(folder.id);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-2">Fejl ved indlæsning af mapper</p>
            <p className="text-sm text-muted-foreground">
              Tjek din internetforbindelse og prøv igen
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Mapper</h2>
          <p className="text-muted-foreground">
            Organiser dine lister i mapper
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="mt-4 sm:mt-0">
          <FolderPlus className="h-4 w-4 mr-2" />
          Ny Mappe
        </Button>
      </div>

      {folders && folders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => {
            const VisibilityIcon = getVisibilityIcon(folder.visibility);
            
            return (
              <Card key={folder.id} className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Folder 
                        className="h-5 w-5 flex-shrink-0" 
                        style={{ color: folder.color || undefined }}
                      />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">
                          {folder.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Af {folder.owner.displayName}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/folders/${folder.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Rediger
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteFolder(folder)}
                          className="text-destructive"
                          disabled={folder._count.lists > 0}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Slet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Lists count */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                        <span>{folder._count.lists} lister</span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getVisibilityColor(folder.visibility)}`}
                      >
                        <VisibilityIcon className="h-3 w-3 mr-1" />
                        {getVisibilityText(folder.visibility)}
                      </Badge>
                    </div>

                    {/* View folder link */}
                    <Link 
                      href={`/folders/${folder.id}`}
                      className="block"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Se Lister
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ingen mapper endnu</h3>
              <p className="text-muted-foreground mb-6">
                Opret din første mappe for at organisere dine lister
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Opret Første Mappe
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateFolderDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}