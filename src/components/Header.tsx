import React, { useState } from 'react';
import { Trophy, ShieldCheck, Lock, LogOut, X, Menu } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAdmin: () => void;
  totalHouses: number;
  isAdminAuthenticated: boolean;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenAdmin,
  totalHouses,
  isAdminAuthenticated,
  onLogoutAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="pulsing-dot animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white uppercase">
                  MF <span className="gold-gradient-text">JOGOS</span>
                </span>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-emerald-400">{totalHouses} Plataformas</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Verificadas</span>
            </div>

            {isAdminAuthenticated ? (
              <div className="flex items-center gap-2 animate-in fade-in">
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                  title="Painel do Administrador"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Painel Admin</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="p-2 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                  title="Sair do Modo Administrador"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-slate-500 hover:text-amber-400 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5"
                title="Acesso do Administrador"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400" />
                <span className="text-[11px] font-medium hidden sm:inline text-slate-500 hover:text-slate-300">Admin</span>
              </button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Expand */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Total de plataformas ativas:</span>
              <span className="font-bold text-amber-400">{totalHouses} Verificadas</span>
            </div>
            {isAdminAuthenticated && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs">
                <span className="text-amber-300 font-bold">Modo Administrador Ativo</span>
                <button
                  onClick={onLogoutAdmin}
                  className="text-red-400 hover:underline flex items-center gap-1 text-xs font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sair
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
