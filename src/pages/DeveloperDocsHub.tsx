
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon, BookOpen, Code, FileText, BookMarked, Puzzle, Download, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DeveloperDocsHub = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Sample documentation categories
  const documentationCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of SecureAddress Bridge integration',
      items: [
        { title: 'Introduction', url: '/developer/docs?tab=api&section=introduction' },
        { title: 'Quick Start Guide', url: '/developer/docs?tab=api&section=quickstart' },
        { title: 'Authentication', url: '/developer/docs?tab=api&section=authentication' },
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Complete reference for our REST API endpoints',
      items: [
        { title: 'Address Management', url: '/developer/docs?tab=api&section=addresses' },
        { title: 'Permission Management', url: '/developer/docs?tab=api&section=permissions' },
        { title: 'Verification', url: '/developer/docs?tab=api&section=verification' },
      ]
    },
    {
      id: 'sdk-libraries',
      title: 'SDK Libraries',
      description: 'Official client libraries for multiple platforms',
      items: [
        { title: 'JavaScript SDK', url: '/developer/docs?tab=sdk&section=javascript' },
        { title: 'Python SDK', url: '/developer/docs?tab=sdk&section=python' },
        { title: 'React SDK', url: '/developer/docs?tab=sdk&section=react' },
      ]
    },
    {
      id: 'tutorials',
      title: 'Tutorials',
      description: 'Step-by-step guides for common integration scenarios',
      items: [
        { title: 'E-commerce Integration', url: '/tutorials/ecommerce' },
        { title: 'Web3 Wallet Linking', url: '/tutorials/web3-wallet' },
        { title: 'Address Verification', url: '/tutorials/verification' },
      ]
    },
    {
      id: 'examples',
      title: 'Code Examples',
      description: 'Ready-to-use code examples and boilerplates',
      items: [
        { title: 'E-commerce Checkout', url: '/developer/docs?tab=examples&section=ecommerce' },
        { title: 'User Profile Integration', url: '/developer/docs?tab=examples&section=profiles' },
        { title: 'Zero-Knowledge Proofs', url: '/developer/docs?tab=examples&section=zkp' },
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      description: 'Recommendations for secure and efficient implementations',
      items: [
        { title: 'Security Guidelines', url: '/developer/docs?tab=best-practices&section=security' },
        { title: 'Performance Optimization', url: '/developer/docs?tab=best-practices&section=performance' },
        { title: 'Data Privacy', url: '/developer/docs?tab=best-practices&section=privacy' },
      ]
    }
  ];

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <HomeIcon className="h-4 w-4 mr-1" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer">Developer</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer/docs">Documentation</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-primary" />
                Developer Documentation
              </h1>
              <p className="text-muted-foreground">
                Comprehensive guides, API references, and SDKs for integrating with SecureAddress Bridge
              </p>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              Developer
            </Badge>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-5 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="api">API Docs</TabsTrigger>
              <TabsTrigger value="sdk">SDK</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Documentation Center</CardTitle>
                  <CardDescription>
                    Find everything you need to integrate with SecureAddress Bridge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documentationCategories.map(category => (
                      <Card key={category.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <ul className="space-y-1">
                            {category.items.map((item, i) => (
                              <li key={i}>
                                <Button variant="link" className="p-0 h-auto text-sm" asChild>
                                  <a href={item.url}>{item.title}</a>
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="h-5 w-5 mr-2" />
                      Downloads
                    </CardTitle>
                    <CardDescription>
                      SDK packages, reference materials, and templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">SDK Packages</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          <Code className="h-4 w-4 mr-2" />
                          JavaScript SDK (v1.2.0)
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          <Code className="h-4 w-4 mr-2" />
                          Python SDK (v1.1.0)
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          <Code className="h-4 w-4 mr-2" />
                          React SDK (v1.0.5)
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Documentation</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          API Reference (PDF)
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Integration Guide (PDF)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Github className="h-5 w-5 mr-2" />
                      Community Resources
                    </CardTitle>
                    <CardDescription>
                      Developer community, open source projects, and more
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Open Source Projects</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full text-left justify-start" asChild>
                          <a href="https://github.com/SecureAddressBridge/js-sdk" target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            SecureAddressBridge/js-sdk
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start" asChild>
                          <a href="https://github.com/SecureAddressBridge/react-components" target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            SecureAddressBridge/react-components
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start" asChild>
                          <a href="https://github.com/SecureAddressBridge/examples" target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            SecureAddressBridge/examples
                          </a>
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Community</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full text-left justify-start" asChild>
                          <a href="https://github.com/SecureAddressBridge/community" target="_blank" rel="noopener noreferrer">
                            <Puzzle className="h-4 w-4 mr-2" />
                            Developer Forum
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start" asChild>
                          <a href="https://discord.gg/secureaddress" target="_blank" rel="noopener noreferrer">
                            <BookMarked className="h-4 w-4 mr-2" />
                            Discord Community
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Reference</CardTitle>
                  <CardDescription>
                    Complete documentation for the SecureAddress Bridge REST API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      API documentation content would go here. This would typically include endpoint details, 
                      request/response formats, authentication information, and example responses.
                    </p>
                    <Button onClick={() => navigate('/api-testing')}>
                      Try API in Testing Tool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sdk" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SDK Libraries</CardTitle>
                  <CardDescription>
                    Official client libraries for multiple platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      SDK documentation content would go here. This would include installation instructions,
                      API references, example usage, and configuration options.
                    </p>
                    <Button onClick={() => navigate('/developer/sandbox')}>
                      Try SDK in Sandbox
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Code Examples</CardTitle>
                  <CardDescription>
                    Ready-to-use code examples and boilerplates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Example code snippets and implementation samples would go here. This would 
                      include complete working examples for various use cases and platforms.
                    </p>
                    <Button asChild>
                      <a href="https://github.com/SecureAddressBridge/examples" target="_blank" rel="noopener noreferrer">
                        View Examples Repository
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tutorials" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tutorials</CardTitle>
                  <CardDescription>
                    Step-by-step guides for common integration scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Tutorial content would go here. This would include comprehensive guides walking
                      through specific integration scenarios with detailed explanations.
                    </p>
                    <Button onClick={() => navigate('/tutorials')}>
                      View All Tutorials
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperDocsHub;
