import React from 'react';
import { BoxFillInputs } from '../types/nec';
import { STANDARD_BOXES, EXTENSION_RINGS } from '../data/necTables';
import { Box, Layers, Sliders } from 'lucide-react';

interface BoxSelectorProps {
  inputs: BoxFillInputs;
  onChange: (updated: Partial<BoxFillInputs>) => void;
  unit: 'imperial' | 'metric';
}

export const BoxSelector: React.FC<BoxSelectorProps> = ({ inputs, onChange, unit }) => {
  return (
    <div className="glass rounded-3xl p-6 border border-zinc-800 space-y-5">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Box &amp; Extension Selection</h3>
            <p className="text-xs text-zinc-400">NEC Table 314.16(A) standard volumes &amp; custom sizing</p>
          </div>
        </div>

        {/* Standard vs Custom Mode Switch */}
        <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center text-xs">
          <button
            type="button"
            onClick={() => onChange({ boxType: 'standard' })}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
              inputs.boxType === 'standard'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Standard Box
          </button>
          <button
            type="button"
            onClick={() => onChange({ boxType: 'custom' })}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
              inputs.boxType === 'custom'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Custom Sizing
          </button>
        </div>
      </div>

      {/* Standard Box Selector */}
      {inputs.boxType === 'standard' ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              STANDARD METALLIC / NONMETALLIC BOX (NEC TABLE 314.16(A))
            </label>
            <select
              value={inputs.selectedStandardBoxId}
              onChange={(e) => onChange({ selectedStandardBoxId: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-medium"
            >
              <optgroup label="Round &amp; Octagonal (Ceiling Fixture)">
                {STANDARD_BOXES.filter(b => b.category === 'octagonal_round').map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.volumeCuIn} cu in ({b.volumeCm3} cm³)
                  </option>
                ))}
              </optgroup>
              <optgroup label='4" Square Boxes (4x4)'>
                {STANDARD_BOXES.filter(b => b.category === 'square_4in').map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.volumeCuIn} cu in ({b.volumeCm3} cm³)
                  </option>
                ))}
              </optgroup>
              <optgroup label='4-11/16" Commercial Square Boxes'>
                {STANDARD_BOXES.filter(b => b.category === 'square_4_11_16in').map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.volumeCuIn} cu in ({b.volumeCm3} cm³)
                  </option>
                ))}
              </optgroup>
              <optgroup label='Single-Gang Device Boxes (3" x 2")'>
                {STANDARD_BOXES.filter(b => b.category === 'device_box').map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.volumeCuIn} cu in ({b.volumeCm3} cm³)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Surface Mount Handy &amp; FS Boxes">
                {STANDARD_BOXES.filter(b => b.category === 'handy_fs').map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.volumeCuIn} cu in ({b.volumeCm3} cm³)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Nonmetallic Plastic Outlet Boxes">
                {STANDARD_BOXES.filter(b => b.category === 'nonmetallic_gang').map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.volumeCuIn} cu in ({b.volumeCm3} cm³)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      ) : (
        /* Custom Dimensions Form */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">WIDTH (IN)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={inputs.customDimensions.width}
                onChange={(e) => onChange({
                  customDimensions: {
                    ...inputs.customDimensions,
                    width: parseFloat(e.target.value) || 0
                  }
                })}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">HEIGHT (IN)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={inputs.customDimensions.height}
                onChange={(e) => onChange({
                  customDimensions: {
                    ...inputs.customDimensions,
                    height: parseFloat(e.target.value) || 0
                  }
                })}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">DEPTH (IN)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={inputs.customDimensions.depth}
                onChange={(e) => onChange({
                  customDimensions: {
                    ...inputs.customDimensions,
                    depth: parseFloat(e.target.value) || 0
                  }
                })}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-zinc-400">Calculated Custom Volume:</span>
            <span className="text-indigo-400 font-bold font-mono text-sm">
              {(inputs.customDimensions.width * inputs.customDimensions.height * inputs.customDimensions.depth).toFixed(2)} cu in
            </span>
          </div>
        </div>
      )}

      {/* Extension Ring / Plaster Mud Ring Section */}
      <div className="pt-2 border-t border-zinc-800/80 space-y-3">
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>PLASTER / MUD RING OR EXTENSION RING (ADDITIONAL VOLUME)</span>
        </label>
        
        <select
          value={inputs.extensionRingId}
          onChange={(e) => onChange({ extensionRingId: e.target.value })}
          className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
        >
          {EXTENSION_RINGS.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        {inputs.extensionRingId === 'custom' && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="Custom Volume (cu in)"
              value={inputs.customExtensionVolume || ''}
              onChange={(e) => onChange({ customExtensionVolume: parseFloat(e.target.value) || 0 })}
              className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono w-full"
            />
            <span className="text-xs text-zinc-400 whitespace-nowrap">cu in</span>
          </div>
        )}
      </div>

    </div>
  );
};
