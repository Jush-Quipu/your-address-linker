
// Export the parseOAuthSettings function so it can be used elsewhere
export function parseOAuthSettings(rawSettings: any): OAuthSettings {
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
