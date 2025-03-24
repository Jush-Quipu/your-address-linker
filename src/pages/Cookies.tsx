
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CookiesPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground">
              Last updated: May 15, 2023
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p>
              This Cookie Policy explains how SecureAddress Bridge ("we", "us", or "our") uses cookies and similar 
              technologies to recognize you when you visit our website and application. It explains what these 
              technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            
            <h2>What are cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
              Cookies are widely used by website owners to make their websites work, or to work more efficiently, 
              as well as to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, SecureAddress Bridge) are called "first-party cookies". 
              Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies 
              enable third-party features or functionality to be provided on or through the website (e.g., advertising, 
              interactive content, and analytics).
            </p>
            
            <h2>Why do we use cookies?</h2>
            <p>
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical 
              reasons in order for our website and application to operate, and we refer to these as "essential" or 
              "strictly necessary" cookies. Other cookies enable us to track and target the interests of our users to 
              enhance the experience on our website. Third parties serve cookies through our website for analytics and 
              other purposes.
            </p>
            
            <h2>Types of cookies we use</h2>
            <p>
              The specific types of first and third-party cookies served through our website and the purposes they 
              perform are described below:
            </p>
            
            <h3>Essential Cookies</h3>
            <p>
              These cookies are strictly necessary to provide you with services available through our website and to 
              use some of its features, such as access to secure areas. Because these cookies are strictly necessary 
              to deliver the website, you cannot refuse them without impacting how our website functions.
            </p>
            <ul>
              <li><strong>Authentication cookies:</strong> Used to identify you when you log in to our platform.</li>
              <li><strong>Security cookies:</strong> Used to enhance the security of our service.</li>
              <li><strong>Session state cookies:</strong> Used to maintain your session state across page requests.</li>
            </ul>
            
            <h3>Performance and Functionality Cookies</h3>
            <p>
              These cookies are used to enhance the performance and functionality of our website but are non-essential 
              to their use. However, without these cookies, certain functionality may become unavailable.
            </p>
            <ul>
              <li><strong>Preferences cookies:</strong> Used to remember your preferences and settings.</li>
              <li><strong>Feature cookies:</strong> Used to recognize you when you return to our website.</li>
            </ul>
            
            <h3>Analytics and Customization Cookies</h3>
            <p>
              These cookies collect information that is used either in aggregate form to help us understand how our 
              website is being used or how effective our marketing campaigns are, or to help us customize our website 
              for you.
            </p>
            <ul>
              <li><strong>Analytics cookies:</strong> Collect information about how visitors use our website.</li>
              <li><strong>Performance cookies:</strong> Used to improve the way our website works.</li>
            </ul>
            
            <h2>How can you control cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences 
              as follows:
            </p>
            <ul>
              <li>
                <strong>Browser settings:</strong> You can set or amend your web browser controls to accept or refuse cookies. 
                If you choose to reject cookies, you may still use our website though your access to some functionality 
                and areas may be restricted.
              </li>
              <li>
                <strong>Cookie preference center:</strong> You can adjust your cookie preferences using our cookie preference 
                center accessible via the "Cookie Settings" link in the footer of our website.
              </li>
              <li>
                <strong>Do-Not-Track signals:</strong> Some browsers support a "Do-Not-Track" feature, which signals to 
                websites you visit that you do not want to have your online activity tracked. Our website respects 
                Do-Not-Track signals.
              </li>
            </ul>
            
            <h2>How often will we update this Cookie Policy?</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies 
              we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy 
              regularly to stay informed about our use of cookies and related technologies.
            </p>
            <p>
              The date at the top of this Cookie Policy indicates when it was last updated.
            </p>
            
            <h2>Where can you get further information?</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please email us at:
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

export default CookiesPage;
