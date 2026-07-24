import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Podium } from './components/Podium';
import { HouseDetailModal } from './components/HouseDetailModal';
import { BonusCalculator } from './components/BonusCalculator';
import { BonusRoulette } from './components/BonusRoulette';
import { AdminModal } from './components/AdminModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';

import { INITIAL_HOUSES } from './data/initialHouses';
import { BettingHouse, Category } from './types';
import { subscribeHouses, saveHousesToFirestore, resetHousesInFirestore } from './lib/firebase';
import { Sparkles, Trophy, Settings, RefreshCw, ExternalLink } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'mf_jogos_houses_v3';

export default function App() {
  // State for betting houses list
  const [houses, setHouses] = useState<BettingHouse[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((h: BettingHouse) => {
            if (h.featuredInPodium === 1 && (!h.podiumBadgeText || h.podiumBadgeText === 'LANÇAMENTO')) {
              return { ...h, podiumBadgeText: '🥇 nº 1 RECOMENDADA', podiumBadgeStyle: 'gold', featuredTag: '🥇 nº 1 RECOMENDADA' };
            }
            if (h.featuredInPodium === 2 && (!h.podiumBadgeText || h.podiumBadgeText === 'LANÇAMENTO')) {
              return { ...h, podiumBadgeText: '🔥 MAIS POPULAR', podiumBadgeStyle: 'emerald', featuredTag: '🔥 MAIS POPULAR' };
            }
            if (h.featuredInPodium === 3 && (!h.podiumBadgeText || h.podiumBadgeText === 'LANÇAMENTO')) {
              return { ...h, podiumBadgeText: '🎰 MELHOR CASSINO & VIP', podiumBadgeStyle: 'purple', featuredTag: '🎰 MELHOR CASSINO & VIP' };
            }
            if (h.featuredInPodium === 4 && (!h.podiumBadgeText || h.podiumBadgeText === 'LANÇAMENTO')) {
              return { ...h, podiumBadgeText: '🛡️ APOSTA SEM RISCO', podiumBadgeStyle: 'blue', featuredTag: '🛡️ APOSTA SEM RISCO' };
            }
            return h;
          });
        }
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    return INITIAL_HOUSES;
  });

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mf_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('mf_admin_password') || 'admin123';
    } catch {
      return 'admin123';
    }
  });

  // Filters & Views
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedHouseForDetail, setSelectedHouseForDetail] = useState<BettingHouse | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Copy toast feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const housesSectionRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time Firestore database updates
  useEffect(() => {
    const unsubscribe = subscribeHouses((updatedHouses) => {
      setHouses(updatedHouses);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHouses));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAdminTrigger = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      localStorage.setItem('mf_admin_auth', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsLoginModalOpen(false);
    setIsAdminOpen(true);
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('mf_admin_auth');
    } catch (e) {
      console.error(e);
    }
    setIsAdminOpen(false);
  };

  const handleChangeAdminPassword = (newPassword: string) => {
    setAdminPassword(newPassword);
    try {
      localStorage.setItem('mf_admin_password', newPassword);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleScrollToHouses = () => {
    housesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveHouses = async (newHouses: BettingHouse[]) => {
    setHouses(newHouses);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHouses));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
    await saveHousesToFirestore(newHouses);
  };

  const handleResetDefaults = async () => {
    if (confirm('Deseja restaurar a lista padrão inicial de casas de apostas para todos os usuários?')) {
      setHouses(INITIAL_HOUSES);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      try {
        await resetHousesInFirestore();
      } catch (err) {
        console.error('Erro ao restaurar no Firestore:', err);
      }
    }
  };

  // Filter logic
  const filteredHouses = houses.filter((house) => {
    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesName = house.name.toLowerCase().includes(query);
      const matchesBonus = house.bonusTitle.toLowerCase().includes(query);
      const matchesCode = house.promoCode?.toLowerCase().includes(query) || false;
      if (!matchesName && !matchesBonus && !matchesCode) return false;
    }

    // Category filter
    if (activeCategory === 'all') return true;
    return house.categories.includes(activeCategory);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Main Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAdmin={handleOpenAdminTrigger}
        totalHouses={houses.length}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogoutAdmin={handleLogoutAdmin}
      />

      <main className="flex-1">
        
        {/* Hero Banner Section */}
        <Hero
          onScrollToHouses={handleScrollToHouses}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenRoulette={() => setIsRouletteOpen(true)}
        />

        {/* Exclusive Podium Section */}
        <div ref={housesSectionRef}>
          <Podium
            houses={filteredHouses}
            onOpenHouseDetail={setSelectedHouseForDetail}
            copiedCode={copiedCode}
            onCopyCode={handleCopyCode}
          />
        </div>

        {/* FAQ Section */}
        <FaqSection />

      </main>

      {/* Footer */}
      <Footer onOpenAdmin={handleOpenAdminTrigger} />

      {/* Floating Action Button - Quick Admin & Calculator */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="p-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-2xl shadow-2xl transition-transform hover:scale-110 cursor-pointer"
          title="Calculadora de Bônus"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {isAdminAuthenticated && (
          <button
            onClick={() => setIsAdminOpen(true)}
            className="p-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border border-amber-400 rounded-2xl shadow-2xl transition-transform hover:scale-110 flex items-center gap-2 cursor-pointer animate-in fade-in"
            title="Painel de Gestão do Afiliado"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline text-xs">Painel de Links</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <HouseDetailModal
        house={selectedHouseForDetail}
        onClose={() => setSelectedHouseForDetail(null)}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
      />

      <BonusCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <BonusRoulette
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        houses={houses}
        onOpenHouseDetail={setSelectedHouseForDetail}
      />

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        currentPassword={adminPassword}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        houses={houses}
        onSaveHouses={handleSaveHouses}
        onResetDefaults={handleResetDefaults}
        onLogout={handleLogoutAdmin}
        adminPassword={adminPassword}
        onChangePassword={handleChangeAdminPassword}
      />

    </div>
  );
}
