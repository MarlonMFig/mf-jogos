import React, { useState } from 'react';
import { X, Sparkles, Trophy, ExternalLink, RefreshCw, Zap, Gift, Shield } from 'lucide-react';
import { BettingHouse } from '../types';
import confetti from 'canvas-confetti';

interface BonusRouletteProps {
  isOpen: boolean;
  onClose: () => void;
  houses: BettingHouse[];
  onOpenHouseDetail: (house: BettingHouse) => void;
}

export const BonusRoulette: React.FC<BonusRouletteProps> = ({
  isOpen,
  onClose,
  houses,
  onOpenHouseDetail
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<BettingHouse | null>(null);

  if (!isOpen) return null;

  const handlePickRandom = () => {
    if (houses.length === 0) return;
    setIsSpinning(true);
    setSelectedHouse(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * houses.length);
      setSelectedHouse(houses[randomIndex]);
      count++;

      if (count > 15) {
        clearInterval(interval);
        setIsSpinning(false);
        const finalPick = houses[Math.floor(Math.random() * houses.length)];
        setSelectedHouse(finalPick);

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (err) {
          // ignore
        }
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-center">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black text-white">Recomendador da Sorte MF</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-300">
            Não sabe qual casa escolher hoje? Clique no botão abaixo para rodar o recomendador e encontrar a oferta ideal!
          </p>

          <div className="min-h-[160px] flex items-center justify-center bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            {selectedHouse ? (
              <div className={`space-y-3 transition-all duration-150 ${isSpinning ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}>
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg overflow-hidden bg-slate-800 border border-slate-700/50"
                  style={{ backgroundColor: selectedHouse.brandColor }}
                >
                  {selectedHouse.logoUrl ? (
                    <img src={selectedHouse.logoUrl} alt={selectedHouse.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedHouse.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selectedHouse.name}</h3>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 space-y-2">
                <Trophy className="w-10 h-10 mx-auto text-amber-500/40" />
                <p className="text-xs font-semibold">Clique no botão abaixo para sortear uma casa!</p>
              </div>
            )}
          </div>

          <button
            onClick={handlePickRandom}
            disabled={isSpinning}
            className="w-full py-4 bg-gradient-to-r from-purple-600 via-amber-500 to-emerald-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'SORTEANDO CASA...' : 'SORTEAR CASA DE APOSTA'}</span>
          </button>

          {selectedHouse && !isSpinning && (
            <div className="pt-2">
              <a
                href={selectedHouse.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>CADASTRAR</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
