"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon, ListTodo, CheckSquare, Folder } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) {
        return { tasks: [], lists: [], folders: [] };
      }

      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        return { tasks: [], lists: [], folders: [] };
      }

      const data = await response.json();
      return data || { tasks: [], lists: [], folders: [] };
    },
    enabled: !!session && searchQuery.length >= 2,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Søg</h1>
        <p className="text-muted-foreground">
          Søg i dine lister, opgaver og mapper
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Søg efter lister, opgaver eller mapper..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results */}
      {searchQuery.length >= 2 && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-muted-foreground">Søger...</div>
            </div>
          ) : (
            <>
              {/* Tasks */}
              {results?.tasks && results.tasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Opgaver ({results.tasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.tasks.map((task: any) => (
                        <Link
                          key={task.id}
                          href={`/lists/${task.listId}?task=${task.id}`}
                          className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {task.list?.name || 'Liste'}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lists */}
              {results?.lists && results.lists.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListTodo className="h-5 w-5" />
                      Lister ({results.lists.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.lists.map((list: any) => (
                        <Link
                          key={list.id}
                          href={`/lists/${list.id}`}
                          className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="font-medium">{list.name}</div>
                          {list.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {list.description}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Folders */}
              {results?.folders && results.folders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="h-5 w-5" />
                      Mapper ({results.folders.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.folders.map((folder: any) => (
                        <Link
                          key={folder.id}
                          href={`/folders/${folder.id}`}
                          className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="font-medium">{folder.name}</div>
                          {folder._count?.lists > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {folder._count.lists} lister
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Results */}
              {(!results?.tasks || results.tasks.length === 0) &&
               (!results?.lists || results.lists.length === 0) &&
               (!results?.folders || results.folders.length === 0) && (
                <div className="text-center py-12">
                  <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Ingen resultater fundet for "{searchQuery}"
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Initial State */}
      {searchQuery.length < 2 && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Indtast mindst 2 tegn for at søge
          </p>
        </div>
      )}
    </div>
  );
}
