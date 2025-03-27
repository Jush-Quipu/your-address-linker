import React from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  onCopy?: (text: string) => void;
  copied?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  showLineNumbers = false,
  onCopy,
  copied = false
}) => {
  const [internalCopied, setInternalCopied] = React.useState(false);
  
  const isCopied = onCopy ? copied : internalCopied;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    
    if (onCopy) {
      onCopy(code);
    } else {
      setInternalCopied(true);
      toast.success('Code copied to clipboard');
      
      setTimeout(() => {
        setInternalCopied(false);
      }, 2000);
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2">
        <button
          onClick={copyToClipboard}
          className="h-8 w-8 rounded-md bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center"
          aria-label="Copy code"
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      
      <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-t-md border border-border">
        <div className="text-xs font-mono text-muted-foreground">{language}</div>
      </div>
      
      <pre 
        className={`bg-muted p-4 rounded-b-md overflow-x-auto text-sm font-mono border border-t-0 border-border
          ${showLineNumbers ? 'line-numbers' : ''}`}
      >
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
