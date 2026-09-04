'use client';

import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Users, Stethoscope, BookOpen, Activity } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isParentActive = pathname.startsWith('/parent');
  const isDoctorActive = pathname.startsWith('/doctor');
  const isProtocolsActive = pathname.startsWith('/protocols');

  return (
    <html lang="en">
      <head>
        <title>Pediatric ASD Screening Platform (CDSS)</title>
        <meta name="description" content="AI-assisted developmental screening platform for early detection of Autism Spectrum Disorder in pediatric patients aged 12-36 months." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="min-h-screen flex flex-col">
          {/* ─── Header ──────────────────────────────────────────── */}
          <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo & Title */}
                <div
                  className="flex items-center gap-3 cursor-pointer select-none"
                  onClick={() => router.push('/parent')}
                >
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
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-1 sm:gap-2">
                  {/* Role Switcher */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => router.push('/parent')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                        isParentActive
                          ? 'bg-white text-teal-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Parent / Guardian</span>
                      <span className="sm:hidden">Parent</span>
                    </button>
                    <button
                      onClick={() => router.push('/doctor')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                        isDoctorActive
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span className="hidden sm:inline">Doctor / Clinician</span>
                      <span className="sm:hidden">Doctor</span>
                    </button>
                  </div>

                  {/* Protocols Link */}
                  <button
                    onClick={() => router.push('/protocols')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                      isProtocolsActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden md:inline">Protocols & Guide</span>
                  </button>
                </nav>
              </div>
            </div>
          </header>

          {/* ─── Main Content ────────────────────────────────────── */}
          <main className="flex-1">
            {children}
          </main>

          {/* ─── Footer ──────────────────────────────────────────── */}
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
      </body>
    </html>
  );
}
