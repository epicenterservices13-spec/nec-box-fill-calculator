import React from 'react';
import { ConductorEntry, WireSize } from '../types/nec';
import { NEC_CONDUCTOR_VOLUMES, WIRE_SIZE_ORDER } from '../data/necTables';
import { Cable, Plus, Trash2, Info } from 'lucide-react';

interface ConductorFormProps {
  conductors: ConductorEntry[];
  onChange: (updated: ConductorEntry[]) => void;
  unit: 'imperial' | 'metric';
}

export const ConductorForm: React.FC<ConductorFormProps> = ({ conductors, onChange, unit }) => {
  const addConductor = (size: WireSize = '12', count: number = 2, desc: string = '') => {
    const newEntry: ConductorEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      size,
      count,
      isPigtail: false,
      description: desc
    };
    onChange([...conductors, newEntry]);
  };

  const updateConductor = (id: string, field: keyof ConductorEntry, value: any) => {
    onChange(conductors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeConductor = (id: string) => {
    onChange(conductors.filter(c => c.id !== id));
  };

  return (
    <div className="glass rounded-3xl p-6 border border-zinc-800 space-y-5">
      
      {/* Header & Quick Add */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Cable className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Insulated Conductors</span>
              <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-mono">
                {conductors.reduce((sum, c) => sum + (c.isPigtail ? 0 : c.count), 0)} Total
              </span>
            </h3>
            <p className="text-xs text-zinc-400">NEC 314.16(B)(1) — Wires entering or passing through box</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => addConductor('12', 2, 'Insulated Wire')}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Conductor
        </button>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-zinc-400 font-medium mr-1">Quick Add Cables:</span>
        <button
          type="button"
          onClick={() => addConductor('14', 2, '14/2 Romex Feed')}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-all font-mono"
        >
          + 14/2 Romex (2x 14 AWG)
        </button>
        <button
          type="button"
          onClick={() => addConductor('12', 2, '12/2 Romex Feed')}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-all font-mono"
        >
          + 12/2 Romex (2x 12 AWG)
        </button>
        <button
          type="button"
          onClick={() => addConductor('14', 3, '14/3 Cable Feed')}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-all font-mono"
        >
          + 14/3 Cable (3x 14 AWG)
        </button>
        <button
          type="button"
          onClick={() => addConductor('12', 3, '12/3 Cable Feed')}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-all font-mono"
        >
          + 12/3 Cable (3x 12 AWG)
        </button>
      </div>

      {/* Conductors List */}
      {conductors.length === 0 ? (
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 text-xs">
          No conductors added. Click "+ Add Conductor" or use quick cable buttons above.
        </div>
      ) : (
        <div className="space-y-3">
          {conductors.map((c) => {
            const vol = NEC_CONDUCTOR_VOLUMES[c.size]?.cuIn || 2.0;
            const subtotal = c.isPigtail ? 0 : c.count * vol;

            return (
              <div
                key={c.id}
                className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Wire Size Picker */}
                  <div className="flex-1 min-w-[130px]">
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">WIRE SIZE</label>
                    <select
                      value={c.size}
                      onChange={(e) => updateConductor(c.id, 'size', e.target.value as WireSize)}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm font-semibold font-mono focus:outline-none focus:border-indigo-500"
                    >
                      {WIRE_SIZE_ORDER.map(sz => (
                        <option key={sz} value={sz}>{sz} AWG ({NEC_CONDUCTOR_VOLUMES[sz].cuIn} cu in)</option>
                      ))}
                    </select>
                  </div>

                  {/* Conductor Count */}
                  <div className="w-24">
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">COUNT</label>
                    <input
                      type="number"
                      min="1"
                      value={c.count}
                      onChange={(e) => updateConductor(c.id, 'count', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm font-semibold font-mono text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Pigtail Checkbox */}
                  <div className="flex items-center gap-2 self-end mb-1 bg-zinc-950 px-3 py-2 border border-zinc-800 rounded-xl">
                    <input
                      type="checkbox"
                      id={`pigtail-${c.id}`}
                      checked={c.isPigtail}
                      onChange={(e) => updateConductor(c.id, 'isPigtail', e.target.checked)}
                      className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor={`pigtail-${c.id}`} className="text-xs text-zinc-300 font-medium cursor-pointer">
                      Internal Pigtail
                    </label>
                  </div>

                  {/* Volume Subtotal */}
                  <div className="text-right min-w-[80px] self-end mb-1">
                    <span className="text-[10px] text-zinc-500 block">SUBTOTAL</span>
                    <span className={`text-sm font-mono font-bold ${c.isPigtail ? 'text-zinc-500 line-through' : 'text-indigo-400'}`}>
                      {subtotal.toFixed(2)} cu in
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeConductor(c.id)}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all self-end mb-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Description & Pigtail Note */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Description (optional, e.g. Line Feed, Load to switch)..."
                    value={c.description || ''}
                    onChange={(e) => updateConductor(c.id, 'description', e.target.value)}
                    className="bg-zinc-950/60 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-1 text-xs w-full focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
                  />
                  {c.isPigtail && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                      <Info className="w-3 h-3" /> NEC 314.16(B)(1) Ex: 0 Allowance
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
