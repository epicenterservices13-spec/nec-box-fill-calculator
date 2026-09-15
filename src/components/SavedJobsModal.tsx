import React, { useState } from 'react';
import { BoxFillInputs, SavedJob } from '../types/nec';
import { calculateBoxFill } from '../utils/calculator';
import { buildShareUrl } from '../utils/shareLink';
import { formatSavedAt } from '../utils/savedJobs';
import { STANDARD_BOXES } from '../data/necTables';
import { X, FolderOpen, Save, Trash2, Link2, Upload, CheckCircle2, AlertOctagon } from 'lucide-react';

interface SavedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: SavedJob[];
  currentInputs: BoxFillInputs;
  onSaveCurrent: (label: string) => void;
  onLoad: (job: SavedJob) => void;
  onDelete: (id: string) => void;
}

export const SavedJobsModal: React.FC<SavedJobsModalProps> = ({
  isOpen,
  onClose,
  jobs,
  currentInputs,
  onSaveCurrent,
  onLoad,
  onDelete
}) => {
  const [label, setLabel] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveCurrent(label);
    setLabel('');
  };

  const handleCopyLink = (inputs: BoxFillInputs, id: string) => {
    navigator.clipboard.writeText(buildShareUrl(inputs));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const boxNameFor = (inputs: BoxFillInputs) => {
    if (inputs.boxType !== 'standard') {
      return `Custom Box (${inputs.customDimensions.width}" x ${inputs.customDimensions.height}" x ${inputs.customDimensions.depth}")`;
    }
    return STANDARD_BOXES.find(b => b.id === inputs.selectedStandardBoxId)?.name || 'Standard Box';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Saved Boxes</h3>
              <p className="text-xs text-zinc-400">Keep every box on the job, and share any of them by link</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyLink(currentInputs, 'current')}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-800 transition-all"
            >
              <Link2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{copiedId === 'current' ? 'Link Copied!' : 'Copy Link to Current'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Current Calculation */}
        <div className="bg-zinc-900/60 p-4 border-b border-zinc-800 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-[10px] text-zinc-400 font-semibold block mb-1">SAVE CURRENT CALCULATION AS</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              placeholder="e.g. Kitchen — Box 4 (GFCI home run)"
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium placeholder:text-zinc-600"
            />
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Box</span>
          </button>
        </div>

        {/* Saved Jobs List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {jobs.length === 0 ? (
            <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-xs">
              Nothing saved yet. Name the box above and hit Save — every box on the job stays available here,
              and all of them land on the inspection certificate.
            </div>
          ) : (
            jobs.map((job) => {
              const jobResult = calculateBoxFill(job.inputs);

              return (
                <div
                  key={job.id}
                  className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{job.label}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        jobResult.isCompliant
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {jobResult.isCompliant ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                        {jobResult.fillPercentage}% fill
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{boxNameFor(job.inputs)}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {jobResult.totalRequiredVolumeCuIn.toFixed(2)} / {jobResult.totalAvailableVolumeCuIn.toFixed(2)} cu in
                      <span className="mx-1.5">·</span>
                      saved {formatSavedAt(job.savedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(job.inputs, job.id)}
                      className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium px-3 py-2 rounded-xl transition-all"
                    >
                      <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{copiedId === job.id ? 'Copied!' : 'Share'}</span>
                    </button>
                    <button
                      onClick={() => { onLoad(job); onClose(); }}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Load</span>
                    </button>
                    <button
                      onClick={() => onDelete(job.id)}
                      title="Delete saved box"
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
