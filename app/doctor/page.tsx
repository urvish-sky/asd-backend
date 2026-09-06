'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  ShieldAlert,
  Activity,
  ChevronRight,
  RefreshCw,
  Database,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Patient, RiskTier, ClinicalStatus } from '@/lib/types';
import { mockPatients } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';

// Hardcoded baseline mock data profiles (Arjun M., Priya K., Rohan S.)
const mockData: Patient[] = mockPatients;

/**
 * Accurately calculates child age from Date of Birth string (ISO YYYY-MM-DD or ISO timestamp).
 * Accounts for year and month differences plus day of month.
 */
function calculateAgeInMonths(dobString?: string | null): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
  if (today.getDate() < dob.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

/**
 * Formats age display for clinical presentation.
 * Returns human-readable age with both months and years if >= 24 mo.
 */
function formatAgeDisplay(dobString?: string | null, fallbackMonths?: number): string {
  const calculatedMonths = calculateAgeInMonths(dobString);
  const totalMonths = calculatedMonths !== null ? calculatedMonths : (typeof fallbackMonths === 'number' ? fallbackMonths : null);

  if (totalMonths === null) return 'N/A';

  if (totalMonths >= 24) {
    const years = Math.floor(totalMonths / 12);
    const remMonths = totalMonths % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m (${totalMonths} mo)` : `${years} yr (${totalMonths} mo)`;
  }
  return `${totalMonths} mo`;
}

/**
 * Dynamic Risk Tier badge styling and labels with appropriate clinical colors.
 */
function getRiskTierBadge(tier?: string): { label: string; className: string; icon?: React.ReactNode } {
  const normalized = (tier || '').toLowerCase().trim();
  if (normalized === 'elevated' || normalized === 'high') {
    return {
      label: 'Elevated Risk',
      className: 'bg-red-100 text-red-800 border border-red-300 font-semibold shadow-xs',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />,
    };
  }
  if (normalized === 'moderate' || normalized === 'medium') {
    return {
      label: 'Moderate Risk',
      className: 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold shadow-xs',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
    };
  }
  return {
    label: 'Typical',
    className: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold shadow-xs',
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  };
}

/**
 * Dynamic Clinical Status badge styling.
 */
function getClinicalStatusBadge(status?: string): { label: string; className: string } {
  const normalized = (status || '').toLowerCase().trim();
  if (normalized === 'reviewed') {
    return { label: 'Reviewed', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  }
  if (normalized === 'referred') {
    return { label: 'Referred', className: 'bg-purple-50 text-purple-700 border border-purple-200' };
  }
  return { label: 'Pending Review', className: 'bg-blue-50 text-blue-700 border border-blue-200' };
}

export default function DoctorPortal() {
  const { setPatients } = useAppStore();
  const { role, accessToken } = useAuth();
  const router = useRouter();

  // Baseline hardcoded mock data (Arjun M., Priya K., Rohan S.) initialized into state
  const [records, setRecords] = useState<Patient[]>(mockData);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskTier | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ClinicalStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'cache' | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // ─── Fetch Dynamic Inbox Data from FastAPI Backend ────────────────────────
  useEffect(() => {
    let ignore = false;

    async function loadInbox() {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

        const res = await fetch(`${API_BASE_URL}/api/inbox`, { headers });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        if (!ignore) {
          const fetchedLiveData: Patient[] = Array.isArray(data.patients)
            ? data.patients
            : Array.isArray(data)
            ? data
            : [];

          // Keep 3 mock data profiles and append any new live database entries after them
          const newLiveEntries = fetchedLiveData.filter(
            (live) => !mockData.some((m) => m.id === live.id && m.childName === live.childName)
          );
          const combined = [...mockData, ...newLiveEntries];
          setRecords(combined);
          setPatients(combined);
          setDataSource(data.source === 'supabase_postgresql' ? 'live' : 'cache');
        }
      } catch (err: any) {
        if (!ignore) {
          console.warn('Could not fetch from /api/inbox; preserving mock data state:', err);
          setError(err?.message || 'Failed to connect to FastAPI backend.');
          setRecords(mockData);
          setDataSource('cache');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInbox();

    return () => {
      ignore = true;
    };
  }, [accessToken, API_BASE_URL, setPatients]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/inbox`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      const fetchedLiveData: Patient[] = Array.isArray(data.patients)
        ? data.patients
        : Array.isArray(data)
        ? data
        : [];
      const newLiveEntries = fetchedLiveData.filter(
        (live) => !mockData.some((m) => m.id === live.id && m.childName === live.childName)
      );
      const combined = [...mockData, ...newLiveEntries];
      setRecords(combined);
      setPatients(combined);
      setDataSource(data.source === 'supabase_postgresql' ? 'live' : 'cache');
    } catch (err: any) {
      console.warn('Could not refresh /api/inbox:', err);
      setError(err?.message || 'Failed to connect to FastAPI backend.');
      setRecords(mockData);
      setDataSource('cache');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, setPatients]);

  const filteredPatients = useMemo(() => {
    return records.filter((p) => {
      const matchesSearch =
        p.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'all' || p.riskTier === riskFilter;
      const matchesStatus = statusFilter === 'all' || p.clinicalStatus === statusFilter;
      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [records, searchQuery, riskFilter, statusFilter]);

  // Dynamically calculated statistics based on actual records array length and statuses
  const totalPatients = records.length;
  const pendingCount = records.filter((p) => p.clinicalStatus === 'pending' || (p as any).submissionStatus === 'under_review').length;
  const elevatedCount = records.filter((p) => p.riskTier === 'elevated').length;
  const reviewedCount = records.filter((p) => p.clinicalStatus === 'reviewed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Clinical Triage Inbox</h1>
            <p className="text-sm text-slate-500">Review patient submissions and AI-generated behavioral telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {dataSource && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              dataSource === 'live'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span>{dataSource === 'live' ? 'Supabase PostgreSQL' : 'Local Fallback'}</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Refresh clinical triage inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Backend Notice / Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">Backend Connection Notice</p>
              <p className="text-xs text-amber-700 mt-0.5">{error}. Operating in local offline mode.</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-medium text-xs transition-colors shrink-0 cursor-pointer self-end sm:self-auto"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Patients', value: totalPatients, icon: <Users className="w-5 h-5" />, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Pending Review', value: pendingCount, icon: <Clock className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Elevated Risk', value: elevatedCount, icon: <ShieldAlert className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Reviewed', value: reviewedCount, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat) => (
          <div key={stat.label} className={`clinical-card p-4 ${stat.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${stat.color}`}>{stat.icon}</span>
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="clinical-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search by patient name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="form-input w-auto"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskTier | 'all')}
            >
              <option value="all">All Risk Tiers</option>
              <option value="typical">Typical</option>
              <option value="moderate">Moderate Risk</option>
              <option value="elevated">Elevated Risk</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            className="form-input w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ClinicalStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="referred">Referred</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="clinical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Child Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Tier</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <RefreshCw className="w-7 h-7 text-teal-600 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600">Loading patient triage cases from backend...</p>
                    <p className="text-xs text-slate-400 mt-1">Fetching dynamic records from {API_BASE_URL}/api/inbox</p>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600">No patients match your filters</p>
                    {records.length === 0 && (
                      <p className="text-xs text-slate-400 mt-1">No patient records found in the database.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => {
                  const riskBadge = getRiskTierBadge(patient.riskTier);
                  const statusBadge = getClinicalStatusBadge(patient.clinicalStatus);
                  const formattedAge = formatAgeDisplay(patient.dateOfBirth, patient.ageInMonths);

                  return (
                    <tr
                      key={`${patient.id}-${index}`}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/doctor/case/${patient.id}`)}
                    >
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {patient.id}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                            {patient.childName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">{patient.childName}</p>
                            <p className="text-xs text-slate-400 capitalize">{patient.biologicalSex}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-800 font-medium block">
                          {formattedAge}
                        </span>
                        {patient.dateOfBirth && (
                          <span className="text-[11px] text-slate-400">
                            DOB: {new Date(patient.dateOfBirth).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {patient.submissionDate
                            ? new Date(patient.submissionDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${riskBadge.className}`}>
                          {riskBadge.icon}
                          {riskBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 group-hover:text-teal-700 transition-colors">
                          Review <ChevronRight className="w-3.5 h-3.5" />
                        </span>
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
