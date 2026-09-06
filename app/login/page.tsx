'use client';

/**
 * Login Page with Role-Based Redirection and Demo Fast-Login
 * Developed under guidance of Prof. Shyam Kamal, IIT BHU.
 */

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sparkles, Stethoscope, Users, ShieldAlert } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';

export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const { signIn, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const routeByRole = (role: UserRole) => {
    if (redirectTarget) {
      router.push(redirectTarget);
      return;
    }
    if (role === 'doctor') {
      router.push('/doctor');
    } else if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/parent');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      } else if (result.role) {
        routeByRole(result.role);
      } else {
        router.push('/parent');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify your network connection.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    demoLogin(role);
    routeByRole(role);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 mx-auto mb-3 shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Sign In to CDSS Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pediatric ASD Screening Platform • IIT BHU Clinical Decision Support
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-5 flex items-start gap-2.5 animate-fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Authentication Failed</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                className="form-input pl-9.5 text-sm"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input pl-9.5 pr-10 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="mt-5 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700 underline">
            Register with Role
          </Link>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
              Or Fast One-Click Demo
            </span>
          </div>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('parent')}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 text-teal-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Parent / Guardian Demo</span>
            </div>
            <span className="text-[10px] bg-teal-200/80 px-1.5 py-0.5 rounded font-mono">/parent</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('doctor')}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>Pediatrician / Doctor Demo</span>
            </div>
            <span className="text-[10px] bg-blue-200/80 px-1.5 py-0.5 rounded font-mono">/doctor</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>System Administrator Demo</span>
            </div>
            <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">/admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
