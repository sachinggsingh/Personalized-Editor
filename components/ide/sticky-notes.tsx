import React, { useState } from 'react';
import { useSnippetManager } from '../../hooks/use-snippet-manager';
import { StickyNote } from '../../types/ide';
import { Rnd } from 'react-rnd';
import { Trash2 } from 'lucide-react';

export default function StickyNotes({ onClose }: { onClose?: () => void }) {
  const { notes, addNote, updateNote, deleteNote } = useSnippetManager();
  const [newContent, setNewContent] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAdd = () => {
    if (newContent.trim()) {
      addNote({ content: newContent, color: '#23272a' });
      setNewContent('');
      setShowInput(false);
    }
  };

  return (
    <>
      {/* Floating Add Note Button */}
      <button
        className="fixed bottom-6 right-6 z-[100] bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full shadow-lg"
        onClick={() => setShowInput((v) => !v)}
        title="Add Sticky Note"
      >
        + Note
      </button>
      {/* Add Note Input */}
      {showInput && (
        <div className="fixed bottom-20 right-6 z-[101] bg-[#23272a] border border-[#404040] rounded-lg p-4 flex gap-2 items-center shadow-lg">
          <input
            className="flex-1 border border-[#404040] bg-[#1e1e1e] rounded px-2 py-1 text-white placeholder-gray-400"
            placeholder="Add a note..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            autoFocus
          />
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
      )}
      {/* Render all sticky notes as draggable/resizable */}
      {notes.map(note => (
        <Rnd
          key={note.id}
          default={{
            x: note.x ?? 100,
            y: note.y ?? 100,
            width: note.width ?? 240,
            height: note.height ?? 160,
          }}
          position={{ x: note.x ?? 100, y: note.y ?? 100 }}
          size={{ width: note.width ?? 240, height: note.height ?? 160 }}
          minWidth={160}
          minHeight={80}
          bounds="window"
          onDragStop={(_, d) => updateNote(note.id, { x: d.x, y: d.y })}
          onResizeStop={(_, __, ref, delta, position) => {
            updateNote(note.id, {
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              x: position.x,
              y: position.y,
            });
          }}
          className="z-[99]"
        >
          <div className="bg-[#2d2d2d] rounded-lg shadow-lg flex flex-col gap-2 relative h-full w-full border border-[#404040]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#404040] cursor-move">
              <span className="font-bold text-white text-sm">Note</span>
              <button
                className="text-xs text-red-400 hover:text-red-600"
                onClick={() => deleteNote(note.id)}
                title="Delete note"
              >
                <Trash2 size={16}/>
              </button>
            </div>
            <textarea
              className="bg-transparent w-full flex-1 resize-none outline-none text-white placeholder-gray-400 px-3 py-2"
              value={note.content}
              onChange={e => updateNote(note.id, { content: e.target.value })}
              rows={3}
              style={{ color: 'white', minHeight: 40 }}
            />
          </div>
        </Rnd>
      ))}
      {/* Optional: Close all notes button */}
      {onClose && (
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[110] text-gray-400 hover:text-white bg-[#23272a] border border-[#404040] rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
          title="Close Sticky Notes Mode"
        >
          ✕
        </button>
      )}
    </>
  );
} 