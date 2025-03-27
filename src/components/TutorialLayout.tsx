
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface TutorialLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  previousTutorial: {
    slug: string;
    title: string;
  } | null;
  nextTutorial: {
    slug: string;
    title: string;
  } | null;
}

const TutorialLayout: React.FC<TutorialLayoutProps> = ({
  title,
  description,
  children,
  previousTutorial,
  nextTutorial
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/tutorials">Tutorials</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{title}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            <p className="text-muted-foreground text-lg">{description}</p>
          </header>
          
          <div className="prose prose-slate max-w-none dark:prose-invert">
            {children}
          </div>
          
          <div className="mt-16 flex justify-between items-center">
            {previousTutorial ? (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/tutorials/${previousTutorial.slug}`)}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {previousTutorial.title}
              </Button>
            ) : (
              <div></div>
            )}
            
            {nextTutorial ? (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/tutorials/${nextTutorial.slug}`)}
                className="flex items-center"
              >
                {nextTutorial.title}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TutorialLayout;
