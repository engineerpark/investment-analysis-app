import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Link, Newspaper, TrendingUp, Shield, RefreshCw, CheckCircle, AlertCircle, Globe, Building2, Smartphone } from 'lucide-react';

interface ExternalIntegrationsProps {
  onBack: () => void;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  isConnected: boolean;
  lastSync: string;
  status: 'connected' | 'error' | 'pending';
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  category: 'market' | 'economy' | 'crypto' | 'politics';
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
}

interface EconomicIndicator {
  name: string;
  value: number;
  unit: string;
  change: number;
  lastUpdate: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
}

export default function ExternalIntegrations({ onBack }: ExternalIntegrationsProps) {
  const [selectedTab, setSelectedTab] = useState('banking');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [lastNewsUpdate, setLastNewsUpdate] = useState<Date>(new Date());

  // 은행 계좌 연동 상태 (시뮬레이션)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: 'KB국민은행',
      accountNumber: '123-456-789012',
      accountType: '적금',
      balance: 15000000,
      isConnected: true,
      lastSync: '2시간 전',
      status: 'connected'
    },
    {
      id: '2',
      bankName: '삼성증권',
      accountNumber: '987-654-321098',
      accountType: 'CMA',
      balance: 8500000,
      isConnected: true,
      lastSync: '30분 전',
      status: 'connected'
    },
    {
      id: '3',
      bankName: '미래에셋증권',
      accountNumber: '555-777-888999',
      accountType: '위탁계좌',
      balance: 25000000,
      isConnected: false,
      lastSync: '-',
      status: 'pending'
    }
  ]);

  // 뉴스 피드 (시뮬레이션)
  const [newsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: '연준, 기준금리 동결...인플레이션 둔화 신호',
      summary: 'FOMC 회의에서 기준금리를 4.75%-5.00%로 유지하기로 결정. 파월 의장은 인플레이션이 목표치에 근접하고 있다고 발언',
      source: '연합뉴스',
      timestamp: '1시간 전',
      category: 'economy',
      sentiment: 'positive',
      relevance: 95
    },
    {
      id: '2',
      title: '비트코인, 10만 달러 돌파 후 조정...알트코인 강세',
      summary: '비트코인이 사상 최고치 경신 후 9만 8천 달러 선에서 거래 중. 이더리움과 솔라나 등 주요 알트코인은 상승세 지속',
      source: '코인데스크 코리아',
      timestamp: '2시간 전',
      category: 'crypto',
      sentiment: 'neutral',
      relevance: 88
    },
    {
      id: '3',
      title: 'NVIDIA 3분기 실적 예상치 상회...AI 수요 지속',
      summary: '엔비디아가 3분기 매출 351억 달러를 기록하며 시장 예상치를 크게 상회. 데이터센터 부문 매출이 급증하며 AI 붐 지속성 확인',
      source: '블룸버그',
      timestamp: '3시간 전',
      category: 'market',
      sentiment: 'positive',
      relevance: 92
    },
    {
      id: '4',
      title: '한국은행, 기준금리 3.25% 동결...경제성장률 전망 하향',
      summary: '한국은행이 기준금리를 3.25%로 유지하며 2025년 경제성장률 전망을 2.1%로 하향 조정. 내수 부진과 수출 둔화 우려',
      source: '매일경제',
      timestamp: '4시간 전',
      category: 'economy',
      sentiment: 'negative',
      relevance: 85
    },
    {
      id: '5',
      title: '테슬라, 완전자율주행 업데이트 발표...주가 3% 상승',
      summary: '테슬라가 FSD(Full Self-Driving) v13 업데이트를 발표하며 자율주행 기술 개선 소식에 주가 상승. 로보택시 상용화 기대감 증가',
      source: 'TechCrunch',
      timestamp: '5시간 전',
      category: 'market',
      sentiment: 'positive',
      relevance: 78
    },
    {
      id: '6',
      title: '중국 제조업 PMI 49.1...4개월 연속 위축',
      summary: '중국 제조업 구매관리자지수(PMI)가 49.1을 기록하며 경기 둔화 우려 지속. 글로벌 공급망과 무역에 미칠 영향 주목',
      source: 'Reuters',
      timestamp: '6시간 전',
      category: 'economy',
      sentiment: 'negative',
      relevance: 82
    }
  ]);

  // 경제 지표 실시간 업데이트 (시뮬레이션)
  const [economicIndicators] = useState<EconomicIndicator[]>([
    {
      name: '미국 10년 국채 수익률',
      value: 4.28,
      unit: '%',
      change: -0.03,
      lastUpdate: '실시간',
      trend: 'down',
      impact: 'high'
    },
    {
      name: 'VIX 공포지수',
      value: 16.8,
      unit: '',
      change: -1.2,
      lastUpdate: '실시간',
      trend: 'down',
      impact: 'high'
    },
    {
      name: '달러 인덱스 (DXY)',
      value: 104.2,
      unit: '',
      change: 0.3,
      lastUpdate: '실시간',
      trend: 'up',
      impact: 'medium'
    },
    {
      name: '원/달러 환율',
      value: 1380,
      unit: '원',
      change: 5,
      lastUpdate: '실시간',
      trend: 'up',
      impact: 'medium'
    },
    {
      name: 'WTI 원유',
      value: 75.8,
      unit: '$',
      change: 1.2,
      lastUpdate: '실시간',
      trend: 'up',
      impact: 'medium'
    },
    {
      name: '금 현물',
      value: 2085,
      unit: '$',
      change: -8.5,
      lastUpdate: '실시간',
      trend: 'down',
      impact: 'low'
    }
  ]);

  // 계좌 연결 처리
  const handleConnectAccount = async (accountId: string) => {
    setIsConnecting(accountId);
    
    // 시뮬레이션: 3초 후 연결 완료
    setTimeout(() => {
      setBankAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, isConnected: true, status: 'connected', lastSync: '방금 전' }
            : account
        )
      );
      setIsConnecting(null);
    }, 3000);
  };

  // 계좌 연결 해제
  const handleDisconnectAccount = (accountId: string) => {
    setBankAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, isConnected: false, status: 'pending', lastSync: '-' }
          : account
      )
    );
  };

  // 뉴스 업데이트 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setLastNewsUpdate(new Date());
    }, 30000); // 30초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 상태별 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <RefreshCw className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  // 감정별 색상
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // 카테고리별 색상
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return 'bg-blue-100 text-blue-800';
      case 'economy': return 'bg-green-100 text-green-800';
      case 'crypto': return 'bg-purple-100 text-purple-800';
      case 'politics': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 트렌드별 색상
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
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
                <h1 className="text-lg">외부 서비스 연동</h1>
              </div>

              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="banking" className="text-xs">계좌연동</TabsTrigger>
                  <TabsTrigger value="news" className="text-xs">뉴스피드</TabsTrigger>
                  <TabsTrigger value="indicators" className="text-xs">경제지표</TabsTrigger>
                </TabsList>

                {/* 계좌 연동 탭 */}
                <TabsContent value="banking" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        증권계좌 연동 (Open Banking)
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        실제 계좌와 연동하여 포트폴리오를 자동으로 동기화하세요.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {bankAccounts.filter(acc => acc.isConnected).length}
                          </div>
                          <div className="text-sm text-muted-foreground">연결된 계좌</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            ₩{bankAccounts.filter(acc => acc.isConnected).reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">총 잔액</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {bankAccounts.filter(acc => acc.lastSync !== '-').length}
                          </div>
                          <div className="text-sm text-muted-foreground">동기화됨</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 계좌 목록 */}
                  <div className="space-y-3">
                    {bankAccounts.map((account) => (
                      <Card key={account.id} className={`border-l-4 ${
                        account.status === 'connected' ? 'border-green-200' :
                        account.status === 'error' ? 'border-red-200' : 'border-yellow-200'
                      }`}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{account.bankName}</h3>
                                {getStatusIcon(account.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {account.accountNumber} ({account.accountType})
                              </p>
                              {account.isConnected && (
                                <p className="text-lg font-bold text-green-600">
                                  ₩{account.balance.toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {account.isConnected ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDisconnectAccount(account.id)}
                                >
                                  연결 해제
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleConnectAccount(account.id)}
                                  disabled={isConnecting === account.id}
                                >
                                  {isConnecting === account.id ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      연결 중...
                                    </>
                                  ) : (
                                    <>
                                      <Link className="h-4 w-4 mr-2" />
                                      연결하기
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {account.isConnected && (
                            <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-2">
                              <span>마지막 동기화: {account.lastSync}</span>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 새 계좌 추가 */}
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">새 계좌 연결</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            추가 은행이나 증권사 계좌를 연결하세요
                          </p>
                        </div>
                        <Button variant="outline">
                          <Link className="h-4 w-4 mr-2" />
                          계좌 추가하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 보안 정보 */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">보안 정보</p>
                          <p className="text-xs text-blue-700 mt-1">
                            모든 계좌 연동은 금융결제원의 오픈뱅킹 API를 통해 안전하게 처리되며, 
                            계좌 정보는 암호화되어 저장됩니다. 비밀번호나 보안카드 정보는 저장하지 않습니다.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 뉴스 피드 탭 */}
                <TabsContent value="news" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Newspaper className="h-4 w-4" />
                          투자 관련 뉴스 피드
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <RefreshCw className="h-3 w-3" />
                          {lastNewsUpdate.toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} 업데이트
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI가 큐레이션한 투자 관련 주요 뉴스를 실시간으로 받아보세요.
                      </p>
                    </CardHeader>
                  </Card>

                  {/* 뉴스 필터 */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="cursor-pointer">전체</Badge>
                        <Badge variant="outline" className="cursor-pointer">시장</Badge>
                        <Badge variant="outline" className="cursor-pointer">경제</Badge>
                        <Badge variant="outline" className="cursor-pointer">암호화폐</Badge>
                        <Badge variant="outline" className="cursor-pointer">정치</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 뉴스 목록 */}
                  <div className="space-y-3">
                    {newsItems.map((news) => (
                      <Card key={news.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getCategoryColor(news.category)}>
                              {news.category === 'market' && '시장'}
                              {news.category === 'economy' && '경제'}
                              {news.category === 'crypto' && '암호화폐'}
                              {news.category === 'politics' && '정치'}
                            </Badge>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{news.timestamp}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                news.sentiment === 'positive' ? 'bg-green-500' :
                                news.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                              }`}></div>
                            </div>
                          </div>
                          
                          <h3 className="font-medium mb-2">{news.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{news.summary}</p>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{news.source}</span>
                            <div className="flex items-center gap-2">
                              <div className="text-xs">관련도 {news.relevance}%</div>
                              <Progress value={news.relevance} className="w-16 h-1" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 뉴스 소스 설정 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">뉴스 소스 설정</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">국내 경제 뉴스</span>
                          <Badge variant="outline">활성화</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">해외 시장 뉴스</span>
                          <Badge variant="outline">활성화</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">암호화폐 뉴스</span>
                          <Badge variant="outline">활성화</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">기업 공시</span>
                          <Badge variant="secondary">비활성화</Badge>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4">
                        뉴스 설정 변경
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 경제 지표 탭 */}
                <TabsContent value="indicators" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        실시간 경제 지표
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        주요 경제 지표를 실시간으로 모니터링하고 포트폴리오에 미칠 영향을 분석합니다.
                      </p>
                    </CardHeader>
                  </Card>

                  {/* 주요 지표 대시보드 */}
                  <div className="grid grid-cols-2 gap-3">
                    {economicIndicators.map((indicator, index) => (
                      <Card key={index} className={`border-l-4 ${
                        indicator.impact === 'high' ? 'border-red-200' :
                        indicator.impact === 'medium' ? 'border-yellow-200' : 'border-green-200'
                      }`}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{indicator.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {indicator.impact === 'high' && '높음'}
                                {indicator.impact === 'medium' && '보통'}
                                {indicator.impact === 'low' && '낮음'}
                              </Badge>
                            </div>
                            
                            <div className="text-xl font-bold">
                              {indicator.value.toLocaleString()}{indicator.unit}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className={`flex items-center gap-1 text-sm ${getTrendColor(indicator.trend)}`}>
                                <TrendingUp className={`h-3 w-3 ${
                                  indicator.trend === 'down' ? 'rotate-180' : 
                                  indicator.trend === 'stable' ? 'rotate-90' : ''
                                }`} />
                                {indicator.change > 0 ? '+' : ''}{indicator.change}
                              </div>
                              <span className="text-xs text-muted-foreground">{indicator.lastUpdate}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 지표 설명 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">지표 해석 가이드</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm font-medium">높은 영향도</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            포트폴리오에 즉각적이고 큰 영향을 미칠 수 있는 지표들입니다.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm font-medium">중간 영향도</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            중장기적으로 시장에 영향을 미칠 수 있는 지표들입니다.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium">낮은 영향도</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            참고용 지표로, 간접적인 영향을 미칠 수 있습니다.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 알림 설정 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        지표 알림 설정
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">금리 변동 알림</span>
                            <p className="text-xs text-muted-foreground">0.25%p 이상 변동 시</p>
                          </div>
                          <Badge variant="outline">활성화</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">VIX 급등 알림</span>
                            <p className="text-xs text-muted-foreground">25 이상 상승 시</p>
                          </div>
                          <Badge variant="outline">활성화</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">환율 급변 알림</span>
                            <p className="text-xs text-muted-foreground">일일 2% 이상 변동</p>
                          </div>
                          <Badge variant="secondary">비활성화</Badge>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4">
                        <Smartphone className="h-4 w-4 mr-2" />
                        알림 설정 변경
                      </Button>
                    </CardContent>
                  </Card>

                  {/* API 상태 */}
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">API 연결 상태: 정상</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        모든 데이터 소스가 정상적으로 연결되어 실시간 업데이트 중입니다.
                      </p>
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