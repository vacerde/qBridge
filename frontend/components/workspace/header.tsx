"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ArrowLeft, Code, Play, Save, Share2, Sparkles } from "lucide-react";
import Link from "next/link";

interface WorkspaceHeaderProps {
  workspace: {
    id: string;
    name: string;
    description: string;
    template: string;
  };
}

export function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  const router = useRouter();
  
  return (
    <header className="h-12 border-b flex items-center justify-between px-4 bg-background">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getTemplateColor(workspace.template)}>
            {getTemplateIcon(workspace.template)}
            {workspace.template}
          </Badge>
          <span className="font-medium">{workspace.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="h-8">
          <Sparkles className="h-4 w-4 mr-1" />
          AI
        </Button>
        <Button size="sm" variant="ghost" className="h-8">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        <Button size="sm" variant="ghost" className="h-8">
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="default" className="h-8">
          <Play className="h-4 w-4 mr-1" />
          Run
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://api.dicebear.com/6.x/avataaars/svg?seed=John" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function getTemplateIcon(template: string) {
  return <Code className="h-3.5 w-3.5 mr-1" />;
}

function getTemplateColor(template: string) {
  switch (template) {
    case "next":
      return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30";
    case "node":
      return "bg-green-500/20 text-green-500 hover:bg-green-500/30";
    case "python":
      return "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30";
    default:
      return "bg-primary/20 text-primary hover:bg-primary/30";
  }
}