
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, Calendar, User, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BlogPage: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Zero-Knowledge Proofs: The Future of Privacy-Preserving Verification',
      excerpt: 'Explore how zero-knowledge proofs are revolutionizing the way we verify information without revealing sensitive data.',
      image: 'placeholder.svg',
      date: '2025-03-15',
      author: 'Alex Johnson',
      category: 'Technology',
      tags: ['ZK Proofs', 'Privacy', 'Web3']
    },
    {
      id: 2,
      title: 'Bridging Web2 and Web3: The Evolution of Identity',
      excerpt: 'How secure address verification is creating a seamless connection between traditional commerce and blockchain technologies.',
      image: 'placeholder.svg',
      date: '2025-03-10',
      author: 'Maria Garcia',
      category: 'Industry',
      tags: ['Web3', 'Identity', 'Blockchain']
    },
    {
      id: 3,
      title: 'The Privacy Paradox: Verification Without Exposure',
      excerpt: 'Addressing the challenge of proving you are who you say you are without revealing private information.',
      image: 'placeholder.svg',
      date: '2025-03-05',
      author: 'Jamal Williams',
      category: 'Security',
      tags: ['Privacy', 'Security', 'Identity']
    },
    {
      id: 4,
      title: 'Smart Contracts for Shipping: A New Paradigm',
      excerpt: 'How blockchain-based smart contracts are transforming the logistics and shipping industry.',
      image: 'placeholder.svg',
      date: '2025-02-28',
      author: 'Sarah Chen',
      category: 'Industry',
      tags: ['Smart Contracts', 'Logistics', 'Shipping']
    },
    {
      id: 5,
      title: 'The Future of E-commerce with Decentralized Identity',
      excerpt: 'Exploring how decentralized identity solutions will reshape online shopping experiences.',
      image: 'placeholder.svg',
      date: '2025-02-20',
      author: 'David Kim',
      category: 'Business',
      tags: ['E-commerce', 'DID', 'Web3']
    },
    {
      id: 6,
      title: 'Regulatory Compliance in the Age of Blockchain',
      excerpt: 'Navigating the complex landscape of global regulations while leveraging blockchain technology.',
      image: 'placeholder.svg',
      date: '2025-02-15',
      author: 'Emma Thompson',
      category: 'Compliance',
      tags: ['Regulation', 'Compliance', 'Legal']
    },
  ];

  const categories = ['All', 'Technology', 'Industry', 'Security', 'Business', 'Compliance'];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog & Insights</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore the latest articles, tutorials, and insights about privacy, blockchain, and secure address verification.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Subscribe to our newsletter:</span>
              <Input
                placeholder="Your email"
                className="max-w-[200px]"
              />
              <Button size="sm">Subscribe</Button>
            </div>
          </div>
          
          <Tabs defaultValue="All" className="mb-10">
            <TabsList className="mb-8">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogPosts
                    .filter(post => category === 'All' || post.category === category)
                    .map(post => (
                      <Card key={post.id} className="overflow-hidden flex flex-col h-full">
                        <div className="h-48 bg-muted flex items-center justify-center">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <CardContent className="pt-6 flex-grow">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge variant="secondary">{post.category}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {post.date}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                          <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                          <div className="flex items-center text-xs text-muted-foreground mb-3">
                            <User className="h-3 w-3 mr-1" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                              <span key={tag} className="text-xs bg-muted px-2 py-1 rounded flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                          <Button variant="ghost" className="ml-auto text-primary flex items-center">
                            Read Article
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
