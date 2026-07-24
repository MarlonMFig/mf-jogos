import React, { useState } from 'react';
import { X, Shield, ExternalLink, Copy, Check, CheckCircle2, AlertCircle, ArrowRight, Gift, FileText, Sparkles } from 'lucide-react';
import { BettingHouse } from '../types';
import confetti from 'canvas-confetti';

interface HouseDetailModalProps {
  house: BettingHouse | null;
  onClose: () => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export const HouseDetailModal: React.FC<HouseDetailModalProps> = ({
  house,
  onClose,
  copiedCode,
  onCopyCode
}) => {
  if (!house) return null;

  const handleClaimBonus = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6']
      });
    } catch (err) {
      // ignore
    }

    window.open(house.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header Modal */}
        <div className="relative bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0 overflow-hidden bg-slate-800 border border-slate-700/50"
              style={{ backgroundColor: house.brandColor }}
            >
              {house.logoUrl ? (
                <img src={house.logoUrl} alt={house.name} className="w-full h-full object-cover" />
              ) : (
                house.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-white">{house.name}</h2>
                {house.isVerified && (
                  <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    <Shield className="w-3.5 h-3.5" /> Verificada
                  </span>
                )}
                {house.isNew && (
                  <span className="inline-flex items-center gap-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Lançamento
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-xs font-black tracking-wider text-red-500 bg-[#1f0b10] border border-red-600/80 shadow-sm">
                  +18
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Bonus Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Gift className="w-4 h-4" /> Bônus de Cadastro Exclusivo
              </span>
              <span className="text-xs font-semibold text-slate-400">Oferta Ativa hoje</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {house.bonusTitle}
            </div>
            <p className="text-sm text-slate-300">
              {house.bonusDescription}
            </p>

            {house.promoCode && (
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 text-xs block">Cupom Promocional da Comunidade:</span>
                  <span className="font-mono font-bold text-amber-400 text-base">{house.promoCode}</span>
                </div>
                <button
                  onClick={() => house.promoCode && onCopyCode(house.promoCode)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedCode === house.promoCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Código Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Depósito Mínimo</span>
              <span className="text-base font-extrabold text-white">R$ {house.minDeposit}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Saque Mínimo</span>
              <span className="text-base font-extrabold text-emerald-400">R$ {house.minWithdrawal ?? 10}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Saque via PIX</span>
              <span className="text-base font-extrabold text-emerald-400">{house.withdrawalTime}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block mb-1">Regra de Rollover</span>
              <span className="text-xs font-bold text-amber-300 line-clamp-2">{house.rollover}</span>
            </div>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Pontos Fortes (Prós)
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {house.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Observações (Contras)
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {house.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step-by-Step Registration Guide */}
          {house.stepGuide && house.stepGuide.length > 0 && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Passo a Passo para Cadastrar e Garantir o Bônus
              </h3>
              <div className="space-y-3 pt-2">
                {house.stepGuide.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <p className="pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* License Info */}
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <span className="font-semibold text-slate-300 block">Licença e Segurança:</span>
              <span>{house.license}</span>
            </div>
          </div>

        </div>

        {/* Footer Modal CTA */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>Redirecionamento direto via link oficial de afiliado da MF Jogos.</span>
          </div>

          <button
            onClick={handleClaimBonus}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>IR PARA O SITE & CADASTRAR</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
