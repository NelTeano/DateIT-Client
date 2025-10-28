export const auth0 = new Auth0Client({
  // Options are loaded from environment variables by default
  // Ensure necessary environment variables are properly set
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET,
  appBaseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL,
  secret: process.env.NEXT_PUBLIC_AUTH0_SECRET,

  authorizationParameters: {
    // In v4, the AUTH0_SCOPE and AUTH0_AUDIENCE environment variables for API authorized applications are no longer automatically picked up by the SDK.
    // Instead, we need to provide the values explicitly.
    scope: process.env.NEXT_PUBLIC_AUTH0_SCOPE,
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
  }
});