import React, { useState, useEffect } from 'react';
import { X, Settings, Plus, Trash2, Save, RotateCcw, Link as LinkIcon, Check, Shield, Upload, Image as ImageIcon, DollarSign, Trophy, Sparkles, KeyRound, LogOut, Lock, Gift } from 'lucide-react';
import { BettingHouse } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  houses: BettingHouse[];
  onSaveHouses: (newHouses: BettingHouse[]) => Promise<void> | void;
  onResetDefaults: () => Promise<void> | void;
  onLogout?: () => void;
  adminPassword?: string;
  onChangePassword?: (newPassword: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  houses,
  onSaveHouses,
  onResetDefaults,
  onLogout,
  adminPassword = 'admin123',
  onChangePassword
}) => {
  const [tempHouses, setTempHouses] = useState<BettingHouse[]>(houses);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'podium' | 'add' | 'password'>('podium');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

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

  // Sync tempHouses when houses updates or when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempHouses(houses);
    }
  }, [isOpen]);

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
          
          {/* TAB 1: PODIUM UPDATE */}
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
