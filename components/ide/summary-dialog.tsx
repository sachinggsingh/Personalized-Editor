'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface SummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language?: string;
}

export function SummaryDialog({
  isOpen,
  onClose,
  code,
  language,
}: SummaryDialogProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && code.trim()) {
      generateSummary();
    }
  }, [isOpen, code]);

  const generateSummary = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('/api/summarize-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: language
        })
      });

      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('Failed to connect to summarization service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] bg-[#1e1e1e] border-[#2d2d2d] text-white p-0">
        <SheetHeader className="p-6 flex flex-row items-center justify-between border-b border-[#2d2d2d]">
          <div>
            <SheetTitle className="text-white text-xl">Code Summary</SheetTitle>
            <SheetDescription className="text-gray-400 mt-1">
              AI-powered analysis of your code
            </SheetDescription>
          </div>
        </SheetHeader>
        <div className="p-6 font-mono text-sm overflow-y-auto h-[calc(100vh-120px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <p className="text-gray-400">Analyzing your code...</p>
            </div>
          ) : error ? (
            <div className="text-red-400 space-y-2">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
              <Button 
                onClick={generateSummary}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <div className="bg-[#2d2d2d] p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">Summary:</h3>
                <pre className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">{summary}</pre>
              </div>
              <Button 
                onClick={generateSummary}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Regenerate Summary
              </Button>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              No code to summarize
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 