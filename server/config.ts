export function validateConfig() {
  const required = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENALEX_MAILTO: process.env.OPENALEX_MAILTO,
  };

  const missing: string[] = [];
  
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please set them in your .env file.`
    );
  }

  console.log('✓ Configuration validated');
}
