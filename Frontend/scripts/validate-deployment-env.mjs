// Vite embeds VITE_* variables in the public bundle. Only the API URL belongs here.
import { loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const configured = (env.VITE_FASTAPI_URL || env.VITE_API_URL || '').trim();
let valid = false;
try {
  const url = new URL(configured);
  const host = url.hostname.toLowerCase();
  valid = url.protocol === 'https:' && !url.username && !url.password &&
    !url.search && !url.hash && url.pathname === '/' && host.includes('.') &&
    host !== 'localhost' && !host.endsWith('.localhost') &&
    !host.endsWith('.local') && !/^\[|^\d+\.\d+\.\d+\.\d+$/.test(host);
} catch {}

if (!valid) {
  console.error('Set VITE_FASTAPI_URL to the public HTTPS backend origin in Vercel before deploying. Do not use localhost or include credentials.');
  process.exit(1);
}
console.log('Public backend URL configured.');
