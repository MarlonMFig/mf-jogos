import React from 'react';
import { Flame, ShieldCheck, Zap, Sparkles, Gift, CheckCircle2, ExternalLink } from 'lucide-react';

interface HeroProps {
  onScrollToHouses: () => void;
  onOpenCalculator: () => void;
  onOpenRoulette: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToHouses,
  onOpenCalculator,
  onOpenRoulette
}) => {
  return (
    <div className="relative overflow-hidden bg-slate-950 pt-8 pb-12 border-b border-slate-800/60">
      {/* Background Radial Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span></span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
            <br className="hidden sm:block" />
            <span className="gold-gradient-text">MF JOGOS</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Compare depósitos mínimos, rapidez no saque via PIX, cotações altas e cadastre-se com links diretos e seguros.
          </p>

          {/* Trust badges list */}
          <div className="flex flex-nowrap items-center justify-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-medium pt-2 max-w-full">
            <span className="inline-flex items-center px-2 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-wider text-red-500 bg-[#1f0b10] border border-red-600/80 shadow-sm shrink-0">
              +18
            </span>

            <a
              href="https://whatsapp.com/channel/0029VamTwKj8aKvHgAu7qW3F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 hover:border-emerald-500/80 text-emerald-300 hover:text-emerald-200 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-bold transition-all shadow-md cursor-pointer hover:scale-105 shrink-0 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-emerald-400 shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span><span className="hidden sm:inline">Canal </span>WhatsApp</span>
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70 shrink-0" />
            </a>

            <a
              href="https://instagram.com/mf_jogos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/40 hover:border-pink-500/80 text-pink-300 hover:text-pink-200 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-bold transition-all shadow-md cursor-pointer hover:scale-105 shrink-0 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-pink-400 shrink-0" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram<span className="hidden sm:inline"> Oficial</span></span>
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70 shrink-0" />
            </a>
          </div>

          {/* Quick Action CTAs */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={onOpenCalculator}
              className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Simular Bônus</span>
            </button>

            <button
              onClick={onOpenRoulette}
              className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Qual Escolher?</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
