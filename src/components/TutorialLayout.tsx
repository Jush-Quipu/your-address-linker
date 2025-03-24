
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface TutorialLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  previousTutorial?: {
    slug: string;
    title: string;
  };
  nextTutorial?: {
    slug: string;
    title: string;
  };
}

const TutorialLayout: React.FC<TutorialLayoutProps> = ({
  children,
  title,
  description,
  previousTutorial,
  nextTutorial,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Link to="/docs" className="hover:text-primary flex items-center">
                <Home className="h-4 w-4 mr-1" />
                <span>Documentation</span>
              </Link>
              <span className="mx-2">/</span>
              <Link to="/tutorials" className="hover:text-primary">
                Tutorials
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{title}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            {description && (
              <p className="text-muted-foreground text-lg">{description}</p>
            )}
          </div>
          
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
          
          <div className="mt-12 border-t pt-6 flex justify-between">
            {previousTutorial ? (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/tutorials/${previousTutorial.slug}`)}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {previousTutorial.title}
              </Button>
            ) : (
              <div></div>
            )}
            
            {nextTutorial && (
              <Button 
                onClick={() => navigate(`/tutorials/${nextTutorial.slug}`)}
                className="flex items-center"
              >
                {nextTutorial.title}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TutorialLayout;
