"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  File,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  FileCog,
  Settings,
  Search,
  PanelLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Mock file structure
const initialFileStructure = [
  {
    id: "1",
    type: "folder",
    name: "src",
    expanded: true,
    children: [
      {
        id: "2",
        type: "folder",
        name: "components",
        expanded: false,
        children: [
          { id: "3", type: "file", name: "Button.tsx" },
          { id: "4", type: "file", name: "Card.tsx" },
          { id: "5", type: "file", name: "Input.tsx" },
        ],
      },
      {
        id: "6",
        type: "folder",
        name: "pages",
        expanded: false,
        children: [
          { id: "7", type: "file", name: "index.tsx" },
          { id: "8", type: "file", name: "about.tsx" },
          { id: "9", type: "file", name: "contact.tsx" },
        ],
      },
      { id: "10", type: "file", name: "main.tsx" },
      { id: "11", type: "file", name: "App.tsx" },
    ],
  },
  { id: "12", type: "file", name: "package.json" },
  { id: "13", type: "file", name: "tsconfig.json" },
  { id: "14", type: "file", name: "README.md" },
];

export function WorkspaceSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [fileStructure, setFileStructure] = useState(initialFileStructure);
  const [searchQuery, setSearchQuery] = useState("");
  
  const toggleFolder = (id: string) => {
    const toggleExpanded = (items: any[]): any[] => {
      return items.map(item => {
        if (item.id === id && item.type === 'folder') {
          return { ...item, expanded: !item.expanded };
        } else if (item.children) {
          return { ...item, children: toggleExpanded(item.children) };
        } else {
          return item;
        }
      });
    };
    
    setFileStructure(toggleExpanded(fileStructure));
  };
  
  const renderFileTree = (items: any[], level = 0) => {
    return items.map(item => {
      // Filter based on search query
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        if (!item.children || !item.children.some((child: any) => 
          child.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return null;
        }
      }
      
      const isFolder = item.type === "folder";
      const paddingLeft = level * 12;
      
      const FileIcon = getFileIcon(item.name);
      
      return (
        <div key={item.id}>
          <div 
            className={cn(
              "flex items-center py-1 px-2 text-sm hover:bg-muted/50 cursor-pointer rounded",
              isFolder ? "font-medium" : ""
            )}
            style={{ paddingLeft: `${paddingLeft + 8}px` }}
            onClick={() => isFolder && toggleFolder(item.id)}
          >
            {isFolder ? (
              <>
                {item.expanded ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                {item.expanded ? (
                  <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                ) : (
                  <Folder className="h-4 w-4 mr-2 text-blue-500" />
                )}
              </>
            ) : (
              <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            )}
            <span className={cn(
              "truncate",
              item.type === "file" && "text-sm"
            )}>
              {item.name}
            </span>
          </div>
          {isFolder && item.expanded && item.children && renderFileTree(item.children, level + 1)}
        </div>
      );
    }).filter(Boolean); // Filter out null items from search filtering
  };
  
  return (
    <div 
      className={cn(
        "border-r bg-background transition-all duration-300 flex flex-col",
        collapsed ? "w-12" : "w-64"
      )}
    >
      <div className="p-2 border-b flex items-center justify-between h-12">
        {!collapsed && (
          <div className="text-sm font-medium">Explorer</div>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
      
      {!collapsed && (
        <>
          <div className="p-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input 
                placeholder="Search files" 
                className="pl-8 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-2">
            {renderFileTree(fileStructure)}
          </div>
          
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Workspace Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function getFileIcon(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'json':
      return FileCog;
    case 'md':
      return FileText;
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return File;
    default:
      return File;
  }
}