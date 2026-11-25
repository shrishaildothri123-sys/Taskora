import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  clearSupabaseConfig,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';
import { seedInitialData } from '../services/supabaseService';
import { Member, Project, Task } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: () => void;
  currentProjects: Project[];
  currentMembers: Member[];
  currentTasks: Task[];
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigChange,
  currentProjects,
  currentMembers,
  currentTasks,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });
  const [seedingStatus, setSeedingStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestStatus({ loading: false });
      setSeedingStatus({ loading: false });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestStatus({ loading: true });

    saveSupabaseConfig(url, anonKey);
    const res = await testSupabaseConnection(url, anonKey);
    setTestStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });

    if (res.success) {
      onConfigChange();
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestStatus({
      loading: false,
      success: false,
      message: 'Disconnected from Supabase. Working in local storage mode.',
    });
    onConfigChange();
  };

  const handleSeedData = async () => {
    setSeedingStatus({ loading: true });
    const res = await seedInitialData(currentProjects, currentMembers, currentTasks);
    setSeedingStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
    if (res.success) {
      onConfigChange();
    }
  };

  const handleCopySqlInstructions = () => {
    const sqlNotice = `-- Run this in your Supabase SQL Editor:
-- Find supabase/schema.sql in this project or copy from supabase/schema.sql`;
    navigator.clipboard.writeText(sqlNotice);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#151C27]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl elevation-3 border border-[#E5DEFF]/80 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5DEFF]/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#6D28D9]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-[#151C27] font-display">
                Supabase Connection &amp; CRUD
              </h2>
              <p className="text-[12px] text-[#6B7280]">
                Connect Taskora directly to your Supabase PostgreSQL database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F4F2FB] hover:text-[#151C27] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveAndTest} className="mt-5 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#4A4455] mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="taskora-input w-full h-9 rounded-lg px-3 text-[13px] text-[#151C27] placeholder:text-[#9CA3AF]"
            />
            <p className="mt-1 text-[11px] text-[#7B7486]">
              Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#4A4455] mb-1">
              Supabase Anon (Public) Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              required
              className="taskora-input w-full h-9 rounded-lg px-3 text-[13px] text-[#151C27] placeholder:text-[#9CA3AF] font-mono"
            />
            <p className="mt-1 text-[11px] text-[#7B7486]">
              Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API keys (anon)
            </p>
          </div>

          {/* Connection Status Feedback */}
          {testStatus.message && (
            <div
              className={`rounded-lg p-3 text-[12.5px] flex items-start gap-2.5 ${
                testStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              {testStatus.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              )}
              <div className="flex-1">{testStatus.message}</div>
            </div>
          )}

          {/* Seeding Feedback */}
          {seedingStatus.message && (
            <div
              className={`rounded-lg p-3 text-[12.5px] flex items-start gap-2.5 ${
                seedingStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {seedingStatus.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">{seedingStatus.message}</div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={testStatus.loading}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#6D28D9] px-4 text-[13px] font-medium text-white hover:bg-[#5B21B6] disabled:opacity-50 transition-colors shadow-sm"
              >
                {testStatus.loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save &amp; Test Connection</span>
              </button>

              {getSupabaseConfig().isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#6B7280] hover:bg-[#F4F2FB] hover:text-red-600 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>

            {getSupabaseConfig().isConfigured && (
              <button
                type="button"
                onClick={handleSeedData}
                disabled={seedingStatus.loading}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#DDD6FE] bg-[#EDE9FE] px-3 text-[12px] font-medium text-[#6D28D9] hover:bg-[#DDD6FE] transition-colors"
              >
                {seedingStatus.loading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Seed Database</span>
              </button>
            )}
          </div>
        </form>

        {/* Database Setup Helper Card */}
        <div className="mt-6 rounded-xl border border-[#E5DEFF] bg-[#FAF8FE] p-4 text-[12.5px]">
          <div className="flex items-center justify-between font-semibold text-[#151C27] mb-1.5">
            <span>First time setting up your Supabase project?</span>
          </div>
          <p className="text-[#6B7280] mb-3 leading-relaxed">
            Execute the pre-built schema file <code className="bg-[#EDE9FE] text-[#6D28D9] px-1 py-0.5 rounded text-[11px] font-mono">supabase/schema.sql</code> in your Supabase SQL Editor. It creates the <code className="font-mono text-[11px]">tasks</code>, <code className="font-mono text-[11px]">projects</code>, and <code className="font-mono text-[11px]">members</code> tables with Row Level Security (RLS) policies and real-time triggers.
          </p>

          <div className="flex items-center gap-2">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6D28D9] hover:underline"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

