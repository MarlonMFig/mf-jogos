import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { FAQ_LIST } from '../data/initialHouses';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Tire Suas Dúvidas</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Perguntas Frequentes dos <span className="gold-gradient-text">Seguidores</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Tudo o que você precisa saber antes de se cadastrar e resgatar seus bônus
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_LIST.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-200 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                  <span>{item.question}</span>
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-150">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
