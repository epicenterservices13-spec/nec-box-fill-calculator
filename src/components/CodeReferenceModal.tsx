import React, { useState } from 'react';
import { NEC_CODE_ARTICLES, INSPECTION_CHECKLIST } from '../data/codeReferences';
import { NEC_CONDUCTOR_VOLUMES, WIRE_SIZE_ORDER } from '../data/necTables';
import { X, BookOpen, Search, CheckCircle2 } from 'lucide-react';

interface CodeReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeReferenceModal: React.FC<CodeReferenceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'table5' | 'checklist'>('articles');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredArticles = NEC_CODE_ARTICLES.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">NEC Article 314.16 Code Library</h3>
              <p className="text-xs text-zinc-400">National Electrical Code Rules, Tables &amp; Inspection Guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-zinc-900/60 border-b border-zinc-800 px-6 py-2.5 flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'articles' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            NEC 314.16 Sections
          </button>
          <button
            onClick={() => setActiveTab('table5')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'table5' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Table 314.16(B) Volumes
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'checklist' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Inspector Checklist
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* TAB 1: ARTICLES */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search code sections (e.g. 314.16(B)(4), Grounding, Clamps)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-4">
                {filteredArticles.map((art) => (
                  <div key={art.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 font-mono bg-amber-950/50 border border-amber-800/40 px-2.5 py-0.5 rounded">
                        {art.section}
                      </span>
                      <h4 className="text-sm font-bold text-white">{art.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-300 italic border-l-2 border-indigo-500 pl-3 py-1 bg-zinc-950/40 rounded-r-lg">
                      "{art.fullText}"
                    </p>
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Key Electrical Takeaways:</span>
                      <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1 pl-1">
                        {art.keyTakeaways.map((k, idx) => (
                          <li key={idx}>{k}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TABLE 314.16(B) VOLUMES */}
          {activeTab === 'table5' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white">NEC Table 314.16(B) Volume Allowance Required per Conductor</h4>
                <p className="text-xs text-zinc-400">
                  Free space requirement within box for each conductor entering or passing through.
                </p>
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                        <th className="pb-2 font-semibold">SIZE (AWG / kcmil)</th>
                        <th className="pb-2 font-semibold text-right">FREE SPACE (CUBIC INCHES)</th>
                        <th className="pb-2 font-semibold text-right">FREE SPACE (CUBIC CENTIMETERS)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 font-mono">
                      {WIRE_SIZE_ORDER.map((sz) => (
                        <tr key={sz} className="hover:bg-zinc-900/40">
                          <td className="py-2 text-white font-bold">{sz} AWG</td>
                          <td className="py-2 text-right text-indigo-400 font-bold">{NEC_CONDUCTOR_VOLUMES[sz].cuIn.toFixed(2)} cu in</td>
                          <td className="py-2 text-right text-zinc-400">{NEC_CONDUCTOR_VOLUMES[sz].cm3} cm³</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSPECTOR CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">Electrical Inspector On-Site Verification Checklist</h4>
              <div className="space-y-3">
                {INSPECTION_CHECKLIST.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-zinc-950/60 border border-zinc-800 p-3 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-zinc-300 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
