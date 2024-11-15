// Centralized domain configuration
export const siteConfig = {
    domain: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.laatstelijst.nl',
    oauthRedirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'https://www.laatstelijst.nl/callback',
  };
  