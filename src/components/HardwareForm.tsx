import React from 'react';
import { BoxFillInputs, WireSize } from '../types/nec';
import { WIRE_SIZE_ORDER, NEC_CONDUCTOR_VOLUMES } from '../data/necTables';
import { ShieldCheck, Anchor, Wrench, Info } from 'lucide-react';

interface HardwareFormProps {
  inputs: BoxFillInputs;
  onChange: (updated: Partial<BoxFillInputs>) => void;
  largestConductorInBox: WireSize;
  unit: 'imperial' | 'metric';
}

export const HardwareForm: React.FC<HardwareFormProps> = ({
  inputs,
  onChange,
  largestConductorInBox,
  unit
}) => {
  return (
    <div className="glass rounded-3xl p-6 border border-zinc-800 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Clamps, Fixtures &amp; Grounding</h3>
            <p className="text-xs text-zinc-400">NEC 314.16(B)(2), (B)(3) &amp; (B)(5) Hardware Allowances</p>
          </div>
        </div>
      </div>

      {/* Grounding Conductor Section (NEC 314.16(B)(5)) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Equipment Grounding Conductors (EGC)</h4>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-mono">
            NEC 2020 / 2023 Rule
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          
          {/* Ground Wire Count */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">TOTAL EGC GROUNDS</label>
            <input
              type="number"
              min="0"
              value={inputs.egcCount}
              onChange={(e) => onChange({ egcCount: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm font-semibold font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Largest EGC Size */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">LARGEST EGC WIRE SIZE</label>
            <select
              value={inputs.largestEgcSize || largestConductorInBox}
              onChange={(e) => onChange({ largestEgcSize: e.target.value as WireSize })}
              className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm font-semibold font-mono focus:outline-none focus:border-indigo-500"
            >
              {WIRE_SIZE_ORDER.map(sz => (
                <option key={sz} value={sz}>{sz} AWG ({NEC_CONDUCTOR_VOLUMES[sz].cuIn} cu in)</option>
              ))}
            </select>
          </div>
        </div>

        {/* EGC Allowance Summary Note */}
        {inputs.egcCount > 0 && (
          <div className="text-xs text-zinc-400 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              {inputs.egcCount <= 4 ? (
                <span>
                  <strong>1 Volume Allowance ({NEC_CONDUCTOR_VOLUMES[inputs.largestEgcSize || largestConductorInBox].cuIn} cu in)</strong> for up to 4 equipment grounding wires.
                </span>
              ) : (
                <span>
                  <strong>{(1 + (inputs.egcCount - 4) * 0.25).toFixed(2)} Volume Allowances</strong> (1 base + {(inputs.egcCount - 4) * 0.25} for {inputs.egcCount - 4} extra grounds over 4).
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Internal Clamps & Fixture Stud Toggles */}
      <div className="grid sm:grid-cols-2 gap-4">
        
        {/* Internal Cable Clamps */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="clamp-toggle" className="text-xs font-bold text-white cursor-pointer">
              Internal Cable Clamps
            </label>
            <input
              type="checkbox"
              id="clamp-toggle"
              checked={inputs.hasInternalClamps}
              onChange={(e) => onChange({ hasInternalClamps: e.target.checked })}
              className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            NEC 314.16(B)(2): Adds 1 allowance based on largest conductor in box ({largestConductorInBox} AWG).
          </p>
        </div>

        {/* Support Fittings / Fixture Studs */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="support-toggle" className="text-xs font-bold text-white cursor-pointer flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-amber-400" />
              <span>Fixture Stud / Hickey</span>
            </label>
            <input
              type="checkbox"
              id="support-toggle"
              checked={inputs.hasSupportFittings}
              onChange={(e) => onChange({ hasSupportFittings: e.target.checked })}
              className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            NEC 314.16(B)(3): Adds 1 allowance based on largest conductor in box ({largestConductorInBox} AWG).
          </p>
        </div>

      </div>

    </div>
  );
};
