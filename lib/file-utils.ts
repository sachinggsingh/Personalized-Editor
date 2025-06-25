import { FileNode } from '@/types/ide';
import { TypeScriptIcon, PythonIcon, JavaIcon, CppIcon, CIcon } from '@/components/icons/language-icons';
import React from 'react';

export const getFileIcon = (fileName: string): React.ReactNode => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap: Record<string, React.ReactNode> = {
    'c': React.createElement(CIcon, { className: 'w-4 h-4' }),
    'cpp': React.createElement(CppIcon, { className: 'w-4 h-4' }),
    'cc': React.createElement(CppIcon, { className: 'w-4 h-4' }),
    'cxx': React.createElement(CppIcon, { className: 'w-4 h-4' }),
    'h': React.createElement(CIcon, { className: 'w-4 h-4' }),
    'hpp': React.createElement(CppIcon, { className: 'w-4 h-4' }),
    'java': React.createElement(JavaIcon, { className: 'w-4 h-4' }),
    'py': React.createElement(PythonIcon, { className: 'w-4 h-4' }),
    'ts': React.createElement(TypeScriptIcon, { className: 'w-4 h-4' }),
    'tsx': React.createElement(TypeScriptIcon, { className: 'w-4 h-4' }),
  };

  return iconMap[extension || ''] || '📄';
};

export const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'java': 'java',
    'py': 'python',
    'ts': 'typescript',
  };

  return languageMap[extension || ''] || 'plaintext';
};

export const createFileNode = (
  name: string,
  type: 'file' | 'folder',
  parentPath: string = '',
  content?: string
): FileNode => {
  const path = parentPath ? `${parentPath}/${name}` : name;
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    type,
    content: content || '',
    children: type === 'folder' ? [] : undefined,
    path,
    extension: type === 'file' ? name.split('.').pop()?.toLowerCase() : undefined,
    isOpen: false,
    isEditing: false,
  };
};

export const findFileById = (files: FileNode[], id: string): FileNode | null => {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const findFileByPath = (files: FileNode[], path: string): FileNode | null => {
  for (const file of files) {
    if (file.path === path) return file;
    if (file.children) {
      const found = findFileByPath(file.children, path);
      if (found) return found;
    }
  }
  return null;
};

export const updateFileContent = (
  files: FileNode[],
  fileId: string,
  newContent: string
): FileNode[] => {
  return files.map(file => {
    if (file.id === fileId) {
      return { ...file, content: newContent };
    }
    if (file.children) {
      return { ...file, children: updateFileContent(file.children, fileId, newContent) };
    }
    return file;
  });
};

export const addFileToFolder = (
  files: FileNode[],
  folderId: string,
  newFile: FileNode
): FileNode[] => {
  return files.map(file => {
    if (file.id === folderId && file.type === 'folder') {
      return {
        ...file,
        children: [...(file.children || []), newFile],
        isOpen: true,
      };
    }
    if (file.children) {
      return { ...file, children: addFileToFolder(file.children, folderId, newFile) };
    }
    return file;
  });
};

export const deleteFile = (files: FileNode[], fileId: string): FileNode[] => {
  return files.filter(file => {
    if (file.id === fileId) return false;
    if (file.children) {
      file.children = deleteFile(file.children, fileId);
    }
    return true;
  });
};