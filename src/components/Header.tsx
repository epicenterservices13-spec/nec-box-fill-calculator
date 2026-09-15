import React from 'react';
import { Zap, BookOpen, FileCheck2, Bookmark, RefreshCw, FolderOpen } from 'lucide-react';

interface HeaderProps {
  unit: 'imperial' | 'metric';
  setUnit: (unit: 'imperial' | 'metric') => void;
  onOpenPresets: () => void;
  onOpenCodeRef: () => void;
  onOpenReport: () => void;
  onOpenJobs: () => void;
  savedJobCount: number;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  setUnit,
  onOpenPresets,
  onOpenCodeRef,
  onOpenReport,
  onOpenJobs,
  savedJobCount,
  onReset
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">NEC Box Fill Calculator</h1>
              <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
                NEC 314.16
              </span>
            </div>
            <p className="text-xs text-zinc-400">Electrical Outlet &amp; Junction Box Volume Calculations</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Unit Toggle */}
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setUnit('imperial')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                unit === 'imperial'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              cu in / AWG
            </button>
            <button
              onClick={() => setUnit('metric')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                unit === 'metric'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              cm³ / Metric
            </button>
          </div>

          {/* Quick Presets */}
          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium px-3 py-2 rounded-xl transition-all"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>Presets</span>
          </button>

          {/* Saved Boxes */}
          <button
            onClick={onOpenJobs}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium px-3 py-2 rounded-xl transition-all"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved Boxes</span>
            {savedJobCount > 0 && (
              <span className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {savedJobCount}
              </span>
            )}
          </button>

          {/* Code Reference */}
          <button
            onClick={onOpenCodeRef}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium px-3 py-2 rounded-xl transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>NEC Rules</span>
          </button>

          {/* Inspection Report */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Export Report</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            title="Reset Form"
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
