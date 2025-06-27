import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search, Plus, Minus, ArrowLeft, RefreshCw, AlertCircle, Coins, TrendingUp, Info, PieChart, ArrowRight, DollarSign, Building2, Zap } from 'lucide-react';
import { InvestorProfile } from '../App';
import { searchUniversalAssets, getPopularAssets, UniversalAsset } from '../utils/api_enhanced';

// UniversalAsset 타입을 Asset로 재명명하여 호환성 유지
type Asset = UniversalAsset & {
  ticker?: string; // 기존 코드 호환성을 위해 ticker 추가
  uniqueId?: string;
};

interface PortfolioStrategy {
  name: string;
  description: string;
  assets: string[];
  allocation: Record<string, number>;
}

// 투자자 타입별 추천 전략
const portfolioStrategies: Record<string, PortfolioStrategy> = {
  conservative: {
    name: "보수적 포트폴리오",
    description: "안전성을 중시하는 투자 전략",
    assets: ['SPY', 'TLT', 'GLD', '005930', 'VTI'],
    allocation: { 'SPY': 30, 'TLT': 25, 'GLD': 20, '005930': 15, 'VTI': 10 }
  },
  moderate: {
    name: "균형 포트폴리오", 
    description: "성장과 안정성의 균형",
    assets: ['SPY', 'QQQ', 'VEA', 'GLD', 'BTC', '005930', '000660'],
    allocation: { 'SPY': 25, 'QQQ': 20, 'VEA': 15, 'GLD': 15, 'BTC': 10, '005930': 10, '000660': 5 }
  },
  aggressive: {
    name: "성장 포트폴리오",
    description: "높은 수익을 추구하는 공격적 전략", 
    assets: ['QQQ', 'AAPL', 'TSLA', 'NVDA', 'BTC', 'ETH', '035420'],
    allocation: { 'QQQ': 25, 'AAPL': 15, 'TSLA': 15, 'NVDA': 15, 'BTC': 15, 'ETH': 10, '035420': 5 }
  },
  'very-aggressive': {
    name: "초고위험 포트폴리오",
    description: "극한의 수익을 추구하는 투기적 전략",
    assets: ['BTC', 'ETH', 'SOL', 'TSLA', 'NVDA', 'AAPL'],
    allocation: { 'BTC': 40, 'ETH': 20, 'SOL': 15, 'TSLA': 10, 'NVDA': 10, 'AAPL': 5 }
  }
};

interface PortfolioRecommendationProps {
  investorProfile: InvestorProfile;
  onBack: () => void;
  onAnalyze: (assets: Asset[], allocations: Record<string, number>) => void;
  onSavePortfolio?: (assets: Asset[], allocations: Record<string, number>) => void;
}

export default function PortfolioRecommendation({ investorProfile, onBack, onAnalyze, onSavePortfolio }: PortfolioRecommendationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [popularAssets, setPopularAssets] = useState<Asset[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 인기 자산 로드
  useEffect(() => {
    const loadPopularAssets = async () => {
      try {
        setIsLoading(true);
        
        // Mock 데이터 추가 (API 실패 시 대체용)
        const mockAssets: Asset[] = [
          { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', price: 192.53, change: 2.39, changePercent: 1.24, sector: 'Technology', type: 'stock', market: 'US', currency: 'USD', uniqueId: 'stock-AAPL-AAPL', ticker: 'AAPL' },
          { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.26, change: -1.50, changePercent: -0.36, sector: 'Technology', type: 'stock', market: 'US', currency: 'USD', uniqueId: 'stock-MSFT-MSFT', ticker: 'MSFT' },
          { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.84, change: 1.11, changePercent: 0.63, sector: 'Technology', type: 'stock', market: 'US', currency: 'USD', uniqueId: 'stock-GOOGL-GOOGL', ticker: 'GOOGL' },
          { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -3.18, changePercent: -1.28, sector: 'Automotive', type: 'stock', market: 'US', currency: 'USD', uniqueId: 'stock-TSLA-TSLA', ticker: 'TSLA' },
          { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.28, change: 17.65, changePercent: 2.02, sector: 'Technology', type: 'stock', market: 'US', currency: 'USD', uniqueId: 'stock-NVDA-NVDA', ticker: 'NVDA' },
          { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', price: 94250.67, change: 1980.15, changePercent: 2.10, sector: 'Cryptocurrency', type: 'crypto', market: 'CRYPTO', currency: 'USD', geckoId: 'bitcoin', uniqueId: 'crypto-BTC-BTC', ticker: 'BTC' },
          { id: 'ETH', symbol: 'ETH', name: 'Ethereum', price: 3650.32, change: -61.32, changePercent: -1.68, sector: 'Cryptocurrency', type: 'crypto', market: 'CRYPTO', currency: 'USD', geckoId: 'ethereum', uniqueId: 'crypto-ETH-ETH', ticker: 'ETH' },
          { id: '005930', symbol: '005930', name: '삼성전자', price: 75000, change: 1000, changePercent: 1.35, sector: 'Technology', type: 'stock', market: 'KR', currency: 'KRW', exchange: 'KOSPI', uniqueId: 'stock-005930-005930', ticker: '005930' }
        ];
        
        let convertedAssets: Asset[] = mockAssets;
        
        try {
          const popular = await getPopularAssets();
          
          if (popular.length > 0) {
            // API 성공시 실제 데이터 사용
            convertedAssets = popular.map(asset => ({
              ...asset,
              ticker: asset.symbol,
              uniqueId: `${asset.type}-${asset.symbol}-${asset.id}`
            }));
          }
        } catch (apiError) {
          console.warn('API 호출 실패, Mock 데이터 사용:', apiError);
        }
        
        setPopularAssets(convertedAssets);
        
            // 투자자 타입에 따른 초기 포트폴리오 설정 (강제 적용)
        const strategy = portfolioStrategies[investorProfile.type];
        if (strategy && strategy.assets && strategy.assets.length > 0) {
          const initialAssets = strategy.assets.map(symbol => {
            return convertedAssets.find(asset => 
              asset.symbol === symbol || asset.ticker === symbol
            );
          }).filter((asset): asset is Asset => asset !== undefined);
          
          if (initialAssets.length > 0) {
            setSelectedAssets(initialAssets);
          }
        }
        
        setLoadingError(null);
      } catch (error) {
        console.error('인기 자산 로드 오류:', error);
        setLoadingError('자산 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPopularAssets();
  }, [investorProfile.type]);

  // 고유 ID 생성 함수
  const generateUniqueId = (asset: any): string => {
    return `${asset.type}-${asset.market || 'UNKNOWN'}-${asset.symbol}-${asset.id}`;
  };

  // 검색 기능 (품질 개선)
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setShowSearch(true);
    setSearchError(null);

    try {
      const searchResult = await searchUniversalAssets(query);
      
      // UniversalAsset을 Asset으로 변환
      const convertedResults: Asset[] = searchResult.results.map(asset => ({
        ...asset,
        ticker: asset.symbol,
        uniqueId: generateUniqueId(asset)
      }));
      
      setSearchResults(convertedResults);
      
      if (convertedResults.length === 0) {
        setSearchError(null); // 빈 결과는 에러가 아님
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchError('검색 중 오류가 발생했습니다. 네트워크 연결을 확인하고 잠시 후 다시 시도해주세요.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 검색어 변경 시 검색 실행 (디바운싱 개선)
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      setSearchError(null);
      return;
    }
    
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500); // 디바운싱 시간을 늘려서 API 호출 빈도 감소

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 자산 추가 (중복 확인 개선)
  const handleAddAsset = (asset: Asset) => {
    if (selectedAssets.length >= 20) return;
    
    // 중복 확인 (고유 ID 기준)
    const newAssetId = generateUniqueId(asset);
    const isAlreadySelected = selectedAssets.some(a => {
      const existingId = generateUniqueId(a);
      return existingId === newAssetId;
    });
    
    if (!isAlreadySelected) {
      setSelectedAssets(prev => [...prev, asset]);
    }
    
    setSearchTerm('');
    setShowSearch(false);
    setSearchError(null);
  };

  // 자산 제거
  const handleRemoveAsset = (uniqueId: string) => {
    setSelectedAssets(prev => prev.filter(asset => 
      asset.uniqueId !== uniqueId
    ));
  };

  // 포트폴리오 분석으로 이동
  const handleAnalyzePortfolio = () => {
    if (selectedAssets.length === 0) return;
    
    // 선택된 자산들에 대해 균등 분배로 초기 설정
    const equalAllocation = 100 / selectedAssets.length;
    const allocations: Record<string, number> = {};
    
    selectedAssets.forEach(asset => {
      const assetId = asset.symbol || asset.ticker || asset.id || '';
      if (assetId) {
        allocations[assetId] = equalAllocation;
      }
    });
    
    onAnalyze(selectedAssets, allocations);
  };

  // 포트폴리오 바로 저장
  const handleSavePortfolioDirectly = () => {
    if (selectedAssets.length === 0 || !onSavePortfolio) return;
    
    // 선택된 자산들에 대해 균등 분배로 초기 설정
    const equalAllocation = 100 / selectedAssets.length;
    const allocations: Record<string, number> = {};
    
    selectedAssets.forEach(asset => {
      const assetId = asset.symbol || asset.ticker || asset.id || '';
      if (assetId) {
        allocations[assetId] = equalAllocation;
      }
    });
    
    onSavePortfolio(selectedAssets, allocations);
  };

  // 자산 타입별 아이콘
  const getAssetTypeIcon = (type: string, market?: string) => {
    switch (type) {
      case 'crypto':
        return <Coins className="h-4 w-4 text-orange-500" />;
      case 'stock':
        return market === 'KR' ? 
          <Building2 className="h-4 w-4 text-blue-500" /> : 
          <DollarSign className="h-4 w-4 text-green-500" />;
      case 'etf':
        return <PieChart className="h-4 w-4 text-purple-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  // 자산 타입별 배지
  const getAssetTypeBadge = (type: string, market?: string) => {
    switch (type) {
      case 'crypto':
        return '코인';
      case 'stock':
        return market === 'KR' ? '국내주식' : '해외주식';
      case 'etf':
        return 'ETF';
      default:
        return type.toUpperCase();
    }
  };

  // 가격 포맷팅
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`;
    } else {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // 자산 카드 컴포넌트
  const AssetCard = ({ 
    asset, 
    isSelected, 
    onAdd, 
    onRemove, 
    allocation 
  }: {
    asset: Asset;
    isSelected: boolean;
    onAdd?: () => void;
    onRemove?: () => void;
    allocation?: number;
  }) => (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getAssetTypeIcon(asset.type, asset.market)}
            <span className="text-sm font-medium">{asset.symbol}</span>
            <Badge variant="secondary" className="text-xs">
              {getAssetTypeBadge(asset.type, asset.market)}
            </Badge>
            {allocation && (
              <Badge variant="outline" className="text-xs">
                {allocation}%
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1 truncate">{asset.name}</p>
          <p className="text-xs text-gray-500 mb-2 truncate">{asset.sector}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatPrice(asset.price, asset.currency)}</span>
            {asset.price > 0 && asset.changePercent !== undefined && (
              <span className={`text-xs font-medium ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <div className="ml-3 flex-shrink-0">
          {isSelected ? (
            <Button
              size="sm"
              variant="danger"
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="success"
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

  // 통계 계산
  const currentStrategy = portfolioStrategies[investorProfile.type];
  const stockCount = selectedAssets.filter(asset => asset.type === 'stock').length;
  const cryptoCount = selectedAssets.filter(asset => asset.type === 'crypto').length;
  const etfCount = selectedAssets.filter(asset => asset.type === 'etf').length;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center responsive-container">
        <div className="text-center px-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg mb-2">실시간 시세 로딩 중...</h2>
          <p className="text-sm text-gray-500">
            최신 가격 정보를 가져오고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white responsive-container">
      <div className="h-full flex flex-col">
        {/* 스크롤 가능한 메인 컨텐츠 */}
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold truncate">포트폴리오 추천</h1>
                <Badge className={`${investorProfile.color || ''} text-xs mt-1`}>
                  {investorProfile.title}
                </Badge>
              </div>
            </div>

            {/* 진행 단계 표시 */}
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">단계 1/3: 자산 선택</span>
                <span className="text-xs text-gray-500">다음: 비중 조정</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '33%' }}></div>
              </div>
            </div>

            {/* 전략 설명 */}
            {currentStrategy && (
              <Card className="p-4">
                <h3 className="font-medium text-sm mb-2">{currentStrategy.name}</h3>
                <p className="text-xs text-gray-500">{currentStrategy.description}</p>
              </Card>
            )}

            {/* 에러 표시 */}
            {loadingError && (
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">{loadingError}</span>
                </div>
              </Card>
            )}

            {/* 검색 섹션 */}
            <div className="space-y-3">
              <h2 className="text-base font-medium">자산 검색 및 추가</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="주식, ETF, 암호화폐 검색... (예: 삼성전자, Apple, 비트코인)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchResults.length > 0) {
                      e.preventDefault();
                      handleAddAsset(searchResults[0]);
                    }
                    if (e.key === 'Escape') {
                      setSearchTerm('');
                      setShowSearch(false);
                    }
                  }}
                  className="pl-10 h-12"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={showSearch}
                  aria-label="자산 검색"
                />
                {isSearching && (
                  <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>

              {/* 검색 결과 */}
              {showSearch && searchTerm.length >= 2 && (
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg bg-white p-2">
                  {isSearching ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">검색 중...</p>
                    </div>
                  ) : searchError ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-600 mb-2">{searchError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSearch(searchTerm)}
                        className="text-xs"
                      >
                        다시 시도
                      </Button>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((asset) => (
                      <AssetCard
                        key={asset.uniqueId}
                        asset={asset}
                        isSelected={selectedAssets.some(a => a.symbol === asset.symbol && a.type === asset.type && a.market === asset.market)}
                        onAdd={() => handleAddAsset(asset)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-sm text-gray-500">
                        "{searchTerm}"에 대한 검색 결과가 없습니다
                      </span>
                      <p className="text-xs text-gray-400 mt-2">
                        다른 키워드로 검색하거나 영문/한글을 바꿔보세요
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        {['AAPL', '삼성전자', 'BTC', 'SPY', 'QQQ'].map(suggestion => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchTerm(suggestion)}
                            className="text-xs h-7 px-2"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 인기 자산 섹션 */}
            {!showSearch && popularAssets.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-base font-medium">인기 자산</h2>
                <div className="space-y-2">
                  {popularAssets.slice(0, 5).map((asset) => (
                    <AssetCard
                      key={asset.uniqueId}
                      asset={asset}
                      isSelected={selectedAssets.some(a => a.symbol === asset.symbol && a.type === asset.type)}
                      onAdd={() => handleAddAsset(asset)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 선택된 포트폴리오 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium">선택된 포트폴리오</h2>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>주식 {stockCount}개</span>
                    <span>ETF {etfCount}개</span>
                    <span>코인 {cryptoCount}개</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 font-medium">
                    {selectedAssets.length}/20
                  </span>
                  {selectedAssets.length > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      ✓ 다음 단계 가능
                    </div>
                  )}
                </div>
              </div>

              {selectedAssets.length > 0 ? (
                <div className="space-y-2">
                  {selectedAssets.map((asset) => (
                    <AssetCard
                      key={asset.uniqueId}
                      asset={asset}
                      isSelected={true}
                      onRemove={() => handleRemoveAsset(asset.uniqueId || `${asset.type}-${asset.symbol}-${asset.id}`)}
                      allocation={currentStrategy?.allocation[asset.symbol] || currentStrategy?.allocation[asset.ticker || '']}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center border-dashed">
                  <PieChart className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <p className="text-sm text-gray-500 mb-2">
                    아직 선택된 자산이 없습니다
                  </p>
                  <p className="text-xs text-gray-500">
                    위의 검색을 통해 자산을 추가해보세요
                  </p>
                </Card>
              )}
            </div>

            {/* 하단 여백 - 플로팅 버튼을 위한 공간 확보 */}
            <div className="h-32 sm:h-24 md:h-20 lg:h-16"></div>
          </div>
        </div>

        {/* 플로팅 액션 버튼 - 모든 화면 크기 지원 */}
        {selectedAssets.length > 0 && (
          <div 
            className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full px-4 pb-6 pt-4 bg-gradient-to-t from-white via-white to-transparent z-50"
            style={{ 
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
              maxWidth: 'min(393px, 100vw)',
              width: 'min(393px, 100vw)',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            role="toolbar"
            aria-label="포트폴리오 액션 버튼"
          >
            {/* 비중조정 메인 버튼 */}
            <Button 
              variant="success"
              size="touch"
              className="w-full font-semibold shadow-2xl border-2 border-white transform transition-all duration-200 hover:scale-105 active:scale-95 
                         h-12 text-sm sm:h-14 sm:text-base
                         min-h-[48px] min-w-[200px]
                         touch-manipulation focus:outline-none focus:ring-4 focus:ring-green-300"
              onClick={handleAnalyzePortfolio}
              aria-label={`${selectedAssets.length}개 자산의 비중을 조정하러 이동`}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
              }}
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">비중 조정하기 ({selectedAssets.length}개)</span>
              <span className="sm:hidden">비중조정 ({selectedAssets.length}개)</span>
            </Button>
            
            {/* 바로 저장 버튼 (세컨더리) */}
            {onSavePortfolio && (
              <Button 
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs sm:text-sm shadow-lg bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-gray-50 transition-colors
                           h-8 sm:h-10
                           min-h-[32px]
                           touch-manipulation focus:outline-none focus:ring-4 focus:ring-blue-300"
                onClick={handleSavePortfolioDirectly}
                aria-label={`${selectedAssets.length}개 자산을 균등분배로 바로 저장`}
                style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                }}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">균등분배로 바로 저장</span>
                <span className="sm:hidden">바로저장</span>
              </Button>
            )}
          </div>
        )}

        {/* 플로팅 안내 메시지 - 자산 미선택 시 */}
        {selectedAssets.length === 0 && (
          <div 
            className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full px-4 pb-6 pt-4 bg-gradient-to-t from-white via-white to-transparent z-50"
            style={{ 
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
              maxWidth: 'min(393px, 100vw)',
              width: 'min(393px, 100vw)',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            role="status"
            aria-live="polite"
            aria-label="자산 선택 안내"
          >
            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-lg">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-2 text-gray-500" aria-hidden="true" />
              <p className="text-xs sm:text-sm text-gray-600 font-medium" style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>
                최소 1개 이상의 자산을 선택해주세요
              </p>
              <p className="text-xs text-gray-500 mt-1" style={{ fontSize: 'clamp(11px, 2.5vw, 12px)' }}>
                <span className="hidden sm:inline">위의 검색을 통해 자산을 추가해보세요</span>
                <span className="sm:hidden">자산을 추가해보세요</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}