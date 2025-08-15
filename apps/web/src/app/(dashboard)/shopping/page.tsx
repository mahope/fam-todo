"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useApi, type List } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  ShoppingCart,
  Users,
  Lock,
  Eye,
  CheckCircle,
} from "lucide-react";
import { useRealtimeSubscription } from "@/lib/realtime";
import { useTranslations } from 'next-intl';

type ShoppingListWithStats = List & {
  total_items?: number;
  purchased_items?: number;
  progress?: number;
};

export default function ShoppingPage() {
  const t = useTranslations('shopping');
  const [searchQuery, setSearchQuery] = useState("");
  
  const api = useApi();

  // Subscribe to real-time updates
  useRealtimeSubscription("shopping_items", undefined, !!api.token);
  useRealtimeSubscription("lists", undefined, !!api.token);

  // Fetch shopping lists
  const { data: lists, isLoading, error } = useQuery({
    queryKey: ["shopping-lists", searchQuery],
    queryFn: async () => {
      let endpoint = "/lists?type=eq.shopping&select=*";
      
      if (searchQuery) {
        endpoint += `&name=ilike.*${searchQuery}*`;
      }
      
      endpoint += "&order=updated_at.desc";
      
      const response = await api.get<ShoppingListWithStats[]>(endpoint);
      
      // Get item counts for each list
      if (response.data) {
        const listsWithStats = await Promise.all(
          response.data.map(async (list) => {
            // Get total items
            const totalResponse = await api.get(`/shopping_items?list_id=eq.${list.id}&select=count`);
            const totalItems = totalResponse.data?.[0]?.count || 0;

            // Get purchased items
            const purchasedResponse = await api.get(`/shopping_items?list_id=eq.${list.id}&is_purchased=eq.true&select=count`);
            const purchasedItems = purchasedResponse.data?.[0]?.count || 0;

            return {
              ...list,
              total_items: totalItems,
              purchased_items: purchasedItems,
              progress: totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0,
            };
          })
        );
        return listsWithStats;
      }
      
      return response.data || [];
    },
    enabled: !!api.token,
  });

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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            {t('title')}
          </h1>
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

      {/* Search */}
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
      </div>

      {/* Shopping Lists Grid */}
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
      ) : lists && lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => {
            const VisibilityIcon = getVisibilityIcon(list.visibility);
            const isComplete = (list.total_items || 0) > 0 && list.progress === 100;
            
            return (
              <Link key={list.id} href={`/lists/${list.id}`}>
                <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isComplete ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <ShoppingCart className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <CardTitle className={`text-lg truncate ${
                            isComplete ? "line-through text-muted-foreground" : ""
                          }`}>
                            {list.name}
                          </CardTitle>
                          {list.description && (
                            <CardDescription className="line-clamp-2 mt-1">
                              {list.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      {(list.total_items || 0) > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {list.purchased_items || 0} {t('of')} {list.total_items || 0} {t('items')}
                            </span>
                            <span className="font-medium">{list.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all duration-300"
                              style={{ width: `${list.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer Info */}
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
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noLists')}</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? t('noListsSearch') 
                  : t('noListsEmpty')}
              </p>
              <Button asChild>
                <Link href="/lists/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createShopping')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}