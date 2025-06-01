"use client";

import { useEffect, useRef, useState } from "react";

export function WorkspaceTerminal() {
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "$ Welcome to DevForge Terminal",
    "$ Type 'help' to see available commands",
    "$"
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to the bottom when terminal lines change
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      const processCommand = (command: string) => {
        if (command.trim() === "") {
          return ["$"];
        }
        
        if (command === "clear") {
          return ["$"];
        }
        
        if (command === "help") {
          return [
            "Available commands:",
            "  help     - Show this help message",
            "  clear    - Clear the terminal",
            "  ls       - List files",
            "  cd       - Change directory",
            "  npm      - Run npm commands",
            "  node     - Run Node.js",
            "$"
          ];
        }
        
        if (command === "ls") {
          return [
            "src/",
            "package.json",
            "tsconfig.json",
            "README.md",
            "$"
          ];
        }
        
        if (command.startsWith("npm")) {
          if (command === "npm start") {
            return [
              "> project@1.0.0 start",
              "> vite",
              "",
              "VITE v5.0.12  ready in 300 ms",
              "",
              "➜  Local:   http://localhost:3000/",
              "➜  Network: use --host to expose",
              "➜  press h to show help",
              "$"
            ];
          }
          
          return [
            `Executing: ${command}`,
            "...",
            "$"
          ];
        }
        
        return [
          `Command not found: ${command}`,
          "$"
        ];
      };
      
      const commandOutput = processCommand(currentInput);
      setTerminalLines([...terminalLines.slice(0, -1), `$ ${currentInput}`, ...commandOutput]);
      setCurrentInput("");
    }
  };
  
  return (
    <div 
      className="w-full h-full bg-black text-green-400 font-mono text-sm p-2 overflow-auto"
      ref={terminalRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div>
        {terminalLines.slice(0, -1).map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line}
          </div>
        ))}
        <div className="flex">
          <span>{terminalLines[terminalLines.length - 1]}</span>
          <span className="ml-1">{currentInput}</span>
          <span className="ml-0.5 w-2.5 h-5 bg-green-400 animate-pulse" style={{ animationDuration: '1s' }}></span>
        </div>
      </div>
    </div>
  );
}