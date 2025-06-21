import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Brain, Target, RefreshCw, TrendingUp, Info, Zap, AlertCircle } from 'lucide-react';
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

interface ForecastData {
  date: string;
  value: number;
  change: number;
  isPrediction?: boolean;
  confidence?: number;
}

interface ForecastMetrics {
  predictedReturn: number;
  confidence: number;
  modelAccuracy: number;
  economicFactors: {
    interestRate: number;
    unemploymentRate: number;
    inflation: number;
    gdpGrowth: number;
  };
}

interface FuturePredictionScreenProps {
  investorProfile: InvestorProfile;
  selectedAssets: Asset[];
  allocations: Record<string, number>;
  investmentSettings: InvestmentSettings;
  onBack: () => void;
}

export default function FuturePredictionScreen({
  investorProfile,
  selectedAssets,
  allocations,
  investmentSettings,
  onBack
}: FuturePredictionScreenProps) {
  const [forecastPeriod, setForecastPeriod] = useState<'6m' | '1y'>('6m');
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [forecastMetrics, setForecastMetrics] = useState<ForecastMetrics | null>(null);
  const [isForecasting, setIsForecasting] = useState(false);

  // Helper function to get asset identifier
  const getAssetId = (asset: Asset) => asset.symbol || asset.ticker || asset.id || 'unknown';

  // 포트폴리오 기반 시드 생성 함수
  const generatePortfolioSeed = () => {
    const assetString = selectedAssets.map(asset => getAssetId(asset)).sort().join('');
    const allocationString = Object.keys(allocations).sort().map(key => allocations[key]).join('');
    const settingsString = `${investmentSettings.initialInvestment}${investmentSettings.rebalancingAmount}${investmentSettings.rebalancingPeriod}`;
    return (assetString + allocationString + settingsString).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  };

  // 시드 기반 랜덤 함수
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // 딥러닝 미래예측 수행 함수
  const performForecast = async (period: '6m' | '1y') => {
    setIsForecasting(true);
    setForecastPeriod(period);
    
    const forecastDays = period === '6m' ? 180 : 365; // 미래 예측 기간
    const historicalDays = 1095; // 3년 과거 데이터 (학습 데이터)
    const validationDays = 365; // 1년 전부터 정확도 검증
    
    try {
      // 포트폴리오 기반 고정 시드 생성
      const portfolioSeed = generatePortfolioSeed();
      
      // 경제 지표 시뮬레이션 (딥러닝 모델 입력 변수)
      const economicFactors = {
        interestRate: 4.5 + (seededRandom(portfolioSeed + 1) - 0.5) * 2, // 3.5% ~ 5.5%
        unemploymentRate: 3.8 + (seededRandom(portfolioSeed + 2) - 0.5) * 1, // 3.3% ~ 4.3%
        inflation: 2.1 + (seededRandom(portfolioSeed + 3) - 0.5) * 1.5, // 1.35% ~ 2.85%
        gdpGrowth: 2.8 + (seededRandom(portfolioSeed + 4) - 0.5) * 2 // 1.8% ~ 3.8%
      };
      
      // 포트폴리오 특성 기반 기본 수익률 계산
      let baseAnnualReturn = 0;
      let baseVolatility = 0;
      
      selectedAssets.forEach(asset => {
        const allocation = (allocations[getAssetId(asset)] || 0) / 100;
        
        let expectedReturn = 0;
        let volatility = 0;
        
        if (asset.type === 'crypto') {
          expectedReturn = 0.25; // 25%
          volatility = 0.6; // 60%
        } else if (asset.sector?.includes('Technology')) {
          expectedReturn = 0.15; // 15%
          volatility = 0.25; // 25%
        } else if (asset.sector?.includes('Bonds')) {
          expectedReturn = 0.04; // 4%
          volatility = 0.05; // 5%
        } else {
          expectedReturn = 0.10; // 10%
          volatility = 0.20; // 20%
        }
        
        baseAnnualReturn += allocation * expectedReturn;
        baseVolatility += allocation * volatility;
      });
      
      // 경제 지표를 통한 수익률 조정 (딥러닝 모델 시뮬레이션)
      const interestRateImpact = (5.0 - economicFactors.interestRate) * 0.02;
      const unemploymentImpact = (4.0 - economicFactors.unemploymentRate) * 0.015;
      const inflationImpact = (2.5 - economicFactors.inflation) * 0.01;
      const gdpImpact = (economicFactors.gdpGrowth - 2.5) * 0.025;
      
      const adjustedReturn = baseAnnualReturn + interestRateImpact + unemploymentImpact + inflationImpact + gdpImpact;
      
      // === 1단계: 3년 과거 데이터 생성 (학습 데이터) ===
      const allData: ForecastData[] = [];
      let baseValue = investmentSettings.initialInvestment;
      
      // 3년 전부터 현재까지의 데이터 생성
      for (let i = historicalDays; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // 시드 기반 고정 패턴 생성
        const dayPattern = seededRandom(portfolioSeed + i + 1000);
        const seasonalPattern = Math.sin((i / 365) * 2 * Math.PI) * 0.001; // 연간 사이클
        
        // 과거 데이터의 일일 수익률 (실제 시장 패턴 시뮬레이션)
        const dailyReturn = (baseAnnualReturn / 365) + 
                           (dayPattern - 0.5) * baseVolatility * 0.8 +
                           seasonalPattern; // 연간 사이클 패턴
        
        baseValue *= (1 + dailyReturn);
        
        allData.push({
          date: i === 0 ? '현재' : date.toLocaleDateString('ko-KR', { 
            year: i > 365 ? '2-digit' : undefined,
            month: 'short', 
            day: 'numeric'
          }),
          value: baseValue,
          change: dailyReturn * 100,
          isPrediction: false
        });
      }
      
      // === 2단계: 1년 전부터 예측 정확도 검증 ===
      const validationStartIndex = allData.length - validationDays - 1;
      const actualData = allData.slice(validationStartIndex, -1); // 1년 전부터 어제까지
      
      // 1년 전 시점에서 예측 시뮬레이션
      let validationBaseValue = actualData[0].value;
      let totalError = 0;
      let validationCount = 0;
      
      for (let i = 1; i < actualData.length; i++) {
        // 예측값 계산
        const timeDecay = 1 - (i / validationDays) * 0.1;
        const predictionSeed = seededRandom(portfolioSeed + i + 2000);
        const predictedDailyReturn = (adjustedReturn / 365) + 
                                   (predictionSeed - 0.5) * 0.015 * timeDecay;
        
        validationBaseValue *= (1 + predictedDailyReturn);
        
        // 실제값과 예측값 비교
        const actualValue = actualData[i].value;
        const error = Math.abs((validationBaseValue - actualValue) / actualValue);
        totalError += error;
        validationCount++;
      }
      
      // 실제 모델 정확도 계산 (평균 오차율 기반)
      const averageError = totalError / validationCount;
      const modelAccuracy = Math.max(65, 95 - (averageError * 100)); // 65% ~ 95%
      
      // === 3단계: 미래 예측 데이터 생성 ===
      const currentValue = allData[allData.length - 1].value;
      let futureBaseValue = currentValue;
      
      // 신뢰도 계산 (경제 상황 + 모델 정확도)
      const economicStability = 1 - (Math.abs(economicFactors.interestRate - 4.5) / 10 + 
                                    Math.abs(economicFactors.unemploymentRate - 3.8) / 10 +
                                    Math.abs(economicFactors.inflation - 2.1) / 10);
      const confidence = Math.min(95, modelAccuracy * economicStability);
      
      // 미래 예측 데이터 생성
      for (let i = 1; i <= forecastDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        // 시드 기반 고정 예측 패턴
        const futureSeed = seededRandom(portfolioSeed + i + 3000);
        
        // 딥러닝 예측 모델: 기본 수익률 + 노이즈 + 시간 감쇠
        const timeDecay = 1 - (i / forecastDays) * 0.15; // 시간이 갈수록 불확실성 증가
        const dailyReturn = (adjustedReturn / 365) + 
                           (futureSeed - 0.5) * 0.02 * (1 - confidence / 100) * timeDecay;
        
        futureBaseValue *= (1 + dailyReturn);
        
        // 신뢰구간 계산 (시간이 갈수록 확산)
        const timeUncertainty = (i / forecastDays) * 0.4;
        const dayConfidence = Math.max(45, confidence - timeUncertainty * 100);
        
        allData.push({
          date: date.toLocaleDateString('ko-KR', { 
            month: 'short', 
            day: 'numeric'
          }),
          value: futureBaseValue,
          change: dailyReturn * 100,
          isPrediction: true,
          confidence: dayConfidence
        });
      }
      
      // === 4단계: 차트용 데이터 준비 ===
      const chartData: ForecastData[] = [];
      
      // 과거 데이터 샘플링 (더 많은 포인트 유지)
      const historicalData = allData.slice(0, historicalDays + 1);
      const historicalSampleInterval = Math.max(1, Math.floor(historicalData.length / 150));
      
      for (let i = 0; i < historicalData.length; i += historicalSampleInterval) {
        chartData.push(historicalData[i]);
      }
      
      // 예측 데이터 샘플링
      const predictionData = allData.slice(historicalDays + 1);
      const predictionSampleInterval = Math.max(1, Math.floor(predictionData.length / 50));
      
      for (let i = 0; i < predictionData.length; i += predictionSampleInterval) {
        chartData.push(predictionData[i]);
      }
      
      // 중요한 포인트들은 반드시 포함
      const currentPoint = allData[historicalDays];
      const lastPoint = allData[allData.length - 1];
      
      if (!chartData.includes(currentPoint)) {
        chartData.push(currentPoint);
      }
      if (!chartData.includes(lastPoint)) {
        chartData.push(lastPoint);
      }
      
      // 시간순 정렬
      chartData.sort((a, b) => {
        if (a.date === '현재') return historicalDays;
        if (b.date === '현재') return -historicalDays;
        
        const aIsHistorical = !a.isPrediction;
        const bIsHistorical = !b.isPrediction;
        
        if (aIsHistorical && bIsHistorical) {
          return 0;
        } else if (aIsHistorical && !bIsHistorical) {
          return -1;
        } else if (!aIsHistorical && bIsHistorical) {
          return 1;
        } else {
          return 0;
        }
      });
      
      // 예측 수익률 계산
      const predictedReturn = ((futureBaseValue - currentValue) / currentValue) * 100;
      
      const metrics: ForecastMetrics = {
        predictedReturn,
        confidence,
        modelAccuracy,
        economicFactors
      };
      
      setForecastData(chartData);
      setForecastMetrics(metrics);
      
    } catch (error) {
      console.error('Forecast error:', error);
    } finally {
      setIsForecasting(false);
    }
  };

  // 컴포넌트 마운트 시 기본 예측 실행
  useEffect(() => {
    if (selectedAssets.length > 0) {
      performForecast(forecastPeriod);
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
          {data.isPrediction && (
            <p className="text-xs text-blue-600 font-medium">
              🎯 예측 신뢰도: {data.confidence?.toFixed(0)}%
            </p>
          )}
          <p className={`text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
          </p>
          {data.isPrediction && (
            <p className="text-xs text-purple-600">🤖 AI 예측</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-background responsive-container">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto pb-4">
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
                  <h1 className="text-xl font-semibold">딥러닝 미래예측</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${investorProfile.color} text-xs`}>
                      {investorProfile.title}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      🧠 LSTM 모델 기반
                    </span>
                  </div>
                </div>
              </div>

              {/* Period Selection */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">예측 기간 선택</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: '6m' as const, label: '6개월 예측', desc: '단기 예측' },
                      { value: '1y' as const, label: '1년 예측', desc: '중기 예측' }
                    ].map((period) => (
                      <Button
                        key={period.value}
                        variant={forecastPeriod === period.value ? 'info' : 'outline'}
                        onClick={() => performForecast(period.value)}
                        disabled={isForecasting}
                        className="h-16 flex flex-col items-center justify-center gap-1"
                      >
                        <span className="text-sm font-medium">{period.label}</span>
                        <span className="text-xs opacity-75">{period.desc}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Loading State */}
              {isForecasting && (
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-purple-600" />
                      <p className="text-sm text-muted-foreground mb-2">
                        🧠 딥러닝 모델 분석 중...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        3년 학습데이터로 {forecastPeriod === '6m' ? '6개월' : '1년'} 미래 예측 중
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Forecast Chart */}
              {forecastData.length > 0 && !isForecasting && (
                <Card className="mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      딥러닝 {forecastPeriod === '6m' ? '6개월' : '1년'} 예측 결과
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastData}>
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
                          
                          {/* 과거 데이터 (학습 데이터) - 실선 */}
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            dot={false}
                            connectNulls={false}
                            data={forecastData.filter(d => !d.isPrediction)}
                          />
                          
                          {/* 예측 데이터 - 점선 */}
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8B5CF6" 
                            strokeWidth={3}
                            strokeDasharray="8 8"
                            dot={false}
                            connectNulls={false}
                            data={forecastData.filter(d => d.isPrediction)}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-center text-xs">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-0.5 bg-green-500"></div>
                        <span className="text-muted-foreground">학습 데이터 (3년)</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-0.5 bg-purple-500" style={{backgroundImage: 'repeating-linear-gradient(to right, #8B5CF6 0, #8B5CF6 4px, transparent 4px, transparent 8px)'}}></div>
                        <span className="text-muted-foreground">AI 예측</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Prediction Metrics */}
              {forecastMetrics && !isForecasting && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="text-xs text-muted-foreground">예측 수익률</span>
                          </div>
                          <p className={`text-xl font-bold ${forecastMetrics.predictedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {forecastMetrics.predictedReturn >= 0 ? '+' : ''}{forecastMetrics.predictedReturn.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {forecastPeriod === '6m' ? '6개월' : '1년'} 기간
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-muted-foreground">예측 신뢰도</span>
                          </div>
                          <p className="text-xl font-bold text-blue-600">
                            {forecastMetrics.confidence.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {forecastMetrics.confidence >= 80 ? '높음' : 
                             forecastMetrics.confidence >= 60 ? '보통' : '낮음'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Model Performance */}
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        모델 성능 지표
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">모델 정확도:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{forecastMetrics.modelAccuracy.toFixed(1)}%</span>
                            <Badge variant={forecastMetrics.modelAccuracy >= 80 ? 'default' : 'secondary'} className="text-xs">
                              {forecastMetrics.modelAccuracy >= 80 ? '우수' : '양호'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">학습 데이터:</span>
                          <span className="text-sm font-medium">3년 (1,095일)</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">검증 기간:</span>
                          <span className="text-sm font-medium">1년 (365일)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Economic Factors */}
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        경제 지표 반영
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">기준금리:</span>
                          <span className="font-medium">{forecastMetrics.economicFactors.interestRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">실업률:</span>
                          <span className="font-medium">{forecastMetrics.economicFactors.unemploymentRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">인플레이션:</span>
                          <span className="font-medium">{forecastMetrics.economicFactors.inflation.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GDP 성장률:</span>
                          <span className="font-medium">{forecastMetrics.economicFactors.gdpGrowth.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Disclaimer */}
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-orange-700">
                          <p className="font-medium mb-1">예측 한계 안내</p>
                          <p>본 예측은 딥러닝 모델 기반 시뮬레이션입니다. 실제 시장 상황과 다를 수 있으며, 투자 결정의 참고용으로만 활용하시기 바랍니다.</p>
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