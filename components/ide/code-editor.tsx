"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Save, Circle } from "lucide-react";
import { EditorTab } from "@/types/ide";
import { getFileIcon } from "@/lib/file-utils";
import { cn } from "@/lib/utils";
import Editor, { OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  tabs: EditorTab[];
  activeTab: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onContentChange: (tabId: string, content: string) => void;
  onSave: (tabId: string) => void;
  value?: string; // collaborative value override
}

function MonacoEditor({
  content,
  language,
  onChange,
}: {
  content: string;
  language: string;
  onChange: (content: string) => void;
}) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      value={content}
      onChange={(value) => onChange(value || "")}
      theme="vs-dark"
      onMount={handleEditorDidMount}
    />
  );
}

export function CodeEditor({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose,
  onContentChange,
  onSave,
  value,
}: CodeEditorProps) {
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  if (!tabs.length) {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex items-center justify-center text-gray-400 text-center p-4">
        <div>
          <p className="text-lg mb-2">No files open</p>
          <p className="text-sm">
            Select a file from the explorer to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e]">
      {/* Tabs Bar */}
      <div className="h-10 bg-[#2d2d2d] border-b border-[#404040] flex items-center px-2">
        <ScrollArea className="w-full h-full">
          <div className="flex">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-3 border-r border-[#404040] cursor-pointer group min-w-32",
                  activeTab === tab.id
                    ? "bg-[#1e1e1e] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#3d3d3d]"
                )}
                onClick={() => onTabSelect(tab.id)}
              >
                <span className="text-xm">{getFileIcon(tab.name)}</span>
                <span className="text-xm truncate flex-1">{tab.name}</span>
                <div className="flex items-center gap-1">
                  {tab.isDirty && <Circle className="w-2 h-2 fill-white" />}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-[#404040]"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Save Bar */}
      {currentTab && (
        <>
          <div className="h-8 bg-[#2d2d2d] border-b border-[#404040] flex items-center justify-between px-3 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span>{currentTab.path}</span>
              {currentTab.isDirty && <span>• Unsaved changes</span>}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSave(currentTab.id)}
              className="h-6 hover:text-white hover:bg-[#404040]"
              disabled={!currentTab.isDirty}
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              content={typeof value === 'string' ? value : currentTab.content}
              language={currentTab.language}
              onChange={(content) => {
                onContentChange(currentTab.id, content);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
