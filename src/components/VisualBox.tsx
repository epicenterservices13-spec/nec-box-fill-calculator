import React from 'react';
import { CalculationResult, BoxFillInputs } from '../types/nec';
import { CABLE_TYPES, STANDARD_BOXES } from '../data/necTables';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface VisualBoxProps {
  result: CalculationResult;
  inputs: BoxFillInputs;
  unit: 'imperial' | 'metric';
}

export const VisualBox: React.FC<VisualBoxProps> = ({ result, inputs, unit }) => {
  const selectedBox = STANDARD_BOXES.find(b => b.id === inputs.selectedStandardBoxId);
  const boxName = inputs.boxType === 'standard' 
    ? (selectedBox?.name || 'Standard Metallic Box')
    : `Custom Box (${inputs.customDimensions.width}" x ${inputs.customDimensions.height}" x ${inputs.customDimensions.depth}")`;

  const pct = Math.min(100, Math.max(0, result.fillPercentage));
  
  // Status Colors
  let statusColorClass = 'bg-emerald-500 text-emerald-400 border-emerald-500/30';
  let progressColorClass = 'bg-gradient-to-r from-emerald-500 to-teal-400';
  let StatusIcon = CheckCircle2;

  if (result.fillPercentage > 100) {
    statusColorClass = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    progressColorClass = 'bg-gradient-to-r from-rose-600 to-red-500';
    StatusIcon = AlertCircle;
  } else if (result.fillPercentage > 85) {
    statusColorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    progressColorClass = 'bg-gradient-to-r from-amber-500 to-orange-400';
    StatusIcon = AlertTriangle;
  }

  // Unit formatting
  const formatVol = (cuIn: number, cm3: number) => {
    return unit === 'imperial' ? `${cuIn.toFixed(1)} cu in` : `${cm3} cm³`;
  };

  return (
    <div className="glass rounded-3xl p-6 border border-zinc-800 space-y-6">
      
      {/* Box Name & Fill Gauge */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
            Enclosure Volume Capacity
          </span>
          <h2 className="text-xl font-bold text-white leading-tight">{boxName}</h2>
          <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
            <span>Base: {formatVol(result.boxCapacityCuIn, result.boxCapacityCm3)}</span>
            {result.extensionVolumeCuIn > 0 && (
              <span className="text-indigo-400 font-medium">
                + Ring ({formatVol(result.extensionVolumeCuIn, Math.round(result.extensionVolumeCuIn * 16.3871))})
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColorClass}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{result.fillPercentage}% Capacity</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-zinc-400 font-medium">
            Required Volume: <strong className="text-white font-mono">{formatVol(result.totalRequiredVolumeCuIn, result.totalRequiredVolumeCm3)}</strong>
          </span>
          <span className="text-zinc-400 font-medium">
            Max Available: <strong className="text-white font-mono">{formatVol(result.totalAvailableVolumeCuIn, result.totalAvailableVolumeCm3)}</strong>
          </span>
        </div>

        <div className="h-4 bg-zinc-900 border border-zinc-800 rounded-full p-0.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColorClass}`}
            style={{ width: `${Math.min(100, result.fillPercentage)}%` }}
          />
        </div>

        {/* Headroom / Overflow indicator */}
        <div className="mt-2 text-right">
          {result.isCompliant ? (
            <span className="text-xs text-emerald-400 font-mono">
              ✓ {formatVol(result.excessVolumeCuIn, Math.round(result.excessVolumeCuIn * 16.3871))} Headroom Free
            </span>
          ) : (
            <span className="text-xs text-rose-400 font-mono font-bold">
              ⚠ Overfilled by {formatVol(Math.abs(result.excessVolumeCuIn), Math.round(Math.abs(result.excessVolumeCuIn) * 16.3871))}
            </span>
          )}
        </div>
      </div>

      {/* 2D Box Diagram Graphic */}
      <div className="relative bg-zinc-950/90 rounded-2xl border-2 border-zinc-800 p-5 min-h-[160px] flex flex-col justify-between overflow-hidden">
        
        {/* Metallic Box Outline / Grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top Wire Inlets & Clamps */}
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-1">
            {inputs.hasInternalClamps && (
              <span className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded border border-zinc-700 font-mono">
                [Clamp]
              </span>
            )}
            {inputs.hasSupportFittings && (
              <span className="bg-amber-900/50 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-700/50 font-mono">
                [Fixture Stud]
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">NEC 314.16 Enclosure</span>
        </div>

        {/* Center Box Content Items Visualizer */}
        <div className="relative z-10 my-3 space-y-2">
          
          {/* Conductors Representation */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(inputs.cables || []).map((cable, i) => {
              const type = CABLE_TYPES.find(t => t.id === cable.cableTypeId);
              if (!type) return null;
              return (
                <div key={`cable-${i}`} className="flex items-center gap-1 bg-indigo-950/40 border border-indigo-800/50 px-2 py-1 rounded-lg text-xs">
                  <span className={`w-2 h-2 rounded-full ${type.size === '14' ? 'bg-white' : type.size === '12' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                  <span className="text-indigo-200 font-mono">{cable.quantity}x {type.shortLabel}</span>
                </div>
              );
            })}

            {inputs.conductors.map((c, i) => (
              <div key={i} className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 px-2 py-1 rounded-lg text-xs">
                <span className={`w-2 h-2 rounded-full ${c.size === '14' ? 'bg-white' : c.size === '12' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                <span className="text-zinc-200 font-mono">{c.count}x {c.size} AWG</span>
                {c.isPigtail && <span className="text-[9px] text-zinc-500">(Pigtail)</span>}
              </div>
            ))}

            {/* Grounding Conductor Visual */}
            {result.totalEgcCount > 0 && (
              <div className="flex items-center gap-1 bg-emerald-950/60 border border-emerald-700/50 px-2 py-1 rounded-lg text-xs text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono">{result.totalEgcCount}x Ground ({inputs.largestEgcSize} AWG)</span>
              </div>
            )}
          </div>

          {/* Devices Representation */}
          {inputs.devices.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {inputs.devices.map((d, i) => (
                <div key={i} className="bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                  <span>📱 {d.description || d.type}</span>
                  <span className="text-[10px] bg-indigo-900/80 px-1.5 py-0.5 rounded text-indigo-200 font-mono">
                    {d.gangs}-gang
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Box Metadata */}
        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono relative z-10 pt-2 border-t border-zinc-900">
          <span>Largest Wire: {result.largestConductorInBox} AWG</span>
          <span>Fill Allowances: {result.breakdown.reduce((sum, b) => sum + b.allowanceCount, 0)} total</span>
        </div>
      </div>
    </div>
  );
};
