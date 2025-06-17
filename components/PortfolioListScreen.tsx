import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Users, Star, Heart, BookOpen, Brain, Link } from 'lucide-react';

interface SavedPortfolio {
  id: string;
  name: string;
  investorProfile: {
    type: string;
    title: string;
    description: string;
    characteristics: string[];
    color: string;
  };
  assets: any[];
  allocations: Record<string, number>;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  createdDate: string;
  author?: {
    name: string;
    isVerified?: boolean;
  };
  followers?: number;
  likes?: number;
}

interface PortfolioListScreenProps {
  onBack: () => void;
  onCreateNew: () => void;
  onViewPortfolio: (portfolio: SavedPortfolio) => void;
  currentUserPortfolios: SavedPortfolio[];
  onEducationCenter?: () => void;
  onPersonalizedRecommendations?: () => void;
  onExternalIntegrations?: () => void;
}

export default function PortfolioListScreen({ 
  onBack, 
  onCreateNew, 
  onViewPortfolio, 
  currentUserPortfolios,
  onEducationCenter,
  onPersonalizedRecommendations,
  onExternalIntegrations
}: PortfolioListScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'my' | 'public'>('my');

  // 다른 사용자들의 공개 포트폴리오 (예시 데이터)
  const publicPortfolios: SavedPortfolio[] = [
    {
      id: 'public-1',
      name: '2024 성장주 집중 투자',
      investorProfile: {
        type: 'growth',
        title: '성장 추구형',
        description: '높은 성장 잠재력을 가진 기업에 투자',
        characteristics: [],
        color: 'bg-green-600'
      },
      assets: [],
      allocations: {},
      totalValue: 50000,
      dailyChange: 1250,
      dailyChangePercent: 2.56,
      createdDate: '2024-12-10',
      author: {
        name: '김투자',
        isVerified: true
      },
      followers: 1250,
      likes: 89
    },
    {
      id: 'public-2',
      name: 'ESG 지속가능 포트폴리오',
      investorProfile: {
        type: 'esg',
        title: 'ESG 투자형',
        description: '환경과 사회적 가치를 중시하는 투자',
        characteristics: [],
        color: 'bg-emerald-600'
      },
      assets: [],
      allocations: {},
      totalValue: 30000,
      dailyChange: -450,
      dailyChangePercent: -1.48,
      createdDate: '2024-12-08',
      author: {
        name: '박지속',
        isVerified: false
      },
      followers: 867,
      likes: 56
    },
    {
      id: 'public-3',
      name: '방어적 배당주 전략',
      investorProfile: {
        type: 'dividend',
        title: '배당 선호형',
        description: '안정적인 배당 수익을 추구',
        characteristics: [],
        color: 'bg-blue-600'
      },
      assets: [],
      allocations: {},
      totalValue: 75000,
      dailyChange: 380,
      dailyChangePercent: 0.51,
      createdDate: '2024-12-05',
      author: {
        name: '이안정',
        isVerified: true
      },
      followers: 2100,
      likes: 143
    },
    {
      id: 'public-4',
      name: '암호화폐 & 혁신기술',
      investorProfile: {
        type: 'crypto',
        title: '혁신 투자형',
        description: '새로운 기술과 디지털 자산에 투자',
        characteristics: [],
        color: 'bg-purple-600'
      },
      assets: [],
      allocations: {},
      totalValue: 25000,
      dailyChange: 2100,
      dailyChangePercent: 9.17,
      createdDate: '2024-12-12',
      author: {
        name: '최크립토',
        isVerified: false
      },
      followers: 456,
      likes: 78
    }
  ];

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString()}`;
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
                <h1 className="text-lg">포트폴리오 둘러보기</h1>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setSelectedTab('my')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    selectedTab === 'my'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  내 포트폴리오
                </button>
                <button
                  onClick={() => setSelectedTab('public')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    selectedTab === 'public'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  인기 포트폴리오
                </button>
              </div>

              {selectedTab === 'my' ? (
                <div className="space-y-4">
                  {/* Create New Portfolio Button */}
                  <Card className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors" onClick={onCreateNew}>
                    <CardContent className="pt-6 text-center">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                          <Plus className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">새 포트폴리오 만들기</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            투자 성향 분석부터 시작하세요
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User's Portfolios */}
                  {currentUserPortfolios.length > 0 ? (
                    currentUserPortfolios.map((portfolio) => (
                      <Card key={portfolio.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewPortfolio(portfolio)}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{portfolio.name}</h3>
                              <Badge className={`${portfolio.investorProfile.color} text-white text-xs mb-2`}>
                                {portfolio.investorProfile.title}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                생성일: {portfolio.createdDate}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {formatCurrency(portfolio.totalValue)}
                              </div>
                              <div className={`text-sm ${portfolio.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {portfolio.dailyChange >= 0 ? '+' : ''}{formatCurrency(portfolio.dailyChange)}
                                ({portfolio.dailyChangePercent >= 0 ? '+' : ''}{portfolio.dailyChangePercent.toFixed(2)}%)
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="text-center py-8">
                      <CardContent>
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <TrendingUp className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">아직 포트폴리오가 없습니다</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                              첫 번째 포트폴리오를 만들어보세요
                            </p>
                          </div>
                          <Button onClick={onCreateNew} className="mt-4">
                            포트폴리오 만들기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Popular Portfolios */}
                  {publicPortfolios.map((portfolio) => (
                    <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{portfolio.name}</h3>
                              {portfolio.author?.isVerified && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <Badge className={`${portfolio.investorProfile.color} text-white text-xs mb-2`}>
                              {portfolio.investorProfile.title}
                            </Badge>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {portfolio.author?.name}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {portfolio.followers?.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {portfolio.likes}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {formatCurrency(portfolio.totalValue)}
                            </div>
                            <div className={`text-sm flex items-center gap-1 ${portfolio.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {portfolio.dailyChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {portfolio.dailyChangePercent >= 0 ? '+' : ''}{portfolio.dailyChangePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="w-full"
                            onClick={() => onViewPortfolio(portfolio)}
                          >
                            포트폴리오 보기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* 추가 서비스 섹션 */}
              <div className="space-y-3 mt-8 mb-4">
                <h3 className="text-lg font-medium">추가 서비스</h3>
                
                <div className="grid gap-3">
                  {onEducationCenter && (
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onEducationCenter}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">투자 교육 센터</h4>
                            <p className="text-xs text-muted-foreground">포트폴리오 이론부터 실전 전략까지</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {onPersonalizedRecommendations && (
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onPersonalizedRecommendations}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                            <Brain className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">개인화된 추천</h4>
                            <p className="text-xs text-muted-foreground">AI가 제안하는 맞춤형 투자 전략</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {onExternalIntegrations && (
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onExternalIntegrations}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Link className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">외부 서비스 연동</h4>
                            <p className="text-xs text-muted-foreground">계좌 연동, 뉴스 피드, 경제 지표</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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