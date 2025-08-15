'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  X,
  CheckCircle,
  Info
} from 'lucide-react';
import { pwaInstallManager, networkManager, appUpdateManager } from '@/lib/pwa/pwa-utils';

export function InstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Initial state
    setCanInstall(pwaInstallManager.canInstall);
    setIsInstalled(pwaInstallManager.isInstalled);
    setIsStandalone(pwaInstallManager.isStandalone);

    // Don't show if already installed or in standalone mode
    setShowPrompt(pwaInstallManager.canInstall && !pwaInstallManager.isInstalled);

    // Listen for changes
    const unsubscribe = pwaInstallManager.addListener(() => {
      setCanInstall(pwaInstallManager.canInstall);
      setIsInstalled(pwaInstallManager.isInstalled);
      setIsStandalone(pwaInstallManager.isStandalone);
      setShowPrompt(pwaInstallManager.canInstall && !pwaInstallManager.isInstalled);
    });

    return unsubscribe;
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const success = await pwaInstallManager.showInstallPrompt();
      if (success) {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if dismissed recently (within 7 days)
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  if (!showPrompt || isInstalled || isStandalone) {
    return null;
  }

  return (
    <Card className="m-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Installer FamTodo</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Få en bedre oplevelse med FamTodo som app på din enhed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-green-600" />
              <span>Virker offline</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span>Native app følelse</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-green-600" />
              <span>Automatisk sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Push notifikationer</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleInstall} disabled={installing} className="flex-1">
              {installing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Installerer...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Installer App
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Ikke nu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionInfo, setConnectionInfo] = useState<{
    connectionType: string;
    effectiveType: string;
  }>({ connectionType: 'unknown', effectiveType: 'unknown' });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const status = networkManager.getNetworkStatus();
      setIsOnline(status.isOnline);
      setConnectionInfo({
        connectionType: status.connectionType,
        effectiveType: status.effectiveType,
      });
    };

    updateNetworkStatus();

    const unsubscribe = networkManager.addListener((online) => {
      setIsOnline(online);
      updateNetworkStatus();
    });

    return unsubscribe;
  }, []);

  if (isOnline) {
    return null; // Don't show when online
  }

  return (
    <Alert className="m-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span>Du er offline. Dine ændringer vil blive synkroniseret når du kommer online igen.</span>
          <Badge variant="outline" className="ml-2">
            Offline mode
          </Badge>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function UpdateAvailable() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setUpdateAvailable(appUpdateManager.isUpdateAvailable());

    const unsubscribe = appUpdateManager.addListener((available) => {
      setUpdateAvailable(available);
    });

    return unsubscribe;
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await appUpdateManager.applyUpdate();
    } catch (error) {
      console.error('Update failed:', error);
      setUpdating(false);
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <Alert className="m-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <RefreshCw className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span>En ny version af FamTodo er tilgængelig!</span>
          <Button 
            size="sm" 
            onClick={handleUpdate} 
            disabled={updating}
            className="ml-2"
          >
            {updating ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Opdaterer...
              </>
            ) : (
              'Opdater nu'
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function PWAStatus() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsStandalone(pwaInstallManager.isStandalone);
    setIsInstalled(pwaInstallManager.isInstalled);

    const unsubscribe = pwaInstallManager.addListener(() => {
      setIsStandalone(pwaInstallManager.isStandalone);
      setIsInstalled(pwaInstallManager.isInstalled);
    });

    return unsubscribe;
  }, []);

  if (!isStandalone && !isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="default" className="bg-green-600 text-white">
        <CheckCircle className="h-3 w-3 mr-1" />
        App Mode
      </Badge>
    </div>
  );
}