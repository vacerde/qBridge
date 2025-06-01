"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { WorkspaceCreateButton } from "@/components/dashboard/workspace-create-button";
import { WorkspaceCard } from "@/components/dashboard/workspace-card";
import { Plus } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

// Mock data for workspaces
const mockWorkspaces = [
  {
    id: "ws1",
    name: "Frontend Project",
    description: "Next.js web application",
    lastAccessed: "2025-04-10T10:30:00Z",
    template: "next",
    collaborators: 2,
  },
  {
    id: "ws2",
    name: "API Service",
    description: "Node.js backend API",
    lastAccessed: "2025-04-09T14:45:00Z",
    template: "node",
    collaborators: 1,
  },
  {
    id: "ws3",
    name: "ML Model",
    description: "Python machine learning project",
    lastAccessed: "2025-04-05T09:15:00Z",
    template: "python",
    collaborators: 0,
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const { user } = useAuth();
  const router = useRouter();
  
  if (!user) {
    router.push("/login");
    return null;
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Workspaces"
        text="Create and manage your development workspaces."
      >
        <WorkspaceCreateButton />
      </DashboardHeader>
      <Tabs defaultValue="personal" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="shared">Shared with me</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockWorkspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
            <Card className="h-[190px] flex flex-col items-center justify-center border-dashed cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-secondary/80 p-3 mb-2">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="text-sm text-center text-muted-foreground">Create a new workspace</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="shared" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* This would have shared workspaces in a real app */}
            <Card className="p-6">
              <div className="flex items-center justify-center h-[140px] text-muted-foreground">
                No shared workspaces found
              </div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* This would have team workspaces in a real app */}
            <Card className="p-6">
              <div className="flex items-center justify-center h-[140px] text-muted-foreground">
                No team workspaces found
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}