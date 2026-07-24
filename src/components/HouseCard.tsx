import React from 'react';
import { ExternalLink, Zap, Copy, Check, Shield, Gift, CheckCircle2, Sparkles } from 'lucide-react';
import { BettingHouse } from '../types';
import confetti from 'canvas-confetti';

interface HouseCardProps {
  house: BettingHouse;
  onOpenHouseDetail: (house: BettingHouse) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export const HouseCard: React.FC<HouseCardProps> = ({
  house,
  onOpenHouseDetail,
  copiedCode,
  onCopyCode
}) => {
  const handleClaimBonus = (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6']
      });
    } catch (err) {
      // ignore
    }

    window.open(house.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onOpenHouseDetail(house)}
      className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0 overflow-hidden group-hover:scale-105 transition-transform bg-slate-800 border border-slate-700/50"
              style={{ backgroundColor: house.brandColor }}
            >
              {house.logoUrl ? (
                <img src={house.logoUrl} alt={house.name} className="w-full h-full object-cover" />
              ) : (
                house.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5 group-hover:text-amber-400 transition-colors">
                {house.name}
                {house.isVerified && (
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" title="Verificada & Licenciada" />
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* Badges row: Golden/Podium Badge + Lançamento + +18 */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {(() => {
            const tagText = house.podiumBadgeText || house.featuredTag;
            if (!tagText) return null;

            const badgeStyleClass = house.podiumBadgeStyle === 'gold'
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black border border-amber-300/40 shadow-sm'
              : house.podiumBadgeStyle === 'emerald'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black border border-emerald-300/40 shadow-sm'
              : house.podiumBadgeStyle === 'blue'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black border border-cyan-400/30 shadow-sm'
              : house.podiumBadgeStyle === 'purple'
              ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-black border border-purple-400/30 shadow-sm'
              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold';

            return (
              <span className={`text-[11px] px-2.5 py-1 rounded-lg shrink-0 uppercase tracking-wide ${badgeStyleClass}`}>
                {tagText}
              </span>
            );
          })()}

          {house.isNew && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Lançamento
            </span>
          )}

          <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-xs font-black tracking-wider text-red-500 bg-[#1f0b10] border border-red-600/80 shadow-sm shrink-0">
            +18
          </span>
        </div>

        {/* Bonus Highlight Box */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mb-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Gift className="w-3 h-3 text-amber-400" />
            Bônus de Cadastro
          </div>
          <div className="text-base font-black text-amber-300 leading-snug">
            {house.bonusTitle}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {house.bonusDescription}
          </p>
        </div>

        {/* Quick Features Specs */}
        <div className="grid grid-cols-3 gap-1.5 text-xs mb-4">
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-2">
            <span className="text-slate-400 text-[10px] block truncate">Dep. Mínimo</span>
            <span className="font-bold text-white text-xs">R$ {house.minDeposit}</span>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-2">
            <span className="text-slate-400 text-[10px] block truncate">Saque Mín.</span>
            <span className="font-bold text-emerald-400 text-xs">R$ {house.minWithdrawal ?? 10}</span>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-2">
            <span className="text-slate-400 text-[10px] block truncate">Rollover</span>
            <span className="font-bold text-amber-300 text-[11px] truncate block" title={house.rollover || house.withdrawalTime}>{house.rollover || house.withdrawalTime || '1x'}</span>
          </div>
        </div>

        {/* Pros bullet list */}
        <div className="space-y-1.5 mb-5 text-xs text-slate-300">
          {house.pros.slice(0, 2).map((pro, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{pro}</span>
            </div>
          ))}
        </div>

        {/* Promo Code display */}
        {house.promoCode && (
          <div className="mb-4 flex items-center justify-between bg-slate-950 border border-dashed border-slate-800 rounded-xl p-2.5 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">CÓDIGO PROMO:</span>
              <span className="font-mono font-bold text-amber-400">{house.promoCode}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (house.promoCode) onCopyCode(house.promoCode);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {copiedCode === house.promoCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Buttons Footer */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <button
          onClick={handleClaimBonus}
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
        >
          <span>PEGAR BÔNUS</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenHouseDetail(house);
          }}
          className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition-colors cursor-pointer"
        >
          Análise Completa & Rollover →
        </button>
      </div>

    </div>
  );
};
