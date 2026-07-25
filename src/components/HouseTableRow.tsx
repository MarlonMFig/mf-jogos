import React from 'react';
import { ExternalLink, Shield, Check, Copy, Gift, Sparkles, MousePointerClick } from 'lucide-react';
import { BettingHouse } from '../types';
import { recordClickInFirestore, recordCopyInFirestore, getHouseClicks } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface HouseTableRowProps {
  house: BettingHouse;
  index: number;
  onOpenHouseDetail: (house: BettingHouse) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  houseClicks?: Record<string, number>;
}

export const HouseTableRow: React.FC<HouseTableRowProps> = ({
  house,
  index,
  onOpenHouseDetail,
  copiedCode,
  onCopyCode,
  houseClicks
}) => {
  const clicks = getHouseClicks(houseClicks, house.id);

  const handleClaimBonus = (e: React.MouseEvent) => {
    e.stopPropagation();

    recordClickInFirestore(house.id);

    try {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981']
      });
    } catch (err) {
      // ignore
    }

    window.open(house.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <tr 
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
      onClick={() => onOpenHouseDetail(house)}
      className="bg-slate-900/60 hover:bg-slate-900 transition-colors border-b border-slate-800/80 cursor-pointer text-sm animate-in fade-in"
    >
      {/* Position # */}
      <td className="p-4 font-black text-slate-500 text-center w-12">
        #{index + 1}
      </td>

      {/* House Name & Rating */}
      <td className="p-4 min-w-[200px]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md shrink-0 overflow-hidden bg-slate-800 border border-slate-700/50"
            style={{ backgroundColor: house.brandColor }}
          >
            {house.logoUrl ? (
              <img src={house.logoUrl} alt={house.name} className="w-full h-full object-cover" />
            ) : (
              house.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
              {house.name}
              {house.isVerified && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
              {house.isNew && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Lançamento
                </span>
              )}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider text-red-500 bg-[#1f0b10] border border-red-600/80 shadow-sm">
                +18
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold text-slate-300 bg-slate-950 border border-slate-800 shadow-sm" title="Total de acessos a esta plataforma">
                <MousePointerClick className="w-3 h-3 text-emerald-400" />
                {clicks.toLocaleString('pt-BR')} {clicks === 1 ? 'acesso' : 'acessos'}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Min Deposit & Saque Mín */}
      <td className="p-4 min-w-[140px]">
        <div className="text-xs">
          <span className="text-slate-400 block text-[10px]">Dep. / Saque Mín.</span>
          <span className="font-bold text-white">R$ {house.minDeposit} / <span className="text-emerald-400">R$ {house.minWithdrawal ?? 10}</span></span>
        </div>
      </td>

      <td className="p-4 min-w-[140px]">
        <div className="text-xs">
          <span className="text-slate-400 block text-[10px]">Saque via PIX</span>
          <span className="font-bold text-emerald-400">{house.withdrawalTime}</span>
        </div>
      </td>

      {/* Action Button */}
      <td className="p-4 text-right min-w-[150px]">
        <button
          onClick={handleClaimBonus}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl font-extrabold text-xs inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <span>ACESSAR</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
};
