
import React from 'react';
import { ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  showLineNumbers = true 
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="relative my-6">
      <pre className={`p-4 rounded-lg overflow-x-auto bg-slate-950 text-slate-50 text-sm ${showLineNumbers ? 'pl-12' : ''}`}>
        {showLineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-end pr-2 py-4 text-slate-500 select-none bg-slate-900/50 rounded-l-lg">
            {code.split('\n').map((_, i) => (
              <div key={i} className="text-xs">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 text-xs px-2 py-1 h-auto opacity-50 hover:opacity-100"
        onClick={copyToClipboard}
      >
        <ClipboardCopy className="h-3 w-3 mr-1" />
        Copy
      </Button>
    </div>
  );
};

export default CodeBlock;
