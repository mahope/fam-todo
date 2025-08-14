"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi, type List } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ListTodo, 
  ShoppingCart,
  Users,
  Lock,
  Eye,
  Filter,
} from "lucide-react";
import { useTranslations } from 'next-intl';

type ListWithTasks = List & {
  task_count?: number;
  incomplete_count?: number;
};

export default function ListsPage() {
  const t = useTranslations('lists');
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "generic" | "shopping">("all");
  const [visibility, setVisibility] = useState<"all" | "private" | "family" | "adults">("all");
  
  const api = useApi();
  const queryClient = useQueryClient();

  // Fetch lists with task counts
  const { data: lists, isLoading, error } = useQuery({
    queryKey: ["lists", searchQuery, filter, visibility],
    queryFn: async () => {
      let endpoint = "/lists?select=*";
      
      // Add filters
      if (filter !== "all") {
        endpoint += `&type=eq.${filter}`;
      }
      
      if (visibility !== "all") {
        endpoint += `&visibility=eq.${visibility}`;
      }
      
      if (searchQuery) {
        endpoint += `&name=ilike.*${searchQuery}*`;
      }
      
      endpoint += "&order=updated_at.desc";
      
      const response = await api.get<ListWithTasks[]>(endpoint);
      return response.data || [];
    },
    enabled: !!api.token,
  });

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      const response = await api.delete(`/lists?id=eq.${listId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  const handleDeleteList = async (listId: string, listName: string) => {
    if (window.confirm(t('deleteConfirm', { name: listName }))) {
      deleteListMutation.mutate(listId);
    }
  };

  const getListIcon = (type: string) => {
    return type === "shopping" ? ShoppingCart : ListTodo;
  };

  const getVisibilityIcon = (vis: string) => {
    switch (vis) {
      case "private":
        return Lock;
      case "adults":
        return Users;
      default:
        return Eye;
    }
  };

  const getVisibilityColor = (vis: string) => {
    switch (vis) {
      case "private":
        return "text-red-600 dark:text-red-400";
      case "adults":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  const filteredLists = lists || [];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link href="/lists/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('createNew')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t('type')}: {filter === "all" ? t('all') : filter === "generic" ? t('tasks') : t('shopping')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("all")}>
                {t('allTypes')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("generic")}>
                <ListTodo className="h-4 w-4 mr-2" />
                {t('taskLists')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("shopping")}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('shoppingLists')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                {visibility === "all" ? t('all') : 
                 visibility === "private" ? t('private') :
                 visibility === "family" ? t('family') : t('adultsOnly')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setVisibility("all")}>
                {t('allLists')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVisibility("private")}>
                <Lock className="h-4 w-4 mr-2" />
                {t('private')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVisibility("family")}>
                <Eye className="h-4 w-4 mr-2" />
                {t('family')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVisibility("adults")}>
                <Users className="h-4 w-4 mr-2" />
                {t('adultsOnly')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Lists Grid */}
      {isLoading ? (
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
      ) : error ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive mb-2">{t('errorLoading')}</p>
              <p className="text-sm text-muted-foreground">
                {t('checkConnection')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filteredLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list) => {
            const ListIcon = getListIcon(list.type);
            const VisibilityIcon = getVisibilityIcon(list.visibility);
            
            return (
              <Card key={list.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ListIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">
                          <Link 
                            href={`/lists/${list.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {list.name}
                          </Link>
                        </CardTitle>
                        {list.description && (
                          <CardDescription className="line-clamp-2 mt-1">
                            {list.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/lists/${list.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('edit')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteList(list.id, list.name)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <VisibilityIcon className={`h-4 w-4 ${getVisibilityColor(list.visibility)}`} />
                      <span className="capitalize">
                        {list.visibility === 'private' ? t('private') :
                         list.visibility === 'family' ? t('family') :
                         list.visibility === 'adults' ? t('adultsOnly') : list.visibility}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{new Date(list.updated_at).toLocaleDateString()}</span>
                    </div>
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
              <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noLists')}</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filter !== "all" || visibility !== "all" 
                  ? t('noListsSearch') 
                  : t('noListsEmpty')}
              </p>
              <Button asChild>
                <Link href="/lists/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createList')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}