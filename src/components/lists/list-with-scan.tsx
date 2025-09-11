'use client';

import React, { useState } from 'react';
import { ScanLine, Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ScanItemsDialog } from './scan-items-dialog';
import { useList } from '@/lib/hooks/use-lists';
import { Skeleton } from '@/components/ui/skeleton';

interface ListWithScanProps {
  listId: string;
}

export function ListWithScan({ listId }: ListWithScanProps) {
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const { data: list, isLoading, refetch } = useList(listId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!list) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">List not found</p>
        </CardContent>
      </Card>
    );
  }

  const items = list.listType === 'SHOPPING' ? list.shoppingItems : list.tasks;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{list.name}</CardTitle>
              <CardDescription className="mt-1">
                {list.description || `${list.listType === 'SHOPPING' ? 'Shopping' : 'Task'} list`}
              </CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{list.listType}</Badge>
                <Badge variant="secondary">{list.visibility}</Badge>
                {list.folder && (
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: list.folder.color || undefined,
                      color: list.folder.color || undefined
                    }}
                  >
                    {list.folder.name}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScanDialogOpen(true)}
                className="gap-2"
              >
                <ScanLine className="h-4 w-4" />
                Scan Items
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit List
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item Manually
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{items.length} items</span>
              {list.listType === 'SHOPPING' && (
                <span>
                  {list.shoppingItems.filter(i => !i.purchased).length} remaining
                </span>
              )}
              {list.listType === 'TODO' && (
                <span>
                  {list.tasks.filter(t => !t.completed).length} pending
                </span>
              )}
            </div>
            
            <Separator />
            
            {/* Items List */}
            <ScrollArea className="h-[400px] pr-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No items in this list yet
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setScanDialogOpen(true)}
                    className="gap-2"
                  >
                    <ScanLine className="h-4 w-4" />
                    Scan Items from Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {list.listType === 'SHOPPING' ? (
                    // Shopping Items
                    list.shoppingItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={item.purchased}
                          className="h-5 w-5"
                        />
                        <div className="flex-1">
                          <p className={item.purchased ? 'line-through text-muted-foreground' : ''}>
                            {item.quantity && (
                              <span className="font-medium mr-2">
                                {item.quantity} {item.unit}
                              </span>
                            )}
                            {item.name}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Tasks
                    list.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={task.completed}
                          className="h-5 w-5 mt-0.5"
                        />
                        <div className="flex-1">
                          <p className={task.completed ? 'line-through text-muted-foreground' : ''}>
                            {task.title}
                          </p>
                          {task.deadline && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </p>
                          )}
                          {task.priority && task.priority !== 'MEDIUM' && (
                            <Badge
                              variant={task.priority === 'URGENT' ? 'destructive' : 'secondary'}
                              className="mt-1"
                            >
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </ScrollArea>
            
            {/* Quick Actions */}
            {items.length > 0 && (
              <>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScanDialogOpen(true)}
                    className="gap-2"
                  >
                    <ScanLine className="h-4 w-4" />
                    Add from Photo
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scan Dialog */}
      <ScanItemsDialog
        listId={listId}
        listType={list.listType}
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onSuccess={() => refetch()}
      />
    </>
  );
}