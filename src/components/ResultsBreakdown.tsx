import React from 'react';
import { BoxSuggestion, CalculationResult } from '../types/nec';
import { CheckCircle2, AlertOctagon, Lightbulb, PackageCheck, ArrowRight } from 'lucide-react';

interface ResultsBreakdownProps {
  result: CalculationResult;
  unit: 'imperial' | 'metric';
  onApplySuggestion: (suggestion: BoxSuggestion) => void;
}

export const ResultsBreakdown: React.FC<ResultsBreakdownProps> = ({ result, unit, onApplySuggestion }) => {
  const formatVol = (cuIn: number, cm3: number) => {
    return unit === 'imperial' ? `${cuIn.toFixed(2)} cu in` : `${cm3} cm³`;
  };

  return (
    <div className="space-y-6">
      
      {/* Pass / Fail Compliance Banner */}
      <div className={`glass rounded-3xl p-6 border transition-all ${
        result.isCompliant
          ? 'border-emerald-500/30 bg-emerald-950/20'
          : 'border-rose-500/40 bg-rose-950/20'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${
              result.isCompliant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {result.isCompliant ? <CheckCircle2 className="w-8 h-8" /> : <AlertOctagon className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  result.isCompliant ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {result.isCompliant ? 'NEC Compliant' : 'Non-Compliant Overfill'}
                </span>
                <span className="text-xs text-zinc-400 font-mono">{result.fillPercentage}% Fill Ratio</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {result.isCompliant ? 'Passed Code Verification' : 'Exceeds Maximum Box Volume'}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-400 block">REQUIRED vs CAPACITY</span>
            <div className="text-xl font-extrabold font-mono text-white">
              {formatVol(result.totalRequiredVolumeCuIn, result.totalRequiredVolumeCm3)}
              <span className="text-sm font-normal text-zinc-400 mx-1.5">/</span>
              {formatVol(result.totalAvailableVolumeCuIn, result.totalAvailableVolumeCm3)}
            </div>
          </div>
        </div>

        {/* Warnings / Recommendations */}
        {(result.warnings.length > 0 || result.recommendations.length > 0) && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
            {result.warnings.map((w, idx) => (
              <div key={idx} className="text-xs font-medium text-amber-300 flex items-center gap-2">
                <span>⚠️ {w}</span>
              </div>
            ))}
            {result.recommendations.map((r, idx) => (
              <div key={idx} className="text-xs text-zinc-300 flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smallest Compliant Box Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="glass rounded-3xl p-6 border border-indigo-500/30 bg-indigo-950/10 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {result.suggestions[0].reason === 'overfilled' ? 'Boxes That Would Pass' : 'Roomier Alternatives'}
              </h3>
              <p className="text-xs text-zinc-400">
                Smallest catalog assemblies holding {formatVol(result.totalRequiredVolumeCuIn, result.totalRequiredVolumeCm3)} — click to apply
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {result.suggestions.map((s) => (
              <button
                key={`${s.boxId}-${s.extensionRingId}`}
                type="button"
                onClick={() => onApplySuggestion(s)}
                className="w-full text-left bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-3.5 transition-all group flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{s.boxName}</div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {s.extensionRingId === 'none' ? 'No extension ring needed' : `with ${s.extensionRingName}`}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-indigo-400">
                      {formatVol(s.totalVolumeCuIn, Math.round(s.totalVolumeCuIn * 16.3871))}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {s.fillPercentage}% fill · {formatVol(s.headroomCuIn, Math.round(s.headroomCuIn * 16.3871))} free
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Itemized Volume Breakdown Table */}
      <div className="glass rounded-3xl p-6 border border-zinc-800 space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center justify-between">
          <span>Itemized NEC Volume Breakdown</span>
          <span className="text-xs text-zinc-400 font-mono font-normal">
            {result.breakdown.length} Itemized Groups
          </span>
        </h3>

        {result.breakdown.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">No items added to calculation.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800 font-mono">
                  <th className="pb-2.5 font-semibold">ITEM CATEGORY</th>
                  <th className="pb-2.5 font-semibold">NEC REF</th>
                  <th className="pb-2.5 font-semibold text-center">ALLOWANCES</th>
                  <th className="pb-2.5 font-semibold text-center">WIRE SIZE</th>
                  <th className="pb-2.5 font-semibold text-right">VOL / ITEM</th>
                  <th className="pb-2.5 font-semibold text-right">TOTAL VOL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {result.breakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 text-white">
                      <div>{item.label}</div>
                      <div className="text-[10px] text-zinc-500 font-normal">{item.details}</div>
                    </td>
                    <td className="py-3 font-mono text-indigo-400">{item.necRef}</td>
                    <td className="py-3 text-center font-mono text-zinc-200">{item.allowanceCount}x</td>
                    <td className="py-3 text-center font-mono text-zinc-200">{item.wireSizeUsed} AWG</td>
                    <td className="py-3 text-right font-mono text-zinc-400">
                      {formatVol(item.volumePerAllowance, Math.round(item.volumePerAllowance * 16.3871))}
                    </td>
                    <td className="py-3 text-right font-mono text-indigo-400 font-bold">
                      {formatVol(item.totalVolumeCuIn, Math.round(item.totalVolumeCuIn * 16.3871))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-700 text-sm font-bold text-white">
                  <td colSpan={5} className="pt-3 text-right">Total Conductor &amp; Hardware Volume Required:</td>
                  <td className="pt-3 text-right font-mono text-indigo-400">
                    {formatVol(result.totalRequiredVolumeCuIn, result.totalRequiredVolumeCm3)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
