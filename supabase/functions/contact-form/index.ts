
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = "admin@secureaddress.bridge"; // Change this to your admin email

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
    
    // Send notification email to admin
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'SecureAddress Bridge <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
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

    if (emailError) {
      console.error('Email error:', emailError);
      // We don't throw here - we've already saved the message to the database
    }
    
    // Send confirmation email to the user
    const { data: confirmationData, error: confirmationError } = await resend.emails.send({
      from: 'SecureAddress Bridge <onboarding@resend.dev>',
      to: [email],
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

    if (confirmationError) {
      console.error('Confirmation email error:', confirmationError);
      // We don't throw here - we've already saved the message and sent the admin notification
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
