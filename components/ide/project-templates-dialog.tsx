'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProjectTemplates } from '@/lib/project-templates';
import { ProjectTemplate } from '@/types/ide';

interface ProjectTemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export function ProjectTemplatesDialog({
  isOpen,
  onClose,
  onSelectTemplate,
}: ProjectTemplatesDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const templates = getProjectTemplates();

  const handleCreateProject = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#1e1e1e] border-[#2d2d2d] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Project</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-[#404040] bg-[#2d2d2d] hover:border-[#606060]'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div>
                    <CardTitle className="text-sm font-medium text-white">
                      {template.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Template
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-gray-400">
                  {template.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#404040]">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-[#404040]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            disabled={!selectedTemplate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}