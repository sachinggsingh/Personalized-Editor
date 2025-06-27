import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface ExecuteRequest {
  code: string;
  language: string;
  input?: string;
}

// Piston API configuration
const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

// Language mapping for Piston
const LANGUAGE_MAPPING: Record<string, string> = {
  'python': 'python',
  'javascript': 'javascript',
  'js': 'javascript',
  'node': 'javascript',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'typescript': 'typescript',
  'ts': 'typescript',
};

export async function POST(request: NextRequest) {
  try {
    const { code, language, input }: ExecuteRequest = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    // Map language to Piston language
    const pistonLanguage = LANGUAGE_MAPPING[language.toLowerCase()];
    
    if (!pistonLanguage) {
      return NextResponse.json({ 
        error: 'command not supported', 
        supportedLanguages: Object.keys(LANGUAGE_MAPPING)
      }, { status: 400 });
    }

    // Execute code using Piston API
    const result = await executeWithPiston(pistonLanguage, code, input);

    return NextResponse.json({ 
      output: result.output, 
      error: result.error,
      success: !result.error 
    });

  } catch (err) {
    console.error('Execution error:', err);
    return NextResponse.json({ 
      error: 'Execution failed', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}

async function executeWithPiston(language: string, code: string, input?: string): Promise<{ output: string; error: string | null }> {
  try {
    const response = await fetch(PISTON_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: '*', // Use latest version
        files: [
          {
            name: `main.${getFileExtension(language)}`,
            content: code
          }
        ],
        stdin: input || '',
        args: []
      })
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.run) {
      const { stdout, stderr, signal, code: exitCode } = data.run;
      
      if (signal) {
        return { output: '', error: `Process killed by signal: ${signal}` };
      }
      
      if (exitCode !== 0) {
        return { output: stdout || '', error: stderr || `Process exited with code ${exitCode}` };
      }
      
      return { output: stdout || '', error: null };
    } else {
      return { output: '', error: 'No execution result from Piston API' };
    }

  } catch (error) {
    console.error('Piston API error:', error);
    return { 
      output: '', 
      error: `Failed to execute code: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    'python': 'py',
    'javascript': 'js',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'csharp': 'cs',
    'php': 'php',
    'ruby': 'rb',
    'go': 'go',
    'rust': 'rs',
    'swift': 'swift',
    'kotlin': 'kt',
    'typescript': 'ts',
  };
  
  return extensions[language] || 'txt';
} 