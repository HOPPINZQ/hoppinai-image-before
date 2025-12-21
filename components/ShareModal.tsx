
import React from 'react';
import { X, Twitter, Facebook, Link, Copy, Check, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  ageOffset: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, imageUrl, ageOffset }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.href;
  const shareText = `Check out my ${ageOffset > 0 ? `+${ageOffset}` : ageOffset} year time travel transformation on ChronosLens! 🕰️✨`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 space-y-6 animate-in zoom-in-95 duration-200 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Share Your Journey</h2>
          <p className="text-slate-400 text-sm">Tell the world about your time travel experience!</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={shareToTwitter}
            className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 hover:bg-blue-400/10 rounded-2xl transition-all border border-white/5 hover:border-blue-400/50 group"
          >
            <Twitter className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Twitter</span>
          </button>
          <button 
            onClick={shareToFacebook}
            className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 hover:bg-blue-600/10 rounded-2xl transition-all border border-white/5 hover:border-blue-600/50 group"
          >
            <Facebook className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Facebook</span>
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Share App Link</label>
          <div className="flex gap-2 p-2 bg-slate-900 rounded-xl border border-white/5 items-center">
            <div className="flex-1 truncate text-sm text-slate-400 px-2">{appUrl}</div>
            <button 
              onClick={copyToClipboard}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="text-xs font-bold">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="pt-2 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Social platforms usually require a public URL to show image previews.
          </p>
        </div>
      </div>
    </div>
  );
};
