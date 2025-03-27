
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/supabase';

// Define OAuth Settings type
export interface OAuthSettings {
  scopes: string[];
  token_lifetime: number;
  refresh_token_rotation: boolean;
}

// Developer role enum
export enum DeveloperRole {
  DEVELOPER = 'developer',
  ADMIN = 'admin',
  SUPPORT = 'support'
}

// App status enum
export enum AppStatus {
  ACTIVE = 'active',
  DEVELOPMENT = 'development',
  SUSPENDED = 'suspended'
}

// App verification status enum
export enum AppVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// Define verification details interface
export interface VerificationDetails {
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
}

// Developer App interface
export interface DeveloperApp {
  id: string;
  user_id?: string;
  app_name: string;
  description: string | null;
  website_url: string | null;
  callback_urls: string[];
  created_at: string;
  updated_at?: string;
  status: AppStatus;
  verification_status: AppVerificationStatus;
  verification_details?: VerificationDetails;
  monthly_request_limit: number | null;
  app_secret?: string;
  oauth_settings: OAuthSettings;
}

// Developer App from DB record
interface DeveloperAppRecord {
  id: string;
  user_id: string;
  app_name: string;
  description: string | null;
  website_url: string | null;
  callback_urls: string[];
  created_at: string;
  updated_at: string | null;
  status: AppStatus;
  verification_status: AppVerificationStatus;
  verification_details: Json | null;
  monthly_request_limit: number | null;
  app_secret: string | null;
  oauth_settings: Json | null;
}

// Developer role record
interface DeveloperRoleRecord {
  id: string;
  user_id: string;
  role: DeveloperRole;
  created_at: string;
}

// OAuth Settings update interface
export interface OAuthSettingsUpdate {
  scopes?: string[];
  tokenLifetime?: number;
  refreshTokenRotation?: boolean;
}

// App update interface
export interface DeveloperAppUpdate {
  appName?: string;
  description?: string;
  websiteUrl?: string;
  callbackUrls?: string[];
  status?: AppStatus;
  verificationStatus?: AppVerificationStatus;
  verificationDetails?: VerificationDetails;
  requestLimit?: number;
  oauthSettings?: OAuthSettingsUpdate;
}

// Parse OAuth settings from JSON
export function parseOAuthSettings(rawSettings: Json | null): OAuthSettings {
  // Default values
  const defaultSettings: OAuthSettings = {
    scopes: ['read:profile', 'read:address'],
    token_lifetime: 3600,
    refresh_token_rotation: true
  };

  if (!rawSettings) return defaultSettings;

  try {
    // If it's a string, try to parse it
    const settings = typeof rawSettings === 'string' 
      ? JSON.parse(rawSettings) 
      : rawSettings;

    return {
      scopes: Array.isArray(settings.scopes) ? settings.scopes : defaultSettings.scopes,
      token_lifetime: typeof settings.token_lifetime === 'number' ? settings.token_lifetime : defaultSettings.token_lifetime,
      refresh_token_rotation: typeof settings.refresh_token_rotation === 'boolean' ? settings.refresh_token_rotation : defaultSettings.refresh_token_rotation
    };
  } catch (e) {
    console.error('Error parsing OAuth settings:', e);
    return defaultSettings;
  }
}

// Parse verification details from JSON
export function parseVerificationDetails(details: Json | null): VerificationDetails | undefined {
  if (!details) return undefined;
  
  try {
    const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
    return {
      verified_at: parsedDetails.verified_at,
      verified_by: parsedDetails.verified_by,
      verification_notes: parsedDetails.verification_notes
    };
  } catch (e) {
    console.error('Error parsing verification details:', e);
    return undefined;
  }
}

// Map database record to DeveloperApp
function mapToDeveloperApp(app: DeveloperAppRecord): DeveloperApp {
  return {
    ...app,
    verification_details: parseVerificationDetails(app.verification_details),
    oauth_settings: parseOAuthSettings(app.oauth_settings)
  };
}

// Check if a user has developer access
export async function checkDeveloperAccess(userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from('developer_roles')
    .select('role')
    .eq('user_id', userId);
    
  if (error || !data) {
    console.error('Error checking developer access:', error);
    return false;
  }
  
  return data.length > 0;
}

// Check if a user has admin access
export async function checkAdminAccess(userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from('developer_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin');
    
  if (error || !data) {
    console.error('Error checking admin access:', error);
    return false;
  }
  
  return data.length > 0;
}

// Get all roles for a user
export async function getUserRoles(userId?: string): Promise<DeveloperRole[]> {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('developer_roles')
    .select('role')
    .eq('user_id', userId);
    
  if (error || !data) {
    console.error('Error getting user roles:', error);
    return [];
  }
  
  return data.map(item => item.role as DeveloperRole);
}

// Add a role to a user
export async function addUserRole(userId: string, role: DeveloperRole): Promise<boolean> {
  const { error } = await supabase
    .from('developer_roles')
    .insert({
      user_id: userId,
      role
    });
    
  if (error) {
    console.error('Error adding user role:', error);
    return false;
  }
  
  return true;
}

// Remove a role from a user
export async function removeUserRole(userId: string, role: DeveloperRole): Promise<boolean> {
  const { error } = await supabase
    .from('developer_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);
    
  if (error) {
    console.error('Error removing user role:', error);
    return false;
  }
  
  return true;
}

// Get all developer apps for a user
export async function getDeveloperApps(userId?: string): Promise<DeveloperApp[]> {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('developer_apps')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error || !data) {
    console.error('Error fetching developer apps:', error);
    return [];
  }
  
  return data.map(app => mapToDeveloperApp(app as DeveloperAppRecord));
}

// Create a new developer app
export async function createDeveloperApp(appData: {
  appName: string;
  description?: string;
  websiteUrl?: string;
  callbackUrls: string[];
  status?: AppStatus;
}): Promise<DeveloperApp | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !sessionData.session) {
    throw new Error('User must be authenticated to create an app');
  }
  
  const userId = sessionData.session.user.id;
  
  // Generate a unique ID for the app (we'll let Supabase handle this with default values)
  const { data, error } = await supabase
    .from('developer_apps')
    .insert({
      user_id: userId,
      app_name: appData.appName,
      description: appData.description || null,
      website_url: appData.websiteUrl || null,
      callback_urls: appData.callbackUrls,
      status: appData.status || AppStatus.DEVELOPMENT,
      verification_status: AppVerificationStatus.PENDING,
      monthly_request_limit: 1000, // Default limit
      oauth_settings: {
        scopes: ['read:profile', 'read:address'],
        token_lifetime: 3600,
        refresh_token_rotation: true
      }
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating developer app:', error);
    throw new Error(`Failed to create application: ${error.message}`);
  }
  
  return mapToDeveloperApp(data as DeveloperAppRecord);
}

// Update a developer app
export async function updateDeveloperApp(appId: string, updates: DeveloperAppUpdate): Promise<DeveloperApp> {
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString()
  };
  
  // Map from camelCase to snake_case for DB
  if (updates.appName !== undefined) updateData.app_name = updates.appName;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.websiteUrl !== undefined) updateData.website_url = updates.websiteUrl;
  if (updates.callbackUrls !== undefined) updateData.callback_urls = updates.callbackUrls;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.verificationStatus !== undefined) updateData.verification_status = updates.verificationStatus;
  if (updates.verificationDetails !== undefined) updateData.verification_details = updates.verificationDetails;
  if (updates.requestLimit !== undefined) updateData.monthly_request_limit = updates.requestLimit;
  
  // Update OAuth settings if provided
  if (updates.oauthSettings) {
    // Get current OAuth settings first
    const { data: currentApp, error: fetchError } = await supabase
      .from('developer_apps')
      .select('oauth_settings')
      .eq('id', appId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching current app settings:', fetchError);
      throw new Error(`Failed to update application: ${fetchError.message}`);
    }
    
    const currentSettings = parseOAuthSettings(currentApp.oauth_settings);
    
    // Update with new values
    updateData.oauth_settings = {
      ...currentSettings,
      scopes: updates.oauthSettings.scopes !== undefined ? updates.oauthSettings.scopes : currentSettings.scopes,
      token_lifetime: updates.oauthSettings.tokenLifetime !== undefined ? updates.oauthSettings.tokenLifetime : currentSettings.token_lifetime,
      refresh_token_rotation: updates.oauthSettings.refreshTokenRotation !== undefined ? updates.oauthSettings.refreshTokenRotation : currentSettings.refresh_token_rotation
    };
  }
  
  // Update the app
  const { data, error } = await supabase
    .from('developer_apps')
    .update(updateData)
    .eq('id', appId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating developer app:', error);
    throw new Error(`Failed to update application: ${error.message}`);
  }
  
  return mapToDeveloperApp(data as DeveloperAppRecord);
}

// Rotate app secret
export async function rotateAppSecret(appId: string): Promise<DeveloperApp> {
  // Generate a new secret
  const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Update in the database
  const { data, error } = await supabase
    .from('developer_apps')
    .update({
      app_secret: newSecret,
      updated_at: new Date().toISOString()
    })
    .eq('id', appId)
    .select()
    .single();
    
  if (error) {
    console.error('Error rotating app secret:', error);
    throw new Error(`Failed to rotate app secret: ${error.message}`);
  }
  
  return mapToDeveloperApp(data as DeveloperAppRecord);
}
