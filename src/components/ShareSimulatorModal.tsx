import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PendingSharedMaterial, smartDeriveResourceMetadata } from '../utils/shareTargetService';
import { soundEngine } from '../utils/soundEffects';
import {
  Share2,
  Smartphone,
  FileText,
  Upload,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface ShareSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaterial: (material: PendingSharedMaterial) => void;
}

const SAMPLE_FILES = [
  {
    name: 'Applied_Mathematics_1_EndSem_PYQ_With_Solutions_2025.pdf',
    size: 3.8 * 1024 * 1024,
    formattedSize: '3.8 MB',
    type: 'application/pdf',
    origin: 'WhatsApp (CR Shared in Division A Group)',
  },
  {
    name: 'Applied_Physics_Unit_1_Quantum_Mechanics_Notes.pdf',
    size: 2.4 * 1024 * 1024,
    formattedSize: '2.4 MB',
    type: 'application/pdf',
    origin: 'Google Drive (Faculty Share)',
  },
  {
    name: 'Basic_Electrical_Engineering_Lab_Manual_All_Experiments.pdf',
    size: 5.1 * 1024 * 1024,
    formattedSize: '5.1 MB',
    type: 'application/pdf',
    origin: 'Files App (Downloaded from Telegram)',
  },
  {
    name: 'Engineering_Mechanics_Formula_Sheet_CheatSheet.pdf',
    size: 1.2 * 1024 * 1024,
    formattedSize: '1.2 MB',
    type: 'application/pdf',
    origin: 'WhatsApp Study Group',
  },
];

export const ShareSimulatorModal: React.FC<ShareSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSelectMaterial,
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [customFile, setCustomFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      soundEngine.playSuccess();
    }
  };

  const handleExecuteSimulatedShare = () => {
    soundEngine.playSuccess();
    onClose();

    if (customFile) {
      const meta = smartDeriveResourceMetadata(customFile.name);
      onSelectMaterial({
        name: customFile.name,
        size: customFile.size,
        formattedSize: `${(customFile.size / (1024 * 1024)).toFixed(1)} MB`,
        type: customFile.type || 'application/pdf',
        blob: customFile,
        title: meta.title,
        subject: meta.subject,
        category: meta.category,
        description: meta.description,
        source: 'SIMULATOR',
      });
      return;
    }

    const sample = SAMPLE_FILES[selectedFileIdx];
    const meta = smartDeriveResourceMetadata(sample.name);
    onSelectMaterial({
      name: sample.name,
      size: sample.size,
      formattedSize: sample.formattedSize,
      type: sample.type,
      title: meta.title,
      subject: meta.subject,
      category: meta.category,
      description: `Shared directly via IT Adda integration from ${sample.origin}.`,
      source: 'SIMULATOR',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060410]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-mono overflow-y-auto">
      <div className="bg-[#150c28]/95 backdrop-blur-2xl border-2 border-[#f4e6c8] max-w-lg w-full p-5 sm:p-6 shadow-[10px_10px_0_#060410] space-y-4 my-auto animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#f47b5c] border-2 border-[#f4e6c8] text-[#1a1030] flex items-center justify-center shadow-[2px_2px_0_#060410]">
              <Smartphone className="w-4 h-4 text-[#1a1030]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                Phone Share Simulator
              </h3>
              <p className="text-[11px] text-[#a08fd4]">
                Experience how student shares any material directly to IT Adda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#a08fd4] hover:text-[#f4e6c8] p-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mock Phone Share Dialog Display */}
        <div className="p-3 bg-[#1a1030] border-2 border-[#4b2f7e] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#f4e6c8]">
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#f9c74f]" />
              <span>Simulated OS Share Sheet:</span>
            </span>
            <span className="text-[10px] text-[#52b788] bg-[#52b788]/20 px-1.5 py-0.5 border border-[#52b788]/40">
              Web Share Target Active
            </span>
          </div>

          <p className="text-[11px] text-[#a08fd4]">
            Choose a study resource to simulate sharing from WhatsApp, Telegram, or phone storage:
          </p>

          <div className="space-y-2">
            {SAMPLE_FILES.map((sample, idx) => {
              const isSelected = selectedFileIdx === idx && !customFile;
              return (
                <div
                  key={sample.name}
                  onClick={() => {
                    setSelectedFileIdx(idx);
                    setCustomFile(null);
                  }}
                  className={`p-2.5 border cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#241548] border-[#f9c74f] shadow-[2px_2px_0_#060410]'
                      : 'bg-[#150c28]/60 border-[#4b2f7e]/60 hover:border-[#f4e6c8]'
                  }`}
                >
                  <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#f9c74f]' : 'text-[#a08fd4]'}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#f4e6c8]'}`}>
                      {sample.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#a08fd4]">
                      <span className="text-[#f9c74f]">{sample.formattedSize}</span>
                      <span>·</span>
                      <span className="truncate">{sample.origin}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#f9c74f] text-[#1a1030] flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Or pick your own real file */}
          <div className="pt-2 border-t border-[#4b2f7e]/70 flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="text-[#a08fd4] text-[11px]">Or test with your own file:</span>
            <label className="pixel-btn-secondary text-[11px] py-1 px-2.5 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3 h-3 text-[#f47b5c]" />
              <span>{customFile ? customFile.name : 'Choose Any PDF/File'}</span>
              <input
                type="file"
                onChange={handleCustomFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleExecuteSimulatedShare}
            className="pixel-btn w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0_#060410]"
          >
            <Zap className="w-4 h-4 fill-current text-[#1a1030]" />
            <span>Tap &quot;Share to IT Adda&quot; ➔ Open & 1-Tap Upload</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-center text-[#a08fd4]">
            This will immediately open IT Adda with this file pre-selected and ready to upload with 1 tap!
          </p>
        </div>
      </div>
    </div>
  );
};
