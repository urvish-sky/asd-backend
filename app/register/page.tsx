'use client';

/**
 * Registration Page with Role Selection for ASD Screening CDSS
 * Developed under guidance of Prof. Shyam Kamal, IIT BHU.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Stethoscope, Users, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(email, password, fullName, role);
      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      } else {
        setSuccessMessage('Account created successfully! Directing to your portal...');
        setTimeout(() => {
          if (role === 'doctor') {
            router.push('/doctor');
          } else if (role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/parent');
          }
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration encountered an error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 mx-auto mb-3 shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Create Your CDSS Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Join the Pediatric ASD Screening Decision Support System
          </p>
        </div>

        {/* Feedback Notices */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-5 flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Registration Notice</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-5 flex items-center gap-2.5 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                className="form-input pl-9.5 text-sm"
                placeholder="e.g. Dr. Aarushi Gupta or Kavita Mehta"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                className="form-input pl-9.5 text-sm"
                placeholder="name@institution.edu or personal email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="form-input pl-9.5 pr-8 text-sm"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="form-input pl-9.5 text-sm"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Your System Role *
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {/* Parent */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  role === 'parent'
                    ? 'border-teal-500 bg-teal-50/80 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="parent"
                  checked={role === 'parent'}
                  onChange={() => setRole('parent')}
                  className="mt-1 accent-teal-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs sm:text-sm">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>Parent / Guardian</span>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded ml-auto">
                      Intake & Videos
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Register your child, upload protocol recordings, and receive Ayurvedic PARWAA holistic care plans.
                  </p>
                </div>
              </label>

              {/* Doctor */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  role === 'doctor'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === 'doctor'}
                  onChange={() => setRole('doctor')}
                  className="mt-1 accent-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs sm:text-sm">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>Pediatrician / Clinician</span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded ml-auto">
                      Clinical Triage
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Access clinical triage inbox, review video telemetry, adjust ISAA item scores, and sign off reports.
                  </p>
                </div>
              </label>

              {/* Admin */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  role === 'admin'
                    ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="mt-1 accent-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>System Administrator</span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded ml-auto">
                      Full Control
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Manage system users and assigned roles, inspect database diagnostics, and view platform telemetry.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700 underline">
            Sign In with Existing Account
          </Link>
        </div>
      </div>
    </div>
  );
}
