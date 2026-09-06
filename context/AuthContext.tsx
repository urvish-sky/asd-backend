'use client';

/**
 * Authentication and RBAC Context for Pediatric ASD Screening CDSS
 * Developed under guidance of Prof. Shyam Kamal, IIT BHU.
 *
 * Manages Supabase Auth user sessions, profile roles ('parent', 'doctor', 'admin'),
 * access tokens for FastAPI requests, and cookies for Next.js middleware protection.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export type UserRole = 'parent' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: UserRole }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error?: string; role?: UserRole }>;
  demoLogin: (role: UserRole) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronizes profile and role from Supabase or user metadata
  const fetchProfile = useCallback(async (currentUser: User, token?: string) => {
    try {
      const meta = currentUser.user_metadata || {};
      const fallbackRole: UserRole = (meta.role as UserRole) || 'parent';
      const fallbackName: string = meta.full_name || meta.name || currentUser.email?.split('@')[0] || 'User';

      let assignedRole: UserRole = fallbackRole;
      let assignedName: string = fallbackName;

      // Query profiles table in Supabase
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (data && !error) {
          assignedRole = (data.role as UserRole) || fallbackRole;
          assignedName = data.full_name || fallbackName;
        } else if (error && error.code === 'PGRST116') {
          // Row missing: attempt to create profile fallback
          await supabase.from('profiles').upsert({
            id: currentUser.id,
            full_name: assignedName,
            email: currentUser.email,
            role: assignedRole,
          });
        }
      } catch (err) {
        console.warn('Profiles table query error, using metadata:', err);
      }

      const userProfile: UserProfile = {
        id: currentUser.id,
        full_name: assignedName,
        email: currentUser.email || '',
        role: assignedRole,
      };

      setProfile(userProfile);
      setRole(assignedRole);

      // Sync cookies for Next.js Middleware
      setCookie('asd_user_role', assignedRole);
      setCookie('asd_user_id', currentUser.id);
      if (token) {
        setCookie('asd_auth_token', token);
      }
    } catch (err) {
      console.error('Failed to resolve user profile:', err);
    }
  }, []);

  // Initialize Auth Session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // Check for active Supabase session
        const { data: { session } } = await supabase.auth.getSession();

        if (session && session.user) {
          if (isMounted) {
            setUser(session.user);
            setAccessToken(session.access_token);
            await fetchProfile(session.user, session.access_token);
          }
        } else {
          // Check for demo mock session in cookie
          const cookieRole = getCookie('asd_user_role') as UserRole | null;
          const cookieToken = getCookie('asd_auth_token');
          const cookieUserId = getCookie('asd_user_id');

          if (cookieRole && cookieToken && cookieToken.startsWith('mock-')) {
            const demoProfiles: Record<UserRole, UserProfile> = {
              parent: { id: cookieUserId || '00000000-0000-0000-0000-000000000003', full_name: 'Kavita Mehta', email: 'kavita.mehta@example.com', role: 'parent' },
              doctor: { id: cookieUserId || '00000000-0000-0000-0000-000000000001', full_name: 'Dr. Aarushi Gupta', email: 'doctor@aiims.edu', role: 'doctor' },
              admin: { id: cookieUserId || '00000000-0000-0000-0000-000000000002', full_name: 'Prof. Shyam Kamal', email: 'admin@iitbhu.ac.in', role: 'admin' },
            };
            const mockProf = demoProfiles[cookieRole];
            if (isMounted) {
              setRole(cookieRole);
              setProfile(mockProf);
              setAccessToken(cookieToken);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing Supabase auth:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen for auth state transitions (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession: Session | null) => {
        if (!isMounted) return;

        if (newSession && newSession.user) {
          setUser(newSession.user);
          setAccessToken(newSession.access_token);
          setCookie('asd_auth_token', newSession.access_token);
          await fetchProfile(newSession.user, newSession.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setRole(null);
          setAccessToken(null);
          deleteCookie('asd_auth_token');
          deleteCookie('asd_user_role');
          deleteCookie('asd_user_id');
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign In with email & password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.session && data.user) {
        setUser(data.user);
        setAccessToken(data.session.access_token);
        setCookie('asd_auth_token', data.session.access_token);
        await fetchProfile(data.user, data.session.access_token);

        const assignedRole = (data.user.user_metadata?.role as UserRole) || 'parent';
        return { role: assignedRole };
      }

      return { error: 'Failed to establish session.' };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign in.' };
    }
  };

  // Sign Up with email, password, full name, and role selector
  const signUp = async (email: string, password: string, fullName: string, selectedRole: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: selectedRole,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Upsert into profiles table explicitly as safety safeguard
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            email: email.trim(),
            role: selectedRole,
          });
        } catch (profileErr) {
          console.warn('Profile table insert warning:', profileErr);
        }

        if (data.session) {
          setUser(data.user);
          setAccessToken(data.session.access_token);
          setCookie('asd_auth_token', data.session.access_token);
          await fetchProfile(data.user, data.session.access_token);
        }

        return { role: selectedRole };
      }

      return { error: 'Registration incomplete.' };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during registration.' };
    }
  };

  // One-click Demo Login for evaluating parent, clinician, or admin workflows instantly
  const demoLogin = (demoRole: UserRole) => {
    const demoConfigs: Record<UserRole, { token: string; profile: UserProfile }> = {
      parent: {
        token: 'mock-parent-token',
        profile: {
          id: '00000000-0000-0000-0000-000000000003',
          full_name: 'Kavita Mehta',
          email: 'kavita.mehta@example.com',
          role: 'parent',
        },
      },
      doctor: {
        token: 'mock-doctor-token',
        profile: {
          id: '00000000-0000-0000-0000-000000000001',
          full_name: 'Dr. Aarushi Gupta',
          email: 'doctor@aiims.edu',
          role: 'doctor',
        },
      },
      admin: {
        token: 'mock-admin-token',
        profile: {
          id: '00000000-0000-0000-0000-000000000002',
          full_name: 'Prof. Shyam Kamal',
          email: 'admin@iitbhu.ac.in',
          role: 'admin',
        },
      },
    };

    const config = demoConfigs[demoRole];
    setRole(demoRole);
    setProfile(config.profile);
    setAccessToken(config.token);

    // Persist to cookies for Next.js middleware and API headers
    setCookie('asd_auth_token', config.token);
    setCookie('asd_user_role', demoRole);
    setCookie('asd_user_id', config.profile.id);
  };

  // Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out warning:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setRole(null);
      setAccessToken(null);
      deleteCookie('asd_auth_token');
      deleteCookie('asd_user_role');
      deleteCookie('asd_user_id');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user, accessToken || undefined);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        accessToken,
        loading,
        signIn,
        signUp,
        demoLogin,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
