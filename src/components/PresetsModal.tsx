import React from 'react';
import { WiringPreset, BoxFillInputs } from '../types/nec';
import { WIRING_PRESETS } from '../data/necTables';
import { X, ArrowRight, Bookmark } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: WiringPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Wiring Preset Templates</h3>
              <p className="text-xs text-zinc-400">Select standard residential or commercial wiring scenarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {WIRING_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="bg-zinc-900/70 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all group cursor-pointer space-y-2"
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                  {preset.category}
                </span>
                <span className="text-xs text-zinc-400 group-hover:text-indigo-400 flex items-center gap-1 font-semibold transition-colors">
                  Load Preset <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white">{preset.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{preset.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
