"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ListTodo, 
  ShoppingCart, 
  Folder, 
  Users, 
  Plus, 
  Search,
  CheckCircle2,
  Filter,
  Archive,
  Calendar,
  Clock,
  Heart,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = ListTodo,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            action.href ? (
              <Button asChild>
                <Link href={action.href}>
                  <Plus className="h-4 w-4 mr-2" />
                  {action.label}
                </Link>
              </Button>
            ) : (
              <Button onClick={action.onClick}>
                <Plus className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            )
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild>
                <Link href={secondaryAction.href}>
                  {secondaryAction.label}
                </Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyTasks() {
  return (
    <EmptyState
      icon={ListTodo}
      title="Ingen opgaver endnu"
      description="Kom i gang med at organisere dit liv ved at tilføje din første opgave."
      action={{
        label: "Opret opgave",
        onClick: () => {
          // Trigger task creation modal
          const event = new CustomEvent("openQuickTask");
          window.dispatchEvent(event);
        }
      }}
      secondaryAction={{
        label: "Se alle lister",
        href: "/lists"
      }}
    />
  );
}

export function EmptyLists() {
  return (
    <EmptyState
      icon={ListTodo}
      title="Ingen lister endnu"
      description="Opret din første liste for at begynde at organisere dine opgaver og idéer."
      action={{
        label: "Opret liste",
        href: "/lists/new"
      }}
      secondaryAction={{
        label: "Opret mappe",
        href: "/folders/new"
      }}
    />
  );
}

export function EmptyShoppingList() {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Tom indkøbsliste"
      description="Tilføj varer til din indkøbsliste så du ikke glemmer noget i butikken."
      action={{
        label: "Tilføj vare"
      }}
    />
  );
}

export function EmptyFolders() {
  return (
    <EmptyState
      icon={Folder}
      title="Ingen mapper endnu"
      description="Opret mapper for at organisere dine lister i kategorier der giver mening for dig."
      action={{
        label: "Opret mappe",
        href: "/folders/new"
      }}
      secondaryAction={{
        label: "Opret liste",
        href: "/lists/new"
      }}
    />
  );
}

export function EmptyFamily() {
  return (
    <EmptyState
      icon={Users}
      title="Du er alene i familien"
      description="Inviter familiemedlemmer så I kan dele lister og opgaver sammen."
      action={{
        label: "Inviter medlem"
      }}
    />
  );
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon={Search}
      title="Ingen resultater fundet"
      description="Prøv at søge med andre ord eller tjek stavningen af dine søgeord."
      secondaryAction={{
        label: "Ryd søgning"
      }}
    />
  );
}

export function EmptyCompletedTasks() {
  return (
    <EmptyState
      icon={CheckCircle2}
      title="Ingen fuldførte opgaver"
      description="Når du fuldfører opgaver, vil de blive vist her. Kom i gang med at være produktiv!"
      action={{
        label: "Se alle opgaver",
        href: "/tasks"
      }}
    />
  );
}

export function EmptyFilteredResults({ filterType }: { filterType: string }) {
  const getFilterIcon = () => {
    switch (filterType) {
      case "completed": return CheckCircle2;
      case "archived": return Archive;
      case "today": return Calendar;
      case "overdue": return Clock;
      default: return Filter;
    }
  };

  const getFilterTitle = () => {
    switch (filterType) {
      case "completed": return "Ingen fuldførte opgaver";
      case "archived": return "Ingen arkiverede elementer";
      case "today": return "Ingen opgaver for i dag";
      case "overdue": return "Ingen forfaldne opgaver";
      default: return "Ingen resultater";
    }
  };

  const getFilterDescription = () => {
    switch (filterType) {
      case "completed": return "Der er ingen fuldførte opgaver at vise med det aktuelle filter.";
      case "archived": return "Du har ikke arkiveret nogen elementer endnu.";
      case "today": return "Du har ingen opgaver planlagt for i dag.";
      case "overdue": return "Godt! Du har ingen forfaldne opgaver at tage fat på.";
      default: return "Prøv at justere dine filter for at se flere resultater.";
    }
  };

  return (
    <EmptyState
      icon={getFilterIcon()}
      title={getFilterTitle()}
      description={getFilterDescription()}
      secondaryAction={{
        label: "Ryd filter"
      }}
    />
  );
}

interface MotivationalEmptyStateProps {
  type: "productivity" | "achievement" | "collaboration" | "organization";
}

export function MotivationalEmptyState({ type }: MotivationalEmptyStateProps) {
  const motivationalContent = {
    productivity: {
      icon: Zap,
      title: "Klar til at være produktiv?",
      description: "Det bedste tidspunkt at plante et træ var for 20 år siden. Det næstbedste er nu. Lad os komme i gang!",
    },
    achievement: {
      icon: Star,
      title: "Dine bedrifter venter",
      description: "Store ting kommer ikke til dem der venter, men til dem der tager handling. Start din rejse i dag.",
    },
    collaboration: {
      icon: Heart,
      title: "Stærkere sammen",
      description: "Alene kan du gå hurtigt, men sammen kan I gå langt. Inviter din familie til at blive en del af rejsen.",
    },
    organization: {
      icon: ListTodo,
      title: "Orden skaber klarhed",
      description: "En organiseret hjerne er en rolig hjerne. Lad os skabe struktur i dit liv, en liste ad gangen.",
    },
  };

  const content = motivationalContent[type];
  
  return (
    <div className="text-center py-16 px-6 max-w-md mx-auto">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
        <content.icon className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {content.title}
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-8">
        {content.description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-5 w-5 mr-2" />
          Kom i gang
        </Button>
        <Button variant="outline" size="lg">
          Udforsk funktioner
        </Button>
      </div>
    </div>
  );
}