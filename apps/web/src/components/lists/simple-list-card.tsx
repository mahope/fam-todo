'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Eye, EyeOff, Users, Trash2, Edit } from 'lucide-react';
import { ListV2 } from '@/lib/hooks/use-lists-v2';
import { logger } from '@/lib/logger';

interface SimpleListCardProps {
  list: ListV2;
  onDelete?: (listId: string) => void;
  isDeleting?: boolean;
}

const VISIBILITY_CONFIG = {
  PRIVATE: {
    icon: Eye,
    label: 'Privat',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  FAMILY: {
    icon: Users,
    label: 'Familie',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  ADULT: {
    icon: EyeOff,
    label: 'Voksne',
    className: 'bg-orange-100 text-orange-800 border-orange-200'
  }
} as const;

export default function SimpleListCard({ list, onDelete, isDeleting = false }: SimpleListCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    logger.info('SimpleListCard: Delete button clicked', { listId: list.id });
    setShowDeleteDialog(false);
    onDelete?.(list.id);
  };

  const visibilityConfig = VISIBILITY_CONFIG[list.visibility];
  const VisibilityIcon = visibilityConfig.icon;

  return (
    <>
      <Card className="h-full transition-all duration-200 hover:shadow-md group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* List Name */}
              <Link 
                href={`/lists/${list.id}`}
                className="block group-hover:text-blue-600 transition-colors"
              >
                <h3 className="font-semibold text-lg leading-tight truncate">
                  {list.name}
                </h3>
              </Link>
              
              {/* List Description */}
              {list.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {list.description}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            {(list.canEdit || list.canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {list.canEdit && (
                    <DropdownMenuItem asChild>
                      <Link href={`/lists/${list.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Rediger
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {list.canDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Slet
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {/* Visibility Badge */}
            <Badge 
              variant="outline" 
              className={`${visibilityConfig.className} text-xs flex items-center gap-1`}
            >
              <VisibilityIcon className="h-3 w-3" />
              {visibilityConfig.label}
            </Badge>

            {/* Task Count */}
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <span className="font-medium">{list.taskCount}</span>
              <span>opgaver</span>
            </div>
          </div>

          {/* Folder Info */}
          {list.folder && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: list.folder.color || '#6b7280' }}
                />
                <span className="text-sm text-gray-600 truncate">
                  {list.folder.name}
                </span>
              </div>
            </div>
          )}

          {/* Owner Info */}
          {!list.isOwner && list.owner && (
            <div className="mt-2 text-xs text-gray-500">
              Ejes af {list.owner.name || list.owner.email}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slet liste</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på, at du vil slette listen &quot;{list.name}&quot;? 
              Denne handling kan ikke fortrydes, og alle opgaver i listen vil også blive slettet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuller</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Sletter...' : 'Slet liste'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}