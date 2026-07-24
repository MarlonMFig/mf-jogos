import React, { useState } from 'react';
import { X, Calculator, DollarSign, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';

interface BonusCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusCalculator: React.FC<BonusCalculatorProps> = ({ isOpen, onClose }) => {
  const [deposit, setDeposit] = useState<number>(100);
  const [bonusPercentage, setBonusPercentage] = useState<number>(100);
  const [rollover, setRollover] = useState<number>(5);

  if (!isOpen) return null;

  const bonusAmount = (deposit * bonusPercentage) / 100;
  const totalBanca = deposit + bonusAmount;
  const requiredRolloverVolume = bonusAmount * rollover;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Calculadora de Bônus & Rollover</h2>
              <p className="text-xs text-slate-400">Simule quanto receberá de banca e meta de apostas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Body */}
        <div className="p-6 space-y-6">
          
          {/* Deposit Amount Slider/Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <label>Seu Primeiro Depósito (R$):</label>
              <span className="text-amber-400 text-base font-black">R$ {deposit},00</span>
            </div>
            <input
              type="range"
              min="10"
              max="2000"
              step="10"
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex gap-2 pt-1">
              {[20, 50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  onClick={() => setDeposit(val)}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    deposit === val
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  R$ {val}
                </button>
              ))}
            </div>
          </div>

          {/* Bonus % selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Porcentagem do Bônus:</label>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setBonusPercentage(pct)}
                  className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    bonusPercentage === pct
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pct}% de Bônus
                </button>
              ))}
            </div>
          </div>

          {/* Rollover Requirement Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Requisito de Rollover (Multiplicador):</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setRollover(r)}
                  className={`py-2 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    rollover === r
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r}x {r === 1 ? '(Livre)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Result Highlight Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Bônus Recebido
                </span>
                <span className="text-lg font-black text-amber-400">+ R$ {bonusAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Banca Total para Jogar
                </span>
                <span className="text-lg font-black text-emerald-400">R$ {totalBanca.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  Volume de Apostas Exigido (Rollover):
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  R$ {requiredRolloverVolume.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Isso significa que você precisará movimentar R$ {requiredRolloverVolume.toFixed(2)} em apostas qualificadas para liberar o saque do saldo do bônus.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-colors cursor-pointer"
          >
            ENTENDI, VER CASAS COM ESSE BÔNUS
          </button>
        </div>

      </div>
    </div>
  );
};
