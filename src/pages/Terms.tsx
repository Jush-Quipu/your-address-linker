
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: May 15, 2023
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p>
              Welcome to SecureAddress Bridge. By using our platform, you agree to these Terms of Service.
              Please read them carefully.
            </p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using SecureAddress Bridge (the "Service"), you agree to be bound by these Terms of Service
              and our Privacy Policy. If you do not agree to these terms, please do not use the Service.
            </p>
            
            <h2>2. Description of Service</h2>
            <p>
              SecureAddress Bridge is a privacy-preserving platform that allows users to securely link their blockchain
              wallet address to a verified physical home address and selectively share this information with authorized
              third parties.
            </p>
            
            <h2>3. Account Registration and Requirements</h2>
            <p>
              To use certain features of the Service, you must register for an account by either:
            </p>
            <ul>
              <li>Connecting a compatible Web3 wallet; or</li>
              <li>Creating an account with an email address and password.</li>
            </ul>
            <p>
              You are responsible for maintaining the security of your account and for all activities that occur under your account.
              You must be at least 18 years old to use the Service.
            </p>
            
            <h2>4. Address Verification</h2>
            <p>
              You agree to provide accurate and truthful information when verifying your physical address.
              Providing false information may result in termination of your account and possible legal consequences.
              We reserve the right to reject any verification attempt that appears fraudulent or suspicious.
            </p>
            
            <h2>5. User Conduct</h2>
            <p>
              When using the Service, you agree not to:
            </p>
            <ul>
              <li>Violate any applicable laws or regulations.</li>
              <li>Infringe upon the rights of others, including privacy and intellectual property rights.</li>
              <li>Use the Service for illegal or unauthorized purposes.</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts.</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service.</li>
              <li>Use the Service to distribute malware, spyware, or other harmful code.</li>
              <li>Scrape, crawl, or use automated means to access the Service.</li>
              <li>Sell, resell, rent, or lease access to the Service without our written permission.</li>
            </ul>
            
            <h2>6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by SecureAddress Bridge
              and are protected by international copyright, trademark, patent, trade secret, and other intellectual
              property or proprietary rights laws.
            </p>
            
            <h2>7. User-Generated Content</h2>
            <p>
              You retain all rights to the content you upload to the Service, including verification documents.
              By uploading content, you grant us a limited license to use, process, and store such content as necessary
              to provide the Service.
            </p>
            
            <h2>8. Third-Party Services</h2>
            <p>
              The Service may integrate with or link to third-party services, including blockchain networks and
              shipping providers. Your use of such third-party services is subject to their respective terms of service
              and privacy policies. We are not responsible for the practices of such third parties.
            </p>
            
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SecureAddress Bridge and its officers, directors, employees, and agents
              shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including
              loss of profits, data, or goodwill, resulting from your access to or use of the Service.
            </p>
            
            <h2>10. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "as is" and "as available" basis without warranties of any kind,
              either express or implied, including, but not limited to, implied warranties of merchantability,
              fitness for a particular purpose, or non-infringement.
            </p>
            
            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. We will provide notice of significant
              changes through the Service or by other means. Your continued use of the Service after such modifications
              constitutes your acceptance of the revised Terms.
            </p>
            
            <h2>12. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability,
              for any reason, including breach of these Terms. Upon termination, your right to use the Service will
              immediately cease.
            </p>
            
            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions.
              Any disputes arising under these Terms shall be resolved exclusively in the state or federal courts located in
              San Francisco County, California.
            </p>
            
            <h2>14. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              legal@secureaddress.bridge<br />
              SecureAddress Bridge, Inc.<br />
              123 Privacy Street<br />
              San Francisco, CA 94103<br />
              United States
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
