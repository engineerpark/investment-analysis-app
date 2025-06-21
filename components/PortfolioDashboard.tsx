import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, PieChart, RefreshCw, Edit3, Save, Target, AlertTriangle, BarChart3, Brain, Shield, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InvestorProfile } from '../App';

interface Asset {
  id?: string;
  symbol: string;
  ticker?: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  sector: string;
  type: "stock" | "crypto" | "etf" | "index";
  market?: 'US' | 'KR' | 'CRYPTO' | 'GLOBAL';
  currency?: string;
  exchange?: string;
  geckoId?: string;
  uniqueId?: string;
}

interface InvestmentSettings {
  initialInvestment: number;
  rebalancingAmount: number;
  rebalancingPeriod: string;
  exchangeRate: number;
}

interface PortfolioDashboardProps {
  investorProfile: InvestorProfile;
  selectedAssets: Asset[];
  allocations: Record<string, number>;
  investmentSettings: InvestmentSettings;
  onBack: () => void;
  onEdit: () => void;
  onNewPortfolio: () => void;
  onAdvancedAnalysis?: () => void;
  onRiskManagement?: () => void;
  onBacktesting?: () => void;
  onFuturePrediction?: () => void;
  isPublicView?: boolean;
  portfolioAuthor?: {
    name: string;
    isVerified?: boolean;
  };
}

interface PortfolioMetrics {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  expectedReturn: number;
  riskLevel: number;
  sharpeRatio: number;
}

interface SectorAllocation {
  name: string;
  value: number;
  color: string;
}

interface PerformanceData {
  date: string;
  value: number;
  change: number;
}

// 색상 팔레트
const SECTOR_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
  '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#64748B'
];

export default function PortfolioDashboard({ 
  investorProfile, 
  selectedAssets, 
  allocations,
  investmentSettings,
  onBack, 
  onEdit, 
  onNewPortfolio,
  onAdvancedAnalysis,
  onRiskManagement,
  onBacktesting,
  onFuturePrediction,
  isPublicView = false,
  portfolioAuthor
}: PortfolioDashboardProps) {
  // Helper function to get asset identifier (symbol or ticker)
  const getAssetId = (asset: Asset) => asset.symbol || asset.ticker || asset.id || 'unknown';

  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    expectedReturn: 0,
    riskLevel: 0,
    sharpeRatio: 0
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // 포트폴리오 메트릭 계산
  useEffect(() => {
    const calculateMetrics = () => {
      setIsLoading(true);
      
      // 총 포트폴리오 가치 계산 (설정된 초기 투자금액 사용)
      const totalInvestment = investmentSettings.initialInvestment;
      let totalValue = 0;
      let weightedReturn = 0;
      let weightedRisk = 0;
      
      selectedAssets.forEach(asset => {
        const allocation = allocations[getAssetId(asset)] || 0;
        const assetValue = (allocation / 100) * totalInvestment;
        totalValue += assetValue;
        
        // 예상 수익률 계산 (자산 타입별)
        let expectedReturn = 0;
        let riskLevel = 0;
        
        if (asset.type === 'crypto') {
          expectedReturn = 15 + Math.random() * 20; // 15-35%
          riskLevel = 0.8 + Math.random() * 0.2; // 80-100%
        } else if (asset.sector?.includes('Technology')) {
          expectedReturn = 10 + Math.random() * 15; // 10-25%
          riskLevel = 0.6 + Math.random() * 0.3; // 60-90%
        } else if (asset.sector?.includes('Bonds')) {
          expectedReturn = 2 + Math.random() * 4; // 2-6%
          riskLevel = 0.1 + Math.random() * 0.2; // 10-30%
        } else if (asset.sector?.includes('Precious Metals')) {
          expectedReturn = 5 + Math.random() * 8; // 5-13%
          riskLevel = 0.3 + Math.random() * 0.3; // 30-60%
        } else {
          expectedReturn = 6 + Math.random() * 10; // 6-16%
          riskLevel = 0.4 + Math.random() * 0.3; // 40-70%
        }
        
        weightedReturn += (allocation / 100) * expectedReturn;
        weightedRisk += (allocation / 100) * riskLevel;
      });
      
      // 일일 변동 계산
      const dailyChangePercent = selectedAssets.reduce((acc, asset) => {
        const allocation = allocations[getAssetId(asset)] || 0;
        return acc + (allocation / 100) * asset.changePercent;
      }, 0);
      
      const dailyChange = (dailyChangePercent / 100) * totalValue;
      
      // 샤프 비율 계산 (단순화)
      const riskFreeRate = 2.5; // 무위험 수익률 2.5%
      const sharpeRatio = (weightedReturn - riskFreeRate) / (weightedRisk * 100);
      
      setPortfolioMetrics({
        totalValue: totalValue + dailyChange,
        dailyChange,
        dailyChangePercent,
        expectedReturn: weightedReturn,
        riskLevel: weightedRisk * 100,
        sharpeRatio
      });
      
      // 성과 데이터 생성 (최근 30일)
      const performanceData: PerformanceData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const baseValue = totalInvestment + (Math.random() - 0.5) * totalInvestment * 0.1;
        const change = (Math.random() - 0.5) * 5; // -2.5% to 2.5% daily change
        
        performanceData.push({
          date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          value: baseValue,
          change
        });
      }
      
      setPerformanceData(performanceData);
      setLastUpdate(new Date());
      setIsLoading(false);
    };

    if (selectedAssets.length > 0) {
      calculateMetrics();
    }
  }, [selectedAssets, allocations, investmentSettings]);

  // 섹터별 배분 계산
  const getSectorAllocation = (): SectorAllocation[] => {
    const sectorMap: Record<string, number> = {};
    
    selectedAssets.forEach(asset => {
      const allocation = allocations[getAssetId(asset)] || 0;
      if (sectorMap[asset.sector]) {
        sectorMap[asset.sector] += allocation;
      } else {
        sectorMap[asset.sector] = allocation;
      }
    });

    return Object.entries(sectorMap)
      .filter(([_, value]) => value > 0)
      .map(([sector, value], index) => ({
        name: sector,
        value: Math.round(value * 100) / 100,
        color: SECTOR_COLORS[index % SECTOR_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  const sectorData = getSectorAllocation();
  const stockCount = selectedAssets.filter(asset => asset.type === 'stock').length;
  const cryptoCount = selectedAssets.filter(asset => asset.type === 'crypto').length;
  const etfCount = selectedAssets.filter(asset => 
    asset.sector?.includes('ETF') || asset.sector?.includes('Bonds') || 
    asset.sector?.includes('Precious Metals') || asset.sector?.includes('Commodities')
  ).length;

  // 리스크 레벨 텍스트
  const getRiskLevelText = (risk: number) => {
    if (risk < 20) return { text: '매우 낮음', color: 'text-green-600' };
    if (risk < 40) return { text: '낮음', color: 'text-green-500' };
    if (risk < 60) return { text: '보통', color: 'text-yellow-500' };
    if (risk < 80) return { text: '높음', color: 'text-orange-500' };
    return { text: '매우 높음', color: 'text-red-500' };
  };

  const riskLevel = getRiskLevelText(portfolioMetrics.riskLevel);

  // 포트폴리오 저장 핸들러
  const handleSavePortfolio = async () => {
    setIsSaving(true);
    
    try {
      // 기존 onNewPortfolio 함수 호출
      await onNewPortfolio();
      
      // 저장 성공 시
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error('포트폴리오 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            ${data.value.toLocaleString()}
          </p>
          <p className={`text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center" style={{ width: '393px', height: '852px' }}>
        <div className="text-center px-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg mb-2">포트폴리오 분석 중...</h2>
          <p className="text-sm text-muted-foreground">
            수익률과 리스크를 계산하고 있습니다.
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
                  <h1 className="text-lg truncate">
                    {isPublicView ? '공개 포트폴리오' : '포트폴리오 대시보드'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${investorProfile.color} text-xs`}>
                      {investorProfile.title}
                    </Badge>
                    {isPublicView && portfolioAuthor && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">by</span>
                        <span className="text-xs font-medium">{portfolioAuthor.name}</span>
                        {portfolioAuthor.isVerified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {!isPublicView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="p-2 h-8 w-8 flex-shrink-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Portfolio Value Summary */}
              <Card className="mb-4">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">총 포트폴리오 가치</span>
                    </div>
                    <div className="text-3xl font-bold">
                      ${portfolioMetrics.totalValue.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {portfolioMetrics.dailyChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm ${portfolioMetrics.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioMetrics.dailyChange >= 0 ? '+' : ''}${portfolioMetrics.dailyChange.toFixed(2)} 
                        ({portfolioMetrics.dailyChangePercent >= 0 ? '+' : ''}{portfolioMetrics.dailyChangePercent.toFixed(2)}%)
                      </span>
                      <span className="text-xs text-muted-foreground">오늘</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Chart */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">최근 30일 성과</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                          tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 백테스팅 & 미래예측 버튼 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {onBacktesting && (
                  <Button 
                    onClick={onBacktesting}
                    variant="analysis"
                    className="h-12 flex flex-col items-center justify-center gap-1"
                  >
                    <History className="h-4 w-4" />
                    <span className="text-xs font-medium">백테스팅</span>
                  </Button>
                )}
                {onFuturePrediction && (
                  <Button 
                    onClick={onFuturePrediction}
                    variant="info"
                    className="h-12 flex flex-col items-center justify-center gap-1"
                  >
                    <Brain className="h-4 w-4" />
                    <span className="text-xs font-medium">미래예측</span>
                  </Button>
                )}
              </div>

              {/* Analysis Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {onAdvancedAnalysis && (
                  <Button 
                    onClick={onAdvancedAnalysis}
                    variant="analysis"
                    className="h-12 flex flex-col items-center justify-center gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs">고급 분석</span>
                  </Button>
                )}
                {onRiskManagement && (
                  <Button 
                    onClick={onRiskManagement}
                    variant="warning"
                    className="h-12 flex flex-col items-center justify-center gap-1"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-xs">리스크 관리</span>
                  </Button>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">예상 수익률</span>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        {portfolioMetrics.expectedReturn.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">연간</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-xs text-muted-foreground">리스크 수준</span>
                      </div>
                      <div className={`text-xl font-bold ${riskLevel.color}`}>
                        {riskLevel.text}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {portfolioMetrics.riskLevel.toFixed(0)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sector Allocation */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">섹터별 배분</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sectorData.slice(0, 5).map((sector, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{sector.name}</span>
                          <span className="text-sm font-medium">{sector.value.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={sector.value} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Asset Composition */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">자산 구성</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{stockCount}</div>
                      <div className="text-xs text-muted-foreground">주식</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{cryptoCount}</div>
                      <div className="text-xs text-muted-foreground">암호화폐</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{etfCount}</div>
                      <div className="text-xs text-muted-foreground">ETF/기타</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Last Update Info */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Save Button */}
      {!isPublicView ? (
        <button 
          onClick={handleSavePortfolio} 
          className={`floating-save-button ${isSaving ? 'saving' : ''} ${isSaved ? 'saved' : ''}`}
          disabled={isSaving}
          aria-label="포트폴리오 저장"
        >
          <span className="save-icon">
            {isSaving ? '⏳' : isSaved ? '✓' : '💾'}
          </span>
          <span className="save-text">
            {isSaving ? '저장 중...' : isSaved ? '저장됨!' : '포트폴리오 저장'}
          </span>
        </button>
      ) : (
        <button 
          onClick={() => {
            // 공개 포트폴리오를 내 포트폴리오로 복사
            onNewPortfolio();
          }} 
          className="floating-save-button"
          aria-label="내 포트폴리오로 복사"
        >
          <span className="save-icon">📋</span>
          <span className="save-text">내 포트폴리오로 복사</span>
        </button>
      )}
    </div>
  );
}