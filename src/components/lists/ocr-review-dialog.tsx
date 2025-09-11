'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Edit2, 
  AlertCircle,
  Sparkles,
  ShoppingCart,
  ListTodo
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ParsedListItem } from '@/lib/services/ocr';

interface OCRReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ParsedListItem[];
  confidence: number;
  listType: 'TODO' | 'SHOPPING';
  onConfirm: (items: ParsedListItem[]) => void;
  onRetry: () => void;
  isProcessing?: boolean;
}

const SHOPPING_CATEGORIES = [
  'Dairy',
  'Grains',
  'Fruits',
  'Vegetables',
  'Meat & Fish',
  'Beverages',
  'Snacks',
  'Household',
  'Paper Products',
  'Other',
];

const UNITS = [
  'kg', 'g', 'mg',
  'l', 'ml',
  'oz', 'lb', 'lbs',
  'cup', 'cups',
  'tbsp', 'tsp',
  'piece', 'pieces', 'pcs',
  'pack', 'packs',
  'box', 'boxes',
  'can', 'cans',
  'bottle', 'bottles',
  'jar', 'jars',
  'bag', 'bags',
  'dozen', 'doz',
];

export function OCRReviewDialog({
  open,
  onOpenChange,
  items: initialItems,
  confidence,
  listType,
  onConfirm,
  onRetry,
  isProcessing = false,
}: OCRReviewDialogProps) {
  const [editedItems, setEditedItems] = useState<ParsedListItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newItemText, setNewItemText] = useState('');

  // Initialize edited items when dialog opens or items change
  useEffect(() => {
    if (open && initialItems.length > 0) {
      setEditedItems([...initialItems]);
      setEditingIndex(null);
    }
  }, [open, initialItems]);

  // Handle item text edit
  const handleItemEdit = (index: number, field: keyof ParsedListItem, value: any) => {
    const updated = [...editedItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setEditedItems(updated);
  };

  // Handle inline editing
  const startEditing = (index: number) => {
    setEditingIndex(index);
  };

  const stopEditing = () => {
    setEditingIndex(null);
  };

  // Remove item
  const removeItem = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  // Add new item
  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ParsedListItem = {
        text: newItemText.trim(),
        confidence: 100, // Manually added items have full confidence
      };
      setEditedItems([...editedItems, newItem]);
      setNewItemText('');
    }
  };

  // Handle confirmation
  const handleConfirm = () => {
    // Filter out empty items
    const validItems = editedItems.filter(item => item.text.trim());
    if (validItems.length > 0) {
      onConfirm(validItems);
    }
  };

  // Get confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-green-600';
    if (conf >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get confidence badge variant
  const getConfidenceBadge = (conf: number) => {
    if (conf >= 80) return 'default';
    if (conf >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {listType === 'SHOPPING' ? (
              <ShoppingCart className="h-5 w-5" />
            ) : (
              <ListTodo className="h-5 w-5" />
            )}
            Review Scanned Items
          </DialogTitle>
          <DialogDescription>
            Review and edit the items detected from your image before adding them to your list.
          </DialogDescription>
          
          {/* Overall confidence indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">OCR Confidence:</span>
            <Badge variant={getConfidenceBadge(confidence)}>
              {Math.round(confidence)}%
            </Badge>
            {confidence < 60 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                disabled={isProcessing}
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry Scan
              </Button>
            )}
          </div>
        </DialogHeader>

        <Separator />

        {/* Items list */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {editedItems.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No items detected. Try taking a clearer photo or add items manually.
                </AlertDescription>
              </Alert>
            ) : (
              editedItems.map((item, index) => (
                <div
                  key={index}
                  className="group border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  {editingIndex === index ? (
                    // Edit mode
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={item.text}
                          onChange={(e) => handleItemEdit(index, 'text', e.target.value)}
                          placeholder="Item name"
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') stopEditing();
                            if (e.key === 'Escape') {
                              setEditedItems([...initialItems]);
                              stopEditing();
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={stopEditing}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {listType === 'SHOPPING' && (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => handleItemEdit(index, 'quantity', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="Qty"
                            className="w-20"
                          />
                          <Select
                            value={item.unit || ''}
                            onValueChange={(value) => handleItemEdit(index, 'unit', value || undefined)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {UNITS.map(unit => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={item.category || ''}
                            onValueChange={(value) => handleItemEdit(index, 'category', value || undefined)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {SHOPPING_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {listType === 'SHOPPING' && item.quantity && (
                              <span className="text-muted-foreground mr-2">
                                {item.quantity} {item.unit}
                              </span>
                            )}
                            {item.text}
                          </span>
                          {item.confidence < 80 && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getConfidenceColor(item.confidence)}`}
                            >
                              {Math.round(item.confidence)}%
                            </Badge>
                          )}
                        </div>
                        {listType === 'SHOPPING' && item.category && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditing(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeItem(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Add new item */}
        <div className="flex gap-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add item manually..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <Button
            onClick={addItem}
            disabled={!newItemText.trim()}
            variant="outline"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{editedItems.length} items ready to add</span>
          {editedItems.length > 0 && (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {editedItems.filter(i => i.confidence >= 80).length} high confidence
            </span>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onRetry}
            disabled={isProcessing}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Scan
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={editedItems.length === 0 || isProcessing}
          >
            <Check className="mr-2 h-4 w-4" />
            Add {editedItems.length} Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}