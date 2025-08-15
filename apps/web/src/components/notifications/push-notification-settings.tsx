'use client';

import React, { useState } from 'react';
import { Bell, BellOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { toast } from 'sonner';

interface PushNotificationSettingsProps {
  className?: string;
}

export default function PushNotificationSettings({ className }: PushNotificationSettingsProps) {
  const [testLoading, setTestLoading] = useState(false);
  
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    error,
  } = usePushNotifications();

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success('Push notifikationer deaktiveret');
      } else {
        await subscribe();
        toast.success('Push notifikationer aktiveret');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Kunne ikke ændre push notification indstillinger');
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    try {
      await sendTestNotification();
      toast.success('Test notifikation sendt');
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Kunne ikke sende test notifikation');
    } finally {
      setTestLoading(false);
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: CheckCircle, color: 'text-green-600', text: 'Tilladt' };
      case 'denied':
        return { icon: AlertCircle, color: 'text-red-600', text: 'Afvist' };
      default:
        return { icon: AlertCircle, color: 'text-yellow-600', text: 'Ikke anmodet' };
    }
  };

  const permissionStatus = getPermissionStatus();
  const PermissionIcon = permissionStatus.icon;

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifikationer
          </CardTitle>
          <CardDescription>
            Modtag notifikationer om opgaver, deadlines og familie aktiviteter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Din browser understøtter ikke push notifikationer. Prøv at opdatere din browser eller brug en anden browser.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifikationer
        </CardTitle>
        <CardDescription>
          Modtag notifikationer om opgaver, deadlines og familie aktiviteter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PermissionIcon className={`h-4 w-4 ${permissionStatus.color}`} />
            <span className="text-sm font-medium">Browser tilladelse:</span>
          </div>
          <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
            {permissionStatus.text}
          </Badge>
        </div>

        {/* Subscription Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Push notifikationer</span>
              {isSubscribed && (
                <Badge variant="outline" className="text-xs">
                  Aktiv
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isSubscribed 
                ? 'Du modtager push notifikationer på denne enhed'
                : 'Aktivér for at modtage notifikationer på denne enhed'
              }
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
          />
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Der opstod en fejl'}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Notification */}
        {isSubscribed && permission === 'granted' && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Test notifikation</h4>
                <p className="text-xs text-muted-foreground">
                  Send en test notifikation for at sikre at alt virker
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                disabled={testLoading}
              >
                {testLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Send test'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Opdaterer indstillinger...
            </span>
          </div>
        )}

        {/* Help Text */}
        {permission === 'denied' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notifikationer er blokeret i din browser. Gå til browserens indstillinger for at tillade notifikationer fra denne side.
            </AlertDescription>
          </Alert>
        )}

        {/* Notification Types Info */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Du vil modtage notifikationer om:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Nye opgaver tildelt til dig</li>
            <li>• Deadlines der nærmer sig</li>
            <li>• Opgaver markeret som færdige</li>
            <li>• Nye kommentarer på dine opgaver</li>
            <li>• Familie invitationer</li>
            <li>• Ændringer i delte lister</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}