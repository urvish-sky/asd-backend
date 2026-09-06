'use client';

/**
 * Root Layout with AuthProvider, Role-Based Navigation & Session Status
 * Developed under guidance of Prof. Shyam Kamal, IIT BHU.
 */

import './globals.css';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Stethoscope,
  BookOpen,
  Activity,
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  User,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function HeaderNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, signOut, loading } = useAuth();

  const isParentActive = pathname.startsWith('/parent');
  const isDoctorActive = pathname.startsWith('/doctor');
  const isAdminActive = pathname.startsWith('/admin');
  const isProtocolsActive = pathname.startsWith('/protocols');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 select-none">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                Pediatric ASD Screening Platform
              </h1>
              <p className="text-[10px] font-medium text-teal-600 tracking-wider uppercase">
                Clinical Decision Support System
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm font-bold text-slate-800">ASD-CDSS</h1>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Protocols Guide */}
            <Link
              href="/protocols"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                isProtocolsActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Protocols</span>
            </Link>

            {/* Role Shortcuts */}
            {role && (
              <div className="hidden lg:flex items-center bg-slate-100 rounded-lg p-1">
                {(role === 'parent' || role === 'admin') && (
                  <button
                    onClick={() => router.push('/parent')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      isParentActive
                        ? 'bg-white text-teal-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Parent</span>
                  </button>
                )}

                {(role === 'doctor' || role === 'admin') && (
                  <button
                    onClick={() => router.push('/doctor')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      isDoctorActive
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Clinician</span>
                  </button>
                )}

                {role === 'admin' && (
                  <button
                    onClick={() => router.push('/admin')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      isAdminActive
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                )}
              </div>
            )}

            {/* Auth User Section */}
            {loading ? (
              <div className="w-20 h-8 rounded-lg bg-slate-100 animate-pulse" />
            ) : user || role ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {/* Role Badge */}
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {profile?.full_name || 'User'}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                      role === 'admin'
                        ? 'text-indigo-600'
                        : role === 'doctor'
                        ? 'text-blue-600'
                        : 'text-teal-600'
                    }`}
                  >
                    {role || 'parent'}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="flex items-center gap-1 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Pediatric ASD Screening Platform (CDSS)</title>
        <meta
          name="description"
          content="AI-assisted developmental screening platform for early detection of Autism Spectrum Disorder in pediatric patients aged 12-36 months."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <HeaderNavigation />

            {/* ─── Main Content ──────────────────────────────────── */}
            <main className="flex-1">{children}</main>

            {/* ─── Footer ────────────────────────────────────────── */}
            <footer className="bg-slate-800 text-slate-300 border-t border-slate-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                      Research & Development
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed max-w-2xl">
                    Developed by{' '}
                    <span className="text-white font-semibold">Urvish Soni</span> and{' '}
                    <span className="text-white font-semibold">Zankhana Mehta</span> at{' '}
                    <span className="text-teal-300 font-semibold">IIT BHU</span> under the guidance of{' '}
                    <span className="text-white font-semibold">Professor Shyam Kamal</span>,{' '}
                    Department of Electrical Engineering.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Class II Clinical Decision Support System — For Research & Screening Purposes Only
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
