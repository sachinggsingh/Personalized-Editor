"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Minimize2, Terminal as TerminalIcon, Play } from "lucide-react";
import { TerminalLine } from "@/types/ide";
import { cn } from "@/lib/utils";

interface TerminalProps {
  isOpen: boolean;
  onToggle: () => void;
  history: TerminalLine[];
  onCommand: (command: string) => void;
  onClear: () => void;
  currentDirectory: string;
}

export function Terminal({
  isOpen,
  onToggle,
  history,
  onCommand,
  onClear,
  currentDirectory,
}: TerminalProps) {
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setIsExecuting(true);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Add command to history
    onCommand(cmd);

    try {
      // Check if it's a code execution command
      if (cmd.startsWith('python ') || cmd.startsWith('js ') || cmd.startsWith('node ') || 
          cmd.startsWith('java ') || cmd.startsWith('cpp ') || cmd.startsWith('c ') || 
          cmd.startsWith('ts ') || cmd.startsWith('typescript ')) {
        const parts = cmd.split(' ');
        let language = parts[0];
        
        // Map command aliases to language names
        if (language === 'js' || language === 'node') language = 'javascript';
        if (language === 'ts') language = 'typescript';
        
        const code = parts.slice(1).join(' ');
        
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language })
        });

        const result = await response.json();
        
        if (result.success) {
          onCommand(`OUTPUT:${result.output}`);
        } else {
          onCommand(`ERROR:${result.error || result.details}`);
        }
      } else {
        // Handle as terminal command
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: cmd, language: 'terminal' })
        });

        const result = await response.json();
        
        if (result.success) {
          onCommand(`OUTPUT:${result.output}`);
        } else {
          onCommand(`ERROR:${result.error || result.details}`);
        }
      }
    } catch (error) {
      onCommand(`ERROR:Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(command);
      setCommand("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col rounded-none overflow-hidden border border-[#2d2d2d] shadow-lg">
      <div className="h-9 bg-[#2d2d2d] border-b border-[#404040] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">Terminal</span>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className="h-7 w-7 p-0 hover:bg-[#404040] transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5 text-gray-400" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className="h-7 w-7 p-0 hover:bg-[#404040] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </Button>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-2">
        <div className="font-mono text-sm space-y-1">
          {history.map((line) => (
            <div key={line.id} className="flex">
              {line.type === "error" ? (
                <div className="text-red-400 whitespace-pre-wrap text-sm leading-relaxed">
                  {line.content}
                </div>
              ) : line.type === "command" ? (
                <div className="text-blue-400 whitespace-pre-wrap text-sm leading-relaxed">
                  {line.content}
                </div>
              ) : (
                <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {line.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-[#2d2d2d] bg-[#1e1e1e]">
        <div className="flex items-center gap-1.5 font-mono text-sm bg-[#2d2d2d] rounded-md px-3 py-2">
          <span className="text-blue-400 font-medium">dev@7</span>
          <span className="text-gray-400">:</span>
          <span className="text-purple-400 font-medium">{currentDirectory}</span>
          <span className="text-gray-400">$</span>
          <Input
            ref={inputRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-none shadow-none text-gray-200 p-0 h-auto text-sm rounded-none placeholder:text-gray-500"
            placeholder={isExecuting ? "Executing..." : "Type a command..."}
            disabled={isExecuting}
          />
          {isExecuting && (
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}
