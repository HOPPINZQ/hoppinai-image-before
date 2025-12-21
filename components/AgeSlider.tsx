
import React from 'react';
import { Check, Layers } from 'lucide-react';

interface AgeSliderProps {
  value: number;
  selectedBatch: number[];
  onChange: (val: number) => void;
  onToggleBatch: (val: number) => void;
  disabled?: boolean;
}

export const AgeSlider: React.FC<AgeSliderProps> = ({ 
  value, 
  selectedBatch, 
  onChange, 
  onToggleBatch, 
  disabled 
}) => {
  const commonAges = [-20, -10, 10, 20, 30, 40, 50, 60];

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between text-sm font-medium text-slate-400">
          <span>Past</span>
          <span className="text-blue-400 text-lg font-bold">
            {value === 0 ? 'Current Age' : value > 0 ? `+${value} Years` : `${value} Years`}
          </span>
          <span>Future</span>
        </div>
        <input
          type="range"
          min="-30"
          max="60"
          step="5"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Layers className="w-3 h-3" />
          <span>Batch Selection</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {commonAges.map((v) => {
            const isSelected = selectedBatch.includes(v);
            return (
              <button
                key={v}
                onClick={() => onToggleBatch(v)}
                disabled={disabled}
                className={`relative text-xs py-2 px-1 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                  isSelected 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                    : 'bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-700/60'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5 shadow-lg">
                    <Check className="w-2 h-2 text-white" strokeWidth={4} />
                  </div>
                )}
                <span className="font-bold">{v > 0 ? `+${v}` : v}</span>
                <span className="text-[10px] opacity-60">{v > 0 ? 'Future' : 'Past'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
