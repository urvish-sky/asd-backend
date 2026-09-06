'use client';

/**
 * System Administration & Role Management Dashboard
 * Developed under guidance of Prof. Shyam Kamal, IIT BHU.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Stethoscope,
  Sparkles,
  Database,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Lock,
  Activity,
  UserCheck,
} from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/apiConfig';

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export default function AdminPortal() {
  const router = useRouter();
  const { role, accessToken, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      // Fetch users list
      const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      // Fetch system stats
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
      if (statsRes.ok) {
        const sdata = await statsRes.json();
        setStats(sdata.stats || {});
      }
    } catch (err: any) {
      console.warn('Failed to load admin data:', err);
      setActionMessage({ type: 'error', text: 'Failed to fetch admin data from backend.' });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!authLoading && role !== 'admin') {
      router.push('/unauthorized?reason=admin_only');
      return;
    }
    if (role === 'admin') {
      fetchAdminData();
    }
  }, [authLoading, role, router, fetchAdminData]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    setActionMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setActionMessage({
          type: 'success',
          text: `User role successfully updated to '${newRole}'.`,
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setActionMessage({
          type: 'error',
          text: errorData.detail || 'Failed to update user role.',
        });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error updating role.' });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Administrator Control Center
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            System Administration & RBAC Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, assign roles, inspect cloud database telemetry, and oversee clinical submissions.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* ─── Action Alert ───────────────────────────────────────── */}
      {actionMessage && (
        <div
          className={`mt-6 p-4 rounded-xl border flex items-center justify-between gap-3 text-xs animate-fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Metric Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Total Users */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Registered Accounts</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{users.length}</p>
          <div className="flex gap-2 mt-2 text-[10px] text-slate-500">
            <span>👨‍👩‍👧 {stats?.users_by_role?.parent || 0} Parents</span>
            <span>•</span>
            <span>🩺 {stats?.users_by_role?.doctor || 0} Doctors</span>
            <span>•</span>
            <span>⚙️ {stats?.users_by_role?.admin || 0} Admins</span>
          </div>
        </div>

        {/* Total Screenings */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Screenings</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {stats?.total_screenings || 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-2">
            Global intake cases recorded in system
          </p>
        </div>

        {/* Elevated Risk Cases */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Elevated Risk Triage</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2">
            {stats?.screenings_by_risk?.elevated || 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-2">
            Priority pediatrician review recommended
          </p>
        </div>

        {/* Database Status */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Supabase Cloud DB</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stats?.database?.supabase_connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-sm font-bold text-slate-800">
              {stats?.database?.supabase_connected ? 'Connected' : 'Local Fallback'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Storage bucket: <code className="font-mono text-teal-700">videos</code>
          </p>
        </div>
      </div>

      {/* ─── User Directory & Role Assignment Table ──────────────── */}
      <div className="clinical-card p-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>User Directory & Role Permissions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Promote registered users to Pediatrician or Administrator, or reassign access levels.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Current Role</th>
                <th className="px-4 py-3">Assign Role</th>
                <th className="px-4 py-3">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No users matching your search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isUpdating = updatingUserId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {u.full_name || 'Unnamed User'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {u.email || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : u.role === 'doctor'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {u.role === 'admin' && <Sparkles className="w-3 h-3 text-indigo-600" />}
                          {u.role === 'doctor' && <Stethoscope className="w-3 h-3 text-blue-600" />}
                          {u.role === 'parent' && <Users className="w-3 h-3 text-teal-600" />}
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          disabled={isUpdating}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          aria-label={`Assign role for ${u.full_name || u.email || 'user'}`}
                          className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-700 shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="parent">Parent / Caregiver</option>
                          <option value="doctor">Pediatrician / Doctor</option>
                          <option value="admin">System Administrator</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-slate-400">
                        {u.id.substring(0, 13)}...
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
