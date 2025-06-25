'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Download,
} from 'lucide-react';
import { FileNode } from '@/types/ide';
import { getFileIcon } from '@/lib/file-utils';
import { cn } from '@/lib/utils';

interface FileExplorerProps {
  files: FileNode[];
  activeFile: string | null;
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (parentId: string | null, name: string, type: 'file' | 'folder') => void;
  onFileDelete: (fileId: string) => void;
  onFolderToggle: (folderId: string) => void;
}

interface FileItemProps {
  file: FileNode;
  level: number;
  activeFile: string | null;
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (parentId: string | null, name: string, type: 'file' | 'folder') => void;
  onFileDelete: (fileId: string) => void;
  onFolderToggle: (folderId: string) => void;
}

function FileItem({
  file,
  level,
  activeFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFolderToggle,
}: FileItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const handleClick = () => {
    if (file.type === 'folder') {
      onFolderToggle(file.id);
    } else {
      onFileSelect(file);
    }
  };

  const handleCreateItem = (type: 'file' | 'folder') => {
    if (newItemName.trim()) {
      onFileCreate(file.type === 'folder' ? file.id : null, newItemName.trim(), type);
      setNewItemName('');
      setIsCreating(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      setIsCreating(null);
      setIsEditing(false);
      setNewItemName('');
      setNewName(file.name);
    }
  };

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 hover:bg-[#2d2d2d] cursor-pointer text-sm',
              activeFile === file.id && 'bg-[#094771] hover:bg-[#094771]',
              'text-gray-300'
            )}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={handleClick}
          >
            {file.type === 'folder' && (
              file.isOpen ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )
            )}
            
            {file.type === 'folder' ? (
              file.isOpen ? (
                <FolderOpen className="w-4 h-4 flex-shrink-0 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 flex-shrink-0 text-blue-400" />
              )
            ) : (
              <span className="w-4 h-4 flex-shrink-0 text-center text-xs">
                {getFileIcon(file.name)}
              </span>
            )}
            
            {isEditing ? (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, () => setIsEditing(false))}
                onBlur={() => setIsEditing(false)}
                className="h-5 text-xs bg-[#1e1e1e] border-[#404040] text-white"
                autoFocus
              />
            ) : (
              <span className="truncate">{file.name}</span>
            )}
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent className="bg-[#2d2d2d] border-[#404040]">
          {file.type === 'folder' && (
            <>
              <ContextMenuItem
                onClick={() => setIsCreating('file')}
                className="text-white hover:bg-[#404040]"
              >
                <File className="w-4 h-4 mr-2" />
                New File
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => setIsCreating('folder')}
                className="text-white hover:bg-[#404040]"
              >
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-[#404040]" />
            </>
          )}
          <ContextMenuItem
            onClick={() => setIsEditing(true)}
            className="text-white hover:bg-[#404040]"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem className="text-white hover:bg-[#404040]">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </ContextMenuItem>
          <ContextMenuItem className="text-white hover:bg-[#404040]">
            <Download className="w-4 h-4 mr-2" />
            Download
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-[#404040]" />
          <ContextMenuItem
            onClick={() => onFileDelete(file.id)}
            className="text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {isCreating && file.type === 'folder' && (
        <div
          className="flex items-center gap-1 px-2 py-1"
          style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
        >
          {isCreating === 'folder' ? (
            <Folder className="w-4 h-4 flex-shrink-0 text-blue-400" />
          ) : (
            <File className="w-4 h-4 flex-shrink-0 text-gray-400" />
          )}
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, () => handleCreateItem(isCreating))}
            onBlur={() => setIsCreating(null)}
            placeholder={`New ${isCreating}...`}
            className="h-5 text-xs bg-[#1e1e1e] border-[#404040] text-white"
            autoFocus
          />
        </div>
      )}

      {file.type === 'folder' && file.isOpen && file.children && (
        <div>
          {file.children.map((child) => (
            <FileItem
              key={child.id}
              file={child}
              level={level + 1}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              onFileCreate={onFileCreate}
              onFileDelete={onFileDelete}
              onFolderToggle={onFolderToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({
  files,
  activeFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFolderToggle,
}: FileExplorerProps) {
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const handleCreateItem = (type: 'file' | 'folder') => {
    if (newItemName.trim()) {
      onFileCreate(null, newItemName.trim(), type);
      setNewItemName('');
      setIsCreating(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isCreating) {
      handleCreateItem(isCreating);
    } else if (e.key === 'Escape') {
      setIsCreating(null);
      setNewItemName('');
    }
  };

  return (
    <div className="w-64 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col">
      <div className="h-8 bg-[#2d2d2d] border-b border-[#404040] flex items-center justify-between px-3">
        <span className="text-xs font-medium text-gray-300">EXPLORER</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating('file')}
            className="h-6 w-6 p-0 hover:bg-[#404040]"
          >
            <File className="w-3 h-3 text-gray-400" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating('folder')}
            className="h-6 w-6 p-0 hover:bg-[#404040]"
          >
            <Folder className="w-3 h-3 text-gray-400" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-1">
          {isCreating && (
            <div className="flex items-center gap-1 px-2 py-1">
              {isCreating === 'folder' ? (
                <Folder className="w-4 h-4 flex-shrink-0 text-blue-400" />
              ) : (
                <File className="w-4 h-4 flex-shrink-0 text-gray-400" />
              )}
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => setIsCreating(null)}
                placeholder={`New ${isCreating}...`}
                className="h-5 text-xs bg-[#1e1e1e] border-[#404040] text-white rounded-none"
                autoFocus
              />
            </div>
          )}
          
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              level={0}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              onFileCreate={onFileCreate}
              onFileDelete={onFileDelete}
              onFolderToggle={onFolderToggle}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}