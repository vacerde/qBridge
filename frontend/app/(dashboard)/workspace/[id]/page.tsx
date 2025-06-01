"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/auth-provider";
import { WorkspaceEditor } from "@/components/workspace/editor";
import { WorkspaceTerminal } from "@/components/workspace/terminal";
import { WorkspaceSidebar } from "@/components/workspace/sidebar";
import { WorkspaceHeader } from "@/components/workspace/header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Mock data for workspace details
const getMockWorkspace = (id: string) => {
  return {
    id,
    name: id === "ws1" ? "Frontend Project" : id === "ws2" ? "API Service" : "ML Model",
    description: id === "ws1" ? "Next.js web application" : id === "ws2" ? "Node.js backend API" : "Python machine learning project",
    template: id === "ws1" ? "next" : id === "ws2" ? "node" : "python",
    lastAccessed: new Date().toISOString(),
  };
};

export default function WorkspacePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("editor");
  
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    // Simulate fetching workspace data
    setTimeout(() => {
      setWorkspace(getMockWorkspace(id as string));
      setIsLoading(false);
    }, 500);
  }, [id, user, router]);
  
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }
  
  if (!workspace) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Workspace not found</h1>
          <p className="text-muted-foreground mb-4">The workspace you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <WorkspaceHeader workspace={workspace} />
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar />
        <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center px-4 border-b h-12">
            <TabsList className="h-full rounded-none border-b-0">
              <TabsTrigger value="editor" className="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary">Editor</TabsTrigger>
              <TabsTrigger value="terminal" className="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary">Terminal</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="editor" className="flex-1 p-0 data-[state=active]:flex">
            <WorkspaceEditor />
          </TabsContent>
          <TabsContent value="terminal" className="flex-1 p-0 data-[state=active]:flex">
            <WorkspaceTerminal />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}