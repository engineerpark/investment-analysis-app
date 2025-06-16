import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search, Plus, Minus, ArrowLeft, RefreshCw, AlertCircle, Coins, TrendingUp, Info, PieChart, ArrowRight } from 'lucide-react';
import { InvestorProfile } from '../App';
import { fetchMultipleAssetPrices, searchAssets, initializeAPI } from '../utils/api_improved';

interface Asset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  type: 'stock' | 'crypto';
  geckoId?: string;
  uniqueId?: string; // 고유 식별자 추가
}

interface PortfolioStrategy {
  name: string;
  description: string;
  creator: string;
  assets: string[];
  allocation: Record<string, number>;
}

// 기본 자산 정보 (가격은 API에서 업데이트됨)
const baseAssets: Omit<Asset, 'price' | 'change' | 'changePercent' | 'uniqueId'>[] = [
  // 주식 - 기술주
  { ticker: 'AAPL', name: '애플', sector: 'Technology', type: 'stock' },
  { ticker: 'MSFT', name: '마이크로소프트', sector: 'Technology', type: 'stock' },
  { ticker: 'GOOGL', name: '구글', sector: 'Technology', type: 'stock' },
  { ticker: 'NVDA', name: '엔비디아', sector: 'Technology', type: 'stock' },
  { ticker: 'TSLA', name: '테슬라', sector: 'Technology', type: 'stock' },
  { ticker: 'META', name: '메타', sector: 'Technology', type: 'stock' },
  { ticker: 'NFLX', name: '넷플릭스', sector: 'Technology', type: 'stock' },
  
  // 주식 - 바이오/헬스케어
  { ticker: 'JNJ', name: '존슨앤존슨', sector: 'Healthcare', type: 'stock' },
  { ticker: 'PFE', name: '화이자', sector: 'Healthcare', type: 'stock' },
  { ticker: 'MRNA', name: '모더나', sector: 'Healthcare', type: 'stock' },
  
  // 주식 - 금융
  { ticker: 'JPM', name: 'JP모건', sector: 'Financial', type: 'stock' },
  { ticker: 'BAC', name: '뱅크오브아메리카', sector: 'Financial', type: 'stock' },
  { ticker: 'WFC', name: '웰스파고', sector: 'Financial', type: 'stock' },
  { ticker: 'V', name: '비자', sector: 'Financial', type: 'stock' },
  
  // 주식 - 유틸리티/에너지
  { ticker: 'NEE', name: 'NextEra Energy', sector: 'Utilities', type: 'stock' },
  { ticker: 'SO', name: 'Southern Company', sector: 'Utilities', type: 'stock' },
  
  // 주식 - 필수소비재
  { ticker: 'PG', name: '프록터앤갤블', sector: 'Consumer Staples', type: 'stock' },
  { ticker: 'KO', name: '코카콜라', sector: 'Consumer Staples', type: 'stock' },
  { ticker: 'WMT', name: '월마트', sector: 'Consumer Staples', type: 'stock' },

  // 주식 - 리츠
  { ticker: 'AMT', name: 'American Tower', sector: 'REIT', type: 'stock' },
  { ticker: 'PLD', name: 'Prologis', sector: 'REIT', type: 'stock' },

  // 주식 - 가치주/배당주
  { ticker: 'BRK.B', name: '버크셔 해서웨이', sector: 'Financial', type: 'stock' },
  { ticker: 'XOM', name: '엑손모빌', sector: 'Energy', type: 'stock' },

  // ETF - 국채
  { ticker: 'TLT', name: '20년+ 미국 국채 ETF', sector: 'Bonds', type: 'stock' },
  { ticker: 'IEF', name: '7-10년 미국 국채 ETF', sector: 'Bonds', type: 'stock' },
  { ticker: 'SHY', name: '1-3년 미국 국채 ETF', sector: 'Bonds', type: 'stock' },
  { ticker: 'AGG', name: '종합 채권 ETF', sector: 'Bonds', type: 'stock' },

  // ETF - 금/귀금속
  { ticker: 'GLD', name: 'SPDR 금 ETF', sector: 'Precious Metals', type: 'stock' },
  { ticker: 'IAU', name: 'iShares 금 ETF', sector: 'Precious Metals', type: 'stock' },
  { ticker: 'SLV', name: 'iShares 은 ETF', sector: 'Precious Metals', type: 'stock' },

  // ETF - 원자재
  { ticker: 'DBC', name: 'Invesco 원자재 ETF', sector: 'Commodities', type: 'stock' },
  { ticker: 'GSG', name: 'iShares 원자재 ETF', sector: 'Commodities', type: 'stock' },
  { ticker: 'USO', name: '미국 석유 ETF', sector: 'Commodities', type: 'stock' },

  // ETF - 부동산
  { ticker: 'VNQ', name: 'Vanguard 리츠 ETF', sector: 'Real Estate ETF', type: 'stock' },
  { ticker: 'IYR', name: 'iShares 부동산 ETF', sector: 'Real Estate ETF', type: 'stock' },

  // ETF - 광범위 시장
  { ticker: 'VTI', name: 'Vanguard 전체 주식시장 ETF', sector: 'Broad Market ETF', type: 'stock' },
  { ticker: 'QQQ', name: 'Invesco 나스닥100 ETF', sector: 'Technology ETF', type: 'stock' },
  { ticker: 'SPY', name: 'SPDR S&P500 ETF', sector: 'Broad Market ETF', type: 'stock' },

  // ETF - 신흥시장
  { ticker: 'EEM', name: '신흥시장 ETF', sector: 'Emerging Markets ETF', type: 'stock' },
  { ticker: 'VWO', name: 'Vanguard 신흥시장 ETF', sector: 'Emerging Markets ETF', type: 'stock' },

  // 코인
  { ticker: 'BTC', name: '비트코인', sector: 'Digital Currency', type: 'crypto' },
  { ticker: 'ETH', name: '이더리움', sector: 'Smart Contract', type: 'crypto' },
  { ticker: 'BNB', name: '바이낸스 코인', sector: 'Exchange Token', type: 'crypto' },
  { ticker: 'XRP', name: '리플', sector: 'Payment', type: 'crypto' },
  { ticker: 'ADA', name: '카르다노', sector: 'Smart Contract', type: 'crypto' },
  { ticker: 'DOGE', name: '도지코인', sector: 'Meme Coin', type: 'crypto' },
  { ticker: 'SOL', name: '솔라나', sector: 'Smart Contract', type: 'crypto' },
  { ticker: 'MATIC', name: '폴리곤', sector: 'Layer 2', type: 'crypto' },
  { ticker: 'DOT', name: '폴카닷', sector: 'Interoperability', type: 'crypto' },
  { ticker: 'AVAX', name: '아발란체', sector: 'Smart Contract', type: 'crypto' },
];

const portfolioStrategies: Record<string, PortfolioStrategy> = {
  'very-conservative': {
    name: "올웨더 포트폴리오",
    description: "모든 경제 상황에서 안정적인 수익을 추구하는 분산 투자 전략",
    creator: "레이 달리오",
    assets: ['TLT', 'IEF', 'AGG', 'GLD', 'VNQ', 'VTI'],
    allocation: {
      'TLT': 25, 'IEF': 20, 'AGG': 20, 'GLD': 15, 'VNQ': 10, 'VTI': 10
    }
  },
  conservative: {
    name: "가치투자 전략",
    description: "우량 기업의 저평가된 주식에 장기 투자하는 안정적 전략",
    creator: "워렌 버핏",
    assets: ['BRK.B', 'SPY', 'VTI', 'TLT', 'VNQ', 'GLD', 'BTC'],
    allocation: {
      'BRK.B': 25, 'SPY': 20, 'VTI': 15, 'TLT': 15, 'VNQ': 10, 'GLD': 10, 'BTC': 5
    }
  },
  moderate: {
    name: "밸류 포트폴리오",
    description: "내재가치 대비 저평가된 우량주 중심의 균형 투자 전략",
    creator: "벤저민 그레이엄",
    assets: ['SPY', 'QQQ', 'VTI', 'TLT', 'GLD', 'VNQ', 'BTC', 'ETH'],
    allocation: {
      'SPY': 20, 'QQQ': 15, 'VTI': 15, 'TLT': 15, 'GLD': 10, 'VNQ': 10,
      'BTC': 10, 'ETH': 5
    }
  },
  aggressive: {
    name: "성장주 투자 전략",
    description: "높은 성장 잠재력을 가진 기업에 집중 투자하는 공격적 전략",
    creator: "피터 린치",
    assets: ['QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'BTC', 'ETH', 'SOL'],
    allocation: {
      'QQQ': 20, 'AAPL': 12, 'MSFT': 12, 'NVDA': 10, 'TSLA': 8,
      'BTC': 20, 'ETH': 10, 'SOL': 8
    }
  },
  'very-aggressive': {
    name: "혁신 기술 전략",
    description: "파괴적 혁신 기술 분야에 집중 투자하는 초공격적 전략",
    creator: "캐시 우드",
    assets: ['QQQ', 'TSLA', 'NVDA', 'META', 'BTC', 'ETH', 'SOL', 'AVAX', 'DOGE'],
    allocation: {
      'QQQ': 15, 'TSLA': 10, 'NVDA': 10, 'META': 5,
      'BTC': 30, 'ETH': 15, 'SOL': 8, 'AVAX': 4, 'DOGE': 3
    }
  }
};

// 고유 ID 생성 함수
const generateUniqueId = (asset: Omit<Asset, 'uniqueId'>): string => {
  return `${asset.type}-${asset.ticker}-${asset.geckoId || 'stock'}-${asset.name.replace(/\s+/g, '-').toLowerCase()}`;
};

interface PortfolioRecommendationProps {
  investorProfile: InvestorProfile;
  onBack: () => void;
  onAnalyze: (assets: Asset[], allocations: Record<string, number>) => void;
}

export default function PortfolioRecommendation({ investorProfile, onBack, onAnalyze }: PortfolioRecommendationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'fallback'>('loading');

  // API에서 실제 가격 데이터 가져오기
  useEffect(() => {
    const loadPrices = async () => {
      setIsLoading(true);
      setLoadingError(null);
      setApiStatus('loading');
      
      try {
        // Initialize API system
        await initializeAPI();
        
        // 모든 자산을 하나의 배열로 구성
        const assetRequests = baseAssets.map(asset => ({
          identifier: asset.ticker,
          type: asset.type
        }));
        
        // 새로운 API로 모든 자산 가격 한번에 가져오기
        const priceData = await fetchMultipleAssetPrices(assetRequests);
        
        // 실제 API 데이터가 있는지 확인 (BTC 가격으로 체크)
        const btcData = priceData['BTC'];
        if (btcData && btcData.price > 50000) {
          setApiStatus('success');
        } else {
          setApiStatus('fallback');
        }
        
        // 자산 목록 생성
        const updatedAssets: Asset[] = baseAssets.map(baseAsset => {
          const apiData = priceData[baseAsset.ticker];
          
          const assetWithPrice = {
            ...baseAsset,
            price: apiData?.price || 100,
            changePercent: apiData?.changePercent || 0,
            change: (apiData?.price || 100) * ((apiData?.changePercent || 0) / 100)
          };
          
          return {
            ...assetWithPrice,
            uniqueId: generateUniqueId(assetWithPrice)
          };
        });
        
        setAssets(updatedAssets);
        setLastUpdate(new Date());
        
        // 전략에 따른 초기 포트폴리오 설정
        const strategy = portfolioStrategies[investorProfile.type];
        if (strategy) {
          const initialAssets = strategy.assets.map(ticker => {
            return updatedAssets.find(asset => asset.ticker === ticker);
          }).filter(Boolean) as Asset[];
          setSelectedAssets(initialAssets);
        }
        
      } catch (error) {
        console.error('Error loading prices:', error);
        setLoadingError('가격 정보를 불러오는데 실패했습니다.');
        setApiStatus('fallback');
        
        // Fallback: 기본 가격으로 자산 생성
        const fallbackAssets: Asset[] = baseAssets.map(baseAsset => {
          const fallbackPrices: Record<string, { price: number; changePercent: number }> = {
            'BTC': { price: 94250.67, changePercent: 2.10 },
            'ETH': { price: 3650.32, changePercent: -1.68 },
            'BNB': { price: 310.45, changePercent: 4.14 },
            'XRP': { price: 2.615, changePercent: 3.88 },
            'ADA': { price: 1.085, changePercent: -3.02 },
            'DOGE': { price: 0.392, changePercent: 3.37 },
            'SOL': { price: 198.74, changePercent: 4.46 },
            'MATIC': { price: 0.895, changePercent: -2.61 },
            'DOT': { price: 7.67, changePercent: 3.28 },
            'AVAX': { price: 42.42, changePercent: 5.41 },
            // Stock fallback prices
            'AAPL': { price: 192.53, changePercent: 1.24 },
            'MSFT': { price: 415.26, changePercent: -0.36 },
            'GOOGL': { price: 175.84, changePercent: 0.63 },
            'NVDA': { price: 875.28, changePercent: 2.02 },
            'TSLA': { price: 248.42, changePercent: -1.28 },
            'META': { price: 502.31, changePercent: -0.8 },
            'NFLX': { price: 486.71, changePercent: 2.1 },
            'JPM': { price: 165.82, changePercent: 0.81 },
            'SPY': { price: 478.92, changePercent: 0.76 },
            'QQQ': { price: 421.56, changePercent: 1.23 },
            'TLT': { price: 89.45, changePercent: -0.25 },
            'GLD': { price: 198.45, changePercent: 0.85 }
          };
          
          const fallbackPrice = fallbackPrices[baseAsset.ticker];
          const assetWithPrice = {
            ...baseAsset,
            price: fallbackPrice?.price || 100,
            changePercent: fallbackPrice?.changePercent || 0,
            change: (fallbackPrice?.price || 100) * ((fallbackPrice?.changePercent || 0) / 100)
          };
          
          return {
            ...assetWithPrice,
            uniqueId: generateUniqueId(assetWithPrice)
          };
        });
        
        setAssets(fallbackAssets);
        setLastUpdate(new Date());
        
        // 전략에 따른 초기 포트폴리오 설정
        const strategy = portfolioStrategies[investorProfile.type];
        if (strategy) {
          const initialAssets = strategy.assets.map(ticker => {
            return fallbackAssets.find(asset => asset.ticker === ticker);
          }).filter(Boolean) as Asset[];
          setSelectedAssets(initialAssets);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPrices();
  }, [investorProfile.type]);

  // 실시간 검색
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const searchTimeout = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchAssets(searchTerm);
          const formattedResults: Asset[] = results.map((result, index) => {
            // Convert AssetData to Asset interface
            const assetWithChange = {
              ticker: result.ticker,
              name: result.name,
              price: result.price,
              changePercent: result.changePercent,
              change: result.price * (result.changePercent / 100),
              sector: result.sector,
              type: result.type === 'etf' || result.type === 'commodity' ? 'stock' as const : result.type,
              geckoId: undefined // AssetData doesn't have geckoId
            };
            return {
              ...assetWithChange,
              uniqueId: generateUniqueId(assetWithChange) + `-search-${index}`
            };
          });
          
          // 중복 제거 (uniqueId 기준)
          const uniqueResults = formattedResults.filter((asset, index, self) => 
            index === self.findIndex(a => a.uniqueId === asset.uniqueId)
          );
          
          setSearchResults(uniqueResults);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500);

      return () => clearTimeout(searchTimeout);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleAddAsset = (asset: Asset) => {
    if (selectedAssets.length < 20 && !selectedAssets.find(a => a.ticker === asset.ticker && a.type === asset.type)) {
      setSelectedAssets([...selectedAssets, asset]);
      setSearchTerm('');
      setShowSearch(false);
      setSearchResults([]);
    }
  };

  const handleRemoveAsset = (uniqueId: string) => {
    setSelectedAssets(selectedAssets.filter(asset => asset.uniqueId !== uniqueId));
  };

  const handleAnalyzePortfolio = () => {
    const currentStrategy = portfolioStrategies[investorProfile.type];
    onAnalyze(selectedAssets, currentStrategy.allocation);
  };

  const formatPrice = (price: number, type: 'stock' | 'crypto') => {
    if (type === 'crypto' && price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (type === 'crypto' && price > 1000) {
      return `$${price.toLocaleString()}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const getAssetTypeIcon = (type: 'stock' | 'crypto', sector?: string) => {
    if (type === 'crypto') {
      return <Coins className="h-3 w-3" />;
    }
    
    // ETF/채권/원자재 구분
    if (sector?.includes('Bonds') || sector?.includes('ETF') || 
        sector?.includes('Precious Metals') || sector?.includes('Commodities')) {
      return <PieChart className="h-3 w-3" />;
    }
    
    return <TrendingUp className="h-3 w-3" />;
  };

  const getAssetTypeBadge = (type: 'stock' | 'crypto', sector?: string) => {
    if (type === 'crypto') return 'Crypto';
    
    if (sector?.includes('ETF')) return 'ETF';
    if (sector?.includes('Bonds')) return 'Bond';
    if (sector?.includes('Precious Metals')) return 'Gold';
    if (sector?.includes('Commodities')) return 'Commodity';
    
    return 'Stock';
  };

  const AssetCard = ({ asset, isSelected, onAdd, onRemove, allocation }: {
    asset: Asset;
    isSelected: boolean;
    onAdd?: () => void;
    onRemove?: () => void;
    allocation?: number;
  }) => (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getAssetTypeIcon(asset.type, asset.sector)}
            <span className="text-sm font-medium">{asset.ticker}</span>
            <Badge variant="secondary" className="text-xs">
              {getAssetTypeBadge(asset.type, asset.sector)}
            </Badge>
            {allocation && (
              <Badge variant="outline" className="text-xs">
                {allocation}%
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1 truncate">{asset.name}</p>
          <p className="text-xs text-muted-foreground mb-2 truncate">{asset.sector}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm">{formatPrice(asset.price, asset.type)}</span>
            {asset.price > 0 && (
              <span className={`text-xs ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          {isSelected ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onAdd}
              disabled={selectedAssets.length >= 20}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  const currentStrategy = portfolioStrategies[investorProfile.type];
  const stockCount = selectedAssets.filter(asset => asset.type === 'stock').length;
  const cryptoCount = selectedAssets.filter(asset => asset.type === 'crypto').length;
  const etfCount = selectedAssets.filter(asset => 
    asset.sector?.includes('ETF') || asset.sector?.includes('Bonds') || 
    asset.sector?.includes('Precious Metals') || asset.sector?.includes('Commodities')
  ).length;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center" style={{ width: '393px', height: '852px' }}>
        <div className="text-center px-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg mb-2">실시간 시세 로딩 중...</h2>
          <p className="text-sm text-muted-foreground">
            CoinGecko API에서 최신 가격을 가져오고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background" style={{ width: '393px', height: '852px' }}>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-8">
            <div className="w-full max-w-none mx-auto">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="p-2 h-8 w-8 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg truncate">포트폴리오 추천</h1>
                  <Badge className={`${investorProfile.color} text-xs mt-1`}>
                    {investorProfile.title}
                  </Badge>
                </div>
              </div>

              {/* Strategy Info */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary flex-shrink-0" />
                    <CardTitle className="text-base truncate">{currentStrategy.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-2">
                    {currentStrategy.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    by {currentStrategy.creator}
                  </Badge>
                </CardContent>
              </Card>

              {/* API Status */}
              <div className="flex items-center justify-between mb-4 p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {apiStatus === 'success' ? (
                    <RefreshCw className="h-3 w-3 text-green-600" />
                  ) : apiStatus === 'fallback' ? (
                    <AlertCircle className="h-3 w-3 text-orange-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {apiStatus === 'success' 
                      ? 'CoinGecko API 연결됨' 
                      : apiStatus === 'fallback'
                      ? 'Mock 데이터 사용 중'
                      : '가격 로딩 실패'
                    }
                  </span>
                </div>
                {lastUpdate && (
                  <span className="text-xs text-muted-foreground">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Search Section */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="주식, ETF, 코인 검색..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSearch(e.target.value.length > 0);
                    }}
                    className="pl-9"
                  />
                  {isSearching && (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                
                {showSearch && searchTerm.length >= 2 && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="text-center py-4">
                        <span className="text-sm text-muted-foreground">검색 중...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((asset) => (
                        <AssetCard
                          key={asset.uniqueId}
                          asset={asset}
                          isSelected={selectedAssets.some(a => a.ticker === asset.ticker && a.type === asset.type)}
                          onAdd={() => handleAddAsset(asset)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <span className="text-sm text-muted-foreground">검색 결과가 없습니다</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Portfolio Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base">추천 포트폴리오</h2>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        주식 {stockCount - etfCount}개
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        ETF {etfCount}개
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        코인 {cryptoCount}개
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedAssets.length}/20
                  </span>
                </div>
                
                <div className="space-y-2">
                  {selectedAssets.map((asset) => (
                    <AssetCard
                      key={asset.uniqueId}
                      asset={asset}
                      isSelected={true}
                      onRemove={() => handleRemoveAsset(asset.uniqueId!)}
                      allocation={currentStrategy.allocation[asset.ticker]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Button at Bottom */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-background border-t border-border">
          <Button 
            className="w-full h-12"
            onClick={handleAnalyzePortfolio}
            disabled={selectedAssets.length === 0}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            다음: 비중 분석
          </Button>
        </div>
      </div>
    </div>
  );
}