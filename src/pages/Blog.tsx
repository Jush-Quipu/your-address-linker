
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const BlogPage: React.FC = () => {
  const blogPosts = [
    {
      title: "Introducing SecureAddress Bridge: Privacy-First Address Verification",
      excerpt: "Today, we're excited to announce the launch of SecureAddress Bridge, a new platform that connects Web3 wallets with physical addresses while preserving privacy.",
      date: new Date('2023-09-15'),
      author: "Alex Rivera",
      category: "Announcements",
      readTime: 5
    },
    {
      title: "Zero-Knowledge Proofs: The Key to Private Address Verification",
      excerpt: "Learn how zero-knowledge proofs power our platform and allow us to verify addresses without exposing sensitive information.",
      date: new Date('2023-10-02'),
      author: "Sophia Chen",
      category: "Technology",
      readTime: 8
    },
    {
      title: "The Privacy Problem in E-commerce: How Web3 Can Help",
      excerpt: "E-commerce platforms collect vast amounts of data about customers. See how blockchain-based solutions can enhance privacy while maintaining service quality.",
      date: new Date('2023-10-18'),
      author: "Marcus Johnson",
      category: "Industry",
      readTime: 6
    },
    {
      title: "Partnering with Major Carriers for Secure Address Verification",
      excerpt: "We're excited to announce partnerships with leading shipping carriers to create a more secure, private shipping experience for online shoppers.",
      date: new Date('2023-11-05'),
      author: "Alex Rivera",
      category: "Partnerships",
      readTime: 4
    },
    {
      title: "Building a Privacy-First Company in a Data-Hungry World",
      excerpt: "Our founder shares the challenges and opportunities in creating a company that prioritizes user privacy above all else.",
      date: new Date('2023-11-22'),
      author: "Alex Rivera",
      category: "Company",
      readTime: 7
    },
    {
      title: "Introducing Our Developer SDK: Build with Privacy",
      excerpt: "Today we're launching our developer SDK, making it easier than ever to integrate privacy-preserving address verification into your applications.",
      date: new Date('2023-12-10'),
      author: "Sophia Chen",
      category: "Product",
      readTime: 5
    }
  ];

  const categories = ["All", "Announcements", "Technology", "Industry", "Partnerships", "Company", "Product"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights on privacy, blockchain technology, and the future of address verification.
            </p>
          </div>
          
          <div className="mb-10 flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <Button 
                key={index} 
                variant={index === 0 ? "default" : "outline"} 
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary">
                      {post.category}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      {format(post.date, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold leading-tight">{post.title}</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {post.author.split(' ')[0][0]}{post.author.split(' ')[1] ? post.author.split(' ')[1][0] : ''}
                      </span>
                    </div>
                    <span className="text-sm">{post.author}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{post.readTime} min read</span>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg">
              Load More
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
