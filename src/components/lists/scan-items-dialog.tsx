'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Check, AlertCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useScanListItems, useExtractOCR } from '@/lib/hooks/use-scan';
import { OCRReviewDialog } from './ocr-review-dialog';
import { ParsedListItem } from '@/lib/services/ocr';

interface ScanItemsDialogProps {
  listId: string;
  listType: 'TODO' | 'SHOPPING';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ScanItemsDialog({
  listId,
  listType,
  open,
  onOpenChange,
  onSuccess,
}: ScanItemsDialogProps) {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [autoCategories, setAutoCategories] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ParsedListItem[]>([]);
  const [ocrConfidence, setOcrConfidence] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { mutate: extractOCR, isPending: isExtracting } = useExtractOCR();
  const { mutate: scanItems, isPending: isSaving, isSuccess, data } = useScanListItems(listId);
  
  const isPending = isExtracting || isSaving;

  // Start camera capture
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Failed to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCapturing(false);
    }
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setImage(imageDataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle OCR extraction
  const handleExtract = () => {
    if (!image) {
      toast({
        title: 'No Image',
        description: 'Please capture or upload an image first.',
        variant: 'destructive',
      });
      return;
    }

    extractOCR(
      {
        image,
        listType,
      },
      {
        onSuccess: (result) => {
          setExtractedItems(result.items);
          setOcrConfidence(result.confidence);
          setShowReview(true);
        },
        onError: (error) => {
          toast({
            title: 'OCR Failed',
            description: error instanceof Error ? error.message : 'Failed to extract text from image',
            variant: 'destructive',
          });
        },
      }
    );
  };

  // Handle confirmed items from review
  const handleConfirmItems = (items: ParsedListItem[]) => {
    scanItems(
      {
        items,
        mode,
        autoCategories: listType === 'SHOPPING' ? autoCategories : false,
      },
      {
        onSuccess: (result) => {
          toast({
            title: 'Items Added Successfully',
            description: `Added ${result.created} items to your list.`,
          });
          setShowReview(false);
          onOpenChange(false);
          onSuccess?.();
          // Reset state
          setImage(null);
          setImageFile(null);
          setExtractedItems([]);
        },
        onError: (error) => {
          toast({
            title: 'Failed to Add Items',
            description: error instanceof Error ? error.message : 'Failed to add items to list',
            variant: 'destructive',
          });
        },
      }
    );
  };

  // Handle retry from review
  const handleRetryOCR = () => {
    setShowReview(false);
    setExtractedItems([]);
    // Re-run OCR
    handleExtract();
  };

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      stopCamera();
      setImage(null);
      setImageFile(null);
      setMode('append');
      setShowReview(false);
      setExtractedItems([]);
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan Items from Image</DialogTitle>
            <DialogDescription>
              Take a photo or upload an image of your {listType === 'SHOPPING' ? 'shopping' : 'task'} list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Camera/Image Preview */}
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              {isCapturing ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <Button
                      onClick={capturePhoto}
                      size="lg"
                      className="rounded-full"
                    >
                      <Camera className="h-6 w-6" />
                    </Button>
                  </div>
                  <Button
                    onClick={stopCamera}
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : image ? (
                <>
                  <img
                    src={image}
                    alt="Captured"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    onClick={() => {
                      setImage(null);
                      setImageFile(null);
                    }}
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {isSuccess && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <Check className="h-16 w-16 text-green-600" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
                  <div className="flex gap-4">
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      size="lg"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="lg"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Take a clear photo of your handwritten or printed list
                  </p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Options */}
            {image && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Import Mode</Label>
                  <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'append' | 'replace')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="append" id="append" />
                      <Label htmlFor="append" className="font-normal">
                        Add to existing items
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="replace" id="replace" />
                      <Label htmlFor="replace" className="font-normal">
                        Replace all items
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {listType === 'SHOPPING' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoCategories"
                      checked={autoCategories}
                      onCheckedChange={(checked) => setAutoCategories(checked as boolean)}
                    />
                    <Label htmlFor="autoCategories" className="font-normal">
                      Auto-detect categories
                    </Label>
                  </div>
                )}

                {mode === 'replace' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This will remove all existing items from your list before adding the scanned items.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Progress indicator */}
            {isExtracting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Extracting text from image...</span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <Progress value={50} className="w-full" />
              </div>
            )}
            
            {isSaving && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Adding items to list...</span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <Progress value={90} className="w-full" />
              </div>
            )}

            {/* Success message */}
            {isSuccess && data && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Successfully added {data.created} items with {Math.round(data.confidence)}% confidence
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExtract}
              disabled={!image || isPending}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Review Items
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* OCR Review Dialog */}
      <OCRReviewDialog
        open={showReview}
        onOpenChange={setShowReview}
        items={extractedItems}
        confidence={ocrConfidence}
        listType={listType}
        onConfirm={handleConfirmItems}
        onRetry={handleRetryOCR}
        isProcessing={isSaving}
      />
    </>
  );
}