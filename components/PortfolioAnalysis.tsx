import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, PieChart, BarChart3, ArrowRight, DollarSign, Plus } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { InvestorProfile } from '../App';

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

interface InvestmentSettings {
  initialInvestment: number;
  rebalancingAmount: number;
  rebalancingPeriod: string;
  exchangeRate: number;
}

interface PortfolioAnalysisProps {
  investorProfile: InvestorProfile;
  selectedAssets: Asset[];
  initialAllocations: Record<string, number>;
  onBack: () => void;
  onSave: (allocations: Record<string, number>, settings?: InvestmentSettings) => void;
}

interface SectorData {
  name: string;
  value: number;
  color: string;
}

interface AssetData {
  name: string;
  ticker: string;
  value: number;
  color: string;
  sector: string;
}

// 색상 팔레트
const SECTOR_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#64748B', // Slate
];

const ASSET_COLORS = [
  '#3B82F6', '#1D4ED8', '#2563EB', '#1E40AF',
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B',
  '#10B981', '#059669', '#047857', '#065F46',
  '#F59E0B', '#D97706', '#B45309', '#92400E',
  '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
  '#F97316', '#EA580C', '#C2410C', '#9A3412',
  '#06B6D4', '#0891B2', '#0E7490', '#155E75',
  '#84CC16', '#65A30D', '#4D7C0F', '#365314',
];

export default function PortfolioAnalysis({ 
  investorProfile, 
  selectedAssets, 
  initialAllocations, 
  onBack, 
  onSave 
}: PortfolioAnalysisProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>(initialAllocations);
  const [activeChart, setActiveChart] = useState<'sector' | 'asset'>('sector');
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [rebalancingAmount, setRebalancingAmount] = useState<number>(1000);
  const [rebalancingPeriod, setRebalancingPeriod] = useState<string>('monthly');
  const [exchangeRate, setExchangeRate] = useState<number>(1380); // USD to KRW

  // Helper function to get asset identifier (symbol or ticker)
  const getAssetId = (asset: Asset) => asset.symbol || asset.ticker || asset.id || 'unknown';

  // 비중 총합이 100%가 되도록 자동 조정
  const normalizeAllocations = (newAllocations: Record<string, number>) => {
    const total = Object.values(newAllocations).reduce((sum, value) => sum + value, 0);
    if (total === 0) return newAllocations;
    
    const normalized: Record<string, number> = {};
    Object.entries(newAllocations).forEach(([ticker, value]) => {
      normalized[ticker] = (value / total) * 100;
    });
    return normalized;
  };

  // 특정 자산의 비중 변경
  const handleAllocationChange = (ticker: string, newValue: number) => {
    const updatedAllocations = { ...allocations, [ticker]: newValue };
    setAllocations(normalizeAllocations(updatedAllocations));
  };

  // 모든 비중 균등 분배
  const handleEqualDistribution = () => {
    const equalValue = 100 / selectedAssets.length;
    const equalAllocations: Record<string, number> = {};
    selectedAssets.forEach(asset => {
      equalAllocations[getAssetId(asset)] = equalValue;
    });
    setAllocations(equalAllocations);
  };

  // 빠른 금액 추가 함수
  const handleQuickAmountAdd = (amount: number) => {
    setInitialInvestment(prev => prev + amount);
  };

  // 리밸런싱 빠른 금액 추가 함수
  const handleQuickRebalancingAdd = (amount: number) => {
    setRebalancingAmount(prev => prev + amount);
  };

  // 대시보드로 이동
  const handleGoToDashboard = () => {
    const settings: InvestmentSettings = {
      initialInvestment,
      rebalancingAmount,
      rebalancingPeriod,
      exchangeRate
    };
    onSave(allocations, settings);
  };

  // 숫자 포맷팅 (천 단위 콤마)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 원화 포맷팅
  const formatKRW = (usdAmount: number) => {
    const krwAmount = usdAmount * exchangeRate;
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(krwAmount);
  };

  // 리밸런싱 주기 옵션
  const rebalancingOptions = [
    { value: 'monthly', label: '매월' },
    { value: 'quarterly', label: '분기별 (3개월)' },
    { value: 'semiannual', label: '반기별 (6개월)' },
    { value: 'annual', label: '연간' }
  ];

  // 섹터별 데이터 계산
  const getSectorData = (): SectorData[] => {
    const sectorMap: Record<string, number> = {};
    
    selectedAssets.forEach(asset => {
      const assetId = getAssetId(asset);
      const allocation = allocations[assetId] || 0;
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

  // 자산별 데이터 계산
  const getAssetData = (): AssetData[] => {
    return selectedAssets
      .map((asset, index) => {
        const assetId = getAssetId(asset);
        return {
          name: asset.name,
          ticker: assetId,
          value: Math.round((allocations[assetId] || 0) * 100) / 100,
          color: ASSET_COLORS[index % ASSET_COLORS.length],
          sector: asset.sector
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const sectorData = getSectorData();
  const assetData = getAssetData();

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // 커스텀 레이블
  const renderLabel = (entry: any) => {
    return entry.value > 5 ? `${entry.value.toFixed(1)}%` : '';
  };

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
                  <h1 className="text-lg truncate">포트폴리오 분석</h1>
                  <Badge className={`${investorProfile.color} text-xs mt-1`}>
                    {investorProfile.title}
                  </Badge>
                </div>
              </div>

              {/* 진행 단계 표시 */}
              <div className="bg-muted rounded-lg p-3 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">단계 2/3: 비중 조정</span>
                  <span className="text-xs text-muted-foreground">다음: 포트폴리오 저장</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '66%' }}></div>
                </div>
              </div>

              {/* Chart Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={activeChart === 'sector' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveChart('sector')}
                  className="flex-1"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  섹터별
                </Button>
                <Button
                  variant={activeChart === 'asset' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveChart('asset')}
                  className="flex-1"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  종목별
                </Button>
              </div>

              {/* Pie Chart */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {activeChart === 'sector' ? '섹터별 비중' : '종목별 비중'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={activeChart === 'sector' ? sectorData : assetData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(activeChart === 'sector' ? sectorData : assetData).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {(activeChart === 'sector' ? sectorData : assetData).map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-muted-foreground flex-1 truncate">
                          {activeChart === 'asset' ? `${(entry as AssetData).ticker} - ${entry.name}` : entry.name}
                        </span>
                        <span className="text-xs font-medium">
                          {entry.value.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Allocation Controls */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">비중 조정</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEqualDistribution}
                      className="text-xs"
                    >
                      균등분배
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedAssets.map((asset) => {
                    const assetId = getAssetId(asset);
                    return (
                      <div key={asset.uniqueId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{assetId}</span>
                            <Badge variant="secondary" className="text-xs">
                              {asset.sector}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[50px] text-right">
                              {(allocations[assetId] || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Slider
                          value={[allocations[assetId] || 0]}
                          onValueChange={(value: number[]) => handleAllocationChange(assetId, value[0])}
                          max={100}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground truncate">
                          {asset.name}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Investment Settings */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">투자 설정</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      USD/KRW {exchangeRate.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 원금 투자금액 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium">원금 투자금액</label>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={initialInvestment}
                          onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)}
                          className="pl-9"
                          min="0"
                          step="100"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatKRW(initialInvestment)} (환율: {exchangeRate.toLocaleString()}원)
                      </p>
                    </div>
                    
                    {/* 빠른 금액 추가 버튼 */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">빠른 추가</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmountAdd(1000)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          $1,000
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmountAdd(10000)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          $10,000
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmountAdd(100000)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          $100,000
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 리밸런싱 설정 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">리밸런싱 설정</h4>
                    
                    {/* 리밸런싱 금액 */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">추가 투자 금액</label>
                      <div className="space-y-2">
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={rebalancingAmount}
                            onChange={(e) => setRebalancingAmount(Number(e.target.value) || 0)}
                            className="pl-9"
                            min="0"
                            step="100"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ≈ {formatKRW(rebalancingAmount)}
                        </p>
                        
                        {/* 리밸런싱 빠른 금액 추가 버튼 */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">빠른 추가</p>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickRebalancingAdd(500)}
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              $500
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickRebalancingAdd(1000)}
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              $1,000
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickRebalancingAdd(5000)}
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              $5,000
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 리밸런싱 주기 */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">리밸런싱 주기</label>
                      <Select value={rebalancingPeriod} onValueChange={setRebalancingPeriod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rebalancingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {formatCurrency(initialInvestment)}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatKRW(initialInvestment)}
                      </p>
                      <p className="text-sm text-muted-foreground">총 투자금액</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedAssets.length}</p>
                      <p className="text-sm text-muted-foreground">보유 종목</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-medium">
                        {Object.values(allocations).reduce((sum, value) => sum + value, 0).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">총 비중</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium">
                        {formatCurrency(rebalancingAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatKRW(rebalancingAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rebalancingOptions.find(opt => opt.value === rebalancingPeriod)?.label} 추가
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 추가 여백을 위한 패딩 */}
        <div className="h-20"></div>
      </div>
      
      {/* Floating Next Button */}
      <button 
        onClick={handleGoToDashboard}
        className="floating-next-button multiple-buttons"
        aria-label="다음: 대시보드 보기"
      >
        <span className="next-icon">→</span>
        <span className="next-text">다음: 대시보드</span>
      </button>
      
      {/* Floating Save Button */}
      <button 
        onClick={() => {
          const settings: InvestmentSettings = {
            initialInvestment,
            rebalancingAmount,
            rebalancingPeriod,
            exchangeRate
          };
          onSave(allocations, settings);
        }}
        className="floating-save-button multiple-buttons"
        aria-label="포트폴리오 저장"
      >
        <span className="save-icon">💾</span>
        <span className="save-text">포트폴리오 저장</span>
      </button>
    </div>
  );
}