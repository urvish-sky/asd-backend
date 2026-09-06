/**
 * Supabase Browser Client for ASD Screening CDSS
 * Developed under guidance of Prof. Shyam Kamal, IIT BHU.
 *
 * Configured with auth cookie storage for seamless Next.js SSR & Middleware integration.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wtgllzeffkibxecgsbng.supabase.co'
).trim();

const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_-zMN7SQyd3uoMr8QginKgw_-M0Ri27j'
).trim();

// Cookie helper for synchronizing auth token into browser cookies
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = '; expires=' + date.toUTCString();
  const secure = window.location.protocol === 'https:' ? '; Secure; SameSite=Lax' : '; SameSite=Lax';
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
}

// Client-side Supabase singleton instance
let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null;
          // Try localStorage first, then cookies
          const fromLocal = window.localStorage.getItem(key);
          if (fromLocal) return fromLocal;
          return getCookie(key);
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return;
          window.localStorage.setItem(key, value);
          setCookie(key, value);
          // Also set a standardized cookie for Next.js middleware
          try {
            const parsed = JSON.parse(value);
            if (parsed && parsed.access_token) {
              setCookie('asd_auth_token', parsed.access_token);
              const role = parsed.user?.user_metadata?.role || 'parent';
              setCookie('asd_user_role', role);
              setCookie('asd_user_id', parsed.user?.id || '');
            }
          } catch {
            // Ignore parse errors
          }
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return;
          window.localStorage.removeItem(key);
          deleteCookie(key);
          deleteCookie('asd_auth_token');
          deleteCookie('asd_user_role');
          deleteCookie('asd_user_id');
        },
      },
    },
  });

  return clientInstance;
}

export const supabase = getSupabaseClient();
