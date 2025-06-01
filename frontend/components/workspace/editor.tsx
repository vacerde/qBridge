"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

// Mock code content
const mockCodeContent = {
  "App.tsx": `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Counter App</h1>
      <div className="flex items-center gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setCount(count - 1)}
        >
          -
        </button>
        <span className="text-xl">{count}</span>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setCount(count + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}`,
  "main.tsx": `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  "index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
};

export function WorkspaceEditor() {
  const [openTabs, setOpenTabs] = useState(["App.tsx", "main.tsx"]);
  const [activeTab, setActiveTab] = useState("App.tsx");
  
  const closeTab = (tab: string) => {
    const newTabs = openTabs.filter(t => t !== tab);
    setOpenTabs(newTabs);
    if (activeTab === tab && newTabs.length > 0) {
      setActiveTab(newTabs[0]);
    }
  };
  
  return (
    <div className="flex flex-col w-full h-full bg-black border-l border-white/10">
      <div className="flex items-center h-10 bg-black border-b border-white/10">
        {openTabs.map(tab => (
          <div 
            key={tab}
            className={`flex items-center h-full px-3 border-r border-white/10 cursor-pointer ${
              activeTab === tab ? 'bg-zinc-900' : 'bg-black hover:bg-zinc-900/50'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="text-white/80 text-xs mr-2">{tab}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 rounded-full hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab);
              }}
            >
              <X className="h-3 w-3 text-white/60" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        {openTabs.map(tab => (
          <div 
            key={tab}
            className={`h-full ${activeTab === tab ? 'block' : 'hidden'}`}
          >
            <pre className="font-mono text-xs p-4 text-white/90 h-full overflow-auto">
              <code>{mockCodeContent[tab as keyof typeof mockCodeContent]}</code>
            </pre>
          </div>
        ))}
        {openTabs.length === 0 && (
          <div className="h-full flex items-center justify-center text-white/50">
            No files open
          </div>
        )}
      </div>
    </div>
  );
}