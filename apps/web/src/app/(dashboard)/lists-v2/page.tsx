'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useListsV2, useDeleteListV2, ListV2 } from '@/lib/hooks/use-lists-v2';
import SimpleListCard from '@/components/lists/simple-list-card';
import { logger } from '@/lib/logger';
import { useToast } from '@/components/ui/use-toast';

// Loading skeleton component
function ListCardSkeleton() {
  return (
    <Card className="h-full">
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

// Error component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  logger.error('ListsV2Page: Rendering error state', { error: error.message });
  
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Der opstod en fejl</h3>
          <p className="text-gray-600">
            {error.message.includes('Authentication') 
              ? 'Du er ikke logget ind. Prøv at genindlæse siden.'
              : 'Kunne ikke hente dine lister. Prøv igen.'}
          </p>
        </div>
        <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Prøv igen
        </Button>
      </div>
    </Card>
  );
}

// Empty state component
function EmptyState() {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Plus className="h-8 w-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Ingen lister endnu</h3>
          <p className="text-gray-600">
            Kom i gang ved at oprette din første liste
          </p>
        </div>
        <Button asChild>
          <Link href="/lists/new">
            <Plus className="h-4 w-4 mr-2" />
            Opret liste
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export default function ListsV2Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

  // Fetch lists using the new API
  const { 
    data: listsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useListsV2();

  // Delete mutation
  const deleteListMutation = useDeleteListV2();

  // Memoized filtered lists
  const filteredLists = useMemo(() => {
    if (!listsResponse?.lists) return [];

    let filtered = listsResponse.lists;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(list => 
        list.name.toLowerCase().includes(searchLower) ||
        list.description?.toLowerCase().includes(searchLower) ||
        list.owner.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply visibility filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(list => list.visibility === visibilityFilter);
    }

    return filtered;
  }, [listsResponse?.lists, searchTerm, visibilityFilter]);

  // Handle delete
  const handleDelete = async (listId: string) => {
    logger.info('ListsV2Page: Deleting list', { listId });
    
    try {
      await deleteListMutation.mutateAsync(listId);
      toast({
        title: 'Liste slettet',
        description: 'Listen blev slettet succesfuldt.',
      });
    } catch (error) {
      logger.error('ListsV2Page: Failed to delete list', { listId, error });
      toast({
        title: 'Fejl',
        description: 'Kunne ikke slette listen. Prøv igen.',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading) {
    logger.info('ListsV2Page: Rendering loading state');
    
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mine lister</h1>
          <p className="text-gray-600 mt-2">Henter dine lister...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ListCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mine lister</h1>
        </div>
        
        <ErrorState 
          error={error} 
          onRetry={() => {
            logger.info('ListsV2Page: Retrying after error');
            refetch();
          }} 
        />
      </div>
    );
  }

  const lists = listsResponse?.lists || [];
  const meta = listsResponse?.meta;

  logger.info('ListsV2Page: Rendering lists', { 
    totalLists: lists.length, 
    filteredLists: filteredLists.length,
    userRole: meta?.userRole 
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mine lister</h1>
            <p className="text-gray-600 mt-1">
              {meta && (
                <>
                  {lists.length} lister i alt • {meta.userRole.toLowerCase()} rolle
                </>
              )}
            </p>
          </div>
          
          <Button asChild>
            <Link href="/lists/new">
              <Plus className="h-4 w-4 mr-2" />
              Ny liste
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {lists.length > 0 && (
        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Søg i lister..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Visibility filter */}
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrer efter synlighed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle lister</SelectItem>
              <SelectItem value="PRIVATE">Private</SelectItem>
              <SelectItem value="FAMILY">Familie</SelectItem>
              <SelectItem value="ADULT">Voksne</SelectItem>
            </SelectContent>
          </Select>

          {/* Results count */}
          {(searchTerm || visibilityFilter !== 'all') && (
            <Badge variant="secondary" className="whitespace-nowrap">
              {filteredLists.length} af {lists.length}
            </Badge>
          )}
        </div>
      )}

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <EmptyState />
      ) : filteredLists.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">Ingen lister fundet</h3>
            <p className="text-gray-600 mb-4">
              Prøv at justere dine søgekriterier
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setVisibilityFilter('all');
              }}
            >
              Ryd filtre
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLists.map((list) => (
            <SimpleListCard
              key={list.id}
              list={list}
              onDelete={handleDelete}
              isDeleting={deleteListMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}