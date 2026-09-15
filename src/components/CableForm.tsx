import React from 'react';
import { CableEntry } from '../types/nec';
import { CABLE_TYPES, NEC_CONDUCTOR_VOLUMES } from '../data/necTables';
import { Layers, Plus, Trash2, Info, ShieldCheck } from 'lucide-react';

interface CableFormProps {
  cables: CableEntry[];
  onChange: (updated: CableEntry[]) => void;
  unit: 'imperial' | 'metric';
}

const QUICK_CABLES = ['nm_14_2', 'nm_12_2', 'nm_14_3', 'nm_12_3'];

export const CableForm: React.FC<CableFormProps> = ({ cables, onChange, unit }) => {
  const formatVol = (cuIn: number) =>
    unit === 'imperial' ? `${cuIn.toFixed(2)} cu in` : `${Math.round(cuIn * 16.3871)} cm³`;

  const addCable = (cableTypeId: string = 'nm_12_2') => {
    const newEntry: CableEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      cableTypeId,
      quantity: 1,
      description: ''
    };
    onChange([...cables, newEntry]);
  };

  const updateCable = (id: string, field: keyof CableEntry, value: any) => {
    onChange(cables.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCable = (id: string) => {
    onChange(cables.filter(c => c.id !== id));
  };

  const totalGrounds = cables.reduce((sum, c) => {
    const type = CABLE_TYPES.find(t => t.id === c.cableTypeId);
    return sum + (type?.hasEgc ? c.quantity : 0);
  }, 0);

  return (
    <div className="glass rounded-3xl p-6 border border-zinc-800 space-y-5">

      {/* Header & Add */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Cables Entering Box</span>
              <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-mono">
                {cables.reduce((sum, c) => sum + c.quantity, 0)} Total
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Each cable expands into its conductors <strong className="text-zinc-300">and its ground</strong> automatically
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => addCable()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Cable
        </button>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-zinc-400 font-medium mr-1">Quick Add:</span>
        {QUICK_CABLES.map(id => {
          const type = CABLE_TYPES.find(t => t.id === id);
          if (!type) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => addCable(id)}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-all font-mono"
            >
              + {type.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Cable List */}
      {cables.length === 0 ? (
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 text-xs">
          No cables added. Use the quick buttons above, or enter loose conductors below instead.
        </div>
      ) : (
        <div className="space-y-3">
          {cables.map((c) => {
            const type = CABLE_TYPES.find(t => t.id === c.cableTypeId);
            const unitVol = type ? NEC_CONDUCTOR_VOLUMES[type.size]?.cuIn || 2.0 : 0;
            const conductorCount = type ? type.insulatedCount * c.quantity : 0;
            const subtotal = conductorCount * unitVol;

            return (
              <div
                key={c.id}
                className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center gap-3">

                  {/* Cable Type */}
                  <div className="flex-1 min-w-[190px]">
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">CABLE TYPE</label>
                    <select
                      value={c.cableTypeId}
                      onChange={(e) => updateCable(c.id, 'cableTypeId', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm font-semibold font-mono focus:outline-none focus:border-indigo-500"
                    >
                      {CABLE_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-24">
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">QTY</label>
                    <input
                      type="number"
                      min="1"
                      value={c.quantity}
                      onChange={(e) => updateCable(c.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm font-semibold font-mono text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Expansion Summary */}
                  <div className="self-end mb-1 text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono">
                    {conductorCount}x {type?.size} AWG
                    {type?.hasEgc && (
                      <span className="text-emerald-400"> + {c.quantity} EGC</span>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[80px] self-end mb-1">
                    <span className="text-[10px] text-zinc-500 block">CONDUCTOR VOL</span>
                    <span className="text-sm font-mono font-bold text-indigo-400">{formatVol(subtotal)}</span>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeCable(c.id)}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all self-end mb-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Description & Cable Note */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Description (optional, e.g. Home run from panel)..."
                    value={c.description || ''}
                    onChange={(e) => updateCable(c.id, 'description', e.target.value)}
                    className="bg-zinc-950/60 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-1 text-xs flex-1 min-w-[180px] focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
                  />
                  {type?.note && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <Info className="w-3 h-3 shrink-0" /> {type.note}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Derived Ground Summary */}
      {totalGrounds > 0 && (
        <div className="text-xs text-zinc-400 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-emerald-400">{totalGrounds} equipment grounding conductor{totalGrounds === 1 ? '' : 's'}</strong> added
            from these cables, on top of any entered manually below. NEC 314.16(B)(5) counts 1 allowance for the first four grounds.
          </span>
        </div>
      )}

    </div>
  );
};
