import React, { useState, useEffect, useMemo } from 'react';
import { BoxFillInputs, BoxSuggestion, SavedJob, WiringPreset } from './types/nec';
import { calculateBoxFill } from './utils/calculator';
import { readInputsFromHash, clearHash } from './utils/shareLink';
import { loadSavedJobs, persistSavedJobs, createSavedJob } from './utils/savedJobs';
import { Header } from './components/Header';
import { VisualBox } from './components/VisualBox';
import { BoxSelector } from './components/BoxSelector';
import { CableForm } from './components/CableForm';
import { ConductorForm } from './components/ConductorForm';
import { DeviceForm } from './components/DeviceForm';
import { HardwareForm } from './components/HardwareForm';
import { ResultsBreakdown } from './components/ResultsBreakdown';
import { PresetsModal } from './components/PresetsModal';
import { CodeReferenceModal } from './components/CodeReferenceModal';
import { InspectionReportModal } from './components/InspectionReportModal';
import { SavedJobsModal } from './components/SavedJobsModal';
import { Calculator, Link2, X } from 'lucide-react';

const STORAGE_KEY = 'nec_box_fill_inputs_v2';

const DEFAULT_INPUTS: BoxFillInputs = {
  necEdition: '2023',
  boxType: 'standard',
  selectedStandardBoxId: 'sq_4_2_125', // 4" x 2-1/8" Deep Square Box (30.3 cu in)
  customDimensions: {
    width: 4,
    height: 4,
    depth: 2.125,
    customVolumeCuIn: 30.3
  },
  extensionRingId: 'mud_1_2', // 1/2" Single-Gang Mud Ring (+3.5 cu in)
  customExtensionVolume: 0,
  cables: [
    { id: 'cable1', cableTypeId: 'nm_12_2', quantity: 2, description: 'Line in & load out' }
  ],
  conductors: [],
  hasInternalClamps: true,
  clampWireSize: '12',
  hasSupportFittings: false,
  supportFittingWireSize: '12',
  egcCount: 0,
  largestEgcSize: '12',
  hasIsolatedGrounds: false,
  devices: [
    { id: 'dev1', type: 'receptacle', gangs: 1, wireSizeConnected: '12', description: 'Duplex Outlet' }
  ]
};

// Read once at module load: the state initializer clears the hash, so anything
// that needs to know a link was opened has to capture it before that happens.
const SHARED_INPUTS = readInputsFromHash();

// Saved state predates the cables field, and shared links carry whatever the sender
// had — fill the gaps from the defaults without inventing conductors nobody entered.
function normalizeInputs(raw: Partial<BoxFillInputs> | null | undefined): BoxFillInputs {
  if (!raw || typeof raw !== 'object') return DEFAULT_INPUTS;
  return {
    ...DEFAULT_INPUTS,
    ...raw,
    cables: Array.isArray(raw.cables) ? raw.cables : [],
    conductors: Array.isArray(raw.conductors) ? raw.conductors : [],
    devices: Array.isArray(raw.devices) ? raw.devices : [],
    customDimensions: { ...DEFAULT_INPUTS.customDimensions, ...(raw.customDimensions || {}) }
  };
}

export default function App() {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [loadedFromLink, setLoadedFromLink] = useState(SHARED_INPUTS !== null);

  const [inputs, setInputs] = useState<BoxFillInputs>(() => {
    // A shared link wins over whatever is in this browser's storage
    if (SHARED_INPUTS) {
      clearHash();
      return normalizeInputs(SHARED_INPUTS);
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? normalizeInputs(JSON.parse(saved)) : DEFAULT_INPUTS;
    } catch {
      return DEFAULT_INPUTS;
    }
  });

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(() => loadSavedJobs());

  // Modal States
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isCodeRefOpen, setIsCodeRefOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isJobsOpen, setIsJobsOpen] = useState(false);

  // Auto save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [inputs]);

  useEffect(() => {
    persistSavedJobs(savedJobs);
  }, [savedJobs]);

  // Reactive Calculation
  const result = useMemo(() => calculateBoxFill(inputs), [inputs]);

  const updateInputs = (partial: Partial<BoxFillInputs>) => {
    setInputs(prev => ({ ...prev, ...partial }));
  };

  const handleSelectPreset = (preset: WiringPreset) => {
    setInputs(prev => ({
      ...prev,
      ...preset.inputs,
      cables: preset.inputs.cables || [],
      conductors: preset.inputs.conductors || prev.conductors,
      devices: preset.inputs.devices || prev.devices
    }));
  };

  // One click from "this box fails" to a box that passes
  const handleApplySuggestion = (suggestion: BoxSuggestion) => {
    updateInputs({
      boxType: 'standard',
      selectedStandardBoxId: suggestion.boxId,
      extensionRingId: suggestion.extensionRingId,
      customExtensionVolume: 0
    });
  };

  const handleSaveJob = (label: string) => {
    setSavedJobs(prev => [...prev, createSavedJob(label, inputs)]);
  };

  const handleLoadJob = (job: SavedJob) => {
    setInputs(normalizeInputs(job.inputs));
  };

  const handleDeleteJob = (id: string) => {
    setSavedJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <Header
        unit={unit}
        setUnit={setUnit}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenCodeRef={() => setIsCodeRefOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenJobs={() => setIsJobsOpen(true)}
        savedJobCount={savedJobs.length}
        onReset={handleReset}
      />

      {/* Shared Link Notice */}
      {loadedFromLink && (
        <div className="bg-indigo-950/40 border-b border-indigo-500/30 text-indigo-200 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-indigo-400" />
              Loaded a shared calculation from the link. Save it under <strong>Saved Boxes</strong> to keep it.
            </span>
            <button
              onClick={() => setLoadedFromLink(false)}
              className="p-1 text-indigo-300 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Electrical Box Fill Calculator</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Calculate enclosure conductor volume requirements, ground wire allowances, internal clamps, and strap devices under National Electrical Code Article 314.16.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => setIsPresetsOpen(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              Load Preset Template
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              Generate Certificate
            </button>
          </div>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Controls & Forms (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Box Selector */}
            <BoxSelector
              inputs={inputs}
              onChange={updateInputs}
              unit={unit}
            />

            {/* Cables (expand into conductors + grounds) */}
            <CableForm
              cables={inputs.cables}
              onChange={(cables) => updateInputs({ cables })}
              unit={unit}
            />

            {/* Insulated Conductors */}
            <ConductorForm
              conductors={inputs.conductors}
              onChange={(conductors) => updateInputs({ conductors })}
              unit={unit}
            />

            {/* Strap Devices */}
            <DeviceForm
              devices={inputs.devices}
              onChange={(devices) => updateInputs({ devices })}
              unit={unit}
            />

            {/* Hardware & Grounding */}
            <HardwareForm
              inputs={inputs}
              onChange={updateInputs}
              largestConductorInBox={result.largestConductorInBox}
              egcCountFromCables={result.egcCountFromCables}
              totalEgcCount={result.totalEgcCount}
              unit={unit}
            />

          </div>

          {/* Right Column: Visual Box & Results Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20 lg:self-start">
            
            {/* Realtime Visual Enclosure Gauge */}
            <VisualBox
              result={result}
              inputs={inputs}
              unit={unit}
            />

            {/* Itemized Calculation Summary Table */}
            <ResultsBreakdown
              result={result}
              unit={unit}
              onApplySuggestion={handleApplySuggestion}
            />

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500 space-y-2">
        <div className="flex justify-center items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <span className="text-zinc-400 font-semibold">NEC 314.16 Box Fill Calculation System</span>
        </div>
        <p className="max-w-xl mx-auto text-zinc-600">
          Complies with National Electrical Code Chapter 9 Table 5 &amp; Section 314.16 (2020 &amp; 2023 Editions). For engineering &amp; electrical inspection reference.
        </p>
      </footer>

      {/* Modals */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <CodeReferenceModal
        isOpen={isCodeRefOpen}
        onClose={() => setIsCodeRefOpen(false)}
      />

      <InspectionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        inputs={inputs}
        result={result}
        savedJobs={savedJobs}
        unit={unit}
      />

      <SavedJobsModal
        isOpen={isJobsOpen}
        onClose={() => setIsJobsOpen(false)}
        jobs={savedJobs}
        currentInputs={inputs}
        onSaveCurrent={handleSaveJob}
        onLoad={handleLoadJob}
        onDelete={handleDeleteJob}
      />

    </div>
  );
}
