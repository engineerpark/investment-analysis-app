import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Award, Target, BarChart3, Calendar, AlertTriangle, Info, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ComposedChart, Area, AreaChart, Legend, ReferenceLine } from 'recharts';
import { 
  generateBenchmarkData, 
  calculatePerformanceMetrics, 
  calculatePeriodPerformance, 
  analyzeDrawdownPeriods,
  type BenchmarkData,
  type PerformanceMetrics,
  type PeriodPerformance,
  type DrawdownPeriod
} from '../utils/performanceAnalysis';

interface Asset {
  id?: string;
  symbol: string;
  ticker?: string; // Keep for backward compatibility
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

interface AdvancedPerformanceAnalysisProps {
  assets: Asset[];
  allocations: Record<string, number>;
  initialInvestment: number;
  onBack: () => void;
}

export default function AdvancedPerformanceAnalysis({
  assets,
  allocations,
  initialInvestment,
  onBack
}: AdvancedPerformanceAnalysisProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'1y' | '3y' | '5y'>('1y');
  const [selectedBenchmark, setSelectedBenchmark] = useState('SPY');
  const [showTermInfo, setShowTermInfo] = useState<string | null>(null);

  // Helper function to get asset identifier (symbol or ticker)
  const getAssetId = (asset: Asset) => asset.symbol || asset.ticker || asset.id || 'unknown';

  // 포트폴리오 데이터 생성 (시뮬레이션)
  const portfolioData = useMemo(() => {
    const days = selectedPeriod === '1y' ? 365 : selectedPeriod === '3y' ? 1095 : 1825;
    const data = [];
    let currentValue = initialInvestment;
    
    // 포트폴리오 기반 시드 생성
    const portfolioSeed = assets.reduce((seed, asset, index) => {
      const assetId = getAssetId(asset);
      return seed + assetId.charCodeAt(0) * (index + 1);
    }, 0);
    
    // 포트폴리오 예상 수익률 및 변동성 계산
    let expectedReturn = 0;
    let portfolioVolatility = 0;
    
    assets.forEach(asset => {
      const assetId = getAssetId(asset);
      const allocation = allocations[assetId] / 100;
      let assetReturn = 0.08; // 기본 수익률
      let assetVolatility = 0.2; // 기본 변동성
      
      if (asset.type === 'crypto') {
        assetReturn = 0.3;
        assetVolatility = 0.6;
      } else if (asset.sector === 'Technology') {
        assetReturn = 0.15;
        assetVolatility = 0.3;
      } else if (asset.sector === 'Bonds') {
        assetReturn = 0.04;
        assetVolatility = 0.05;
      }
      
      expectedReturn += allocation * assetReturn;
      portfolioVolatility += allocation * assetVolatility;
    });
    
    // 시드 고정 랜덤 생성기
    let seed = portfolioSeed;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      if (i === days) {
        data.push({
          date: date.toISOString().split('T')[0],
          value: currentValue,
          return: 0
        });
        continue;
      }
      
      // 일일 수익률 계산
      const dailyReturn = (expectedReturn / 252) + 
                         (random() - 0.5) * portfolioVolatility * 2 / Math.sqrt(252);
      
      currentValue *= (1 + dailyReturn);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: currentValue,
        return: dailyReturn * 100
      });
    }
    
    return data;
  }, [assets, allocations, initialInvestment, selectedPeriod]);

  // 벤치마크 데이터 (리밸런싱 반영)
  const benchmarkData = useMemo(() => {
    // 리밸런싱 설정 기본값 (실제 설정이 있으면 사용)
    const rebalancingAmount = 50000; // 기본 리밸런싱 금액
    const rebalancingPeriod = 'quarterly'; // 기본 리밸런싱 주기
    
    return generateBenchmarkData(selectedPeriod, rebalancingAmount, rebalancingPeriod);
  }, [selectedPeriod]);

  // 선택된 벤치마크
  const selectedBenchmarkData = useMemo(() => {
    return benchmarkData.find(b => b.ticker === selectedBenchmark) || benchmarkData[0];
  }, [benchmarkData, selectedBenchmark]);

  // 성과 지표 계산
  const performanceMetrics = useMemo(() => {
    const portfolioReturns = portfolioData.slice(1).map(d => d.return / 100);
    const benchmarkReturns = selectedBenchmarkData.data.slice(1).map(d => d.return / 100);
    return calculatePerformanceMetrics(portfolioReturns, benchmarkReturns);
  }, [portfolioData, selectedBenchmarkData]);

  // 기간별 성과 (리밸런싱 반영)
  const periodPerformance = useMemo(() => {
    // 포트폴리오 데이터에 총 투자금 정보 추가
    const portfolioDataWithInvestment = portfolioData.map((d, index) => {
      // 리밸런싱 계산 (기본 3개월마다 5만원 추가)
      const rebalancingCount = Math.floor(index / 90); // 90일마다 리밸런싱
      const totalInvested = initialInvestment + (rebalancingCount * 50000);
      
      return {
        date: d.date,
        value: d.value,
        totalInvested: totalInvested
      };
    });
    
    return calculatePeriodPerformance(
      portfolioDataWithInvestment,
      selectedBenchmarkData.data.map(d => ({ date: d.date, value: d.value }))
    );
  }, [portfolioData, selectedBenchmarkData, initialInvestment]);

  // 손익 구간 분석
  const drawdownPeriods = useMemo(() => {
    return analyzeDrawdownPeriods(
      portfolioData.map(d => ({ date: d.date, value: d.value }))
    );
  }, [portfolioData]);

  // 비교 차트 데이터 (금액 기준) + 리밸런싱 포인트
  const comparisonChartData = useMemo(() => {
    const portfolioNormalized = portfolioData.map((d, i) => {
      const benchmarkValue = i < selectedBenchmarkData.data.length ? 
        (selectedBenchmarkData.data[i].value / selectedBenchmarkData.data[0].value) * initialInvestment : null;
      
      // 리밸런싱 시점 확인 (분기별 = 90일마다)
      const isRebalancingPoint = i > 0 && i % 90 === 0;
      
      return {
        date: d.date,
        portfolio: d.value, // 실제 포트폴리오 금액
        benchmark: benchmarkValue, // 벤치마크도 동일 초기 투자금 기준
        isRebalancing: isRebalancingPoint
      };
    });
    
    return portfolioNormalized.filter((_, i) => i % (selectedPeriod === '5y' ? 10 : selectedPeriod === '3y' ? 5 : 2) === 0);
  }, [portfolioData, selectedBenchmarkData, selectedPeriod, initialInvestment]);

  // 리밸런싱 포인트 데이터
  const rebalancingPoints = comparisonChartData.filter(d => d.isRebalancing);

  const formatMetric = (value: number, suffix: string = '%', decimals: number = 2) => {
    return `${value.toFixed(decimals)}${suffix}`;
  };

  const getMetricColor = (value: number, isGood: boolean = true) => {
    if (value > 0) return isGood ? 'text-green-600' : 'text-red-600';
    if (value < 0) return isGood ? 'text-red-600' : 'text-green-600';
    return 'text-muted-foreground';
  };

  // 용어 설명 데이터
  const termExplanations: Record<string, { title: string; description: string; calculation?: string; interpretation: string }> = {
    'sharpe': {
      title: '샤프 비율 (Sharpe Ratio)',
      description: '위험 대비 수익률을 측정하는 지표입니다. 무위험 수익률을 초과하는 수익률을 변동성으로 나눈 값입니다.',
      calculation: '샤프 비율 = (포트폴리오 수익률 - 무위험 수익률) ÷ 포트폴리오 변동성',
      interpretation: '1.0 이상이면 우수, 0.5~1.0이면 양호, 0.5 미만이면 개선이 필요합니다.'
    },
    'sortino': {
      title: '소르티노 비율 (Sortino Ratio)',
      description: '하방 위험만을 고려한 위험 조정 수익률 지표입니다. 손실 변동성만을 위험으로 간주합니다.',
      calculation: '소르티노 비율 = (포트폴리오 수익률 - 무위험 수익률) ÷ 하방 변동성',
      interpretation: '샤프 비율보다 높게 나타나며, 2.0 이상이면 우수한 성과입니다.'
    },
    'alpha': {
      title: '알파 (Alpha)',
      description: '벤치마크 대비 초과 수익률을 나타냅니다. 펀드매니저의 실력을 측정하는 지표입니다.',
      calculation: '알파 = 포트폴리오 수익률 - (무위험 수익률 + 베타 × (벤치마크 수익률 - 무위험 수익률))',
      interpretation: '양수이면 벤치마크를 상회, 음수이면 벤치마크를 하회하는 성과입니다.'
    },
    'beta': {
      title: '베타 (Beta)',
      description: '시장 전체의 움직임에 대한 민감도를 나타냅니다. 시장 위험을 측정하는 지표입니다.',
      calculation: '베타 = 포트폴리오와 벤치마크의 공분산 ÷ 벤치마크의 분산',
      interpretation: '1.0이면 시장과 동일, 1.0 초과면 시장보다 변동성이 크고, 1.0 미만이면 변동성이 작습니다.'
    },
    'information': {
      title: '정보 비율 (Information Ratio)',
      description: '벤치마크 대비 초과 수익률의 일관성을 측정합니다. 액티브 운용의 효율성을 나타냅니다.',
      calculation: '정보 비율 = 초과 수익률 ÷ 트래킹 에러',
      interpretation: '0.5 이상이면 우수, 0.25~0.5이면 양호한 액티브 운용 성과입니다.'
    },
    'tracking': {
      title: '트래킹 에러 (Tracking Error)',
      description: '포트폴리오와 벤치마크 수익률 차이의 변동성입니다. 벤치마크 추종 정도를 나타냅니다.',
      calculation: '트래킹 에러 = √(Σ(포트폴리오 수익률 - 벤치마크 수익률)² ÷ n)',
      interpretation: '낮을수록 벤치마크를 잘 추종하며, 5% 미만이면 양호합니다.'
    },
    'calmar': {
      title: '칼마 비율 (Calmar Ratio)',
      description: '연간 수익률을 최대 낙폭으로 나눈 위험 조정 수익률 지표입니다.',
      calculation: '칼마 비율 = 연간 수익률 ÷ 최대 낙폭',
      interpretation: '3.0 이상이면 우수, 1.0~3.0이면 양호한 성과입니다.'
    },
    'maxDrawdown': {
      title: '최대 낙폭 (Maximum Drawdown)',
      description: '고점 대비 최대 하락률을 나타냅니다. 손실 위험의 크기를 측정합니다.',
      calculation: '최대 낙폭 = (고점 - 저점) ÷ 고점 × 100',
      interpretation: '20% 미만이면 양호, 30% 이상이면 높은 위험 수준입니다.'
    },
    'maxGain': {
      title: '최대 상승폭 (Maximum Gain)',
      description: '저점 대비 최대 상승률을 나타냅니다. 상승 잠재력을 측정합니다.',
      calculation: '최대 상승폭 = (고점 - 저점) ÷ 저점 × 100',
      interpretation: '높을수록 상승 잠재력이 크지만, 변동성도 클 가능성이 있습니다.'
    },
    'winRate': {
      title: '승률 (Win Rate)',
      description: '전체 거래 중 수익을 낸 거래의 비율입니다.',
      calculation: '승률 = 수익 거래 수 ÷ 전체 거래 수 × 100',
      interpretation: '60% 이상이면 우수, 50% 이상이면 양호한 성과입니다.'
    },
    'profitFactor': {
      title: '수익 팩터 (Profit Factor)',
      description: '총 수익과 총 손실의 비율입니다. 수익성을 나타내는 지표입니다.',
      calculation: '수익 팩터 = 총 수익 ÷ 총 손실',
      interpretation: '2.0 이상이면 우수, 1.5 이상이면 양호, 1.0 미만이면 손실입니다.'
    }
  };

  // 용어 설명 모달 컴포넌트
  const TermInfoModal = ({ termKey }: { termKey: string }) => {
    const term = termExplanations[termKey];
    if (!term) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{term.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTermInfo(null)}
              className="p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">설명</h4>
              <p className="text-sm text-gray-600">{term.description}</p>
            </div>
            {term.calculation && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">계산 방법</h4>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{term.calculation}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">해석</h4>
              <p className="text-sm text-gray-600">{term.interpretation}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-background responsive-container">
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
                <h1 className="text-lg">고급 성과 분석</h1>
              </div>

              {/* 기간 선택 */}
              <div className="flex gap-2 mb-6">
                {(['1y', '3y', '5y'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className="flex-1"
                  >
                    {period === '1y' ? '1년' : period === '3y' ? '3년' : '5년'}
                  </Button>
                ))}
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="overview" className="text-xs">개요</TabsTrigger>
                  <TabsTrigger value="metrics" className="text-xs">지표</TabsTrigger>
                  <TabsTrigger value="periods" className="text-xs">구간</TabsTrigger>
                  <TabsTrigger value="drawdown" className="text-xs">손익</TabsTrigger>
                </TabsList>

                {/* 개요 탭 */}
                <TabsContent value="overview" className="space-y-4">
                  {/* 벤치마크 선택 */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {benchmarkData.map((benchmark) => (
                      <Button
                        key={benchmark.ticker}
                        variant={selectedBenchmark === benchmark.ticker ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedBenchmark(benchmark.ticker)}
                        className="whitespace-nowrap flex-shrink-0"
                      >
                        {benchmark.name}
                      </Button>
                    ))}
                  </div>

                  {/* 벤치마크 대비 성과 비교 차트 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">포트폴리오 vs 벤치마크 자산 가치 비교 (동일 투자금 ${initialInvestment.toLocaleString()})</CardTitle>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-[#2563eb]"></div>
                            <span>내 포트폴리오</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-[#ef4444]" style={{borderTop: '1px dashed #ef4444'}}></div>
                            <span>{selectedBenchmarkData.name}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return selectedPeriod === '5y' ? 
                                  `${date.getFullYear()}` : 
                                  `${date.getMonth() + 1}월`;
                              }}
                            />
                            <YAxis 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                            />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                value ? `$${value.toLocaleString()}` : 'N/A',
                                name === 'portfolio' ? '내 포트폴리오' : `${selectedBenchmarkData.name} (벤치마크)`
                              ]}
                              labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                            />
                            
                            {/* 리밸런싱 시점 표시 */}
                            {rebalancingPoints.map((point, index) => (
                              <ReferenceLine 
                                key={`rebalance-${index}`}
                                x={point.date} 
                                stroke="#fbbf24" 
                                strokeDasharray="2 2"
                                strokeWidth={1}
                                label={{ 
                                  value: "리밸런싱", 
                                  position: "top",
                                  fontSize: 8,
                                  fill: "#f59e0b"
                                }}
                              />
                            ))}
                            
                            <Line 
                              type="monotone" 
                              dataKey="portfolio" 
                              stroke="#2563eb" 
                              strokeWidth={3}
                              dot={false}
                              name="portfolio"
                              connectNulls={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="benchmark" 
                              stroke="#ef4444" 
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={false}
                              name="benchmark"
                              connectNulls={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        노란색 점선: 분기별 리밸런싱 시점 | 파란색 실선: 내 포트폴리오 | 빨간색 점선: {selectedBenchmarkData.name}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 기본 성과 비교 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">성과 비교</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">내 포트폴리오</p>
                          <p className="text-lg">
                            <span className={getMetricColor(portfolioData[portfolioData.length - 1].value - initialInvestment)}>
                              {formatMetric((portfolioData[portfolioData.length - 1].value / initialInvestment - 1) * 100)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              (리밸런싱 반영)
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{selectedBenchmarkData.name}</p>
                          <p className="text-lg">
                            <span className={getMetricColor(selectedBenchmarkData.totalReturn)}>
                              {formatMetric(selectedBenchmarkData.totalReturn)}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">초과 수익률</span>
                          <span className={`text-sm ${getMetricColor(performanceMetrics.alpha)}`}>
                            {performanceMetrics.alpha > 0 ? '+' : ''}
                            {formatMetric(performanceMetrics.alpha)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            (리밸런싱 조정)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 고급 지표 탭 */}
                <TabsContent value="metrics" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        위험 조정 수익률
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="text-sm text-muted-foreground">샤프 비율</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('sharpe')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <p className="text-lg">{formatMetric(performanceMetrics.sharpeRatio, '', 3)}</p>
                          <p className="text-xs text-muted-foreground">
                            {performanceMetrics.sharpeRatio > 1 ? '우수' : 
                             performanceMetrics.sharpeRatio > 0.5 ? '양호' : '개선 필요'}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="text-sm text-muted-foreground">소르티노 비율</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('sortino')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <p className="text-lg">{formatMetric(performanceMetrics.sortinoRatio, '', 3)}</p>
                          <p className="text-xs text-muted-foreground">하방 위험 기준</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        벤치마크 대비 지표
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">알파 (α)</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('alpha')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <span className={getMetricColor(performanceMetrics.alpha)}>
                            {performanceMetrics.alpha > 0 ? '+' : ''}{formatMetric(performanceMetrics.alpha)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">베타 (β)</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('beta')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <span>{formatMetric(performanceMetrics.beta, '', 3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">정보 비율</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('information')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <span>{formatMetric(performanceMetrics.informationRatio, '', 3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">트래킹 에러</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('tracking')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <span>{formatMetric(performanceMetrics.trackingError)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">위험 지표</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">최대 낙폭</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('maxDrawdown')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <span className="text-red-600">-{formatMetric(performanceMetrics.maxDrawdown)}</span>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">최대 상승폭</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('maxGain')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <span className="text-green-600">+{formatMetric(performanceMetrics.maxGain)}</span>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">칼마 비율</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('calmar')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <span>{formatMetric(performanceMetrics.calmarRatio, '', 3)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">거래 성과</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">승률</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('winRate')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <span className={getMetricColor(performanceMetrics.winRate - 50)}>
                            {formatMetric(performanceMetrics.winRate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">수익 팩터</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTermInfo('profitFactor')}
                              className="p-0 h-4 w-4"
                            >
                              <Info className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          <span className={getMetricColor(performanceMetrics.profitFactor - 1)}>
                            {formatMetric(performanceMetrics.profitFactor, '', 2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 기간별 성과 탭 */}
                <TabsContent value="periods" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        기간별 성과 분석
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {periodPerformance.slice(0, 8).map((period, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium w-16">{period.period}</span>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {period.portfolioReturn > 0 ? '+' : ''}{formatMetric(period.portfolioReturn, '', 1)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">vs</span>
                                <Badge variant="secondary" className="text-xs">
                                  {period.benchmarkReturn > 0 ? '+' : ''}{formatMetric(period.benchmarkReturn, '', 1)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm ${getMetricColor(period.alpha)}`}>
                                {period.alpha > 0 ? '+' : ''}{formatMetric(period.alpha, '', 1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 기간별 성과 차트 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">분기별 수익률 비교</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={periodPerformance.filter(p => p.period.includes('Q')).slice(-8)}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                `${value.toFixed(1)}%`,
                                name === 'portfolioReturn' ? '포트폴리오' : '벤치마크'
                              ]}
                            />
                            <Bar dataKey="portfolioReturn" fill="#2563eb" name="포트폴리오" />
                            <Bar dataKey="benchmarkReturn" fill="#ef4444" name="벤치마크" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 손익 구간 분석 탭 */}
                <TabsContent value="drawdown" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        주요 손실 구간
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {drawdownPeriods.slice(0, 5).map((drawdown, index) => (
                          <div key={index} className="p-3 border border-border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">#{index + 1} 손실 구간</span>
                              <span className="text-red-600">-{formatMetric(drawdown.maxDrawdown)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>기간: {new Date(drawdown.startDate).toLocaleDateString('ko-KR')} ~ {new Date(drawdown.endDate).toLocaleDateString('ko-KR')}</div>
                              <div>지속: {drawdown.duration}일</div>
                              <div className="flex items-center gap-2">
                                회복: 
                                {drawdown.recovery ? (
                                  <Badge variant="secondary" className="text-xs">완료</Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">진행중</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 손익 분포 차트 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">일일 수익률 분포</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={[
                              { range: '-5%~', count: portfolioData.filter(d => d.return <= -5).length },
                              { range: '-3%~-5%', count: portfolioData.filter(d => d.return > -5 && d.return <= -3).length },
                              { range: '-1%~-3%', count: portfolioData.filter(d => d.return > -3 && d.return <= -1).length },
                              { range: '-1%~1%', count: portfolioData.filter(d => d.return > -1 && d.return <= 1).length },
                              { range: '1%~3%', count: portfolioData.filter(d => d.return > 1 && d.return <= 3).length },
                              { range: '3%~5%', count: portfolioData.filter(d => d.return > 3 && d.return <= 5).length },
                              { range: '5%~', count: portfolioData.filter(d => d.return > 5).length }
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count">
                              {[
                                { range: '-5%~', count: portfolioData.filter(d => d.return <= -5).length },
                                { range: '-3%~-5%', count: portfolioData.filter(d => d.return > -5 && d.return <= -3).length },
                                { range: '-1%~-3%', count: portfolioData.filter(d => d.return > -3 && d.return <= -1).length },
                                { range: '-1%~1%', count: portfolioData.filter(d => d.return > -1 && d.return <= 1).length },
                                { range: '1%~3%', count: portfolioData.filter(d => d.return > 1 && d.return <= 3).length },
                                { range: '3%~5%', count: portfolioData.filter(d => d.return > 3 && d.return <= 5).length },
                                { range: '5%~', count: portfolioData.filter(d => d.return > 5).length }
                              ].map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={index < 3 ? 'hsl(var(--destructive))' : 
                                        index === 3 ? 'hsl(var(--muted-foreground))' : 
                                        'hsl(var(--primary))'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      {/* 용어 설명 모달 */}
      {showTermInfo && <TermInfoModal termKey={showTermInfo} />}
    </div>
  );
}