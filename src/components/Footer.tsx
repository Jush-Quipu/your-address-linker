
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SB</span>
              </div>
              <span className="font-semibold">SecureAddress Bridge</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your privacy-preserving bridge between blockchain wallets and verified physical addresses.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="/security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/integrations" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
              <li><Link to="/tutorials" className="text-muted-foreground hover:text-foreground transition-colors">Tutorials</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/compliance" className="text-muted-foreground hover:text-foreground transition-colors">Compliance</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SecureAddress Bridge. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://twitter.com/secureaddressbridge" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="https://github.com/secureaddressbridge" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
              </svg>
            </a>
            <a href="https://discord.gg/secureaddressbridge" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Discord</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0c-.163-.38-.398-.861-.608-1.23a.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055c1.94 1.424 3.817 2.29 5.652 2.867a.077.077 0 0 0 .084-.026c.458-.62.865-1.272 1.226-1.96a.074.074 0 0 0-.042-.106c-.611-.231-1.198-.51-1.765-.826a.075.075 0 0 1-.008-.125c.119-.088.237-.18.351-.273a.075.075 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.075.075 0 0 1 .078.01c.114.094.232.185.351.273a.075.075 0 0 1-.006.127c-.567.316-1.154.595-1.765.825a.074.074 0 0 0-.043.107c.36.687.772 1.34 1.225 1.96a.076.076 0 0 0 .084.025c1.841-.578 3.719-1.444 5.657-2.867a.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.114 0-2.025-1.023-2.025-2.285 0-1.26.894-2.285 2.025-2.285 1.138 0 2.048 1.036 2.025 2.285 0 1.262-.896 2.285-2.025 2.285zm7.467 0c-1.114 0-2.025-1.023-2.025-2.285 0-1.26.894-2.285 2.025-2.285 1.138 0 2.047 1.036 2.025 2.285 0 1.262-.895 2.285-2.025 2.285z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
