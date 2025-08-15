'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName: string;
  onAvatarUpdate: (newAvatarUrl: string | null) => void;
  className?: string;
}

export default function AvatarUpload({
  currentAvatar,
  userName,
  onAvatarUpdate,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const initials = userName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ugyldig filtype',
        description: 'Vælg venligst en billedfil (JPG, PNG, GIF)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Filen er for stor',
        description: 'Vælg venligst en fil under 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onAvatarUpdate(data.avatarUrl);
      
      toast({
        title: 'Profilbillede opdateret',
        description: 'Dit profilbillede er blevet opdateret',
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Upload fejlede',
        description: 'Der opstod en fejl under upload af dit profilbillede',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Remove failed');
      }

      onAvatarUpdate(null);
      
      toast({
        title: 'Profilbillede fjernet',
        description: 'Dit profilbillede er blevet fjernet',
      });
    } catch (error) {
      console.error('Avatar remove error:', error);
      toast({
        title: 'Fjernelse fejlede',
        description: 'Der opstod en fejl under fjernelse af dit profilbillede',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Current Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={currentAvatar || undefined} alt={userName} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            
            {/* Camera overlay */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Upload Area */}
          <div
            className={cn(
              'w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
              isUploading && 'opacity-50 pointer-events-none'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Træk og slip et billede her, eller
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Vælg fil
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG eller GIF (maks. 5MB)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 w-full">
            {currentAvatar && (
              <Button
                variant="outline"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Fjern billede
              </Button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}