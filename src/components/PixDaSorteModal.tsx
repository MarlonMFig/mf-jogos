import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trophy, CheckCircle2, AlertCircle, Gift, ArrowRight, Dices, Clock, ShieldCheck, ExternalLink, WifiOff, BellRing } from 'lucide-react';
import { PixDaSorteConfig, PixDaSorteWinner, claimPixDaSorteWinnerInFirestore, getVisitorIp, checkAndRecordIpAttempt, parseEventDateSafely, formatEventDatePtBR } from '../lib/firebase';
import { requestNotificationPermission } from '../lib/notifications';
import confetti from 'canvas-confetti';

interface PixDaSorteModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PixDaSorteConfig;
}

export const PixDaSorteModal: React.FC<PixDaSorteModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [resultStatus, setResultStatus] = useState<'idle' | 'win' | 'lose' | 'already_tried' | 'already_tried_ip' | 'out_of_prizes'>('idle');
  const [rngNumber, setRngNumber] = useState<number>(777);
  const [now, setNow] = useState<Date>(() => new Date());

  // Periodically update current time every 5 seconds to auto-expire at deadline
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);
  
  // Winner form
  const [winnerName, setWinnerName] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [isSavingWinner, setIsSavingWinner] = useState(false);
  const [claimedSuccess, setClaimedSuccess] = useState(false);

  // Check attempt key in local storage
  const storageKey = `mf_pix_sorte_attempt_${config.eventDate || 'v1'}`;

  useEffect(() => {
    if (isOpen) {
      setNow(new Date());
      setResultStatus('idle');
      setIsVerifying(false);
      setClaimedSuccess(false);

      const previousAttempt = localStorage.getItem(storageKey);
      if (previousAttempt) {
        const attempt = JSON.parse(previousAttempt);
        if (attempt.won) {
          setResultStatus('win');
        } else {
          setResultStatus('already_tried');
        }
      }
    }
  }, [isOpen, storageKey]);

  if (!isOpen) return null;

  // Check if current date/time has reached or surpassed the deadline set in admin
  const eventDateObj = parseEventDateSafely(config.eventDate);
  const isExpired = Boolean(eventDateObj && now >= eventDateObj);
  const isPromoActive = Boolean(config.active) && !isExpired;

  const remainingPrizes = Math.max(0, config.totalPrizes - config.claimedPrizes);
  const formattedEventDate = formatEventDatePtBR(config.eventDate);

  const handleVerifyLuck = async () => {
    if (!isPromoActive) return;

    if (remainingPrizes <= 0) {
      setResultStatus('out_of_prizes');
      return;
    }

    // 1. Check Device local storage limit (1 per device)
    const previousAttempt = localStorage.getItem(storageKey);
    if (previousAttempt) {
      const attempt = JSON.parse(previousAttempt);
      if (attempt.won) {
        setResultStatus('win');
      } else {
        setResultStatus('already_tried');
      }
      return;
    }

    setIsVerifying(true);
    setResultStatus('idle');

    // 2. Fetch visitor IP and check Firestore IP limit (Max 2 attempts per IP)
    const userIp = await getVisitorIp();
    const ipCheck = await checkAndRecordIpAttempt(config.eventDate, userIp);

    if (!ipCheck.allowed) {
      setIsVerifying(false);
      setResultStatus('already_tried_ip');
      return;
    }

    // RNG animation timer
    let ticks = 0;
    const interval = setInterval(() => {
      setRngNumber(Math.floor(100 + Math.random() * 899));
      ticks++;

      if (ticks >= 18) {
        clearInterval(interval);
        setIsVerifying(false);

        // Decide win or loss based on winOddsPercentage
        const roll = Math.random() * 100;
        const isWinner = roll <= (config.winOddsPercentage || 15) && remainingPrizes > 0;

        if (isWinner) {
          setResultStatus('win');

          localStorage.setItem(
            storageKey,
            JSON.stringify({ won: true, timestamp: new Date().toISOString() })
          );

          try {
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.6 }
            });
          } catch (e) {
            console.error(e);
          }
        } else {
          setResultStatus('lose');
          localStorage.setItem(
            storageKey,
            JSON.stringify({ won: false, timestamp: new Date().toISOString() })
          );
        }
      }
    }, 120);
  };

  const handleSaveWinnerInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerName.trim() || !pixKey.trim()) return;

    setIsSavingWinner(true);
    const newWinner: PixDaSorteWinner = {
      id: `w_${Date.now()}`,
      name: winnerName.trim(),
      pixKey: pixKey.trim(),
      prizeValue: config.pixValue,
      timestamp: new Date().toISOString(),
    };

    const success = await claimPixDaSorteWinnerInFirestore(newWinner, config);
    setIsSavingWinner(false);

    if (success) {
      setClaimedSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 text-slate-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
            <Sparkles className="w-32 h-32" />
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 font-black text-[10px] tracking-widest uppercase">
              PROMOÇÃO EXCLUSIVA
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
            <span>PIX DA SORTE</span>
            <Trophy className="w-7 h-7 text-yellow-300 animate-bounce shrink-0" />
          </h2>
          <p className="text-xs sm:text-sm font-bold text-emerald-950 opacity-90 mt-1">
            Sorteio instantâneo para visitantes MF JOGOS!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
            <Clock className={`w-4 h-4 ${isPromoActive ? 'text-emerald-400' : 'text-slate-500'} shrink-0`} />
            <span>
              Data / Horário do Evento:{' '}
              {isPromoActive ? (
                <strong className="text-white">{formattedEventDate}</strong>
              ) : (
                <span className="text-slate-500 font-bold font-mono">---</span>
              )}
            </span>
          </div>

          {/* RNG Verification Engine */}
          {!isPromoActive ? (
            <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>

              <div className="space-y-2">
                <h3 className="font-black text-amber-300 text-base">
                  {isExpired ? 'Promoção Encerrada' : 'Sem Promoção Ativa'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-sm mx-auto">
                  {isExpired
                    ? 'A promoção "Pix da Sorte" encerrou o seu prazo limite. Ative as notificações, siga o canal do WhatsApp e o Instagram para não ficar de fora dos próximos sorteios!'
                    : 'Não há promoção ativa nesse momento, ative as notificações, siga o canal do whatsapp e o instagram para não ficar de fora.'}
                </p>
              </div>

              {/* Action Buttons to subscribe or follow social media */}
              <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">
                <button
                  onClick={async () => {
                    const ok = await requestNotificationPermission();
                    if (ok) {
                      alert('🔔 Notificações ativadas com sucesso!');
                    } else {
                      alert('⚠️ Permissão para notificações negada ou indisponível.');
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <BellRing className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>Ativar Notificações no Celular</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://whatsapp.com/channel/0029VamTwKj8aKvHgAu7qW3F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <svg className="w-4 h-4 fill-emerald-400 shrink-0" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href="https://instagram.com/mf_jogos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/40 text-pink-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <svg className="w-4 h-4 fill-pink-400 shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          ) : resultStatus === 'out_of_prizes' ? (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-2">
              <Gift className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="font-extrabold text-white text-sm">Prêmios Esgotados!</h3>
              <p className="text-xs text-slate-400">
                Todos os PIX desta rodada já foram resgatados. Volte no próximo horário programado!
              </p>
            </div>
          ) : resultStatus === 'already_tried' ? (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-extrabold text-white text-sm">Tentativa registrada neste dispositivo!</h3>
              <p className="text-xs text-slate-400">
              </p>
            </div>
          ) : resultStatus === 'already_tried_ip' ? (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-3">
              <WifiOff className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="font-extrabold text-white text-sm">Limite por IP Atingido!</h3>
              <p className="text-xs text-slate-400">
                O limite máximo de 2 tentativas por endereço de IP foi atingido para este sorteio do Pix da Sorte.
              </p>
            </div>
          ) : resultStatus === 'lose' ? (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                ❌
              </div>
              <h3 className="font-black text-white text-base">Não foi dessa vez!</h3>
              <p className="text-xs text-slate-400">
                O RNG sorteou uma combinação sem prêmio. Mas não desanime, acompanhe nossas redes para o próximo horário do Pix da Sorte!
              </p>
            </div>
          ) : resultStatus === 'win' ? (
            <div className="bg-gradient-to-b from-emerald-950/80 to-slate-950 p-5 rounded-2xl border border-emerald-500/50 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-1">
                <span className="text-2xl">🎉</span>
                <h3 className="text-lg font-black text-emerald-400 uppercase">PARABÉNS! VOCÊ GANHOU!</h3>
                <p className="text-xs text-slate-300">
                  Você tirou a sorte grande e faturou um PIX de <strong className="text-emerald-300">R$ {config.pixValue},00</strong>!
                </p>
              </div>

              {/* Admin instructions */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <span className="font-extrabold text-amber-400 block">Como receber o seu PIX:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {config.adminInstructions || 'Preencha seu nome e chave PIX abaixo para receber o pagamento diretamente na sua conta.'}
                </p>
              </div>

              {/* Form to submit name & Pix key */}
              {!claimedSuccess ? (
                <form onSubmit={handleSaveWinnerInfo} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Seu Nome Completo:</label>
                    <input
                      type="text"
                      required
                      value={winnerName}
                      onChange={(e) => setWinnerName(e.target.value)}
                      placeholder="Ex: Marlon Figueiredo"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Sua Chave PIX (CPF / Celular / Email / Aleatória):</label>
                    <input
                      type="text"
                      required
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="Ex: 123.456.789-00 ou cel 11999999999"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingWinner}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavingWinner ? (
                      <span>Registrando ganhador...</span>
                    ) : (
                      <>
                        <span>Registrar Resgate do PIX</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-center text-xs text-emerald-300 font-bold space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                  <p>Dados de resgate salvos com sucesso!</p>
                  <p className="text-[11px] font-normal text-slate-400">Nossa equipe processará o seu PIX em instantes.</p>
                </div>
              )}
            </div>
          ) : (
            /* Idle State - Button to verify */
            <div className="text-center space-y-4 py-2">
              <div className="relative w-24 h-24 mx-auto bg-slate-950 rounded-3xl border border-emerald-500/30 flex items-center justify-center shadow-xl overflow-hidden">
                <Dices className={`w-12 h-12 text-emerald-400 ${isVerifying ? 'animate-spin' : 'animate-bounce'}`} />
                {isVerifying && (
                  <span className="absolute text-xl font-black font-mono text-amber-400 bg-slate-950/90 px-2 py-0.5 rounded-md border border-amber-500/40">
                    {rngNumber}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-black text-white text-base">Teste a sua Sorte Agora!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Clique no botão abaixo para rodar o verificador automático RNG do Pix da Sorte.
                </p>
              </div>

              <button
                onClick={handleVerifyLuck}
                disabled={isVerifying || remainingPrizes <= 0}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 cursor-pointer transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <span>Verificando no sistema...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>VERIFICAR PIX DA SORTE</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
