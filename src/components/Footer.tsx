import React from 'react';
import { Trophy, Shield, AlertTriangle, Lock, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Footer Banner */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                MF <span className="gold-gradient-text">JOGOS</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 font-black text-sm rounded-xl flex items-center gap-1.5">
              <span>+18</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jogo Responsável</span>
            </div>
          </div>
        </div>

        {/* Responsible Gaming Notice */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4 text-slate-400">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Aviso de Jogo Responsável e Isenção de Responsabilidade</span>
          </div>
          <p className="leading-relaxed">
            As apostas esportivas e jogos de cassino online envolvem risco financeiro. Nunca aposte valores destinados a compromissos essenciais. O jogo deve ser praticado exclusivamente como forma de entretenimento para maiores de 18 anos. Se você ou alguém que você conhece está enfrentando problemas com jogo, busque ajuda em instituições como <strong>jogadoresanonimos.com.br</strong>.
          </p>
          <div className="pt-2 border-t border-slate-800/60 space-y-1.5 font-medium text-amber-200/90 text-xs">
            <p className="flex items-center gap-2">
              <span>⚠️</span>
              <span><strong>Ministério da Fazenda adverte:</strong> Apostar pode causar dependência.</span>
            </p>
            <p className="flex items-center gap-2">
              <span>⚠️</span>
              <span><strong>Ministério da Fazenda adverte:</strong> Aposta não é investimento.</span>
            </p>
          </div>

          {/* Highlighted Contact Channels */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 space-y-3">
              <span className="text-amber-400 font-black uppercase text-xs tracking-wide flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" /> Canais de Atendimento e Suporte (Jogadores Anônimos):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/80 border border-amber-500/20 p-3 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Escritório Rio de Janeiro (JAERJ)</span>
                  <a href="tel:21997503174" className="text-amber-300 hover:text-amber-200 font-extrabold text-sm flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> (21) 99750-3174
                  </a>
                </div>
                <div className="bg-slate-950/80 border border-amber-500/20 p-3 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Atendimento Geral / Outros Estados</span>
                  <a href="tel:11995716942" className="text-amber-300 hover:text-amber-200 font-extrabold text-sm flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> (11) 99571-6942
                  </a>
                </div>
                <div className="bg-slate-950/80 border border-amber-500/20 p-3 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">E-mail de Contato</span>
                  <a href="mailto:jogadoresanonimos@yahoo.com.br" className="text-amber-300 hover:text-amber-200 font-extrabold text-sm flex items-center gap-1.5 break-all">
                    <Mail className="w-3.5 h-3.5 text-amber-400" /> jogadoresanonimos@yahoo.com.br
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer on Affiliate links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-[11px] text-slate-500">
          <p>
            MF Jogos é um portal de divulgação e comparativo independente. Alguns dos links nesta vitrine são links de afiliados, o que significa que podemos receber uma comissão caso você se cadastre através dos nossos links, sem nenhum custo adicional para você.
          </p>
          <div className="flex items-center gap-4 shrink-0 text-slate-400 font-medium">
            <span>© {new Date().getFullYear()} MF Jogos. Todos os direitos reservados.</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer text-slate-600 hover:text-slate-400"
                title="Acesso Restrito"
              >
                <Lock className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
