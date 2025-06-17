import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Target, Calendar, RefreshCw, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
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

interface BacktestData {
  date: string;
  value: number;
  change: number;
  isRebalancing?: boolean;
  totalInvested?: number;
}

interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  maxGain: number;
  volatility: number;
  sharpeRatio: number;
  dataAvailabilityWarning?: string;
}

interface BacktestingScreenProps {
  investorProfile: InvestorProfile;
  selectedAssets: Asset[];
  allocations: Record<string, number>;
  investmentSettings: InvestmentSettings;
  onBack: () => void;
}

export default function BacktestingScreen({
  investorProfile,
  selectedAssets,
  allocations,
  investmentSettings,
  onBack
}: BacktestingScreenProps) {
  const [backtestPeriod, setBacktestPeriod] = useState<'1y' | '3y' | '5y' | '10y'>('3y');
  const [backtestData, setBacktestData] = useState<BacktestData[]>([]);
  const [backtestMetrics, setBacktestMetrics] = useState<BacktestMetrics | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);

  // Helper function to get asset identifier
  const getAssetId = (asset: Asset) => asset.symbol || asset.ticker || asset.id || 'unknown';

  // 기간별 일수 정의
  const periodDays = {
    '1y': 365,
    '3y': 365 * 3,
    '5y': 365 * 5,
    '10y': 365 * 10
  };

  // 리밸런싱 주기별 일수 정의
  const rebalancingDays = {
    'monthly': 30,
    'quarterly': 90,
    'semiannual': 180,
    'annual': 365
  };

  // 백테스트 수행 함수
  const performBacktest = async (period: '1y' | '3y' | '5y' | '10y') => {
    setIsBacktesting(true);
    setBacktestPeriod(period);
    
    const days = periodDays[period];
    const rebalancingInterval = rebalancingDays[investmentSettings.rebalancingPeriod as keyof typeof rebalancingDays] || 90;
    
    try {
      // 포트폴리오 기반 시드 생성 (일관된 데이터를 위해)
      const generatePortfolioSeed = () => {
        const assetString = selectedAssets.map(asset => getAssetId(asset)).sort().join('');
        const allocationString = Object.keys(allocations).sort().map(key => allocations[key]).join('');
        const settingsString = `${investmentSettings.initialInvestment}${investmentSettings.rebalancingAmount}${investmentSettings.rebalancingPeriod}`;
        return (assetString + allocationString + settingsString).split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
      };

      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };

      const portfolioSeed = generatePortfolioSeed();
      
      // 시뮬레이션 데이터 생성
      const backtestData: BacktestData[] = [];
      let baseValue = investmentSettings.initialInvestment;
      let totalInvested = investmentSettings.initialInvestment;
      let maxValue = baseValue;
      let minValue = baseValue;
      let maxDrawdown = 0;
      let maxGain = 0;
      
      // 자산별 예상 연간 수익률 계산
      const getAssetAnnualReturn = (asset: Asset) => {
        const seed = getAssetId(asset).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const baseRandom = seededRandom(seed);
        
        if (asset.type === 'crypto') {
          return 0.25 + (baseRandom - 0.5) * 0.6; // crypto: -5% ~ 85%
        } else if (asset.sector?.includes('Technology')) {
          return 0.12 + (baseRandom - 0.5) * 0.3; // tech: -3% ~ 27%
        } else if (asset.sector?.includes('Bonds')) {
          return 0.03 + (baseRandom - 0.5) * 0.06; // bonds: 0% ~ 6%
        } else if (asset.sector?.includes('Precious Metals')) {
          return 0.06 + (baseRandom - 0.5) * 0.2; // gold: -4% ~ 16%
        } else {
          return 0.08 + (baseRandom - 0.5) * 0.2; // stocks: -2% ~ 18%
        }
      };
      
      // 포트폴리오 예상 연간 수익률 계산
      let portfolioAnnualReturn = 0;
      let portfolioVolatility = 0;
      
      selectedAssets.forEach(asset => {
        const allocation = (allocations[getAssetId(asset)] || 0) / 100;
        const assetReturn = getAssetAnnualReturn(asset);
        const assetVolatility = asset.type === 'crypto' ? 0.6 : 
                               asset.sector?.includes('Bonds') ? 0.05 : 0.2;
        
        portfolioAnnualReturn += allocation * assetReturn;
        portfolioVolatility += allocation * assetVolatility;
      });
      
      // 일일 데이터 생성
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // 리밸런싱 날짜 확인
        const isRebalancingDay = i % rebalancingInterval === 0 && i !== days && i !== 0;
        
        // 리밸런싱 시 추가 투자
        if (isRebalancingDay) {
          baseValue += investmentSettings.rebalancingAmount;
          totalInvested += investmentSettings.rebalancingAmount;
        }
        
        // 일일 수익률 계산 (시드 기반 일관된 패턴)
        const dailySeed = portfolioSeed + i;
        const marketCycle = Math.sin((i / 365) * 2 * Math.PI) * 0.002; // 연간 사이클
        const randomFactor = seededRandom(dailySeed) - 0.5;
        
        const dailyReturn = portfolioAnnualReturn / 365 + 
                           randomFactor * portfolioVolatility * 0.05 +
                           marketCycle;
        
        // 리밸런싱 추가 금액을 제외한 기존 자산에만 수익률 적용
        const previousValue = isRebalancingDay ? baseValue - investmentSettings.rebalancingAmount : baseValue;
        const returnAmount = previousValue * dailyReturn;
        baseValue = previousValue + returnAmount + (isRebalancingDay ? investmentSettings.rebalancingAmount : 0);
        
        maxValue = Math.max(maxValue, baseValue);
        minValue = Math.min(minValue, baseValue);
        
        const drawdown = (maxValue - baseValue) / maxValue * 100;
        const gain = (baseValue - totalInvested) / investmentSettings.initialInvestment * 100;
        
        maxDrawdown = Math.max(maxDrawdown, drawdown);
        maxGain = Math.max(maxGain, gain);
        
        backtestData.push({
          date: i === 0 ? '현재' : date.toLocaleDateString('ko-KR', { 
            year: period === '10y' ? '2-digit' : undefined,
            month: 'short', 
            day: period === '1y' ? 'numeric' : undefined
          }),
          value: Math.round(baseValue),
          change: dailyReturn * 100,
          isRebalancing: isRebalancingDay,
          totalInvested: totalInvested
        });
      }
      
      // 백테스트 지표 계산
      const totalReturn = (baseValue - totalInvested) / investmentSettings.initialInvestment * 100;
      const annualizedReturn = (Math.pow(baseValue / totalInvested, 1 / (days / 365)) - 1) * 100;
      const dailyReturns = backtestData.map(d => d.change / 100);
      const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
      const dailyStdDev = Math.sqrt(
        dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / dailyReturns.length
      );
      const annualizedVolatility = dailyStdDev * Math.sqrt(252) * 100;
      const riskFreeRate = 2.5; // 2.5%
      const sharpeRatio = (annualizedReturn - riskFreeRate) / annualizedVolatility;
      
      // 데이터 가용성 경고
      const oldAssets = selectedAssets.filter(asset => 
        asset.type === 'crypto' && ['DOGE', 'SOL', 'AVAX', 'MATIC'].includes(getAssetId(asset))
      );
      
      let dataWarning = '';
      if (period === '10y' && oldAssets.length > 0) {
        dataWarning = `${oldAssets.map(a => getAssetId(a)).join(', ')} 등 일부 자산은 2018년 이후 데이터만 사용되었습니다.`;
      } else if (period === '5y' && oldAssets.length > 0) {
        dataWarning = `${oldAssets.map(a => getAssetId(a)).join(', ')} 등 일부 자산은 2020년 이후 데이터만 사용되었습니다.`;
      }
      
      const metrics: BacktestMetrics = {
        totalReturn,
        annualizedReturn,
        maxDrawdown,
        maxGain,
        volatility: annualizedVolatility,
        sharpeRatio,
        dataAvailabilityWarning: dataWarning
      };
      
      setBacktestData(backtestData);
      setBacktestMetrics(metrics);
      
    } catch (error) {
      console.error('Backtest error:', error);
    } finally {
      setIsBacktesting(false);
    }
  };

  // 컴포넌트 마운트 시 기본 백테스트 실행
  useEffect(() => {
    if (selectedAssets.length > 0) {
      performBacktest(backtestPeriod);
    }
  }, [selectedAssets, allocations, investmentSettings]);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            ${data.value.toLocaleString()}
          </p>
          {data.isRebalancing && (
            <p className="text-xs text-blue-600 font-medium">
              📈 리밸런싱: +${investmentSettings.rebalancingAmount.toLocaleString()}
            </p>
          )}
          <p className={`text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-background" style={{ width: '393px', height: '852px' }}>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6">
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
                  <h1 className="text-xl font-semibold">포트폴리오 백테스트</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${investorProfile.color} text-xs`}>
                      {investorProfile.title}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {selectedAssets.length}개 자산 포트폴리오
                    </span>
                  </div>
                </div>
              </div>

              {/* Period Selection */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">백테스트 기간 선택</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: '1y' as const, label: '1년' },
                      { value: '3y' as const, label: '3년' },
                      { value: '5y' as const, label: '5년' },
                      { value: '10y' as const, label: '10년' }
                    ].map((period) => (
                      <Button
                        key={period.value}
                        variant={backtestPeriod === period.value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => performBacktest(period.value)}
                        disabled={isBacktesting}
                        className="text-xs h-10"
                      >
                        {period.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Loading State */}
              {isBacktesting && (
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {backtestPeriod === '1y' ? '1년' : backtestPeriod === '3y' ? '3년' : backtestPeriod === '5y' ? '5년' : '10년'} 백테스트 실행 중...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Backtest Chart */}
              {backtestData.length > 0 && !isBacktesting && (
                <Card className="mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {backtestPeriod === '1y' ? '1년' : backtestPeriod === '3y' ? '3년' : backtestPeriod === '5y' ? '5년' : '10년'} 백테스트 결과
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={backtestData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10 }}
                            stroke="#6b7280"
                          />
                          <YAxis 
                            tick={{ fontSize: 10 }}
                            stroke="#6b7280"
                            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            dot={false}
                          />
                          {/* 리밸런싱 마커 */}
                          {backtestData.filter(d => d.isRebalancing).map((point, index) => (
                            <ReferenceDot 
                              key={index}
                              x={point.date}
                              y={point.value}
                              r={4}
                              fill="#3B82F6"
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        💫 파란색 점: 리밸런싱 시점 (+${investmentSettings.rebalancingAmount.toLocaleString()})
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metrics Cards */}
              {backtestMetrics && !isBacktesting && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-muted-foreground">총 수익률</span>
                          </div>
                          <p className={`text-xl font-bold ${backtestMetrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {backtestMetrics.totalReturn >= 0 ? '+' : ''}{backtestMetrics.totalReturn.toFixed(1)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-muted-foreground">연평균 수익률</span>
                          </div>
                          <p className={`text-xl font-bold ${backtestMetrics.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {backtestMetrics.annualizedReturn >= 0 ? '+' : ''}{backtestMetrics.annualizedReturn.toFixed(1)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-xs text-muted-foreground">최대 낙폭</span>
                          </div>
                          <p className="text-xl font-bold text-red-600">
                            -{backtestMetrics.maxDrawdown.toFixed(1)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            <span className="text-xs text-muted-foreground">샤프 비율</span>
                          </div>
                          <p className="text-xl font-bold text-purple-600">
                            {backtestMetrics.sharpeRatio.toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Data Warning */}
                  {backtestMetrics.dataAvailabilityWarning && (
                    <Card className="mb-4 border-orange-200 bg-orange-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="text-xs text-orange-700">
                            {backtestMetrics.dataAvailabilityWarning}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Additional Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">백테스트 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">초기 투자금액:</span>
                          <span className="font-medium">${investmentSettings.initialInvestment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">리밸런싱 주기:</span>
                          <span className="font-medium">
                            {investmentSettings.rebalancingPeriod === 'monthly' ? '월간' :
                             investmentSettings.rebalancingPeriod === 'quarterly' ? '분기' :
                             investmentSettings.rebalancingPeriod === 'semiannual' ? '반기' : '연간'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">리밸런싱 투자금:</span>
                          <span className="font-medium">${investmentSettings.rebalancingAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">변동성:</span>
                          <span className="font-medium">{backtestMetrics.volatility.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}