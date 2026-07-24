import React from 'react';
import { ExternalLink, Shield, Check, Copy, Gift, Sparkles } from 'lucide-react';
import { BettingHouse } from '../types';
import confetti from 'canvas-confetti';

interface HouseTableRowProps {
  house: BettingHouse;
  index: number;
  onOpenHouseDetail: (house: BettingHouse) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export const HouseTableRow: React.FC<HouseTableRowProps> = ({
  house,
  index,
  onOpenHouseDetail,
  copiedCode,
  onCopyCode
}) => {
  const handleClaimBonus = (e: React.MouseEvent) => {
    e.stopPropagation();

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
      onClick={() => onOpenHouseDetail(house)}
      className="bg-slate-900/60 hover:bg-slate-900 transition-colors border-b border-slate-800/80 cursor-pointer text-sm"
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
            </div>
          </div>
        </div>
      </td>

      {/* Bonus Details */}
      <td className="p-4 min-w-[240px]">
        <div className="font-extrabold text-amber-300 text-sm">
          {house.bonusTitle}
        </div>
        <div className="text-xs text-slate-400 line-clamp-1">
          {house.bonusDescription}
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

      {/* Promo Code */}
      <td className="p-4 min-w-[140px]">
        {house.promoCode ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (house.promoCode) onCopyCode(house.promoCode);
            }}
            className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 hover:border-amber-500/50 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <span className="font-mono font-bold text-amber-400">{house.promoCode}</span>
            {copiedCode === house.promoCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        ) : (
          <span className="text-xs text-slate-500">Automático</span>
        )}
      </td>

      {/* Action Button */}
      <td className="p-4 text-right min-w-[150px]">
        <button
          onClick={handleClaimBonus}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl font-extrabold text-xs inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <span>PEGAR BÔNUS</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
};
