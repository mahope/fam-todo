"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import { useApi } from "@/lib/api";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ListTodo, ShoppingCart, Lock, Eye, Users } from "lucide-react";
import Link from "next/link";

const createListSchema = z.object({
  name: z.string().min(1, "Navn er påkrævet").max(100, "Navn er for langt"),
  description: z.string().max(500, "Beskrivelse er for lang").optional(),
  listType: z.enum(["TODO", "SHOPPING"]),
  visibility: z.enum(["PRIVATE", "FAMILY", "ADULT"]),
  color: z.string().optional(),
});

type CreateListFormValues = z.infer<typeof createListSchema>;

const LIST_COLORS = [
  { value: "#3b82f6", name: "Blå" },
  { value: "#10b981", name: "Grøn" },
  { value: "#f59e0b", name: "Gul" },
  { value: "#ef4444", name: "Rød" },
  { value: "#8b5cf6", name: "Lilla" },
  { value: "#06b6d4", name: "Cyan" },
  { value: "#f97316", name: "Orange" },
  { value: "#84cc16", name: "Lime" },
];

export default function NewListPage() {
  const router = useRouter();
  const api = useApi();
  // const { data: session } = useSession(); // Unused for now

  const form = useForm<CreateListFormValues>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      name: "",
      description: "",
      listType: "TODO",
      visibility: "FAMILY",
      color: LIST_COLORS[0].value,
    },
  });

  const createListMutation = useMutation({
    mutationFn: async (data: CreateListFormValues) => {
      const response = await api.post("/lists", {
        name: data.name,
        description: data.description || null,
        color: data.color || null,
        visibility: data.visibility,
        listType: data.listType,
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    },
    onSuccess: () => {
      // Redirect to lists page
      router.push("/lists");
    },
  });

  async function onSubmit(data: CreateListFormValues) {
    createListMutation.mutate(data);
  }

  const selectedType = form.watch("listType");
  const selectedVisibility = form.watch("visibility");
  const selectedColor = form.watch("color");

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/lists">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Opret Ny Liste</h1>
          <p className="text-muted-foreground">
            Opsæt en ny opgave- eller indkøbsliste til din familie
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste Detaljer</CardTitle>
          <CardDescription>
            Konfigurer dine liste indstillinger og synlighed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="f.eks. Indkøbsliste, Weekend Opgaver"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskrivelse (Valgfri)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tilføj en beskrivelse til din liste..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="listType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liste Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vælg liste type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TODO">
                            <div className="flex items-center gap-2">
                              <ListTodo className="h-4 w-4" />
                              Opgaveliste
                            </div>
                          </SelectItem>
                          <SelectItem value="SHOPPING">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              Indkøbsliste
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedType === "SHOPPING" 
                          ? "Indkøbslister har smart kategorisering og forslag"
                          : "Opgavelister er fantastiske til at organisere to-do's og projekter"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Synlighed</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Hvem kan se denne liste?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRIVATE">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Privat
                            </div>
                          </SelectItem>
                          <SelectItem value="FAMILY">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Familie
                            </div>
                          </SelectItem>
                          <SelectItem value="ADULT">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Kun Voksne
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedVisibility === "PRIVATE" && "Kun du kan se og redigere denne liste"}
                        {selectedVisibility === "FAMILY" && "Alle familiemedlemmer kan se og redigere denne liste"}
                        {selectedVisibility === "ADULT" && "Kun voksne familiemedlemmer kan se og redigere denne liste"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farvetema</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 flex-wrap">
                        {LIST_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => field.onChange(color.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                              selectedColor === color.value 
                                ? "border-foreground scale-110" 
                                : "border-muted-foreground/30"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Vælg en farve til at hjælpe med at identificere din liste
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createListMutation.error && (
                <div className="text-sm text-destructive">
                  {createListMutation.error.message}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={createListMutation.isPending}
                  className="flex-1"
                >
                  {createListMutation.isPending ? "Opretter..." : "Opret Liste"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={createListMutation.isPending}
                >
                  <Link href="/lists">Annuller</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}