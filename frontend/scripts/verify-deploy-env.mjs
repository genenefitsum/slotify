import fs from 'node:fs';
import path from 'node:path';

const requiredKeys = ['VITE_API_BASE_URL', 'VITE_GOOGLE_CLIENT_ID'];

const loadDotEnv = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const contents = fs.readFileSync(envPath, 'utf8');
  const parsed = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key) {
      parsed[key] = value;
    }
  }

  return parsed;
};

const dotenvValues = loadDotEnv();

const getValue = (key) => {
  const runtimeValue = process.env[key];
  if (runtimeValue && String(runtimeValue).trim()) {
    return String(runtimeValue).trim();
  }

  const dotenvValue = dotenvValues[key];
  if (dotenvValue && String(dotenvValue).trim()) {
    return String(dotenvValue).trim();
  }

  return '';
};

const missing = requiredKeys.filter((key) => {
  return !getValue(key);
});

if (missing.length > 0) {
  console.error('Frontend deployment environment validation failed. Missing variables:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const apiBaseUrl = getValue('VITE_API_BASE_URL');

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
