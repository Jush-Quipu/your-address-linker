
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, FileText, Shield } from 'lucide-react';

const CompliancePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Compliance</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn how SecureAddress Bridge maintains compliance with global privacy and data protection regulations.
            </p>
          </div>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Our Compliance Framework
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                At SecureAddress Bridge, we take our regulatory obligations seriously. Our platform is designed to comply 
                with major data protection and privacy regulations worldwide. We continuously monitor the regulatory 
                landscape to ensure our practices remain compliant as laws evolve.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">GDPR Compliance</h3>
                        <p className="text-muted-foreground">
                          We adhere to the General Data Protection Regulation (GDPR) requirements for EU users, 
                          including data minimization, purpose limitation, and user rights implementation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">CCPA/CPRA Compliance</h3>
                        <p className="text-muted-foreground">
                          Our platform meets the requirements of the California Consumer Privacy Act (CCPA) and 
                          California Privacy Rights Act (CPRA) for California residents.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">PIPEDA Compliance</h3>
                        <p className="text-muted-foreground">
                          We comply with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) 
                          for Canadian users.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">International Data Transfers</h3>
                        <p className="text-muted-foreground">
                          We implement appropriate safeguards for international data transfers, including 
                          Standard Contractual Clauses where applicable.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Compliance Documentation
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                We maintain comprehensive documentation of our compliance efforts, including:
              </p>
              
              <ul className="list-disc pl-6 space-y-3 text-lg">
                <li>Data Protection Impact Assessments (DPIAs)</li>
                <li>Records of processing activities</li>
                <li>Technical and organizational security measures</li>
                <li>Data breach response procedures</li>
                <li>Vendor management and data processing agreements</li>
                <li>User consent records</li>
                <li>Staff training documentation</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-6">User Rights and Data Subject Requests</h2>
              <p className="text-lg leading-relaxed mb-6">
                We respect and uphold your data rights. You can exercise the following rights through your account 
                settings or by contacting our data protection officer:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Right to Access</h3>
                  <p className="text-muted-foreground">Request a copy of your personal data that we process.</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Right to Rectification</h3>
                  <p className="text-muted-foreground">Correct inaccurate or incomplete personal data.</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Right to Erasure</h3>
                  <p className="text-muted-foreground">Request deletion of your personal data in certain circumstances.</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Right to Restriction</h3>
                  <p className="text-muted-foreground">Limit how we use your data in certain scenarios.</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Right to Portability</h3>
                  <p className="text-muted-foreground">Receive your data in a structured, machine-readable format.</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Right to Object</h3>
                  <p className="text-muted-foreground">Object to processing of your data for certain purposes.</p>
                </div>
              </div>
              
              <p className="mt-8 text-lg">
                To submit a data subject request, please contact:<br />
                <span className="text-primary">privacy@secureaddress.bridge</span>
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-6">Certifications and Audits</h2>
              <p className="text-lg leading-relaxed mb-6">
                Our compliance program is regularly reviewed and validated:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                      <Shield className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Annual Security Audit</h3>
                    <p className="text-muted-foreground">
                      Independent third-party security assessments conducted annually.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                      <Shield className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">SOC 2 Type II</h3>
                    <p className="text-muted-foreground">
                      Service Organization Control reporting for security, availability, and confidentiality.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                      <Shield className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">ISO 27001</h3>
                    <p className="text-muted-foreground">
                      Information security management system certification in progress.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-6">Contact Our Data Protection Officer</h2>
              <p className="text-lg leading-relaxed">
                If you have questions about our compliance program or how we handle your data, please contact 
                our Data Protection Officer:
              </p>
              
              <div className="bg-muted p-6 rounded-lg mt-6">
                <p>
                  <strong>Email:</strong> dpo@secureaddress.bridge<br />
                  <strong>Mail:</strong> Data Protection Officer<br />
                  SecureAddress Bridge, Inc.<br />
                  123 Privacy Street<br />
                  San Francisco, CA 94103<br />
                  United States
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompliancePage;
