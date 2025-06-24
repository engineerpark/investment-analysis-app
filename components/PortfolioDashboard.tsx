import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Save, RefreshCw } from 'lucide-react';
import { InvestorProfile } from '../App';
import { fetchMultipleAssetPrices, UniversalAsset } from '../utils/api_enhanced';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  type: "stock" | "crypto" | "etf" | "index";
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
  const [realTimeAssets, setRealTimeAssets] = useState<Asset[]>(selectedAssets);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 실시간 가격 업데이트 함수
  const updateRealTimePrices = async () => {
    if (selectedAssets.length === 0) return;
    
    setIsUpdatingPrices(true);
    try {
      const assetRequests = selectedAssets.map(asset => ({
        symbol: asset.symbol,
        type: asset.type
      }));

      const updatedPrices = await fetchMultipleAssetPrices(assetRequests);
      
      // 기존 자산 정보와 새로운 가격 정보 병합
      const updatedAssets = selectedAssets.map(asset => {
        const priceUpdate = updatedPrices.find(p => 
          p.symbol === asset.symbol && p.type === asset.type
        );
        
        if (priceUpdate) {
          return {
            ...asset,
            price: priceUpdate.price,
            change: priceUpdate.change,
            changePercent: priceUpdate.changePercent
          };
        }
        return asset;
      });

      setRealTimeAssets(updatedAssets);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('실시간 가격 업데이트 실패:', error);
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  // 컴포넌트 마운트 시 초기 가격 업데이트
  useEffect(() => {
    updateRealTimePrices();
  }, [selectedAssets]);

  // 30초마다 자동 가격 업데이트
  useEffect(() => {
    const interval = setInterval(updateRealTimePrices, 30000);
    return () => clearInterval(interval);
  }, [selectedAssets]);

  // 총 포트폴리오 가치 계산 (실시간 가격 사용)
  const totalValue = realTimeAssets.reduce((total, asset) => {
    const allocation = allocations[asset.symbol] || 0;
    return total + (allocation / 100) * investmentSettings.initialInvestment;
  }, 0);

  // 일일 변동 계산 (실시간 데이터 사용)
  const dailyChangePercent = realTimeAssets.reduce((acc, asset) => {
    const allocation = allocations[asset.symbol] || 0;
    return acc + (allocation / 100) * asset.changePercent;
  }, 0);

  const dailyChange = (dailyChangePercent / 100) * totalValue;

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
                  </div>
                </div>
                {!isPublicView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="p-2 h-8 w-8 flex-shrink-0"
                  >
                    <Save className="h-4 w-4" />
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
                      <div className={`w-2 h-2 rounded-full ${isUpdatingPrices ? 'bg-orange-500 animate-pulse' : 'bg-green-500 animate-pulse'}`} title={isUpdatingPrices ? '가격 업데이트 중...' : '실시간 가격'} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={updateRealTimePrices}
                        disabled={isUpdatingPrices}
                        className="p-1 h-6 w-6"
                        title="가격 새로고침"
                      >
                        <RefreshCw className={`h-3 w-3 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <div className="text-3xl font-bold">
                      ${totalValue.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {dailyChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm ${dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(2)} 
                        ({dailyChangePercent >= 0 ? '+' : ''}{dailyChangePercent.toFixed(2)}%)
                      </span>
                      <span className="text-xs text-muted-foreground">오늘</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Asset List */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">자산 구성</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realTimeAssets.map((asset, index) => {
                      const allocation = allocations[asset.symbol] || 0;
                      const assetValue = (allocation / 100) * investmentSettings.initialInvestment;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{asset.symbol}</span>
                              <Badge variant="outline" className="text-xs">
                                {asset.type === 'crypto' ? '암호화폐' : asset.type === 'stock' ? '주식' : 'ETF'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{asset.name}</div>
                            <div className="text-sm">
                              ${asset.price.toLocaleString()} 
                              <span className={`ml-2 ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{allocation.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">
                              ${assetValue.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={onNewPortfolio} className="w-full" size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  포트폴리오 저장
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  {onAdvancedAnalysis && (
                    <Button onClick={onAdvancedAnalysis} variant="outline">
                      고급 분석
                    </Button>
                  )}
                  {onRiskManagement && (
                    <Button onClick={onRiskManagement} variant="outline">
                      리스크 관리
                    </Button>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}