
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(RESEND_API_KEY);

// Set admin email to the verified email for testing
// IMPORTANT: In production, change this to your actual admin email after verifying a domain
const ADMIN_EMAIL = "jush922@gmail.com"; 

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-id, x-sdk-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req) => {
  console.log('Contact form submission request received');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Import the Supabase client with correct syntax
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.33.1");
    
    // Create a supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://akfieehzgpcapuhdujvf.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Log environment variables for debugging (without revealing full values)
    console.log('SUPABASE_URL available:', !!Deno.env.get('SUPABASE_URL'));
    console.log('SUPABASE_SERVICE_ROLE_KEY available:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    console.log('RESEND_API_KEY available:', !!RESEND_API_KEY);
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const formData: ContactFormData = await req.json();
    const { name, email, subject, message } = formData;
    
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing required fields' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Store in database
    const { data: submissionData, error: dbError } = await supabase
      .from('contact_submissions')
      .insert([{ name, email, subject, message }])
      .select()
      .single();
      
    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    console.log('Successfully saved to database, now sending emails');
    
    // Send notification email to admin
    try {
      // IMPORTANT: For Resend testing, you can only send to the same email that's verified
      // For production, you need to verify a domain and use an email from that domain as the "from" address
      const adminEmailData = await resend.emails.send({
        from: 'onboarding@resend.dev', // Use Resend's test sender
        to: [ADMIN_EMAIL], // Send to the verified email
        subject: `New Contact Form: ${subject}`,
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <h2>Message:</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>This message was sent from the SecureAddress Bridge contact form.</p>
        `,
      });
      
      console.log('Admin notification email sent:', adminEmailData);
    } catch (emailError: any) {
      console.error('Error sending admin email:', emailError);
      console.error('Error details:', JSON.stringify(emailError));
      // We continue to attempt sending the confirmation email
    }
    
    // Send confirmation email to the user (for testing, also send to verified email)
    try {
      // For testing: Use the verified email as both the sender and recipient
      // For production: Change "from" to use your verified domain
      const confirmationData = await resend.emails.send({
        from: 'onboarding@resend.dev', // Use Resend's test sender
        to: [ADMIN_EMAIL], // For testing, send to verified email instead of user email
        subject: 'Thank you for contacting SecureAddress Bridge',
        html: `
          <h1>Thank You for Contacting Us</h1>
          <p>Dear ${name},</p>
          <p>We have received your message about "${subject}" and will get back to you as soon as possible.</p>
          <p>For your records, here's a copy of your message:</p>
          <blockquote>${message.replace(/\n/g, '<br>')}</blockquote>
          <p>Best regards,<br>The SecureAddress Bridge Team</p>
        `,
      });
      
      console.log('Confirmation email sent:', confirmationData);
    } catch (confirmationError: any) {
      console.error('Error sending confirmation email:', confirmationError);
      console.error('Error details:', JSON.stringify(confirmationError));
      // We still return success since the message was saved to the database
    }

    // Return success response
    const responseData = {
      success: true,
      data: {
        id: submissionData.id,
        timestamp: new Date().toISOString()
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Request-Id': responseData.meta.requestId,
      }
    });
  } catch (error) {
    console.error('Error in contact-form endpoint:', error);
    
    // Return error response
    const errorResponse = {
      success: false,
      error: {
        code: 'server_error',
        message: 'An error occurred while processing the contact form submission',
        details: error instanceof Error ? error.message : String(error)
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Request-Id': errorResponse.meta.requestId,
      }
    });
  }
});
