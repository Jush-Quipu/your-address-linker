
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApiDocumentation from '@/components/ApiDocumentation';
import { useSearchParams } from 'react-router-dom';

const DeveloperDocs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'api-reference';

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Developer API Documentation</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Integrate SecureAddress Bridge into your applications to securely access user address information.
            </p>
          </div>
          
          <ApiDocumentation />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperDocs;
