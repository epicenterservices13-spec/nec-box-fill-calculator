import React, { useState } from 'react';
import { BoxFillInputs, CalculationResult } from '../types/nec';
import { STANDARD_BOXES } from '../data/necTables';
import { X, Printer, Copy, CheckCircle2, AlertOctagon, FileText } from 'lucide-react';

interface InspectionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: BoxFillInputs;
  result: CalculationResult;
  unit: 'imperial' | 'metric';
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  result,
  unit
}) => {
  const [jobTitle, setJobTitle] = useState('Commercial / Residential Branch Circuit');
  const [location, setLocation] = useState('Jobsite Box #101');
  const [electricianName, setElectricianName] = useState('Master Electrician');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const selectedBox = STANDARD_BOXES.find(b => b.id === inputs.selectedStandardBoxId);
  const boxName = inputs.boxType === 'standard' 
    ? (selectedBox?.name || 'Standard Box') 
    : `Custom Box (${inputs.customDimensions.width}" x ${inputs.customDimensions.height}" x ${inputs.customDimensions.depth}")`;

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const generateTextSummary = () => {
    return `=====================================================
NEC ARTICLE 314.16 BOX FILL INSPECTION REPORT
=====================================================
Date: ${dateStr}
Project: ${jobTitle}
Location: ${location}
Electrician: ${electricianName}

ENCLOSURE SPECIFICATIONS:
- Enclosure: ${boxName}
- Available Box Volume: ${result.totalAvailableVolumeCuIn.toFixed(2)} cu in (${result.totalAvailableVolumeCm3} cm³)
- Required Fill Volume: ${result.totalRequiredVolumeCuIn.toFixed(2)} cu in (${result.totalRequiredVolumeCm3} cm³)
- Fill Capacity: ${result.fillPercentage}%
- Compliance Status: ${result.isCompliant ? 'PASS (NEC COMPLIANT)' : 'FAIL (OVERFILLED)'}

ITEMIZED ALLOWANCE BREAKDOWN:
${result.breakdown.map(item => `- [${item.necRef}] ${item.label}: ${item.allowanceCount}x allowance @ ${item.wireSizeUsed} AWG = ${item.totalVolumeCuIn.toFixed(2)} cu in`).join('\n')}

INSPECTOR VERDICT:
${result.isCompliant 
  ? `✓ COMPLIANT: Enclosure provides sufficient volume capacity under NEC 314.16 requirements.`
  : `⚠️ NON-COMPLIANT: Enclosure exceeds maximum allowable volume by ${Math.abs(result.excessVolumeCuIn).toFixed(2)} cu in.`}
=====================================================`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateTextSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">NEC Compliance Certificate</h3>
              <p className="text-xs text-zinc-400">Official Jobsite Box Fill Report &amp; Inspection Summary</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-800 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Inputs for Metadata */}
        <div className="bg-zinc-900/60 p-4 border-b border-zinc-800 grid sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-zinc-400 font-semibold block mb-1">PROJECT TITLE</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-400 font-semibold block mb-1">LOCATION / BOX ID</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-400 font-semibold block mb-1">ELECTRICIAN / INSPECTOR</label>
            <input
              type="text"
              value={electricianName}
              onChange={(e) => setElectricianName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 print:p-0 print:text-black">
          <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950 space-y-6">
            
            {/* Report Header */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-5">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 font-mono">
                  Official Electrical Calculation Report
                </span>
                <h2 className="text-2xl font-black text-white mt-1">NEC 314.16 Box Fill Verification</h2>
                <div className="text-xs text-zinc-400 mt-2 space-y-0.5">
                  <p><strong>Project:</strong> {jobTitle}</p>
                  <p><strong>Location:</strong> {location}</p>
                  <p><strong>Inspector / Installer:</strong> {electricianName}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-zinc-400 font-mono">{dateStr}</div>
                <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  result.isCompliant
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}>
                  {result.isCompliant ? <CheckCircle2 className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
                  <span>{result.isCompliant ? 'PASS - COMPLIANT' : 'FAIL - OVERFILLED'}</span>
                </div>
              </div>
            </div>

            {/* Specifications Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Box Enclosure</span>
                <span className="font-bold text-white block mt-0.5">{boxName}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Box Capacity</span>
                <span className="font-bold text-indigo-400 font-mono block mt-0.5">{result.totalAvailableVolumeCuIn.toFixed(2)} cu in</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Required Conductor Vol</span>
                <span className="font-bold text-white font-mono block mt-0.5">{result.totalRequiredVolumeCuIn.toFixed(2)} cu in</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Fill Capacity Ratio</span>
                <span className={`font-bold font-mono block mt-0.5 ${result.isCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.fillPercentage}%
                </span>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Calculated Volume Allowances:</h4>
              <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-900 text-zinc-400 font-mono">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">NEC Section</th>
                    <th className="p-2.5 text-center">Allowances</th>
                    <th className="p-2.5 text-center">Wire Size</th>
                    <th className="p-2.5 text-right">Volume Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-200">
                  {result.breakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{item.label}</td>
                      <td className="p-2.5 font-mono text-indigo-400">{item.necRef}</td>
                      <td className="p-2.5 text-center font-mono">{item.allowanceCount}x</td>
                      <td className="p-2.5 text-center font-mono">{item.wireSizeUsed} AWG</td>
                      <td className="p-2.5 text-right font-mono font-bold text-indigo-400">{item.totalVolumeCuIn.toFixed(2)} cu in</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Signature line */}
            <div className="pt-8 border-t border-zinc-800 flex justify-between items-end text-xs text-zinc-500">
              <div>
                <div className="w-48 border-b border-zinc-700 pb-1 text-zinc-300 font-semibold">{electricianName}</div>
                <span className="text-[10px]">Inspector / Electrician Signature</span>
              </div>
              <div className="text-right text-[10px]">
                Calculated under National Electrical Code (NEC) Article 314.16
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
