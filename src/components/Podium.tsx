import React from 'react';
import { Crown, ExternalLink, Zap, Gift, Shield, Sparkles, LayoutGrid, Table, Trophy, MousePointerClick } from 'lucide-react';
import { BettingHouse } from '../types';
import { recordClickInFirestore, getHouseClicks } from '../lib/firebase';
import { HouseTableRow } from './HouseTableRow';
import confetti from 'canvas-confetti';

interface PodiumProps {
  houses: BettingHouse[];
  onOpenHouseDetail: (house: BettingHouse) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  viewMode?: 'grid' | 'table';
  setViewMode?: (mode: 'grid' | 'table') => void;
  houseClicks?: Record<string, number>;
}

export const Podium: React.FC<PodiumProps> = ({
  houses,
  onOpenHouseDetail,
  copiedCode,
  onCopyCode,
  viewMode = 'grid',
  setViewMode,
  houseClicks
}) => {
  // Sort podium items by featuredInPodium position (1, 2, 3, 4...)
  const podiumHouses = [...houses].sort((a, b) => (a.featuredInPodium || 99) - (b.featuredInPodium || 99));

  if (podiumHouses.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <Crown className="w-12 h-12 mx-auto text-amber-500/60" />
        <h3 className="text-lg font-bold text-white">Nenhuma casa encontrada no pódio</h3>
        <p className="text-xs text-slate-400">
          Não encontramos nenhuma plataforma de aposta para a busca informada.
        </p>
      </div>
    );
  }

  const handleClaimBonus = (e: React.MouseEvent, house: BettingHouse) => {
    e.stopPropagation();
    
    // Record click event in analytics
    recordClickInFirestore(house.id);

    // Trigger festive confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899']
      });
    } catch (err) {
      // fallback silently
    }

    // Redirect via affiliate URL
    window.open(house.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          <Crown className="w-3.5 h-3.5" />
          <span>VITRINE OFICIAL</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          LANÇAMENTOS <span className="gold-gradient-text">DA SEMANA</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
        </p>
      </div>

      {/* View Switcher Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs text-slate-300 font-bold">
            Exibindo <span className="text-amber-400 font-black">{podiumHouses.length}</span> plataformas recomendadas
          </span>
        </div>

        {setViewMode && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Tabela Compacta"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
          </div>
        )}
      </div>

      {/* View Mode Rendering: Table vs Grid */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider bg-slate-950/80">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 min-w-[200px]">Plataforma</th>
                <th className="p-4 min-w-[140px]">Dep. / Saque</th>
                <th className="p-4 min-w-[140px]">Saque PIX</th>
                <th className="p-4 text-right min-w-[150px]">Ação</th>
              </tr>
            </thead>
            <tbody>
              {podiumHouses.map((house, idx) => (
                <HouseTableRow
                  key={house.id}
                  house={house}
                  index={idx}
                  onOpenHouseDetail={onOpenHouseDetail}
                  copiedCode={copiedCode}
                  onCopyCode={onCopyCode}
                  houseClicks={houseClicks}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {podiumHouses.map((house, idx) => {
            const clicks = getHouseClicks(houseClicks, house.id);
            const rank = house.featuredInPodium || 1;
            const defaultBadges: Record<number, { text: string; style: 'gold' | 'emerald' | 'purple' | 'blue' }> = {
              1: { text: '🥇 nº 1 RECOMENDADA', style: 'gold' },
              2: { text: '🔥 MAIS POPULAR', style: 'emerald' },
              3: { text: '🎰 MELHOR CASSINO & VIP', style: 'purple' },
              4: { text: '🛡️ APOSTA SEM RISCO', style: 'blue' },
            };
            const fallback = defaultBadges[rank] || { text: 'LANÇAMENTO', style: 'purple' };

            const badgeText = house.podiumBadgeText || house.featuredTag || fallback.text;
            const badgeStyle = house.podiumBadgeStyle || fallback.style;

            const badgeStyleClass = badgeStyle === 'gold'
              ? 'bg-[#222026] text-amber-400 border border-amber-500/60 shadow-sm'
              : badgeStyle === 'emerald'
              ? 'bg-[#1c2622] text-emerald-400 border border-emerald-500/60 shadow-sm'
              : badgeStyle === 'blue'
              ? 'bg-[#1a232c] text-cyan-400 border border-cyan-400/60 shadow-sm'
              : 'bg-[#221e2a] text-purple-300 border border-purple-500/60 shadow-sm';

            return (
              <div
                key={house.id}
                style={{ animationDelay: `${idx * 70}ms`, animationFillMode: 'both' }}
                onClick={(e) => handleClaimBonus(e, house)}
                className="relative rounded-3xl p-5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.015] cursor-pointer flex flex-col justify-between border bg-slate-900/90 border-slate-700/80 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/10 animate-in fade-in zoom-in-95"
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md overflow-hidden shrink-0 bg-slate-800 border border-slate-700/50"
                        style={{ backgroundColor: house.brandColor }}
                      >
                        {house.logoUrl ? (
                          <img src={house.logoUrl} alt={house.name} className="w-full h-full object-cover" />
                        ) : (
                          house.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {house.name}
                          {house.isVerified && (
                            <Shield className="w-4 h-4 text-emerald-400 inline" title="100% Verificada" />
                          )}
                        </h3>
                      </div>
                    </div>

                    {/* Acessos Badge */}
                    <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-300 shrink-0 shadow-sm" title="Total de acessos a esta plataforma">
                      <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{clicks.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Highlight Tag (Badge de Destaque / Pódio) + Tags */}
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    {badgeText && (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full tracking-wide ${badgeStyleClass}`}>
                        <span>{badgeText}</span>
                      </span>
                    )}
                    {house.isNew && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Lançamento
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-xs font-black tracking-wider text-red-500 bg-[#1f0b10] border border-red-600/80 shadow-sm">
                      +18
                    </span>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                      <span className="text-slate-400 block text-[10px] truncate">Dep. Mínimo</span>
                      <span className="font-bold text-white text-xs">R$ {house.minDeposit}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                      <span className="text-slate-400 block text-[10px] truncate">Saque Mín.</span>
                      <span className="font-bold text-emerald-400 text-xs">R$ {house.minWithdrawal ?? 10}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                      <span className="text-slate-400 block text-[10px] truncate">Rollover</span>
                      <span className="font-bold text-amber-300 text-[11px] truncate block" title={house.rollover || house.withdrawalTime}>{house.rollover || house.withdrawalTime || '1x'}</span>
                    </div>
                  </div>

                </div>

                {/* Action CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={(e) => handleClaimBonus(e, house)}
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20"
                  >
                    <Gift className="w-4 h-4" />
                    <span>ACESSAR</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
