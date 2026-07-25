import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { X, Settings, Plus, Trash2, Save, RotateCcw, Link as LinkIcon, Check, Shield, Upload, Image as ImageIcon, DollarSign, Trophy, Sparkles, KeyRound, LogOut, Lock, Gift, BarChart3, MousePointerClick, Users, Copy, TrendingUp, Dices, Clock, Bell, Smartphone, Send, BellRing } from 'lucide-react';
import { BettingHouse } from '../types';
import { SiteAnalytics, PixDaSorteConfig, DEFAULT_PIX_DA_SORTE, formatToDatetimeLocal, parseEventDateSafely } from '../lib/firebase';
import { 
  getNotificationSubscribersCount, 
  broadcastPushNotification, 
  AutoNotificationSettings, 
  DEFAULT_AUTO_NOTIFICATIONS, 
  getAutoNotificationSettings, 
  saveAutoNotificationSettings,
  triggerAutoNewHouseNotification,
  triggerAutoPromoNotification,
  triggerAutoPixSorteNotification
} from '../lib/notifications';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  houses: BettingHouse[];
  onSaveHouses: (newHouses: BettingHouse[]) => Promise<void> | void;
  onResetDefaults: () => Promise<void> | void;
  onLogout?: () => void;
  adminPassword?: string;
  onChangePassword?: (newPassword: string) => void;
  analytics?: SiteAnalytics;
  onResetAnalytics?: () => Promise<boolean> | void;
  pixConfig?: PixDaSorteConfig;
  onSavePixConfig?: (config: PixDaSorteConfig) => Promise<boolean> | void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  houses,
  onSaveHouses,
  onResetDefaults,
  onLogout,
  adminPassword = 'admin123',
  onChangePassword,
  analytics,
  onResetAnalytics,
  pixConfig = DEFAULT_PIX_DA_SORTE,
  onSavePixConfig
}) => {
  const [tempHouses, setTempHouses] = useState<BettingHouse[]>(houses);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'pix_da_sorte' | 'notifications' | 'podium' | 'add' | 'password'>('stats');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // Notification Broadcast State
  const [notifTitle, setNotifTitle] = useState('🔥 NOVO PIX DA SORTE LIBERADO!');
  const [notifBody, setNotifBody] = useState('Corra para o site e garanta seu PIX de R$ 50,00 no MF JOGOS!');
  const [notifUrl, setNotifUrl] = useState('/');
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState<string | null>(null);

  // Auto Notification Config State
  const [autoSettings, setAutoSettings] = useState<AutoNotificationSettings>(DEFAULT_AUTO_NOTIFICATIONS);
  const [isSavingAutoNotif, setIsSavingAutoNotif] = useState(false);
  const [autoNotifSuccessMsg, setAutoNotifSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'notifications') {
      getNotificationSubscribersCount().then(setSubscribersCount);
      getAutoNotificationSettings().then(setAutoSettings);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isOpen) {
      getAutoNotificationSettings().then(setAutoSettings);
    }
  }, [isOpen]);

  // Pix da Sorte Form State
  const [pixActive, setPixActive] = useState<boolean>(pixConfig.active);
  const [pixEventDate, setPixEventDate] = useState<string>(pixConfig.eventDate);
  const [pixValue, setPixValue] = useState<number>(pixConfig.pixValue);
  const [pixTotalPrizes, setPixTotalPrizes] = useState<number>(pixConfig.totalPrizes);
  const [pixClaimedPrizes, setPixClaimedPrizes] = useState<number>(pixConfig.claimedPrizes);
  const [pixWinOdds, setPixWinOdds] = useState<number>(pixConfig.winOddsPercentage);
  const [pixInstructions, setPixInstructions] = useState<string>(pixConfig.adminInstructions);
  const [isSavingPix, setIsSavingPix] = useState(false);
  const [pixSaveSuccess, setPixSaveSuccess] = useState(false);

  // Password change state
  const [passCurrent, setPassCurrent] = useState('');
  const [passNew, setPassNew] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for adding new house
  const [newName, setNewName] = useState('');
  const [newAffiliateUrl, setNewAffiliateUrl] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newBonusTitle, setNewBonusTitle] = useState('');
  const [newBonusDesc, setNewBonusDesc] = useState('');
  const [newBrandColor, setNewBrandColor] = useState('#10B981');
  const [newMinDeposit, setNewMinDeposit] = useState(1);
  const [newMinWithdrawal, setNewMinWithdrawal] = useState(10);
  const [newRating, setNewRating] = useState(4.8);
  const [newIsNew, setNewIsNew] = useState(true);
  const [newPodiumBadgeText, setNewPodiumBadgeText] = useState('LANÇAMENTO');
  const [newPodiumBadgeStyle, setNewPodiumBadgeStyle] = useState<'purple' | 'gold' | 'emerald' | 'blue'>('purple');
  const [newRollover, setNewRollover] = useState('1x valor do bônus');

  // Sync tempHouses when modal opens or houses prop updates
  useEffect(() => {
    if (isOpen) {
      setTempHouses(houses);
    }
  }, [isOpen, houses]);

  // Sync pixConfig form fields only when modal is newly opened
  useEffect(() => {
    if (isOpen && pixConfig) {
      setPixActive(pixConfig.active);
      setPixEventDate(formatToDatetimeLocal(pixConfig.eventDate));
      setPixValue(pixConfig.pixValue);
      setPixTotalPrizes(pixConfig.totalPrizes);
      setPixClaimedPrizes(Math.max(pixConfig.claimedPrizes || 0, pixConfig.winners?.length || 0));
      setPixWinOdds(pixConfig.winOddsPercentage);
      setPixInstructions(pixConfig.adminInstructions);
    }
  }, [isOpen]);

  // Keep pixClaimedPrizes synced automatically with live pixConfig
  useEffect(() => {
    if (pixConfig) {
      setPixClaimedPrizes(Math.max(pixConfig.claimedPrizes || 0, pixConfig.winners?.length || 0));
    }
  }, [pixConfig]);

  // Chart data for Recharts (Last 7 Days)
  const chartData = React.useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isoKey = d.toISOString().slice(0, 10);
      const formattedLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      const visits = analytics?.dailyVisits?.[isoKey] ?? 0;
      data.push({
        date: formattedLabel,
        fullDate: isoKey,
        visitas: visits,
      });
    }
    return data;
  }, [analytics?.dailyVisits]);

  if (!isOpen) return null;

  // Helper to compress uploaded images to 128x128 max WebP/PNG (~8KB)
  const compressAndSetLogo = (houseId: string | null, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 128; // 128x128 max is ideal for logos & icons
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Use webp for high compression with alpha channel support (~8KB base64)
          let compressed = canvas.toDataURL('image/webp', 0.85);
          if (!compressed || !compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/png');
          }

          if (houseId) {
            setTempHouses(prev =>
              prev.map(h => (h.id === houseId ? { ...h, logoUrl: compressed } : h))
            );
          } else {
            setNewLogoUrl(compressed);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileUpload = (houseId: string, file: File) => {
    compressAndSetLogo(houseId, file);
  };

  const handleImageUrlChange = (houseId: string, url: string) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === houseId ? { ...h, logoUrl: url } : h))
    );
  };

  const handleMinDepositChange = (houseId: string, amount: number) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === houseId ? { ...h, minDeposit: amount } : h))
    );
  };

  const handleMinWithdrawalChange = (houseId: string, amount: number) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === houseId ? { ...h, minWithdrawal: amount } : h))
    );
  };

  const handleAffiliateUrlChange = (houseId: string, url: string) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === houseId ? { ...h, affiliateUrl: url } : h))
    );
  };

  const handleNameChange = (houseId: string, name: string) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === houseId ? { ...h, name } : h))
    );
  };

  const handleBonusTitleChange = (houseId: string, bonusTitle: string) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === houseId ? { ...h, bonusTitle } : h))
    );
  };

  const handleToggleIsNew = (id: string) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === id ? { ...h, isNew: !h.isNew } : h))
    );
  };

  const handlePodiumBadgeTextChange = (id: string, text: string) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === id ? { ...h, podiumBadgeText: text, featuredTag: text } : h))
    );
  };

  const handlePodiumBadgeStyleChange = (id: string, style: 'purple' | 'gold' | 'emerald' | 'blue') => {
    setTempHouses(prev =>
      prev.map(h => (h.id === id ? { ...h, podiumBadgeStyle: style } : h))
    );
  };

  const handleUpdatePromo = (id: string, code: string) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === id ? { ...h, promoCode: code } : h))
    );
  };

  const handleRolloverChange = (id: string, rollover: string) => {
    setTempHouses(prev =>
      prev.map(h => (h.id === id ? { ...h, rollover } : h))
    );
  };

  const handleSetPodium = (id: string, rank: number | undefined) => {
    setTempHouses(prev =>
      prev.map(h => {
        if (h.id === id) {
          return { ...h, featuredInPodium: rank };
        }
        if (rank && h.featuredInPodium === rank) {
          return { ...h, featuredInPodium: undefined };
        }
        return h;
      })
    );
  };

  const handleDeleteHouse = (id: string) => {
    setTempHouses(prev => prev.filter(h => h.id !== id));
    setConfirmDeleteId(null);
  };

  const handleAddNewHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAffiliateUrl.trim()) {
      setAddError('Por favor preencha o Nome da Casa e o Link de Afiliado!');
      return;
    }
    setAddError(null);

    const created: BettingHouse = {
      id: `house-${Date.now()}`,
      name: newName.trim(),
      logoUrl: newLogoUrl.trim() || undefined,
      brandColor: newBrandColor || '#10B981',
      accentBg: 'from-emerald-600/20 to-neutral-900/40',
      rating: newRating || 4.8,
      reviewCount: 1,
      bonusTitle: newBonusTitle.trim() || 'Bônus de Boas-Vindas Exclusivo',
      bonusDescription: newBonusDesc.trim() || 'Cadastre-se e aproveite ofertas especiais.',
      affiliateUrl: newAffiliateUrl.trim(),
      promoCode: newPromoCode.trim() || undefined,
      minDeposit: newMinDeposit || 1,
      minWithdrawal: newMinWithdrawal || 10,
      withdrawalTime: 'Imediato via PIX',
      categories: ['all', 'trending', 'fast_pix', 'sports', 'casino'],
      pros: ['Plataforma verificada', 'Depósito rápido via PIX', 'Suporte rápido'],
      cons: ['Consulte os termos da casa'],
      license: 'Licenciada e registrada',
      rollover: newRollover.trim() || 'Sem Rollover',
      isVerified: true,
      isNew: newIsNew,
      featuredTag: newPodiumBadgeText.trim() || 'LANÇAMENTO',
      podiumBadgeText: newPodiumBadgeText.trim() || 'LANÇAMENTO',
      podiumBadgeStyle: newPodiumBadgeStyle,
      stepGuide: [
        'Clique no nosso link exclusivo de cadastro.',
        'Preencha seus dados de conta.',
        'Insira o cupom promocional se houver.',
        'Faça seu primeiro depósito e aproveite!'
      ]
    };

    const updatedHouses = [created, ...tempHouses];
    setTempHouses(updatedHouses);

    // Save directly to database and localStorage
    setIsSaving(true);
    try {
      await onSaveHouses(updatedHouses);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Trigger auto push notification for new house if enabled
      triggerAutoNewHouseNotification(created.name, created.bonusTitle);
      if (created.promoCode || created.podiumBadgeText?.includes('PROMO')) {
        triggerAutoPromoNotification(created.name, created.bonusTitle);
      }
    } catch (err) {
      console.error('Erro ao salvar nova casa:', err);
      alert('Erro ao salvar no banco de dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }

    setActiveTab('podium');
    
    // Reset form
    setNewName('');
    setNewAffiliateUrl('');
    setNewLogoUrl('');
    setNewPromoCode('');
    setNewBonusTitle('');
    setNewBonusDesc('');
    setNewRollover('1x valor do bônus');
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await onSaveHouses(tempHouses);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Erro ao salvar no banco de dados:', err);
      setIsSaving(false);
      alert('Erro ao salvar no banco de dados. Tente novamente.');
    }
  };

  // Get current house assigned to podium rank (1, 2, 3, 4)
  const getPodiumHouse = (rank: number): BettingHouse => {
    const found = tempHouses.find(h => h.featuredInPodium === rank);
    if (found) return found;
    // Fallback to rank - 1 house if available
    return tempHouses[rank - 1] || tempHouses[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Painel do Administrador <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">MF JOGOS</span>
              </h2>
              <p className="text-xs text-slate-400">Gerencie a imagem, depósito mínimo, link de afiliado e posições do Pódio</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                title="Sair do Modo Administrador"
              >
                <LogOut className="w-3.5 h-3.5" /> Sair
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'stats'
                ? 'border-amber-500 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>📊 Estatísticas e Cliques</span>
          </button>

          <button
            onClick={() => setActiveTab('pix_da_sorte')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pix_da_sorte'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices className="w-4 h-4 text-emerald-400" />
            <span>🎁 Pix da Sorte</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'notifications'
                ? 'border-cyan-500 text-cyan-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4 text-cyan-400" />
            <span>📱 Notificações Celular</span>
          </button>

          <button
            onClick={() => setActiveTab('podium')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'podium'
                ? 'border-amber-500 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Atualizar Pódio ({tempHouses.length} Casas)</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1 shrink-0 ${
              activeTab === 'add'
                ? 'border-amber-500 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" /> Adicionar Nova Casa
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1 shrink-0 ${
              activeTab === 'password'
                ? 'border-amber-500 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Senha Admin
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 0: SITE ANALYTICS & STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" /> Estatísticas em Tempo Real do Site
                  </h3>
                  <p className="text-xs text-slate-400">Acompanhe acessos de visitantes e cliques nos seus links de afiliado.</p>
                </div>
                {onResetAnalytics && (
                  <button
                    onClick={async () => {
                      if (confirm('Deseja zerar todas as estatísticas de cliques e acessos do site?')) {
                        await onResetAnalytics();
                      }
                    }}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Zerar Estatísticas
                  </button>
                )}
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Acessos Totais</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {analytics?.totalVisits || 0}
                  </div>
                  <p className="text-[10px] text-slate-500">Pessoas que acessaram o site</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Cliques nos Links</span>
                    <MousePointerClick className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {analytics?.totalClicks || 0}
                  </div>
                  <p className="text-[10px] text-slate-500">Redirecionamentos para plataformas</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Cupons Copiados</span>
                    <Copy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {analytics?.totalCopies || 0}
                  </div>
                  <p className="text-[10px] text-slate-500">Códigos promocionais copiados</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Taxa de Cliques</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-purple-300 font-mono">
                    {analytics?.totalVisits && analytics.totalVisits > 0
                      ? ((analytics.totalClicks / analytics.totalVisits) * 100).toFixed(1) + '%'
                      : '0.0%'}
                  </div>
                  <p className="text-[10px] text-slate-500">Conversão de visita para clique</p>
                </div>
              </div>

              {/* Recharts Daily Visits Chart */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-cyan-400" /> Histórico de Visitas Diárias (Últimos 7 Dias)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Evolução do tráfego diário no site nos últimos 7 dias.
                    </p>
                  </div>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/20 font-mono font-bold">
                    Visitas / Dia
                  </span>
                </div>

                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#020617',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        formatter={(value: number) => [`${value} visitas`, 'Visitas']}
                      />
                      <Area
                        type="monotone"
                        dataKey="visitas"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#visitGradient)"
                        activeDot={{ r: 6, fill: '#38bdf8', stroke: '#020617', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Platform Performance Table */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" /> Desempenho de Cliques por Plataforma
                </h4>

                <div className="space-y-3">
                  {tempHouses.length === 0 ? (
                    <p className="text-slate-500 text-xs">Nenhuma casa cadastrada.</p>
                  ) : (
                    tempHouses.map((house) => {
                      const cleanId = house.id.replace(/[\.\/\[\]]/g, '_');
                      const clicks = analytics?.houseClicks?.[cleanId] || analytics?.houseClicks?.[house.id] || 0;
                      const copies = analytics?.houseCopies?.[cleanId] || analytics?.houseCopies?.[house.id] || 0;
                      const totalC = analytics?.totalClicks || 1;
                      const percentage = totalC > 0 ? Math.min(100, Math.round((clicks / totalC) * 100)) : 0;

                      return (
                        <div key={house.id} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md overflow-hidden bg-slate-950 shrink-0 border border-slate-700"
                              style={{ backgroundColor: house.brandColor }}
                            >
                              {house.logoUrl ? (
                                <img src={house.logoUrl} alt={house.name} className="w-full h-full object-cover" />
                              ) : (
                                house.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <span className="font-extrabold text-white text-sm block">{house.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono truncate block max-w-[180px]">
                                {house.affiliateUrl}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 w-full sm:max-w-xs space-y-1">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-emerald-400 font-bold">{clicks} cliques</span>
                              <span className="text-slate-400">{percentage}% do total</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/20 font-mono font-bold">
                              {copies} cupons copiados
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 0.5: PIX DA SORTE CAMPAIGN CONFIG */}
          {activeTab === 'pix_da_sorte' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Dices className="w-5 h-5 text-emerald-400" /> Configuração do Pix da Sorte
                    </h3>
                    <p className="text-xs text-slate-400">
                      Defina o dia, horário, valor do PIX e quantidade de ganhadores da promoção.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      if (!onSavePixConfig) return;
                      setIsSavingPix(true);
                      const updatedConfig: PixDaSorteConfig = {
                        active: pixActive,
                        eventDate: pixEventDate,
                        pixValue: Number(pixValue) || 50,
                        totalPrizes: Number(pixTotalPrizes) || 5,
                        claimedPrizes: Number(pixClaimedPrizes) || 0,
                        winOddsPercentage: Number(pixWinOdds) || 15,
                        adminInstructions: pixInstructions,
                        winners: pixConfig.winners || []
                      };
                      await onSavePixConfig(updatedConfig);
                      setIsSavingPix(false);
                      setPixSaveSuccess(true);
                      setTimeout(() => setPixSaveSuccess(false), 3000);

                      // If active, trigger auto notification for Pix da Sorte
                      if (pixActive) {
                        triggerAutoPixSorteNotification(updatedConfig.pixValue);
                      }
                    }}
                    disabled={isSavingPix}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingPix ? 'Salvando...' : 'Salvar Pix da Sorte'}</span>
                  </button>
                </div>

                {pixSaveSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Configurações do Pix da Sorte salvas com sucesso no banco de dados!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Active Toggle */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <label className="font-extrabold text-slate-200 block">Status da Promoção</label>
                    <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={pixActive}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setPixActive(val);
                          if (onSavePixConfig) {
                            onSavePixConfig({
                              active: val,
                              eventDate: pixEventDate,
                              pixValue: Number(pixValue) || 50,
                              totalPrizes: Number(pixTotalPrizes) || 5,
                              claimedPrizes: Number(pixClaimedPrizes) || 0,
                              winOddsPercentage: Number(pixWinOdds) || 15,
                              adminInstructions: pixInstructions,
                              winners: pixConfig.winners || []
                            });
                          }
                        }}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                      {(() => {
                        const parsed = parseEventDateSafely(pixEventDate);
                        const isExp = Boolean(parsed && new Date() >= parsed);
                        if (!pixActive) return <span className="font-bold text-slate-500">⏸️ Promoção Pausada</span>;
                        if (isExp) return <span className="font-bold text-amber-400">⏰ Expirada (Prazo Atingido)</span>;
                        return <span className="font-bold text-emerald-400">✅ Promoção Ativa no Site</span>;
                      })()}
                    </label>
                  </div>

                  {/* Day and Hour */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <label className="font-extrabold text-slate-200 block">Data e Horário do Sorteio</label>
                    <input
                      type="datetime-local"
                      value={pixEventDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPixEventDate(val);
                        if (onSavePixConfig) {
                          onSavePixConfig({
                            active: pixActive,
                            eventDate: val,
                            pixValue: Number(pixValue) || 50,
                            totalPrizes: Number(pixTotalPrizes) || 5,
                            claimedPrizes: Number(pixClaimedPrizes) || 0,
                            winOddsPercentage: Number(pixWinOdds) || 15,
                            adminInstructions: pixInstructions,
                            winners: pixConfig.winners || []
                          });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Valor do Pix */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <label className="font-extrabold text-slate-200 block">Valor de cada PIX (R$)</label>
                    <input
                      type="number"
                      min="1"
                      value={pixValue}
                      onChange={(e) => setPixValue(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Quantidade Total de Pix */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <label className="font-extrabold text-slate-200 block">Qtd. Total de PIX Disponíveis</label>
                    <input
                      type="number"
                      min="1"
                      value={pixTotalPrizes}
                      onChange={(e) => setPixTotalPrizes(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Quantidade Resgatada */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-200 block">Qtd. de PIX Já Resgatados</label>
                      <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 animate-pulse">
                        Auto-Sync
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={pixClaimedPrizes}
                        onChange={(e) => setPixClaimedPrizes(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-black rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPixClaimedPrizes(0)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                        title="Zerar contador de prêmios resgatados"
                      >
                        Zerar
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Sincronizado em tempo real com o número de ganhadores ({pixConfig.winners?.length || 0}).
                    </span>
                  </div>

                  {/* Chance de Ganhar */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <label className="font-extrabold text-slate-200 block">Chance de Ganhar (% RNG)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={pixWinOdds}
                      onChange={(e) => setPixWinOdds(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Instructions Textarea */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="font-extrabold text-slate-200 block text-xs">
                    Instruções para o Ganhador Resgatar
                  </label>
                  <textarea
                    rows={2}
                    value={pixInstructions}
                    onChange={(e) => setPixInstructions(e.target.value)}
                    placeholder="Instruções exibidas para quem ganhar o PIX..."
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Registered Winners List Table */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-emerald-400" /> Lista de Ganhadores Registrados ({pixConfig.winners?.length || 0})
                  </h4>

                  {pixConfig.winners?.length > 0 && onSavePixConfig && (
                    <button
                      onClick={async () => {
                        if (confirm('Deseja limpar o histórico de ganhadores do Pix da Sorte?')) {
                          await onSavePixConfig({
                            ...pixConfig,
                            winners: [],
                            claimedPrizes: 0
                          });
                          setPixClaimedPrizes(0);
                        }
                      }}
                      className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-lg text-[11px] cursor-pointer"
                    >
                      Limpar Lista de Ganhadores
                    </button>
                  )}
                </div>

                {!pixConfig.winners || pixConfig.winners.length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center border border-dashed border-slate-800 rounded-xl">
                    Nenhum ganhador registrado ainda nesta rodada do Pix da Sorte.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 bg-slate-900/60">
                          <th className="p-3">Nome do Ganhador</th>
                          <th className="p-3">Chave PIX</th>
                          <th className="p-3">Valor</th>
                          <th className="p-3">Data e Hora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {pixConfig.winners.map((winner) => (
                          <tr key={winner.id} className="hover:bg-slate-900/40">
                            <td className="p-3 font-sans font-bold text-white">{winner.name}</td>
                            <td className="p-3 text-emerald-400 font-bold">{winner.pixKey}</td>
                            <td className="p-3 text-amber-300">R$ {winner.prizeValue},00</td>
                            <td className="p-3 text-slate-400 text-[11px]">
                              {new Date(winner.timestamp).toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 0.8: PWA PUSH NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-cyan-400" /> Notificações PWA / Tela de Início
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dispare notificações instantâneas direto na tela do celular de quem adicionou o ícone do MF JOGOS.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl">
                    <Bell className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-black text-cyan-300">
                      {subscribersCount} {subscribersCount === 1 ? 'Dispositivo Cadastrado' : 'Dispositivos Cadastrados'}
                    </span>
                  </div>
                </div>

                {notifSuccessMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{notifSuccessMsg}</span>
                  </div>
                )}

                {/* Form Broadcast */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1 text-xs">
                    <label className="font-extrabold text-slate-200 block">Título da Notificação</label>
                    <input
                      type="text"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="Ex: 🔥 NOVO PIX DA SORTE LIBERADO!"
                      className="w-full bg-slate-900 border border-slate-700 text-white font-bold rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-extrabold text-slate-200 block">Mensagem da Notificação</label>
                    <textarea
                      rows={3}
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      placeholder="Ex: Entre agora no site e garanta seu PIX de R$ 50,00 ou confira as novas casas com bônus sem depósito!"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl p-3 text-xs outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-extrabold text-slate-200 block">URL de Destino ao Clicar na Notificação</label>
                    <input
                      type="text"
                      value={notifUrl}
                      onChange={(e) => setNotifUrl(e.target.value)}
                      placeholder="/"
                      className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-mono rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isSendingNotif}
                    onClick={async () => {
                      if (!notifTitle || !notifBody) {
                        alert('Preencha o título e a mensagem antes de disparar!');
                        return;
                      }
                      setIsSendingNotif(true);
                      const ok = await broadcastPushNotification(notifTitle, notifBody, notifUrl);
                      setIsSendingNotif(false);
                      if (ok) {
                        setNotifSuccessMsg('🚀 Notificação disparada com sucesso para os dispositivos inscritos!');
                        setTimeout(() => setNotifSuccessMsg(null), 4000);
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingNotif ? 'Enviando Notificação...' : 'Disparar Notificação para Dispositivos'}</span>
                  </button>
                </div>
              </div>

              {/* Explanatory Guide Box */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" /> Como funciona o envio para a Tela de Início dos Usuários?
                </h4>
                <ul className="space-y-2 text-slate-400 list-disc list-inside">
                  <li>
                    <strong className="text-slate-200">Android & iPhone/iOS (iOS 16.4+)</strong>: Quando o usuário instala o aplicativo adicionando à Tela de Início e clica em <span className="text-amber-400 font-bold">"🔔 Ativar Notificações"</span>, o dispositivo dele autoriza a recepção de alertas.
                  </li>
                  <li>
                    <strong className="text-slate-200">Identificação Automática</strong>: O código guarda a inscrição do aparelho no banco de dados Firestore sob a coleção <code className="text-cyan-400">notification_subscribers</code>.
                  </li>
                  <li>
                    <strong className="text-slate-200">Alerta Nativo</strong>: A mensagem aparece direto na barra de notificações do celular do usuário com vibração e o ícone do MF JOGOS.
                  </li>
                </ul>
              </div>

              {/* AUTOMATIC EVENT ALERTS CONFIGURATION */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400 animate-spin" /> Configurar Alertas Automáticos por Evento
                    </h3>
                    <p className="text-xs text-slate-400">
                      O sistema enviará alertas automáticos no celular dos usuários sempre que estes eventos acontecerem.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSavingAutoNotif}
                    onClick={async () => {
                      setIsSavingAutoNotif(true);
                      const ok = await saveAutoNotificationSettings(autoSettings);
                      setIsSavingAutoNotif(false);
                      if (ok) {
                        setAutoNotifSuccessMsg('✅ Configurações de Alertas Automáticos salvas no banco de dados!');
                        setTimeout(() => setAutoNotifSuccessMsg(null), 3500);
                      } else {
                        alert('Erro ao salvar alertas automáticos. Tente novamente.');
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingAutoNotif ? 'Salvando...' : 'Salvar Alertas Automáticos'}</span>
                  </button>
                </div>

                {autoNotifSuccessMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{autoNotifSuccessMsg}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* EVENT 1: NOVA CASA ADICIONADA */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-white text-xs flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-400" /> 1. Nova Casa de Apostas Adicionada
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSettings.autoNewHouseEnabled}
                          onChange={(e) => setAutoSettings({ ...autoSettings, autoNewHouseEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {autoSettings.autoNewHouseEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Título do Alerta</label>
                          <input
                            type="text"
                            value={autoSettings.autoNewHouseTitle}
                            onChange={(e) => setAutoSettings({ ...autoSettings, autoNewHouseTitle: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 text-white font-bold rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Modelo da Mensagem</label>
                          <input
                            type="text"
                            value={autoSettings.autoNewHouseBody}
                            onChange={(e) => setAutoSettings({ ...autoSettings, autoNewHouseBody: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-400"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 md:col-span-2">
                          Variáveis disponíveis: <code className="text-amber-400 font-mono">{'{houseName}'}</code> (Nome da Casa) e <code className="text-amber-400 font-mono">{'{bonusTitle}'}</code> (Título do Bônus).
                        </p>
                      </div>
                    )}
                  </div>

                  {/* EVENT 2: PROMOÇÃO OU BÔNUS POR TEMPO LIMITADO */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-white text-xs flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-400" /> 2. Promoção / Bônus Por Tempo Limitado
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSettings.autoPromoEnabled}
                          onChange={(e) => setAutoSettings({ ...autoSettings, autoPromoEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>

                    {autoSettings.autoPromoEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Título do Alerta</label>
                          <input
                            type="text"
                            value={autoSettings.autoPromoTitle}
                            onChange={(e) => setAutoSettings({ ...autoSettings, autoPromoTitle: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 text-white font-bold rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-purple-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Modelo da Mensagem</label>
                          <input
                            type="text"
                            value={autoSettings.autoPromoBody}
                            onChange={(e) => setAutoSettings({ ...autoSettings, autoPromoBody: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-purple-400"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 md:col-span-2">
                          Variáveis disponíveis: <code className="text-purple-400 font-mono">{'{houseName}'}</code> e <code className="text-purple-400 font-mono">{'{bonusTitle}'}</code>.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* EVENT 3: PIX DA SORTE ATIVADO */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-white text-xs flex items-center gap-2">
                        <Dices className="w-4 h-4 text-cyan-400" /> 3. Pix da Sorte Ativado / Liberado
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSettings.autoPixSorteEnabled}
                          onChange={(e) => setAutoSettings({ ...autoSettings, autoPixSorteEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>

                    {autoSettings.autoPixSorteEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Título do Alerta</label>
                          <input
                            type="text"
                            value={autoSettings.autoPixSorteTitle}
                            onChange={(e) => setAutoSettings({ ...autoSettings, autoPixSorteTitle: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 text-white font-bold rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Modelo da Mensagem</label>
                          <input
                            type="text"
                            value={autoSettings.autoPixSorteBody}
                            onChange={(e) => setAutoSettings({ ...autoSettings, autoPixSorteBody: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-cyan-400"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 md:col-span-2">
                          Variáveis disponíveis: <code className="text-cyan-400 font-mono">{'{pixValue}'}</code> (Valor em Reais, ex: 50).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'podium' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-xs text-amber-300 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="font-bold text-amber-400 block mb-1 text-sm">🎯 Edição do Pódio e Casas de Apostas</span>
                  <span>Gerencie a posição do Pódio, imagem/logo, depósito mínimo, link de afiliado ou remova qualquer casa.</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('add')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Casa
                  </button>
                  <button
                    onClick={onResetDefaults}
                    className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restaurar Padrão
                  </button>
                </div>
              </div>

              {tempHouses.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-4">
                  <p className="text-slate-400 text-sm">Nenhuma casa de aposta cadastrada no momento.</p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Adicionar Nova Casa
                    </button>
                    <button
                      onClick={onResetDefaults}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" /> Restaurar Padrão
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {tempHouses.map((house) => {
                    const currentBadgeText = house.podiumBadgeText !== undefined && house.podiumBadgeText !== '' ? house.podiumBadgeText : (house.featuredTag || '');
                    const currentBadgeStyle = house.podiumBadgeStyle || 'purple';

                    const rankBadges: Record<number, { title: string; color: string; border: string }> = {
                      1: { title: '🥇 1º LUGAR NO PÓDIO', color: 'bg-amber-500/20 text-amber-400', border: 'border-amber-500/40' },
                      2: { title: '🥈 2º LUGAR NO PÓDIO', color: 'bg-slate-400/20 text-slate-300', border: 'border-slate-500/40' },
                      3: { title: '🥉 3º LUGAR NO PÓDIO', color: 'bg-amber-700/20 text-amber-500', border: 'border-amber-700/40' },
                      4: { title: '🏅 4º LUGAR NO PÓDIO', color: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/40' }
                    };

                    const badgeInfo = house.featuredInPodium ? rankBadges[house.featuredInPodium] : null;

                    return (
                      <div
                        key={house.id}
                        className={`bg-slate-950 p-5 rounded-2xl border ${badgeInfo ? badgeInfo.border : 'border-slate-800'} space-y-4 shadow-lg relative`}
                      >
                        {/* Header Bar */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md overflow-hidden bg-slate-900 shrink-0 border border-slate-700"
                              style={{ backgroundColor: house.brandColor }}
                            >
                              {house.logoUrl ? (
                                <img src={house.logoUrl} alt={house.name} className="w-full h-full object-cover" />
                              ) : (
                                house.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-black text-white text-base flex items-center gap-2">
                                {house.name}
                                {badgeInfo && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase border border-white/10 ${badgeInfo.color}`}>
                                    {badgeInfo.title}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                Dep. Mín: R$ {house.minDeposit} | Saque Mín: R$ {house.minWithdrawal ?? 10}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Podium Rank Selector */}
                            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl">
                              <Trophy className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-slate-400 text-xs font-bold">Posição:</span>
                              <select
                                value={house.featuredInPodium || ''}
                                onChange={(e) => handleSetPodium(house.id, e.target.value ? Number(e.target.value) : undefined)}
                                className="bg-slate-950 border border-slate-700 text-amber-400 font-extrabold text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                              >
                                <option value="">⚪ Nenhuma</option>
                                <option value="1">🥇 1º Lugar</option>
                                <option value="2">🥈 2º Lugar</option>
                                <option value="3">🥉 3º Lugar</option>
                                <option value="4">🏅 4º Lugar</option>
                              </select>
                            </div>

                            {/* Delete Button */}
                            {confirmDeleteId === house.id ? (
                              <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 p-1 rounded-xl animate-in fade-in duration-150">
                                <span className="text-xs text-red-300 font-bold px-1.5">Remover?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHouse(house.id)}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-lg cursor-pointer"
                                >
                                  Sim
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(house.id)}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                                title="Remover casa permanentemente"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Excluir</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Name & Bonus Title */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1 text-xs">
                            <label className="text-slate-400 text-[10px] uppercase font-bold block">
                              Nome da Casa:
                            </label>
                            <input
                              type="text"
                              value={house.name}
                              onChange={(e) => handleNameChange(house.id, e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1 text-xs">
                            <label className="text-slate-400 text-[10px] uppercase font-bold block">
                              Título do Bônus:
                            </label>
                            <input
                              type="text"
                              value={house.bonusTitle}
                              onChange={(e) => handleBonusTitleChange(house.id, e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Tag / Badge de Destaque */}
                        <div className="space-y-3 bg-purple-950/30 border border-purple-500/30 p-3 rounded-xl">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2 space-y-1 text-xs">
                              <label className="text-purple-300 text-[10px] uppercase font-extrabold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Tag de Destaque (ex: 🥇 nº 1 RECOMENDADA, 🔥 MAIS POPULAR):
                              </label>
                              <input
                                type="text"
                                value={currentBadgeText}
                                onChange={(e) => handlePodiumBadgeTextChange(house.id, e.target.value)}
                                placeholder="Ex: 🥇 nº 1 RECOMENDADA, 🔥 MAIS POPULAR"
                                className="w-full bg-slate-900 border border-slate-700 text-purple-200 font-bold px-3 py-1.5 rounded-lg text-xs focus:border-purple-400 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1 text-xs">
                              <label className="text-purple-300 text-[10px] uppercase font-bold block">Cor da Tag:</label>
                              <select
                                value={currentBadgeStyle}
                                onChange={(e) => handlePodiumBadgeStyleChange(house.id, e.target.value as any)}
                                className="w-full bg-slate-900 border border-slate-700 text-white font-bold px-2 py-1.5 rounded-lg text-xs focus:outline-none cursor-pointer"
                              >
                                <option value="gold">🟡 Dourado</option>
                                <option value="emerald">🟢 Verde</option>
                                <option value="purple">🟣 Roxo</option>
                                <option value="blue">🔵 Azul</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-purple-500/20">
                            <label className="flex items-center gap-2 cursor-pointer text-purple-200 text-xs font-bold">
                              <input
                                type="checkbox"
                                checked={!!house.isNew}
                                onChange={() => handleToggleIsNew(house.id)}
                                className="w-4 h-4 rounded border-slate-700 text-purple-500 focus:ring-purple-500 bg-slate-900 cursor-pointer"
                              />
                              <span>Marcar como "Lançamento" (Selo de Destaque)</span>
                            </label>
                          </div>
                        </div>

                        {/* Imagem / Logo Upload & Preview */}
                        <div className="space-y-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                          <label className="text-slate-300 text-[11px] font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-amber-400">
                            <ImageIcon className="w-3.5 h-3.5" /> Logo da Casa (Upload do computador ou URL):
                          </label>

                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 overflow-hidden bg-slate-950 border border-slate-700"
                              style={{ backgroundColor: house.brandColor }}
                            >
                              {house.logoUrl ? (
                                <img src={house.logoUrl} alt={house.name} className="w-full h-full object-cover" />
                              ) : (
                                house.name.slice(0, 2).toUpperCase()
                              )}
                            </div>

                            <div className="flex-1 space-y-2">
                              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors border border-slate-700">
                                <Upload className="w-3.5 h-3.5 text-amber-400" />
                                <span>Escolher Imagem do Computador</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageFileUpload(house.id, file);
                                  }}
                                />
                              </label>

                              <input
                                type="url"
                                value={house.logoUrl || ''}
                                onChange={(e) => handleImageUrlChange(house.id, e.target.value)}
                                placeholder="Ou cole a URL da Imagem (http://...)"
                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Depósito Mínimo, Saque Mínimo, Rollover e Cupom */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                          <div className="space-y-1 text-xs">
                            <label className="text-slate-300 text-[11px] font-extrabold flex items-center gap-1 uppercase tracking-wider text-amber-400">
                              <DollarSign className="w-3.5 h-3.5" /> Dep. Mínimo:
                            </label>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-bold">R$</span>
                              <input
                                type="number"
                                min="0"
                                value={house.minDeposit}
                                onChange={(e) => handleMinDepositChange(house.id, Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono font-extrabold px-2.5 py-1.5 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <label className="text-slate-300 text-[11px] font-extrabold flex items-center gap-1 uppercase tracking-wider text-emerald-400">
                              <DollarSign className="w-3.5 h-3.5" /> Saque Mínimo:
                            </label>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-bold">R$</span>
                              <input
                                type="number"
                                min="0"
                                value={house.minWithdrawal ?? 10}
                                onChange={(e) => handleMinWithdrawalChange(house.id, Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-extrabold px-2.5 py-1.5 rounded-xl text-xs focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <label className="text-slate-300 text-[11px] font-extrabold flex items-center gap-1 uppercase tracking-wider text-amber-300">
                              <Gift className="w-3.5 h-3.5 text-amber-400" /> Rollover:
                            </label>
                            <input
                              type="text"
                              value={house.rollover || ''}
                              onChange={(e) => handleRolloverChange(house.id, e.target.value)}
                              placeholder="Ex: 1x, 5x, Sem Rollover"
                              className="w-full bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold px-2.5 py-1.5 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1 text-xs">
                            <label className="text-slate-300 text-[11px] font-extrabold flex items-center gap-1 uppercase tracking-wider text-amber-400">
                              Cupom Promo:
                            </label>
                            <input
                              type="text"
                              value={house.promoCode || ''}
                              onChange={(e) => handleUpdatePromo(house.id, e.target.value)}
                              placeholder="Código"
                              className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold px-2.5 py-1.5 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Link da Casa (URL de Afiliado) */}
                        <div className="space-y-1 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                          <label className="text-slate-300 text-[11px] font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-emerald-400">
                            <LinkIcon className="w-3.5 h-3.5" /> Link da Casa (URL de Afiliado):
                          </label>
                          <input
                            type="url"
                            value={house.affiliateUrl}
                            onChange={(e) => handleAffiliateUrlChange(house.id, e.target.value)}
                            placeholder="https://suacasa.com?aff=seu_codigo"
                            className="w-full bg-slate-950 border border-slate-800 text-emerald-300 font-mono font-bold px-3 py-2 rounded-xl text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW HOUSE */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddNewHouse} className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
                <h3 className="font-extrabold text-white text-sm">Adicionar Nova Casa de Apostas na Vitrine</h3>

                {addError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold animate-in fade-in">
                    ⚠️ {addError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Nome da Casa *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Bet365, Betano..."
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Cor de Destaque (HEX)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newBrandColor}
                        onChange={(e) => setNewBrandColor(e.target.value)}
                        className="w-10 h-9 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer p-1"
                      />
                      <input
                        type="text"
                        value={newBrandColor}
                        onChange={(e) => setNewBrandColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Logo / Imagem da Casa (URL ou Upload)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newLogoUrl}
                      onChange={(e) => setNewLogoUrl(e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                      className="flex-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                    <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors border border-slate-700 flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) compressAndSetLogo(null, file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Seu Link de Afiliado (URL Completa) *</label>
                  <input
                    type="url"
                    required
                    value={newAffiliateUrl}
                    onChange={(e) => setNewAffiliateUrl(e.target.value)}
                    placeholder="https://exemplo.com/cadastro?aff=mfjogos"
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Código Promocional</label>
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      placeholder="Ex: MFJOGOS"
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-amber-400 font-bold">Rollover (Regra)</label>
                    <input
                      type="text"
                      value={newRollover}
                      onChange={(e) => setNewRollover(e.target.value)}
                      placeholder="Ex: 1x valor do bônus"
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-amber-300 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Dep. Mínimo (R$)</label>
                    <input
                      type="number"
                      value={newMinDeposit}
                      onChange={(e) => setNewMinDeposit(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Saque Mínimo (R$)</label>
                    <input
                      type="number"
                      value={newMinWithdrawal}
                      onChange={(e) => setNewMinWithdrawal(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-emerald-400 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Título do Bônus</label>
                  <input
                    type="text"
                    value={newBonusTitle}
                    onChange={(e) => setNewBonusTitle(e.target.value)}
                    placeholder="Ex: 100% até R$ 500 no 1º Depósito"
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Descrição Curta</label>
                  <textarea
                    rows={2}
                    value={newBonusDesc}
                    onChange={(e) => setNewBonusDesc(e.target.value)}
                    placeholder="Ex: Receba bônus de esportes + 50 rodadas grátis no cassino"
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-purple-950/20 border border-purple-500/30 p-3 rounded-xl">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-purple-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Selo Superior / Badge (Ex: LANÇAMENTO, nº 1 RECOMENDADA)
                    </label>
                    <input
                      type="text"
                      value={newPodiumBadgeText}
                      onChange={(e) => setNewPodiumBadgeText(e.target.value)}
                      placeholder="Ex: LANÇAMENTO, nº 1 RECOMENDADA"
                      className="w-full bg-slate-900 border border-purple-500/40 px-3 py-2 rounded-xl text-purple-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-purple-300 font-bold">Cor do Selo</label>
                    <select
                      value={newPodiumBadgeStyle}
                      onChange={(e) => setNewPodiumBadgeStyle(e.target.value as any)}
                      className="w-full bg-slate-900 border border-purple-500/40 px-2 py-2 rounded-xl text-white font-bold cursor-pointer"
                    >
                      <option value="purple">🟣 Roxo</option>
                      <option value="gold">🟡 Dourado</option>
                      <option value="emerald">🟢 Verde</option>
                      <option value="blue">🔵 Azul</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                    <input
                      type="checkbox"
                      checked={newIsNew}
                      onChange={(e) => setNewIsNew(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-purple-500 focus:ring-purple-500 bg-slate-900"
                    />
                    <span>Marcar como "Lançamento" (Selo de Destaque)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> ADICIONAR À VITRINE
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div className="space-y-4 max-w-md mx-auto py-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-white text-sm">Alterar Senha de Acesso do Administrador</h3>
                </div>

                {passMsg && (
                  <div className={`p-3 rounded-xl border text-xs font-bold ${
                    passMsg.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}>
                    {passMsg.text}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (passCurrent !== adminPassword) {
                      setPassMsg({ type: 'error', text: 'Senha atual incorreta!' });
                      return;
                    }
                    if (passNew.length < 3) {
                      setPassMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 3 caracteres.' });
                      return;
                    }
                    if (passNew !== passConfirm) {
                      setPassMsg({ type: 'error', text: 'A confirmação de senha não confere!' });
                      return;
                    }

                    if (onChangePassword) {
                      onChangePassword(passNew);
                      setPassMsg({ type: 'success', text: 'Senha do Administrador atualizada com sucesso!' });
                      setPassCurrent('');
                      setPassNew('');
                      setPassConfirm('');
                    }
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Senha Atual *</label>
                    <input
                      type="password"
                      required
                      value={passCurrent}
                      onChange={(e) => setPassCurrent(e.target.value)}
                      placeholder="Senha atual"
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Nova Senha *</label>
                    <input
                      type="password"
                      required
                      value={passNew}
                      onChange={(e) => setPassNew(e.target.value)}
                      placeholder="Nova senha"
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Confirmar Nova Senha *</label>
                    <input
                      type="password"
                      required
                      value={passConfirm}
                      onChange={(e) => setPassConfirm(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <Save className="w-4 h-4" /> SALVAR NOVA SENHA
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-slate-400">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Alterações salvas no banco de dados com sucesso!
              </span>
            ) : isSaving ? (
              <span className="text-amber-400 font-bold flex items-center gap-1.5 animate-pulse">
                <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Salvando alterações para todos os usuários...
              </span>
            ) : (
              'As alterações são salvas no banco de dados e atualizadas para todos os visitantes.'
            )}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'SALVANDO...' : 'SALVAR E ATUALIZAR'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
