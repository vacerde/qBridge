import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Users, Code, FileCode2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Workspace {
  id: string;
  name: string;
  description: string;
  lastAccessed: string;
  template: string;
  collaborators: number;
}

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const getTemplateIcon = (template: string) => {
    switch (template) {
      case "next":
        return <Code className="h-4 w-4" />;
      case "node":
        return <FileCode2 className="h-4 w-4" />;
      case "python":
        return <Code className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };
  
  const getTemplateColor = (template: string) => {
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 bg-muted/30">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className={`${getTemplateColor(workspace.template)}`}>
            <span className="flex items-center gap-1">
              {getTemplateIcon(workspace.template)} {workspace.template}
            </span>
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Last accessed: {formatDate(workspace.lastAccessed)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div>
          <CardTitle className="text-lg">{workspace.name}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{workspace.description}</p>
        </div>
        <div className="flex items-center mt-4">
          <div className="flex -space-x-2">
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            {workspace.collaborators > 0 && (
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            )}
            {workspace.collaborators > 1 && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                +{workspace.collaborators - 1}
              </div>
            )}
          </div>
          <div className="ml-auto">
            {workspace.collaborators > 0 && (
              <Badge variant="outline\" className="ml-2">
                <Users className="h-3 w-3 mr-1" /> {workspace.collaborators} active
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex gap-2 border-t bg-card">
        <Link href={`/workspace/${workspace.id}`} className="w-full">
          <Button className="w-full" size="sm">
            <Play className="mr-2 h-3.5 w-3.5" />
            Open workspace
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}