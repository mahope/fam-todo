"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  ArrowLeft, 
  Folder, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ListTodo,
  ShoppingCart,
  Lock,
  Users,
  ShieldCheck,
  Settings,
  Filter,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
  lists: ListType[];
  _count: {
    lists: number;
  };
  created_at: string;
  updated_at: string;
};

type ListType = {
  id: string;
  name: string;
  description?: string;
  listType: 'TODO' | 'SHOPPING';
  visibility: 'PRIVATE' | 'FAMILY' | 'ADULTS';
  color?: string;
  ownerId: string;
  _count: {
    tasks: number;
  };
  created_at: string;
  updated_at: string;
};

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "TODO" | "SHOPPING">("all");
  
  const api = useApi();
  const queryClient = useQueryClient();

  // Fetch folder details
  const { data: folder, isLoading: folderLoading, error } = useQuery({
    queryKey: ["folder", folderId],
    queryFn: async () => {
      const response = await fetch(`/api/folders/${folderId}`, {
        headers: {
          'Authorization': `Bearer ${api.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Folder not found');
        }
        throw new Error('Failed to fetch folder');
      }

      return response.json() as Promise<FolderType>;
    },
    enabled: !!api.token && !!folderId,
  });

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${api.token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete list');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder", folderId] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success("Liste slettet successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete list");
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

  const handleDeleteList = async (list: ListType) => {
    if (list._count.tasks > 0) {
      toast.error("Kan ikke slette liste med opgaver. Slet opgaverne først.");
      return;
    }

    if (confirm(`Er du sikker på at du vil slette listen "${list.name}"?`)) {
      deleteListMutation.mutate(list.id);
    }
  };

  // Filter lists based on search and filter
  const filteredLists = folder?.lists?.filter(list => {
    const matchesSearch = !searchQuery || 
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === "all" || list.listType === filter;
    
    return matchesSearch && matchesFilter;
  }) || [];

  if (folderLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !folder) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Mappe ikke fundet</h1>
          <p className="text-muted-foreground mb-4">
            Mappen eksisterer ikke eller du har ikke adgang til den.
          </p>
          <Button asChild>
            <Link href="/folders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbage til mapper
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/folders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <Folder 
            className="h-8 w-8" 
            style={{ color: folder.color || undefined }}
          />
          <div>
            <h1 className="text-3xl font-bold">{folder.name}</h1>
            <p className="text-muted-foreground">
              Af {folder.owner.displayName} • {folder._count.lists} lister
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={getVisibilityColor(folder.visibility)}
          >
            {React.createElement(getVisibilityIcon(folder.visibility), { className: "h-3 w-3 mr-1" })}
            {getVisibilityText(folder.visibility)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/folders/${folder.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rediger mappe
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søg i lister..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {filter === "all" ? "Alle lister" : 
               filter === "TODO" ? "Opgavelister" : "Indkøbslister"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("all")}>
              Alle lister
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("TODO")}>
              <ListTodo className="mr-2 h-4 w-4" />
              Opgavelister
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("SHOPPING")}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Indkøbslister
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild>
          <Link href={`/lists/new?folderId=${folder.id}`}>
            <Plus className="h-4 w-4 mr-2" />
            Ny Liste
          </Link>
        </Button>
      </div>

      {/* Lists Grid */}
      {filteredLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list) => {
            const VisibilityIcon = getVisibilityIcon(list.visibility);
            
            return (
              <Link key={list.id} href={`/lists/${list.id}`}>
                <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {list.listType === 'SHOPPING' ? (
                          <ShoppingCart className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ListTodo className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg truncate">
                            {list.name}
                          </CardTitle>
                          {list.description && (
                            <CardDescription className="line-clamp-2 mt-1">
                              {list.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/lists/${list.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Rediger
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteList(list);
                            }}
                            className="text-destructive"
                            disabled={list._count.tasks > 0}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Slet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <VisibilityIcon className={`h-4 w-4 ${getVisibilityColor(list.visibility).split(' ')[0] === 'bg-red-100' ? 'text-red-600' : getVisibilityColor(list.visibility).split(' ')[0] === 'bg-orange-100' ? 'text-orange-600' : 'text-green-600'}`} />
                        <span className="capitalize">
                          {getVisibilityText(list.visibility)}
                        </span>
                      </div>
                      <span>{list._count.tasks} opgaver</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filter !== "all" 
                  ? "Ingen lister matcher dine filtre" 
                  : "Ingen lister i denne mappe"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filter !== "all"
                  ? "Prøv at justere dine søgekriterier"
                  : "Opret din første liste i denne mappe"}
              </p>
              <Button asChild>
                <Link href={`/lists/new?folderId=${folder.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Opret Liste
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}