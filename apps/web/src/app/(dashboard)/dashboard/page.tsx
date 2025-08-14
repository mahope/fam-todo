"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ListTodo, CheckSquare, Clock, Users, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const router = useRouter();
  const api = useApi();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch user's lists and tasks
  const { data: lists, isLoading: listsLoading } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const response = await api.get("/lists", { limit: 5 });
      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: !!session,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["recent-tasks"],
    queryFn: async () => {
      const response = await api.get("/tasks", { 
        completed: false, 
        sortBy: "deadline",
        sortOrder: "asc",
        limit: 10 
      });
      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: !!session,
  });

  const { data: completedToday, isLoading: completedTodayLoading } = useQuery({
    queryKey: ["completed-today"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get("/tasks", { 
        completed: true,
        completedAfter: `${today}T00:00:00Z`,
        completedBefore: `${today}T23:59:59Z`
      });
      return response.data?.length || 0;
    },
    enabled: !!session,
  });

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <ListTodo className="h-12 w-12 mx-auto animate-pulse" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t('welcome_back', { name: user.name?.split(' ')[0] || t('there') })}
          </h1>
          <p className="text-muted-foreground">
            {t('welcome_subtitle')}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/lists/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('new_list')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_lists')}</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listsLoading ? "..." : lists?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('active_tasks')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasksLoading ? "..." : (Array.isArray(tasks) ? tasks.filter((t: any) => !t.completed).length : 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('completed_today')}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTodayLoading ? "..." : completedToday}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('family_members')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* We'll implement family member count later */}
              1
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('upcoming_tasks')}
            </CardTitle>
            <CardDescription>
              {t('upcoming_tasks_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : tasks && Array.isArray(tasks) && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.list?.name || 'List'} • {
                          task.deadline 
                            ? new Date(task.deadline).toLocaleDateString()
                            : t('no_due_date')
                        }
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'HIGH' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : task.priority === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {task.priority?.toLowerCase() || 'low'}
                    </div>
                  </div>
                ))}
                {tasks.length > 5 && (
                  <Button variant="ghost" size="sm" asChild className="w-full mt-4">
                    <Link href="/tasks">{t('see_all_tasks')}</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">{t('no_tasks_yet')}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/lists">{t('create_first_list')}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Lists */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              {t('your_lists')}
            </CardTitle>
            <CardDescription>
              {t('recently_updated_lists')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : lists && Array.isArray(lists) && lists.length > 0 ? (
              <div className="space-y-3">
                {lists.map((list: any) => (
                  <Link 
                    key={list.id} 
                    href={`/lists/${list.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {list.listType === 'SHOPPING' ? (
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ListTodo className="h-4 w-4 text-muted-foreground" />
                        )}
                        <p className="text-sm font-medium truncate">{list.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {list.visibility === 'PRIVATE' ? t('private') : 
                         list.visibility === 'FAMILY' ? t('family') : t('adults_only')} • 
                        {new Date(list.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
                <Button variant="ghost" size="sm" asChild className="w-full mt-4">
                  <Link href="/lists">{t('see_all_lists')}</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">{t('no_lists_yet')}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/lists/new">{t('create_first_list')}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}