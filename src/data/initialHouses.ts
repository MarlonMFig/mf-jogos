import { BettingHouse, FAQItem } from '../types';

export const INITIAL_HOUSES: BettingHouse[] = [
  {
    id: 'superbet',
    name: 'Superbet',
    brandColor: '#FF0036',
    accentBg: 'from-red-600/20 to-red-950/40',
    rating: 4.9,
    reviewCount: 1420,
    bonusTitle: '100% até R$ 500 no Primeiro Depósito',
    bonusDescription: 'Ganhe Bônus no Esporte + 50 Rodadas Grátis no Cassino',
    affiliateUrl: 'https://superbet.com/pt-br/',
    promoCode: 'MFSUPER',
    minDeposit: 1,
    minWithdrawal: 10,
    withdrawalTime: 'Imediato via PIX',
    featuredTag: '🥇 nº 1 RECOMENDADA',
    badgeType: 'gold',
    categories: ['all', 'trending', 'high_bonus', 'fast_pix', 'sports', 'casino', 'low_deposit'],
    pros: [
      'Depósito e Saque Mínimo de apenas R$ 10,00 via PIX',
      'SuperOdds diárias nas principais ligas e Brasileirão',
      'Plataforma super rápida e sem travamentos',
      'Suporte ao cliente em Português 24 horas por dia'
    ],
    cons: [
      'Não aceita pagamentos com criptomoedas'
    ],
    license: 'Licenciada e autorizada pelo Ministério da Fazenda (SPA/MF)',
    rollover: '1x o valor do bônus em apostas com odd mínima 1.60',
    featuredInPodium: 1,
    podiumBadgeText: '🥇 nº 1 RECOMENDADA',
    podiumBadgeStyle: 'gold',
    isVerified: true,
    stepGuide: [
      'Clique no botão "PEGAR BÔNUS" para ser redirecionado com nosso link exclusivo.',
      'Preencha seus dados de cadastro (CPF, e-mail e telefone).',
      'Insira o código promocional "MFSUPER" no campo de cupom.',
      'Faça seu primeiro depósito via PIX a partir de R$ 1,00.',
      'O bônus e as rodadas grátis serão creditados instantaneamente!'
    ]
  },
  {
    id: 'betano',
    name: 'Betano',
    brandColor: '#FF5000',
    accentBg: 'from-orange-600/20 to-orange-950/40',
    rating: 4.8,
    reviewCount: 2310,
    bonusTitle: 'Bônus de 100% até R$ 1.000 + R$ 20 em Aposta Grátis',
    bonusDescription: 'Use nosso link para garantir as Melhores Cotações do Mercado',
    affiliateUrl: 'https://www.betano.br/',
    promoCode: 'MFBET',
    minDeposit: 20,
    minWithdrawal: 20,
    withdrawalTime: 'Até 10 min via PIX',
    featuredTag: '🔥 MAIS POPULAR',
    badgeType: 'emerald',
    categories: ['all', 'trending', 'high_bonus', 'sports', 'casino'],
    pros: [
      'Patrocinadora dos maiores campeonatos do mundo',
      'Recurso Múltipla Protegida e Transmissão de jogos ao vivo',
      'SuperAposta com criador de apostas personalizado',
      'Excelente aplicativo Android nativo'
    ],
    cons: [
      'Depósito mínimo de R$ 20 (ligeiramente maior que outras)'
    ],
    license: 'Licenciada MGA e em adequação com regulamentação brasileira (SPA/MF)',
    rollover: '5x em cotações mínimas de 1.65',
    featuredInPodium: 2,
    podiumBadgeText: '🔥 MAIS POPULAR',
    podiumBadgeStyle: 'emerald',
    isVerified: true,
    stepGuide: [
      'Clique no botão verde "PEGAR BÔNUS" para abrir o site oficial.',
      'Cadastre-se usando seu CPF e dados válidos.',
      'Certifique-se de ativar a opção "Bônus de Boas-Vindas".',
      'Realize o primeiro depósito via PIX.',
      'Pronto! Bônus ativado na sua conta imediatamente.'
    ]
  },
  {
    id: 'stake',
    name: 'Stake',
    brandColor: '#1475E1',
    accentBg: 'from-blue-600/20 to-slate-950/40',
    rating: 4.8,
    reviewCount: 1890,
    bonusTitle: 'Rakeback Exclusivo + 200% no Depósito',
    bonusDescription: 'Clube VIP com bônus diários, semanais e sem limites de saque',
    affiliateUrl: 'https://stake.com/',
    promoCode: 'MFVIP',
    minDeposit: 10,
    minWithdrawal: 20,
    withdrawalTime: 'Instantâneo (Pix & Cripto)',
    featuredTag: '🎰 MELHOR CASSINO & VIP',
    badgeType: 'purple',
    categories: ['all', 'trending', 'casino', 'fast_pix', 'high_bonus'],
    pros: [
      'Maior variedade de slots exclusivos e originais Stake',
      'Sorteios semanais de centenas de milhares de reais',
      'Saques sem limite máximo por transação',
      'Suporte PIX instantâneo e Criptomoedas'
    ],
    cons: [
      'Exige validação de identidade para saques altos'
    ],
    license: 'Licença Curaçao e MGA #145353',
    rollover: 'Rakeback sem necessidade de rollover para liberação',
    featuredInPodium: 3,
    podiumBadgeText: '🎰 MELHOR CASSINO & VIP',
    podiumBadgeStyle: 'purple',
    isVerified: true,
    stepGuide: [
      'Acesse pelo nosso link oficial garantindo a entrada na promoção VIP.',
      'Crie sua conta em menos de 1 minuto.',
      'Acesse as configurações de conta e insira o código "MFVIP".',
      'Deposite via PIX ou Cripto a partir de R$ 10.',
      'Ative o Rakeback imediato e jogue com benefícios VIP!'
    ]
  },
  {
    id: 'kto',
    name: 'KTO',
    brandColor: '#E31B23',
    accentBg: 'from-red-600/20 to-neutral-900/40',
    rating: 4.7,
    reviewCount: 980,
    bonusTitle: 'Aposta Sem Risco até R$ 200',
    bonusDescription: 'Se você perder sua primeira aposta, receba 100% do valor de volta!',
    affiliateUrl: 'https://www.kto.com/pt/',
    promoCode: 'MFKTO',
    minDeposit: 10,
    minWithdrawal: 20,
    withdrawalTime: 'Imediato via PIX',
    featuredTag: '🛡️ APOSTA SEM RISCO',
    badgeType: 'gold',
    categories: ['all', 'sports', 'fast_pix', 'low_deposit'],
    pros: [
      'Primeira aposta 100% garantida (se errar, ganha uma aposta grátis)',
      'Aposta Ganha Ganha com pagamento antecipado (2 gols de vantagem)',
      'Processamento de PIX ultrarrápido',
      'Apostas em estatísticas individuais de jogadores'
    ],
    cons: [
      'Cassino com menos exclusividades que concorrentes'
    ],
    license: 'Licença Curaçao #8048/JAZ2018-000',
    rollover: '1x o valor recebido na Aposta Sem Risco em odd mínima de 1.70',
    featuredInPodium: 4,
    podiumBadgeText: '🛡️ APOSTA SEM RISCO',
    podiumBadgeStyle: 'blue',
    isVerified: true,
    isNew: true,
    stepGuide: [
      'Clique no link promocional MF Jogos.',
      'Conclua seu cadastro rápido no site da KTO.',
      'Deposite pelo menos R$ 10 via PIX.',
      'Faça sua primeira aposta esportiva de até R$ 200.',
      'Se acertar, fica com o lucro! Se perder, a KTO devolve 100% em freebet.'
    ]
  },
  {
    id: 'estrelabet',
    name: 'EstrelaBet',
    brandColor: '#FFB800',
    accentBg: 'from-amber-500/20 to-neutral-900/40',
    rating: 4.7,
    reviewCount: 1150,
    bonusTitle: '100% até R$ 500 para Esportes ou Cassino',
    bonusDescription: 'Depósito Mínimo a partir de R$ 1 com saque instantâneo',
    affiliateUrl: 'https://www.estrelabet.com/',
    promoCode: 'MFESTRELA',
    minDeposit: 1,
    minWithdrawal: 10,
    withdrawalTime: 'Imediato via PIX',
    featuredTag: '⚡ DEPÓSITO R$ 1',
    badgeType: 'emerald',
    categories: ['all', 'low_deposit', 'fast_pix', 'sports', 'casino'],
    pros: [
      'Aceita depósitos super baixos a partir de R$ 1,00',
      'Interface totalmente otimizada para celular',
      'Muitos jogos de crash (Aviator, Spaceman, Mina)',
      'Casa brasileira com forte suporte local'
    ],
    cons: [
      'Cotações para basquete e eSports na média do mercado'
    ],
    license: 'Licenciada e registrada em conformidade com SPA/MF',
    rollover: '5x o valor do bônus em bilhetes simples ou múltiplos',
    isVerified: true,
    stepGuide: [
      'Clique em "PEGAR BÔNUS" para navegar até a EstrelaBet.',
      'Faça o cadastro preenchendo os dados pessoais.',
      'Deposite qualquer valor a partir de R$ 1 via PIX.',
      'Receba o bônus de 100% de forma instantânea.'
    ]
  },
  {
    id: 'novibet',
    name: 'Novibet',
    brandColor: '#00A859',
    accentBg: 'from-emerald-600/20 to-neutral-900/40',
    rating: 4.6,
    reviewCount: 840,
    bonusTitle: '100% até R$ 500 + 30 Rodadas Grátis',
    bonusDescription: 'SuperCotas Diárias e Saque Pagamento Antecipado em Esportes',
    affiliateUrl: 'https://www.novibet.br/',
    promoCode: 'MFNOVI',
    minDeposit: 10,
    minWithdrawal: 20,
    withdrawalTime: 'Até 15 min via PIX',
    featuredTag: '🎁 RODADAS GRÁTIS',
    badgeType: 'blue',
    categories: ['all', 'sports', 'casino', 'high_bonus'],
    pros: [
      'Ganhos em dinheiro real com as rodadas grátis sem rollover extra',
      'Programa de fidelidade com prêmios em dinheiro todo mês',
      'Empate Anula Aposta e Pagamento Antecipado com 2 gols'
    ],
    cons: [
      'Layout inicial pode conter muitas informações para iniciantes'
    ],
    license: 'Licenciada por MGA e regulada no Brasil',
    rollover: '5x o valor do bônus em cotações acumuladas a partir de 1.50',
    isVerified: true,
    stepGuide: [
      'Use o link da nossa vitrine para acessar a promoção exclusiva Novibet.',
      'Cadastre-se na plataforma.',
      'Faça um depósito inicial a partir de R$ 10.',
      'Receba seu bônus de 100% e as 30 rodadas no jogo indicado.'
    ]
  },
  {
    id: 'parimatch',
    name: 'Parimatch',
    brandColor: '#FFD700',
    accentBg: 'from-yellow-500/20 to-neutral-900/40',
    rating: 4.6,
    reviewCount: 1020,
    bonusTitle: '100% até R$ 1.500 no Primeiro Depósito',
    bonusDescription: 'Um dos maiores bônus do mercado para apostadores esportivos',
    affiliateUrl: 'https://parimatch.com.br/',
    promoCode: 'MFPARI',
    minDeposit: 5,
    minWithdrawal: 10,
    withdrawalTime: 'Imediato via PIX',
    featuredTag: '💰 BÔNUS GIGANTE',
    badgeType: 'gold',
    categories: ['all', 'high_bonus', 'sports', 'casino'],
    pros: [
      'Bônus máximo altíssimo (até R$ 1.500)',
      'Depósito inicial bem acessível de R$ 5,00',
      'Excelente cobertura de eSports (CS:GO, LoL, Dota 2)',
      'Cashout total e parcial disponível nas apostas'
    ],
    cons: [
      'Rollover do bônus de R$ 1.500 exige mais atenção ao prazo'
    ],
    license: 'Licença internacional Curaçao #5536/JAZ',
    rollover: '10x o valor do bônus em apostas simples com odd mínima 1.90',
    isVerified: true,
    stepGuide: [
      'Acesse o site pelo link promocional Parimatch.',
      'Faça seu registro informando celular e e-mail.',
      'No momento do depósito, ative a opção de bônus de esportes.',
      'Realize o pagamento PIX a partir de R$ 5.',
      'Aproveite a banca dobrada até R$ 1.500!'
    ]
  }
];

export const FAQ_LIST: FAQItem[] = [
  {
    category: 'Pagamentos',
    question: 'Os saques e depósitos via PIX são realmente instantâneos?',
    answer: 'Sim! As casas de apostas recomendadas pela MF Jogos possuem sistema de PIX automatizado. Depósitos caem na hora e os saques são processados diretamente na sua chave PIX vinculada ao seu CPF.'
  },
  {
    category: 'Termos',
    question: 'O que é o "Rollover" do bônus?',
    answer: 'Rollover é a quantidade de vezes que você precisa apostar o valor do bônus recebido antes de poder sacar os lucros. Na nossa vitrine, detalhamos o rollover de cada casa para que você escolha a melhor opção.'
  }
];
