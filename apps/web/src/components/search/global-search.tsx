'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, FileText, CheckSquare, Folder, Clock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks/use-search';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import Link from 'next/link';

interface GlobalSearchProps {
  onClose?: () => void;
  className?: string;
}

export default function GlobalSearch({ onClose, className }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useSearch(query, {
    enabled: isOpen && query.length >= 2,
  });

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    onClose?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length >= 2 && !isOpen) {
      setIsOpen(true);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-600';
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE': return '🔒';
      case 'ADULT': return '👨‍👩‍👧‍👦';
      case 'FAMILY': return '👨‍👩‍👧‍👦';
      default: return '';
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Søg i opgaver, lister og mapper..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-[400px] overflow-hidden z-50 shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Søger...</p>
              </div>
            ) : data.total === 0 && query.length >= 2 ? (
              <div className="p-4 text-center">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Ingen resultater fundet for "{query}"</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {/* Tasks */}
                {data.tasks.length > 0 && (
                  <div className="border-b">
                    <div className="px-4 py-2 bg-gray-50 border-b">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Opgaver ({data.tasks.length})
                      </h4>
                    </div>
                    {data.tasks.map((task: any) => (
                      <Link
                        key={task.id}
                        href={`/lists/${task.listId}?task=${task.id}`}
                        onClick={handleClose}
                        className="block hover:bg-gray-50 transition-colors"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className={cn(
                                  'font-medium text-sm',
                                  task.completed && 'line-through text-gray-500'
                                )}>
                                  {task.title}
                                </span>
                                {task.priority && (
                                  <div className={cn(
                                    'w-2 h-2 rounded-full',
                                    getPriorityColor(task.priority)
                                  )} />
                                )}
                              </div>
                              <div className="text-xs text-gray-500 ml-6">
                                I {task.list.name}
                                {task.deadline && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <Clock className="inline h-3 w-3 mr-1" />
                                    {format(new Date(task.deadline), 'dd. MMM', { locale: da })}
                                  </>
                                )}
                                {task.assignee && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <User className="inline h-3 w-3 mr-1" />
                                    {task.assignee.displayName}
                                  </>
                                )}
                              </div>
                            </div>
                            {task.completed && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Færdig
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Lists */}
                {data.lists.length > 0 && (
                  <div className="border-b">
                    <div className="px-4 py-2 bg-gray-50 border-b">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Lister ({data.lists.length})
                      </h4>
                    </div>
                    {data.lists.map((list: any) => (
                      <Link
                        key={list.id}
                        href={`/lists/${list.id}`}
                        onClick={handleClose}
                        className="block hover:bg-gray-50 transition-colors"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="font-medium text-sm">{list.name}</span>
                                <span className="text-xs">{getVisibilityIcon(list.visibility)}</span>
                                {list.listType === 'SHOPPING' && (
                                  <Badge variant="outline" className="text-xs">
                                    Indkøb
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 ml-6">
                                {list._count.tasks} aktive opgaver
                                {list.folder && (
                                  <>
                                    <span className="mx-1">•</span>
                                    I {list.folder.name}
                                  </>
                                )}
                                <span className="mx-1">•</span>
                                Ejer: {list.owner.displayName}
                              </div>
                              {list.description && (
                                <p className="text-xs text-gray-400 ml-6 mt-1 line-clamp-1">
                                  {list.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Folders */}
                {data.folders.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Mapper ({data.folders.length})
                      </h4>
                    </div>
                    {data.folders.map((folder: any) => (
                      <Link
                        key={folder.id}
                        href={`/folders/${folder.id}`}
                        onClick={handleClose}
                        className="block hover:bg-gray-50 transition-colors"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Folder className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="font-medium text-sm">{folder.name}</span>
                                <span className="text-xs">{getVisibilityIcon(folder.visibility)}</span>
                              </div>
                              <div className="text-xs text-gray-500 ml-6">
                                {folder._count.lists} lister
                                <span className="mx-1">•</span>
                                Ejer: {folder.owner.displayName}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Footer */}
                {data.total > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      {data.total} resultater fundet for "{query}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}