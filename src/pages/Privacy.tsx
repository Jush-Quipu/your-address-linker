
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: May 15, 2023
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p>
              At SecureAddress Bridge, privacy isn't just a feature—it's our foundation. This Privacy Policy explains how we collect,
              use, and protect your information when you use our platform.
            </p>
            
            <h2>Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <ul>
              <li>
                <strong>Account Information:</strong> Email address (for Web2 login option), wallet public address
                (when connecting via Web3), and account preferences.
              </li>
              <li>
                <strong>Physical Address Information:</strong> Your verified home address, which is always stored in encrypted form.
              </li>
              <li>
                <strong>Verification Documents:</strong> Images of proof-of-residence documents (e.g., utility bills)
                that you upload for verification purposes. These are encrypted immediately upon upload.
              </li>
              <li>
                <strong>Usage Information:</strong> Information about how you use our platform, including access logs,
                permission grants, and service interactions.
              </li>
              <li>
                <strong>Technical Information:</strong> Device information, IP addresses, and other technical identifiers
                necessary for service provision and security.
              </li>
            </ul>
            
            <h2>How We Use Your Information</h2>
            <p>
              We use your information for the following purposes:
            </p>
            <ul>
              <li>To provide and maintain our service.</li>
              <li>To process address verification and create a secure link between your wallet and physical address.</li>
              <li>To facilitate permissioned sharing of your address information with third parties you authorize.</li>
              <li>To detect, prevent, and address technical issues and security concerns.</li>
              <li>To improve our service and develop new features.</li>
              <li>To communicate with you about service updates, security alerts, and support messages.</li>
            </ul>
            
            <h2>Privacy-Preserving Architecture</h2>
            <p>
              SecureAddress Bridge is built with privacy by design:
            </p>
            <ul>
              <li>
                <strong>End-to-End Encryption:</strong> Your physical address and verification documents are encrypted on your device
                before being transmitted to our servers.
              </li>
              <li>
                <strong>Zero-Knowledge Proofs:</strong> We use ZK proofs to verify the authenticity of your address information
                without needing to decrypt it for internal processing.
              </li>
              <li>
                <strong>Separate Storage:</strong> We store wallet addresses and physical addresses separately with cryptographic 
                linking to prevent direct association without proper authorization.
              </li>
              <li>
                <strong>Granular Permissions:</strong> You must explicitly authorize every access to your address information,
                with detailed control over what is shared, with whom, and for how long.
              </li>
            </ul>
            
            <h2>Data Sharing</h2>
            <p>
              We share your information only in the following circumstances:
            </p>
            <ul>
              <li>
                <strong>With Your Consent:</strong> We share your address information only with third parties you explicitly authorize
                through our permission system.
              </li>
              <li>
                <strong>Service Providers:</strong> We may engage trusted third parties to perform services on our behalf,
                subject to confidentiality agreements.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information if required by law, regulation, or legal process.
              </li>
            </ul>
            
            <h2>Your Rights and Controls</h2>
            <p>
              You have the following rights regarding your information:
            </p>
            <ul>
              <li>Access and update your personal information through your account settings.</li>
              <li>View and revoke any permissions you've granted to third parties.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Export your data in a portable format.</li>
              <li>Opt out of non-essential communications.</li>
            </ul>
            
            <h2>Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services.
              When you delete your account, we will delete or anonymize your information within 30 days,
              except where we are legally required to retain certain information.
            </p>
            
            <h2>International Data Transfers</h2>
            <p>
              As a global service, your information may be transferred to, stored, and processed in countries other
              than where you reside. We implement appropriate safeguards for international transfers as required by law.
            </p>
            
            <h2>Security</h2>
            <p>
              We implement strong security measures to protect your information, including encryption, access controls,
              and regular security audits. However, no system is perfectly secure, and we cannot guarantee absolute security.
            </p>
            
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes by email
              or through the platform and obtain consent where required by law.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              privacy@secureaddress.bridge<br />
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

export default PrivacyPage;
