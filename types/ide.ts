import { ReactNode } from 'react';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  parent?: string;
  path: string;
  extension?: string;
  isOpen?: boolean;
  isEditing?: boolean;
}

export interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty: boolean;
  language: string;
}

export interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  files: FileNode[];
}

export interface IDEState {
  files: FileNode[];
  activeFile: string | null;
  openTabs: EditorTab[];
  activeTab: string | null;
  terminalHistory: TerminalLine[];
  isTerminalOpen: boolean;
  currentDirectory: string;
  projectName: string;
  theme: 'light' | 'dark';
}

export type CodeSnippet = {
  id: string;
  title: string;
  code: string;
  language: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type StickyNote = {
  id: string;
  content: string;
  color?: string;
  createdAt: string;
  x: number;
  y: number;
  width: number;
  height: number;
};