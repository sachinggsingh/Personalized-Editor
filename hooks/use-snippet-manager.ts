import { useState, useEffect, useCallback } from 'react';
import { CodeSnippet, StickyNote } from '../types/ide';

const SNIPPETS_KEY = 'code_snippets';
const NOTES_KEY = 'sticky_notes';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function useSnippetManager() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => loadFromStorage(SNIPPETS_KEY, []));
  const [notes, setNotes] = useState<StickyNote[]>(() => loadFromStorage(NOTES_KEY, []));

  useEffect(() => { saveToStorage(SNIPPETS_KEY, snippets); }, [snippets]);
  useEffect(() => { saveToStorage(NOTES_KEY, notes); }, [notes]);

  // Snippet functions
  const addSnippet = useCallback((snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setSnippets(snips => [
      { ...snippet, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
      ...snips,
    ]);
  }, []);

  const updateSnippet = useCallback((id: string, updates: Partial<CodeSnippet>) => {
    setSnippets(snips => snips.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
  }, []);

  const deleteSnippet = useCallback((id: string) => {
    setSnippets(snips => snips.filter(s => s.id !== id));
  }, []);

  // Sticky note functions
  const addNote = useCallback((note: Omit<StickyNote, 'id' | 'createdAt' | 'x' | 'y' | 'width' | 'height'>) => {
    setNotes(notes => [
      {
        ...note,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        x: 100,
        y: 100,
        width: 240,
        height: 160,
      },
      ...notes,
    ]);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    setNotes(notes => notes.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(notes => notes.filter(n => n.id !== id));
  }, []);

  return {
    snippets,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    notes,
    addNote,
    updateNote,
    deleteNote,
  };
} 