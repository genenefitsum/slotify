const requiredKeys = ['VITE_API_BASE_URL', 'VITE_GOOGLE_CLIENT_ID'];

const missing = requiredKeys.filter((key) => {
  const value = process.env[key];
  return !value || !String(value).trim();
});

if (missing.length > 0) {
  console.error('Frontend deployment environment validation failed. Missing variables:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const apiBaseUrl = String(process.env.VITE_API_BASE_URL).trim();

if (!/^https?:\/\//i.test(apiBaseUrl)) {
  console.error('Frontend deployment environment validation failed. VITE_API_BASE_URL must be an absolute URL.');
  process.exit(1);
}

if (apiBaseUrl.endsWith('/')) {
  console.warn('Warning: VITE_API_BASE_URL ends with a trailing slash. The app strips one slash at runtime.');
}

console.log('Frontend deployment environment validation passed.');
console.table({
  hasApiBaseUrl: true,
  hasGoogleClientId: true,
  apiBaseUrl,
});
