import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  onCopy?: (text: string) => void;
  copied?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  showLineNumbers = true,
  onCopy,
  copied: externalCopied,
}) => {
  const [internalCopied, setInternalCopied] = useState(false);
  const isCopied = externalCopied !== undefined ? externalCopied : internalCopied;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    
    if (onCopy) {
      // Use the external copy handler if provided
      onCopy(code);
    } else {
      // Otherwise use internal state
      setInternalCopied(true);
      setTimeout(() => setInternalCopied(false), 2000);
    }
  };

  return (
    <div className="relative group">
      <pre className={cn(
        "rounded-md bg-secondary/50 p-4 overflow-x-auto text-sm",
        showLineNumbers ? "pl-12" : ""
      )}>
        {showLineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-secondary/40 flex flex-col items-center py-4 text-muted-foreground text-xs border-r border-muted">
            {code.split('\n').map((_, i) => (
              <div key={i} className="leading-5 h-5">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <code className="language-{language}">{code}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-2 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        aria-label="Copy code"
      >
        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <div className="absolute top-0 right-0 px-3 py-1 rounded-bl rounded-tr-md text-xs font-medium text-muted-foreground bg-secondary/90">
        {language}
      </div>
    </div>
  );
};

export default CodeBlock;
