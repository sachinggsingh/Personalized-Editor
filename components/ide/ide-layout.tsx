"use client";

import { useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Header } from "./header";
import { FileExplorer } from "./file-explorer";
import { CodeEditor } from "./code-editor";
import { Terminal } from "./terminal";
import { ProjectTemplatesDialog } from "./project-templates-dialog";
import { useIDEState } from "@/hooks/use-ide-state";
import { ProjectTemplate } from "@/types/ide";
import StickyNotes from './sticky-notes';
import { SummaryDialog } from "./summary-dialog";

export function IDELayout() {
  const {
    state,
    setFiles,
    openFile,
    closeTab,
    updateTabContent,
    saveFile,
    createFile,
    deleteFile,
    toggleFolder,
    addTerminalLine,
    toggleTerminal,
    setActiveTab,
    setProjectName,
    getCurrentTab,
    clearTerminal,
  } = useIDEState();

  const [isRunning, setIsRunning] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const handleNewProject = () => {
    setShowTemplatesDialog(true);
  };

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setFiles(template.files);
    setProjectName(template.name);

    // Open the main file if available
    const mainFile = template.files.find(
      (f) =>
        f.name === "index.html" || f.name === "App.tsx" || f.name === "page.tsx"
    );
    if (mainFile) {
      openFile(mainFile);
    }
  };

  const handleRunProject = async () => {
    const currentTab = getCurrentTab();
    if (!currentTab) return;

    setIsRunning(true);
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: currentTab.content, 
          language: currentTab.language 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        addTerminalLine({
          type: "output",
          content: result.output,
        });
      } else {
        addTerminalLine({
          type: "error",
          content: result.error || result.details || 'Execution failed',
        });
      }
    } catch (error) {
      addTerminalLine({
        type: "error",
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    setIsRunning(false);
  };

  const handleStopProject = () => {
    setIsRunning(false);
    addTerminalLine({
      type: "command",
      content: "Process terminated",
    });
  };

  const handleTerminalCommand = (command: string) => {
    if (command.startsWith("OUTPUT:")) {
      addTerminalLine({
        type: "output",
        content: command.substring(7),
      });
    } else if (command === "clear") {
      clearTerminal();
    } else {
      addTerminalLine({
        type: "command",
        content: command,
      });
    }
  };

  return (
    <div className="h-screen bg-[#1e1e1e] flex flex-col overflow-hidden">
      {(() => {
        const currentTab = getCurrentTab();
        return (
          <Header
            projectName={state.projectName}
            onProjectNameChange={setProjectName}
            onNewProject={handleNewProject}
            onOpenProject={() => {}}
            onSaveProject={() => {}}
            onRunProject={handleRunProject}
            onStopProject={handleStopProject}
            isRunning={isRunning}
            currentCode={currentTab?.content || ''}
            onOpenNotes={() => setShowNotes(true)}
          />
        );
      })()}
      {showNotes && <StickyNotes onClose={() => setShowNotes(false)} />}
      <div className="flex-1 flex">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <FileExplorer
              files={state.files}
              activeFile={state.activeFile}
              onFileSelect={openFile}
              onFileCreate={createFile}
              onFileDelete={deleteFile}
              onFolderToggle={toggleFolder}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-[#2d2d2d] hover:bg-[#404040] transition-colors" />

          <Panel defaultSize={74} >
            <div className="flex flex-col h-full min-h-0">
              <CodeEditor
                tabs={state.openTabs}
                activeTab={state.activeTab}
                onTabSelect={setActiveTab}
                onTabClose={closeTab}
                onContentChange={updateTabContent}
                onSave={saveFile}
                value={getCurrentTab()?.content}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-[#2d2d2d] hover:bg-[#404040] transition-colors" />

          <Panel defaultSize={25} minSize={20} maxSize={50}>
            <Terminal
              isOpen={state.isTerminalOpen}
              onToggle={toggleTerminal}
              history={state.terminalHistory}
              onCommand={handleTerminalCommand}
              onClear={clearTerminal}
              currentDirectory={state.currentDirectory}
            />
          </Panel>
        </PanelGroup>
      </div>

      <div className="h-6 bg-[#007acc] flex items-center justify-between px-4 text-xs text-white">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <button
            onClick={toggleTerminal}
            className="hover:text-gray-200 transition-colors"
          >
            Terminal
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
        </div>
      </div>

      <ProjectTemplatesDialog
        isOpen={showTemplatesDialog}
        onClose={() => setShowTemplatesDialog(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <SummaryDialog
        isOpen={isSummaryDialogOpen}
        onClose={() => setIsSummaryDialogOpen(false)}
        code={getCurrentTab()?.content || ''}
        language={getCurrentTab()?.language}
      />
    </div>
  );
}
