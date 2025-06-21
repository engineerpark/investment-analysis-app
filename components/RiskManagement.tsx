import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Shield, TrendingDown, AlertTriangle, Target, Activity, Zap, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import {
  analyzePortfolioVolatility,
  generateCorrelationMatrix,
  calculateVaR,
  performStressTest,
  calculateDiversificationEffect,
  type VolatilityAnalysis,
  type CorrelationMatrix,
  type VaRResult,
  type StressTestResult
} from '../utils/riskManagement';

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

interface RiskManagementProps {
  assets: Asset[];
  allocations: Record<string, number>;
  initialInvestment: number;
  onBack: () => void;
}

interface EconomicIndicator {
  name: string;
  shortName: string;
  value: number;
  unit: string;
  change: number;
  status: 'positive' | 'negative' | 'neutral';
  description: string;
}

export default function RiskManagement({
  assets,
  allocations,
  initialInvestment,
  onBack
}: RiskManagementProps) {
  const [selectedTab, setSelectedTab] = useState('volatility');
  
  // Helper function to get asset identifier (symbol or ticker)
  const getAssetId = (asset: Asset) => asset.symbol || asset.ticker || asset.id || 'unknown';

  // 현재 경제지표 데이터 (2025년 6월 15일 기준)
  const economicIndicators: EconomicIndicator[] = [
    {
      name: '미연준 기준금리',
      shortName: 'Fed Rate',
      value: 4.88,
      unit: '%',
      change: 0.0,
      status: 'neutral',
      description: '4.75-5.00% 범위'
    },
    {
      name: '인플레이션율',
      shortName: 'Inflation',
      value: 2.4,
      unit: '%',
      change: -0.1,
      status: 'positive',
      description: '전년동월대비 CPI'
    },
    {
      name: '실업률',
      shortName: 'Unemployment',
      value: 3.7,
      unit: '%',
      change: 0.1,
      status: 'negative',
      description: '계절조정 실업률'
    },
    {
      name: 'GDP 성장률',
      shortName: 'GDP Growth',
      value: 2.3,
      unit: '%',
      change: 0.2,
      status: 'positive',
      description: '연율화 성장률'
    },
    {
      name: '공포지수 (VIX)',
      shortName: 'VIX',
      value: 16.8,
      unit: '',
      change: -1.2,
      status: 'positive',
      description: '변동성 지수'
    },
    {
      name: '달러 인덱스',
      shortName: 'DXY',
      value: 104.2,
      unit: '',
      change: 0.3,
      status: 'neutral',
      description: '주요 통화 대비 달러 강도'
    }
  ];

  // 거시경제 지표와 자산 간 상관관계 계산
  const generateEconomicCorrelationMatrix = useMemo(() => {
    const economicFactors = economicIndicators.map(indicator => indicator.shortName);
    const correlations: number[][] = [];

    // 포트폴리오 기반 시드 생성 (일관된 결과를 위해)
    const generateSeed = (asset: string, factor: string): number => {
      const combined = asset + factor;
      return combined.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    };

    const seededRandom = (seed: number): number => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    assets.forEach((asset, i) => {
      correlations[i] = [];
      economicFactors.forEach((factor, j) => {
        let baseCorrelation = 0;
        
        // 자산 타입과 경제지표별 기본 상관관계 설정
        if (factor === 'Fed Rate') {
          if (asset.type === 'crypto') {
            baseCorrelation = -0.6; // 암호화폐는 금리와 음의 상관관계
          } else if (asset.sector?.includes('Technology')) {
            baseCorrelation = -0.4; // 기술주는 금리와 음의 상관관계
          } else if (asset.sector?.includes('Financial')) {
            baseCorrelation = 0.5; // 금융주는 금리와 양의 상관관계
          } else if (asset.sector?.includes('Bonds')) {
            baseCorrelation = -0.7; // 채권은 금리와 강한 음의 상관관계
          } else if (asset.sector?.includes('Real Estate')) {
            baseCorrelation = -0.5; // 부동산은 금리와 음의 상관관계
          } else {
            baseCorrelation = -0.2; // 일반 주식
          }
        } else if (factor === 'Inflation') {
          if (asset.type === 'crypto') {
            baseCorrelation = 0.3; // 암호화폐는 인플레이션 헤지
          } else if (asset.sector?.includes('Precious Metals')) {
            baseCorrelation = 0.7; // 귀금속은 인플레이션과 강한 양의 상관관계
          } else if (asset.sector?.includes('Energy')) {
            baseCorrelation = 0.6; // 에너지는 인플레이션과 양의 상관관계
          } else if (asset.sector?.includes('Bonds')) {
            baseCorrelation = -0.6; // 채권은 인플레이션과 음의 상관관계
          } else if (asset.sector?.includes('Consumer')) {
            baseCorrelation = -0.3; // 소비재는 인플레이션과 약한 음의 상관관계
          } else {
            baseCorrelation = 0.1; // 일반 주식
          }
        } else if (factor === 'Unemployment') {
          if (asset.type === 'crypto') {
            baseCorrelation = -0.2; // 암호화폐는 실업률과 약한 음의 상관관계
          } else if (asset.sector?.includes('Consumer')) {
            baseCorrelation = -0.5; // 소비재는 실업률과 음의 상관관계
          } else if (asset.sector?.includes('Technology')) {
            baseCorrelation = -0.3; // 기술주는 실업률과 음의 상관관계
          } else if (asset.sector?.includes('Healthcare')) {
            baseCorrelation = -0.1; // 헬스케어는 실업률과 약한 음의 상관관계
          } else {
            baseCorrelation = -0.25; // 일반 주식
          }
        } else if (factor === 'GDP Growth') {
          if (asset.type === 'crypto') {
            baseCorrelation = 0.4; // 암호화폐는 GDP 성장과 양의 상관관계
          } else if (asset.sector?.includes('Technology')) {
            baseCorrelation = 0.6; // 기술주는 GDP 성장과 강한 양의 상관관계
          } else if (asset.sector?.includes('Consumer')) {
            baseCorrelation = 0.5; // 소비재는 GDP 성장과 양의 상관관계
          } else if (asset.sector?.includes('Financial')) {
            baseCorrelation = 0.7; // 금융주는 GDP 성장과 강한 양의 상관관계
          } else if (asset.sector?.includes('Bonds')) {
            baseCorrelation = 0.2; // 채권은 GDP 성장과 약한 양의 상관관계
          } else {
            baseCorrelation = 0.4; // 일반 주식
          }
        } else if (factor === 'VIX') {
          if (asset.type === 'crypto') {
            baseCorrelation = 0.5; // 암호화폐는 VIX와 양의 상관관계 (변동성 높음)
          } else if (asset.sector?.includes('Technology')) {
            baseCorrelation = 0.4; // 기술주는 VIX와 양의 상관관계
          } else if (asset.sector?.includes('Bonds')) {
            baseCorrelation = -0.3; // 채권은 VIX와 음의 상관관계 (안전자산)
          } else if (asset.sector?.includes('Precious Metals')) {
            baseCorrelation = -0.2; // 귀금속은 VIX와 약한 음의 상관관계
          } else {
            baseCorrelation = 0.3; // 일반 주식
          }
        } else if (factor === 'DXY') {
          if (asset.type === 'crypto') {
            baseCorrelation = -0.4; // 암호화폐는 달러와 음의 상관관계
          } else if (asset.sector?.includes('Precious Metals')) {
            baseCorrelation = -0.6; // 귀금속은 달러와 강한 음의 상관관계
          } else if (asset.sector?.includes('Energy')) {
            baseCorrelation = -0.3; // 에너지는 달러와 음의 상관관계
          } else if (asset.sector?.includes('Technology')) {
            baseCorrelation = -0.2; // 글로벌 기술주는 달러와 약한 음의 상관관계
          } else {
            baseCorrelation = 0.1; // 미국 주식은 달러와 약한 양의 상관관계
          }
        }

        // 랜덤 변동 추가
        const assetId = getAssetId(asset);
        const seed = generateSeed(assetId, factor);
        const randomFactor = (seededRandom(seed) - 0.5) * 0.3;
        let correlation = baseCorrelation + randomFactor;
        
        // 상관관계는 -1과 1 사이의 값
        correlation = Math.max(-0.9, Math.min(0.9, correlation));
        
        correlations[i][j] = correlation;
      });
    });

    return {
      assets: assets.map(asset => getAssetId(asset)),
      economicFactors,
      correlations
    };
  }, [assets]);

  // 상관관계 매트릭스 계산
  const correlationMatrix = useMemo(() => {
    return generateCorrelationMatrix(assets);
  }, [assets]);

  // 변동성 분석
  const volatilityAnalysis = useMemo(() => {
    return analyzePortfolioVolatility(assets, allocations, correlationMatrix.correlations);
  }, [assets, allocations, correlationMatrix]);

  // VaR 계산
  const varResults = useMemo(() => {
    return calculateVaR(assets, allocations, initialInvestment, correlationMatrix.correlations);
  }, [assets, allocations, initialInvestment, correlationMatrix]);

  // 스트레스 테스트
  const stressTestResults = useMemo(() => {
    return performStressTest(assets, allocations, initialInvestment);
  }, [assets, allocations, initialInvestment]);

  // 분산 효과 분석
  const diversificationAnalysis = useMemo(() => {
    return calculateDiversificationEffect(assets, allocations);
  }, [assets, allocations]);

  // 상관관계 색상 매핑
  function getCorrelationColor(correlation: number): string {
    if (correlation > 0.5) return '#dc2626'; // 강한 양의 상관관계 - 빨강
    if (correlation > 0.2) return '#ea580c'; // 중간 양의 상관관계 - 주황
    if (correlation > -0.2) return '#65a30d'; // 약한 상관관계 - 초록
    if (correlation > -0.5) return '#2563eb'; // 중간 음의 상관관계 - 파랑
    return '#7c3aed'; // 강한 음의 상관관계 - 보라
  }

  // 리스크 등급 색상
  function getRiskColor(rating: string): string {
    switch (rating) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-orange-600';
      case 'Very High': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  }

  // 포맷팅 함수들
  const formatCurrency = (value: number) => `$${Math.abs(value).toLocaleString()}`;
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

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
                <h1 className="text-lg">리스크 관리</h1>
              </div>

              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="volatility" className="text-xs">변동성</TabsTrigger>
                  <TabsTrigger value="correlation" className="text-xs">상관관계</TabsTrigger>
                  <TabsTrigger value="var" className="text-xs">VaR</TabsTrigger>
                  <TabsTrigger value="stress" className="text-xs">스트레스</TabsTrigger>
                </TabsList>

                {/* 변동성 분석 탭 */}
                <TabsContent value="volatility" className="space-y-4">
                  {/* 포트폴리오 전체 변동성 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        포트폴리오 변동성
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {formatPercent(volatilityAnalysis.portfolioVolatility)}
                          </div>
                          <div className="text-sm text-muted-foreground">연간 변동성</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatPercent(volatilityAnalysis.diversificationBenefit)}
                          </div>
                          <div className="text-sm text-muted-foreground">분산 효과</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 자산별 변동성 기여도 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">자산별 변동성 기여도</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={volatilityAnalysis.assetVolatilities.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="asset" 
                              tick={{ fontSize: 10 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                `${value.toFixed(2)}%`,
                                name === 'volatility' ? '변동성' : '기여도'
                              ]}
                            />
                            <Bar dataKey="volatility" fill="hsl(var(--chart-1))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 자산별 상세 변동성 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">자산별 리스크 프로필</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {volatilityAnalysis.assetVolatilities.slice(0, 6).map((asset, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <span className="text-sm font-medium">{asset.asset}</span>
                                <div className="text-xs text-muted-foreground">{asset.name}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{formatPercent(asset.volatility)}</div>
                                <div className="text-xs text-muted-foreground">
                                  비중: {formatPercent(asset.allocation)}
                                </div>
                              </div>
                            </div>
                            <Progress value={asset.volatility} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 분산 효과 분석 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">분산투자 효과</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-lg font-bold">{diversificationAnalysis.effectiveAssets.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">유효 자산 수</div>
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${getRiskColor(diversificationAnalysis.concentrationRisk)}`}>
                            {diversificationAnalysis.concentrationRisk}
                          </div>
                          <div className="text-sm text-muted-foreground">집중도 위험</div>
                        </div>
                      </div>
                      
                      {diversificationAnalysis.recommendations.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">권장사항</p>
                              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                                {diversificationAnalysis.recommendations.map((rec, i) => (
                                  <li key={i}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 상관관계 분석 탭 */}
                <TabsContent value="correlation" className="space-y-4">
                  {/* 현재 거시경제 지표 현황 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">현재 거시경제 지표 (2025.06.15)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {economicIndicators.map((indicator, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">{indicator.name}</span>
                              {indicator.change !== 0 && (
                                <div className={`flex items-center gap-1 ${
                                  indicator.status === 'positive' ? 'text-green-600' : 
                                  indicator.status === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                                }`}>
                                  {indicator.status === 'positive' ? 
                                    <TrendingUp className="h-3 w-3" /> : 
                                    indicator.status === 'negative' ? 
                                    <TrendingDown className="h-3 w-3" /> : null}
                                  <span className="text-xs">
                                    {indicator.change > 0 ? '+' : ''}{indicator.change}{indicator.unit}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-lg font-bold">
                              {indicator.value.toFixed(indicator.unit === '%' ? 1 : 1)}{indicator.unit}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {indicator.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 거시경제 지표와 자산 간 상관관계 매트릭스 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">거시경제 지표와 자산 간 상관관계</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* 헤더 행 (경제지표들) */}
                        <div className="flex items-center gap-1">
                          <div className="w-16"></div>
                          <div className="flex-1 flex gap-1">
                            {generateEconomicCorrelationMatrix.economicFactors.map((factor, j) => (
                              <div key={factor} className="flex-1 text-xs text-center font-medium p-1">
                                {factor}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* 데이터 행들 */}
                        {generateEconomicCorrelationMatrix.assets.map((asset, i) => (
                          <div key={asset} className="flex items-center gap-1">
                            <div className="w-16 text-xs font-medium truncate">{asset}</div>
                            <div className="flex-1 flex gap-1">
                              {generateEconomicCorrelationMatrix.economicFactors.map((factor, j) => (
                                <div
                                  key={`${asset}-${factor}`}
                                  className="flex-1 h-8 rounded text-xs flex items-center justify-center text-white font-medium"
                                  style={{
                                    backgroundColor: getCorrelationColor(generateEconomicCorrelationMatrix.correlations[i][j]),
                                    opacity: 0.9
                                  }}
                                  title={`${asset} vs ${factor}: ${generateEconomicCorrelationMatrix.correlations[i][j].toFixed(2)}`}
                                >
                                  {generateEconomicCorrelationMatrix.correlations[i][j].toFixed(2)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* 범례 */}
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-2">상관관계 해석</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                            <span>강한 양의 상관관계 (&gt; 0.5)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ea580c' }}></div>
                            <span>중간 양의 상관관계 (0.2-0.5)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#65a30d' }}></div>
                            <span>약한 상관관계 (-0.2-0.2)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2563eb' }}></div>
                            <span>중간 음의 상관관계 (-0.5--0.2)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#7c3aed' }}></div>
                            <span>강한 음의 상관관계 (&lt; -0.5)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 상관관계 인사이트 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">주요 상관관계 분석</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {generateEconomicCorrelationMatrix.assets.map((asset, i) => 
                          generateEconomicCorrelationMatrix.economicFactors.map((factor, j) => {
                            const correlation = generateEconomicCorrelationMatrix.correlations[i][j];
                            if (Math.abs(correlation) > 0.4) {
                              return (
                                <div key={`${asset}-${factor}`} className="flex justify-between items-center p-2 bg-muted rounded">
                                  <div className="text-sm">
                                    <span className="font-medium">{asset}</span> ↔ <span className="font-medium">{factor}</span>
                                  </div>
                                  <Badge variant={correlation > 0 ? 'destructive' : 'secondary'}>
                                    {correlation > 0 ? '+' : ''}{correlation.toFixed(2)}
                                  </Badge>
                                </div>
                              );
                            }
                            return null;
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* VaR 분석 탭 */}
                <TabsContent value="var" className="space-y-4">
                  {varResults.map((varResult, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingDown className="h-4 w-4" />
                          VaR {(varResult.confidence * 100).toFixed(0)}% 신뢰구간
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                              {formatCurrency(varResult.var1Day)}
                            </div>
                            <div className="text-xs text-muted-foreground">1일 VaR</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                              {formatCurrency(varResult.var1Week)}
                            </div>
                            <div className="text-xs text-muted-foreground">1주 VaR</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                              {formatCurrency(varResult.var1Month)}
                            </div>
                            <div className="text-xs text-muted-foreground">1개월 VaR</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-700">
                              {formatCurrency(varResult.expectedShortfall)}
                            </div>
                            <div className="text-xs text-red-600">Expected Shortfall</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-700">
                              {formatCurrency(varResult.worstCase)}
                            </div>
                            <div className="text-xs text-red-600">최악의 경우</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* VaR 설명 */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">VaR (Value at Risk) 해석</p>
                          <p className="text-xs text-blue-700 mt-1">
                            95% 신뢰구간의 1일 VaR가 $1,000이라면, 정상적인 시장 상황에서 하루 동안 
                            $1,000 이상의 손실이 발생할 확률이 5%라는 의미입니다. 
                            Expected Shortfall은 VaR를 초과하는 손실의 평균값입니다.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 스트레스 테스트 탭 */}
                <TabsContent value="stress" className="space-y-4">
                  {/* 포트폴리오 회복력 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        포트폴리오 회복력
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {stressTestResults.portfolioResilience.toFixed(0)}%
                          </div>
                          <div className="text-sm text-muted-foreground">회복력 점수</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getRiskColor(stressTestResults.riskRating)}`}>
                            {stressTestResults.riskRating}
                          </div>
                          <div className="text-sm text-muted-foreground">리스크 등급</div>
                        </div>
                      </div>
                      <Progress value={stressTestResults.portfolioResilience} className="h-3" />
                    </CardContent>
                  </Card>

                  {/* 스트레스 테스트 시나리오 */}
                  <div className="space-y-3">
                    {stressTestResults.scenarios.map((scenario, index) => (
                      <Card key={index} className="border-l-4" style={{
                        borderLeftColor: scenario.result > -initialInvestment * 0.1 ? '#22c55e' :
                                         scenario.result > -initialInvestment * 0.2 ? '#eab308' :
                                         scenario.result > -initialInvestment * 0.3 ? '#f97316' : '#ef4444'
                      }}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{scenario.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-red-600">
                                {formatCurrency(scenario.result)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {((scenario.result / initialInvestment) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-xs">
                              발생 확률: {(scenario.probability * 100).toFixed(0)}%
                            </Badge>
                            <div className="flex items-center gap-1">
                              {scenario.result > -initialInvestment * 0.1 ? (
                                <Zap className="h-3 w-3 text-green-600" />
                              ) : scenario.result > -initialInvestment * 0.2 ? (
                                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {scenario.result > -initialInvestment * 0.1 ? '낮은 위험' :
                                 scenario.result > -initialInvestment * 0.2 ? '중간 위험' : '높은 위험'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 스트레스 테스트 차트 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">시나리오별 손실 분포</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stressTestResults.scenarios}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 9 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), '예상 손실']}
                            />
                            <Bar dataKey="result">
                              {stressTestResults.scenarios.map((scenario, index) => (
                                <Cell 
                                  key={`cell-${index}`}
                                  fill={scenario.result > -initialInvestment * 0.1 ? '#22c55e' :
                                        scenario.result > -initialInvestment * 0.2 ? '#eab308' :
                                        scenario.result > -initialInvestment * 0.3 ? '#f97316' : '#ef4444'}
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