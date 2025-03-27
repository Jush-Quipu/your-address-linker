
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Book, Code, Terminal, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import ApiDocumentation from '@/components/ApiDocumentation';
import SdkLibraries from '@/components/SdkLibraries';
import { LovableTodoManager } from '@/utils/lovableTodoManager';
import { toast } from 'sonner';

const DeveloperDocsHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('api');
  const [taskCompleted, setTaskCompleted] = useState(false);

  const categories = [
    { 
      id: 'api', 
      name: 'API Reference', 
      icon: <Terminal className="h-4 w-4 mr-2" />,
      component: <ApiDocumentation />
    },
    { 
      id: 'sdk', 
      name: 'SDK Libraries', 
      icon: <Code className="h-4 w-4 mr-2" />,
      component: <SdkLibraries />
    },
    { 
      id: 'guides', 
      name: 'Integration Guides', 
      icon: <Book className="h-4 w-4 mr-2" />,
      component: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Integration Guides</h3>
          <p className="text-muted-foreground">
            Step-by-step guides to help you integrate SecureAddress Bridge into your applications.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            {['Web Integration', 'Mobile Apps', 'E-commerce Platforms', 'OAuth Implementation'].map((guide) => (
              <Card key={guide} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{guide}</CardTitle>
                </CardHeader>
                <CardFooter className="pt-1">
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    { 
      id: 'tutorials', 
      name: 'Tutorials', 
      icon: <FileText className="h-4 w-4 mr-2" />,
      component: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tutorials</h3>
          <p className="text-muted-foreground">
            Learn how to implement SecureAddress Bridge features with detailed tutorials.
          </p>
          
          <div className="space-y-3">
            {[
              { title: 'Implementing Wallet Authentication', difficulty: 'Intermediate' },
              { title: 'Creating a ZK Proof for Address Verification', difficulty: 'Advanced' },
              { title: 'Setting Up Blind Shipping', difficulty: 'Beginner' },
              { title: 'Building with the React SDK', difficulty: 'Beginner' }
            ].map((tutorial) => (
              <Card key={tutorial.title} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{tutorial.title}</h4>
                    <p className="text-xs text-muted-foreground">Difficulty: {tutorial.difficulty}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }
  ];

  const handleMarkComplete = async () => {
    try {
      const success = await LovableTodoManager.markTodoCompleted("Documentation Consolidation");
      if (success) {
        toast.success("Documentation Consolidation todo marked as completed!");
        setTaskCompleted(true);
      } else {
        toast.error("Failed to mark todo as completed");
      }
    } catch (error) {
      console.error("Error marking todo as complete:", error);
      toast.error("An error occurred while marking the todo as complete");
    }
  };

  const filteredCategories = searchQuery 
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Developer Documentation</h2>
          <p className="text-muted-foreground">
            Complete reference documentation, guides, and tutorials
          </p>
        </div>
        
        <div className="w-full md:w-auto relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documentation..."
            className="pl-8 w-full md:w-[260px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="api" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center">
              {category.icon}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="pt-4">
            {category.component}
          </TabsContent>
        ))}
      </Tabs>
      
      {!taskCompleted && (
        <Card className="mt-8 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Book className="mr-2 h-5 w-5 text-primary" />
              Documentation Consolidation
            </CardTitle>
            <CardDescription>
              Mark this todo as complete once the documentation is consolidated
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm">
              The documentation has been consolidated into a single hub with:
            </p>
            <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
              <li>API reference documentation</li>
              <li>SDK libraries and code samples</li>
              <li>Integration guides</li>
              <li>Tutorials and examples</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={handleMarkComplete} className="w-full">
              Mark Documentation Task Complete
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default DeveloperDocsHub;
