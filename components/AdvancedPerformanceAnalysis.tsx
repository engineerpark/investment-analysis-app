import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Award, Target, BarChart3, Calendar, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ComposedChart, Area, AreaChart } from 'recharts';
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

  // 벤치마크 데이터
  const benchmarkData = useMemo(() => {
    return generateBenchmarkData(selectedPeriod);
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

  // 기간별 성과
  const periodPerformance = useMemo(() => {
    return calculatePeriodPerformance(
      portfolioData.map(d => ({ date: d.date, value: d.value })),
      selectedBenchmarkData.data.map(d => ({ date: d.date, value: d.value }))
    );
  }, [portfolioData, selectedBenchmarkData]);

  // 손익 구간 분석
  const drawdownPeriods = useMemo(() => {
    return analyzeDrawdownPeriods(
      portfolioData.map(d => ({ date: d.date, value: d.value }))
    );
  }, [portfolioData]);

  // 비교 차트 데이터
  const comparisonChartData = useMemo(() => {
    const portfolioNormalized = portfolioData.map((d, i) => ({
      date: d.date,
      portfolio: ((d.value / portfolioData[0].value) - 1) * 100,
      benchmark: i < selectedBenchmarkData.data.length ? 
        ((selectedBenchmarkData.data[i].value / selectedBenchmarkData.data[0].value) - 1) * 100 : null
    }));
    
    return portfolioNormalized.filter((_, i) => i % (selectedPeriod === '5y' ? 10 : selectedPeriod === '3y' ? 5 : 2) === 0);
  }, [portfolioData, selectedBenchmarkData, selectedPeriod]);

  const formatMetric = (value: number, suffix: string = '%', decimals: number = 2) => {
    return `${value.toFixed(decimals)}${suffix}`;
  };

  const getMetricColor = (value: number, isGood: boolean = true) => {
    if (value > 0) return isGood ? 'text-green-600' : 'text-red-600';
    if (value < 0) return isGood ? 'text-red-600' : 'text-green-600';
    return 'text-muted-foreground';
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
                      <CardTitle className="text-base">벤치마크 대비 누적 수익률</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={comparisonChartData}>
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
                              tickFormatter={(value) => `${value.toFixed(0)}%`}
                            />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                `${value?.toFixed(2)}%`,
                                name === 'portfolio' ? '내 포트폴리오' : selectedBenchmarkData.name
                              ]}
                              labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="portfolio" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="benchmark" 
                              stroke="hsl(var(--muted-foreground))" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
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
                          <p className="text-sm text-muted-foreground">샤프 비율</p>
                          <p className="text-lg">{formatMetric(performanceMetrics.sharpeRatio, '', 3)}</p>
                          <p className="text-xs text-muted-foreground">
                            {performanceMetrics.sharpeRatio > 1 ? '우수' : 
                             performanceMetrics.sharpeRatio > 0.5 ? '양호' : '개선 필요'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">소르티노 비율</p>
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
                          <span className="text-sm text-muted-foreground">알파 (α)</span>
                          <span className={getMetricColor(performanceMetrics.alpha)}>
                            {performanceMetrics.alpha > 0 ? '+' : ''}{formatMetric(performanceMetrics.alpha)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">베타 (β)</span>
                          <span>{formatMetric(performanceMetrics.beta, '', 3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">정보 비율</span>
                          <span>{formatMetric(performanceMetrics.informationRatio, '', 3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">트래킹 에러</span>
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
                          <span className="text-sm text-muted-foreground">최대 낙폭</span>
                          <span className="text-red-600">-{formatMetric(performanceMetrics.maxDrawdown)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">최대 상승폭</span>
                          <span className="text-green-600">+{formatMetric(performanceMetrics.maxGain)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">칼마 비율</span>
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
                          <span className="text-sm text-muted-foreground">승률</span>
                          <span className={getMetricColor(performanceMetrics.winRate - 50)}>
                            {formatMetric(performanceMetrics.winRate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">수익 팩터</span>
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
                            <Bar dataKey="portfolioReturn" fill="hsl(var(--primary))" />
                            <Bar dataKey="benchmarkReturn" fill="hsl(var(--muted-foreground))" />
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
    </div>
  );
}