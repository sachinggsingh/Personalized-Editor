'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Square,
  Upload,
  Code2,
  ChevronDown,
  Save,
  FolderOpen,
  Loader2,
  PlayIcon,
  NotebookPen,
  Bot,
} from 'lucide-react';
import { useState } from 'react';
import { SummaryDialog } from './summary-dialog';

interface HeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onNewProject: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onRunProject: () => void;
  onStopProject: () => void;
  isRunning: boolean;
  isLoading?: boolean;
  currentCode?: string;
  onOpenNotes: () => void;
}

export function Header({
  projectName,
  onProjectNameChange,
  onNewProject,
  onOpenProject,
  onSaveProject,
  onRunProject,
  onStopProject,
  isRunning,
  isLoading = false,
  currentCode = '',
  onOpenNotes,
}: HeaderProps) {
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  return (
    <>
      <div className="h-12 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-semibold text-white">WebIDE</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="h-8 w-40 bg-[#2d2d2d] border-[#404040] text-white text-sm"
              placeholder="Project name"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#2d2d2d]">
                File
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2d2d2d] border-[#404040]">
              <DropdownMenuItem onClick={onNewProject} className="text-white hover:bg-[#404040]">
                <FolderOpen className="w-4 h-4 mr-2" />
                New Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenProject} className="text-white hover:bg-[#404040]">
                <Upload className="w-4 h-4 mr-2" />
                Open Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSaveProject} className="text-white hover:bg-[#404040]">
                <Save className="w-4 h-4 mr-2" />
                Save Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1">
            {isRunning ? (
              <Button
                onClick={onStopProject}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:bg-red-500/20"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={onRunProject}
                size="sm"
                variant="ghost"
                className="text-green-400 hover:bg-green-500/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlayIcon className="w-4 h-4 mr-1" />
                )}
                {isLoading ? 'Running...'  : 'Run'}
              </Button>
            )}

            <Button
              onClick={() => setIsSummaryDialogOpen(true)}
              size="sm"
              variant="ghost"
              className="text-purple-400 hover:bg-purple-500/20"
              disabled={!currentCode}
            >
              <Bot className="w-6 h-6 mr-1" />
              Summarize
            </Button>

            <Button
              onClick={onOpenNotes}
              size="sm"
              variant="ghost"
              className="text-yellow-500 hover:bg-yellow-200/20"
              title="Sticky Notes"
            >
              <NotebookPen className="w-4 h-4 mr-1" />
              Notes
            </Button>
          </div>

        </div>
      </div>

      <SummaryDialog
        isOpen={isSummaryDialogOpen}
        onClose={() => setIsSummaryDialogOpen(false)}
        code={currentCode}
        language="javascript"
      />
    </>
  );
}