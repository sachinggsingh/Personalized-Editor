'use client';

import { useState, useCallback } from 'react';
import { IDEState, FileNode, EditorTab, TerminalLine } from '@/types/ide';
import { 
  findFileById, 
  updateFileContent, 
  addFileToFolder, 
  deleteFile, 
  createFileNode,
  getLanguageFromFileName 
} from '@/lib/file-utils';

const initialState: IDEState = {
  files: [],
  activeFile: null,
  openTabs: [],
  activeTab: null,
  terminalHistory: [
    {
      id: '1',
      type: 'output',
      content: 'Welcome to the IDE Terminal!',
      timestamp: new Date(),
    },
  ],
  isTerminalOpen: false,
  currentDirectory: '/',
  projectName: 'My Project',
  theme: 'dark',
};

export const useIDEState = () => {
  const [state, setState] = useState<IDEState>(initialState);

  const setFiles = useCallback((files: FileNode[]) => {
    setState(prev => ({ ...prev, files }));
  }, []);

  const openFile = useCallback((file: FileNode) => {
    setState(prev => {
      const existingTab = prev.openTabs.find(tab => tab.id === file.id);
      
      if (existingTab) {
        return {
          ...prev,
          activeFile: file.id,
          activeTab: file.id,
        };
      }

      const newTab: EditorTab = {
        id: file.id,
        name: file.name,
        path: file.path,
        content: file.content || '',
        isDirty: false,
        language: getLanguageFromFileName(file.name),
      };

      return {
        ...prev,
        activeFile: file.id,
        activeTab: file.id,
        openTabs: [...prev.openTabs, newTab],
      };
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setState(prev => {
      const newTabs = prev.openTabs.filter(tab => tab.id !== tabId);
      const newActiveTab = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
      
      return {
        ...prev,
        openTabs: newTabs,
        activeTab: newActiveTab,
        activeFile: newActiveTab,
      };
    });
  }, []);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    console.log('Updating tab content:', { tabId, contentLength: content.length });
    setState(prev => {
      const updatedTabs = prev.openTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, content, isDirty: true }
          : tab
      );
      
      const updatedFiles = updateFileContent(prev.files, tabId, content);
      
      return {
        ...prev,
        openTabs: updatedTabs,
        files: updatedFiles,
      };
    });
  }, []);

  const saveFile = useCallback((tabId: string) => {
    setState(prev => {
      const updatedTabs = prev.openTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, isDirty: false }
          : tab
      );
      
      return {
        ...prev,
        openTabs: updatedTabs,
      };
    });
  }, []);

  const createFile = useCallback((parentId: string | null, name: string, type: 'file' | 'folder') => {
    setState(prev => {
      if (!parentId) {
        const newFile = createFileNode(name, type);
        return {
          ...prev,
          files: [...prev.files, newFile],
        };
      }

      const newFile = createFileNode(name, type, '');
      const updatedFiles = addFileToFolder(prev.files, parentId, newFile);
      
      return {
        ...prev,
        files: updatedFiles,
      };
    });
  }, []);

  const deleteFileById = useCallback((fileId: string) => {
    setState(prev => {
      const updatedFiles = deleteFile(prev.files, fileId);
      const updatedTabs = prev.openTabs.filter(tab => tab.id !== fileId);
      const newActiveTab = updatedTabs.length > 0 ? updatedTabs[updatedTabs.length - 1].id : null;
      
      return {
        ...prev,
        files: updatedFiles,
        openTabs: updatedTabs,
        activeTab: newActiveTab,
        activeFile: newActiveTab,
      };
    });
  }, []);

  const toggleFolder = useCallback((folderId: string) => {
    setState(prev => {
      const toggleFolderRecursive = (files: FileNode[]): FileNode[] => {
        return files.map(file => {
          if (file.id === folderId && file.type === 'folder') {
            return { ...file, isOpen: !file.isOpen };
          }
          if (file.children) {
            return { ...file, children: toggleFolderRecursive(file.children) };
          }
          return file;
        });
      };

      return {
        ...prev,
        files: toggleFolderRecursive(prev.files),
      };
    });
  }, []);

  const addTerminalLine = useCallback((line: Omit<TerminalLine, 'id' | 'timestamp'>) => {
    setState(prev => ({
      ...prev,
      terminalHistory: [
        ...prev.terminalHistory,
        {
          ...line,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        },
      ],
    }));
  }, []);

  const toggleTerminal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTerminalOpen: !prev.isTerminalOpen,
    }));
  }, []);

  const setActiveTab = useCallback((tabId: string) => {
    setState(prev => ({
      ...prev,
      activeTab: tabId,
      activeFile: tabId,
    }));
  }, []);

  const setProjectName = useCallback((name: string) => {
    setState(prev => ({ ...prev, projectName: name }));
  }, []);

  const getCurrentFile = useCallback(() => {
    if (!state.activeFile) return null;
    return findFileById(state.files, state.activeFile);
  }, [state.activeFile, state.files]);

  const getCurrentTab = useCallback(() => {
    if (!state.activeTab) return null;
    return state.openTabs.find(tab => tab.id === state.activeTab) || null;
  }, [state.activeTab, state.openTabs]);

  const clearTerminal = useCallback(() => {
    setState(prev => ({
      ...prev,
      terminalHistory: [
        {
          id: '1',
          type: 'output',
          content: 'Welcome to the IDE Terminal!',
          timestamp: new Date(),
        },
      ],
    }));
  }, []);

  return {
    state,
    setFiles,
    openFile,
    closeTab,
    updateTabContent,
    saveFile,
    createFile,
    deleteFile: deleteFileById,
    toggleFolder,
    addTerminalLine,
    toggleTerminal,
    setActiveTab,
    setProjectName,
    getCurrentFile,
    getCurrentTab,
    clearTerminal,
  };
};