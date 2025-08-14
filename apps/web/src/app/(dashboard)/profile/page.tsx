"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { useApi } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  User, 
  Mail, 
  Camera, 
  Save,
  Calendar,
  Shield,
  Activity
} from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Navn er påkrævet").max(100, "Navn er for langt"),
  email: z.string().email("Ugyldig email adresse"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role_name: "admin" | "adult" | "child";
  avatar_url?: string;
  created_at: string;
  last_seen?: string;
};

export default function ProfilePage() {
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();
  const api = useApi();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await api.get<UserProfile[]>(`/app_users?id=eq.${session?.user?.id}&select=*`);
      return response.data?.[0];
    },
    enabled: !!api.token && !!session?.user?.id,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
    },
  });

  // Update form when profile loads
  if (profile && !form.getValues().name) {
    form.reset({
      name: profile.name,
      email: profile.email,
    });
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await api.patch(`/app_users?id=eq.${profile?.id}`, {
        name: data.name,
        email: data.email,
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profil opdateret succesfuldt");
    },
    onError: (error) => {
      toast.error("Kunne ikke opdatere profil: " + error.message);
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setIsUploading(true);
    try {
      // In a real app, you would upload to Supabase Storage here
      // For now, we'll just show a placeholder
      toast.info("Avatar upload funktionalitet kommer snart");
    } catch (error) {
      toast.error("Kunne ikke uploade avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "adult":
        return "Voksen";
      case "child":
        return "Barn";
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("da-DK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-24 w-24 bg-muted rounded-full mx-auto"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Kunne ikke indlæse profil</h3>
              <p className="text-muted-foreground">
                Prøv at genindlæse siden
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <User className="h-8 w-8" />
          Min Profil
        </h1>
        <p className="text-muted-foreground">
          Administrer dine kontooplysninger og præferencer
        </p>
      </div>

      {/* Profile Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profiloplysninger</CardTitle>
          <CardDescription>
            Opdater dine personlige oplysninger
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
              </Button>
            </div>
            <div className="text-center">
              <p className="font-medium">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fulde navn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dit fulde navn"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email adresse</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="din@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Din email adresse bruges til login og notifikationer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Gemmer..." : "Gem Ændringer"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Konto Information</CardTitle>
          <CardDescription>
            Oplysninger om din konto og rolle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Rolle</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {getRoleText(profile.role_name)}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Medlem siden</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(profile.created_at)}
              </span>
            </div>

            {profile.last_seen && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sidst aktiv</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(profile.last_seen)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}