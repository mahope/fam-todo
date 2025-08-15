"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import * as z from "zod";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  Database,
  Download,
  Trash2,
  Shield,
  Smartphone,
  Mail,
  Save
} from "lucide-react";
import { toast } from "sonner";
import PushNotificationSettings from "@/components/notifications/push-notification-settings";

const settingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  task_reminders: z.boolean(),
  deadline_alerts: z.boolean(),
  family_updates: z.boolean(),
  default_list_visibility: z.enum(["private", "family", "adults"]),
  timezone: z.string(),
  date_format: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const api = useApi();
  const queryClient = useQueryClient();

  // Mock settings data - in a real app this would come from the API
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      // This would be a real API call
      return {
        email_notifications: true,
        push_notifications: false,
        task_reminders: true,
        deadline_alerts: true,
        family_updates: true,
        default_list_visibility: "family" as const,
        timezone: "Europe/Copenhagen",
        date_format: "DD/MM/YYYY" as const,
      };
    },
    enabled: !!api.token,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: userSettings,
  });

  // Update form when settings load
  if (userSettings && form.getValues().timezone === undefined) {
    form.reset(userSettings);
  }

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast.success("Indstillinger gemt succesfuldt");
    },
    onError: () => {
      toast.error("Kunne ikke gemme indstillinger");
    },
  });

  async function onSubmit(data: SettingsFormValues) {
    updateSettingsMutation.mutate(data);
  }

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Data eksporteret succesfuldt");
    } catch (error) {
      toast.error("Kunne ikke eksportere data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error("Slet konto funktionalitet er ikke implementeret endnu");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Indstillinger
        </h1>
        <p className="text-muted-foreground">
          Administrer dine app præferencer og kontoindstillinger
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Udseende
            </CardTitle>
            <CardDescription>
              Tilpas app'ens udseende og tema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Tema</Label>
                <RadioGroup
                  value={theme}
                  onValueChange={setTheme}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                      <Sun className="h-4 w-4" />
                      Lyst tema
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                      <Moon className="h-4 w-4" />
                      Mørkt tema
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                      <Monitor className="h-4 w-4" />
                      System (automatisk)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifikationer
            </CardTitle>
            <CardDescription>
              Administrer dine notifikationsindstillinger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email_notifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email notifikationer
                        </FormLabel>
                        <FormDescription>
                          Modtag email opdateringer om opgaver og aktivitet
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="push_notifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <FormLabel className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Push notifikationer
                        </FormLabel>
                        <FormDescription>
                          Modtag push notifikationer på din enhed
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="task_reminders"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <FormLabel>Opgave påmindelser</FormLabel>
                        <FormDescription>
                          Få påmindelser om kommende opgave deadlines
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="family_updates"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <FormLabel>Familie opdateringer</FormLabel>
                        <FormDescription>
                          Få notifikationer når familiemedlemmer tilføjer eller ændrer opgaver
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Advanced Push Notification Settings */}
        <PushNotificationSettings />

        {/* Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Standard Indstillinger
            </CardTitle>
            <CardDescription>
              Sæt standardværdier for nye lister og opgaver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="default_list_visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard liste synlighed</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vælg standard synlighed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private">Privat</SelectItem>
                          <SelectItem value="family">Familie</SelectItem>
                          <SelectItem value="adults">Kun voksne</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Standard synlighed for nye lister du opretter
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tidszone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vælg tidszone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Europe/Copenhagen">København (CET)</SelectItem>
                          <SelectItem value="Europe/Stockholm">Stockholm (CET)</SelectItem>
                          <SelectItem value="Europe/Oslo">Oslo (CET)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Din tidszone for opgave deadlines og påmindelser
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datoformat</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vælg datoformat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Dansk)</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (Amerikansk)</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Hvordan datoer vises i appen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={updateSettingsMutation.isPending}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateSettingsMutation.isPending ? "Gemmer..." : "Gem Indstillinger"}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Administration
            </CardTitle>
            <CardDescription>
              Eksporter eller slet dine data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Eksporter data</p>
                <p className="text-sm text-muted-foreground">
                  Download alle dine opgaver, lister og data som JSON
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleExportData}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Eksporterer..." : "Eksporter"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div className="space-y-1">
                <p className="font-medium text-destructive">Slet konto</p>
                <p className="text-sm text-muted-foreground">
                  Permanent slet din konto og alle tilknyttede data
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Slet Konto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}