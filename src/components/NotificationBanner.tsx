import React, { useState, useEffect } from 'react';
import { BellRing, Smartphone, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { getNotificationPermissionStatus, requestNotificationPermission } from '../lib/notifications';

export const NotificationBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isActivating, setIsActivating] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or granted
    const dismissed = localStorage.getItem('mf_notif_banner_dismissed') === 'true';
    const status = getNotificationPermissionStatus();
    setPermissionStatus(status);

    if (!dismissed && status !== 'granted') {
      // Show banner after short delay
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    setIsActivating(true);
    const granted = await requestNotificationPermission();
    setIsActivating(false);

    if (granted) {
      setActivatedSuccess(true);
      setPermissionStatus('granted');
      setTimeout(() => {
        setIsVisible(false);
      }, 3500);
    } else {
      setIsVisible(false);
      localStorage.setItem('mf_notif_banner_dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('mf_notif_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/40 p-4 rounded-2xl shadow-2xl shadow-amber-500/10 flex items-start gap-3 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 text-slate-950 font-black">
          <Smartphone className="w-5 h-5 text-slate-950" />
        </div>

        <div className="flex-1 space-y-2 pr-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Notificações no Celular
            </span>
          </div>

          {activatedSuccess ? (
            <p className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Notificações ativadas com sucesso! Você receberá os alertas do Pix da Sorte e novos bônus.
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-200 leading-snug">
                Adicionou o ícone do MF JOGOS na Tela de Início? Ative as notificações para ser avisado primeiro sobre o <strong className="text-amber-400">Pix da Sorte</strong> e novos bônus!
              </p>

              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={handleEnable}
                  disabled={isActivating}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <BellRing className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
                  <span>{isActivating ? 'Ativando...' : 'Ativar Notificações'}</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold"
                >
                  Agora Não
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
