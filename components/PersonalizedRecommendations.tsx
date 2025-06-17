import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Brain, Target, TrendingUp, Users, Calendar, Lightbulb, Star, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface PersonalizedRecommendationsProps {
  onBack: () => void;
  investorProfile?: {
    type: string;
    title: string;
    description: string;
    characteristics: string[];
    color: string;
  };
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'optimization' | 'strategy' | 'lifecycle';
  priority: 'high' | 'medium' | 'low';
  impact: number;
  difficulty: string;
  timeframe: string;
  category: string;
}

interface LifecycleStage {
  stage: string;
  age: string;
  goals: string[];
  allocation: {
    stocks: number;
    bonds: number;
    alternatives: number;
    cash: number;
  };
  keyStrategies: string[];
  considerations: string[];
}

export default function PersonalizedRecommendations({ 
  onBack, 
  investorProfile 
}: PersonalizedRecommendationsProps) {
  const [selectedTab, setSelectedTab] = useState('ai-optimization');
  const [selectedLifecycleStage, setSelectedLifecycleStage] = useState<LifecycleStage | null>(null);

  // AI 기반 포트폴리오 최적화 추천
  const aiRecommendations: Recommendation[] = [
    {
      id: '1',
      title: '지역별 분산 투자 최적화',
      description: '현재 미국 주식에 과도하게 집중되어 있습니다. 유럽과 신흥국 ETF 추가로 지역 분산을 개선할 수 있습니다.',
      type: 'optimization',
      priority: 'high',
      impact: 85,
      difficulty: '쉬움',
      timeframe: '즉시 적용 가능',
      category: '분산투자'
    },
    {
      id: '2',
      title: '섹터 집중도 위험 완화',
      description: '기술 섹터 비중이 35%로 높습니다. 헬스케어, 금융 섹터 추가로 섹터 리스크를 분산하세요.',
      type: 'optimization',
      priority: 'high',
      impact: 78,
      difficulty: '보통',
      timeframe: '1-2주',
      category: '리스크 관리'
    },
    {
      id: '3',
      title: '리밸런싱 주기 최적화',
      description: '현재 월별 리밸런싱이 설정되어 있지만, 분기별로 변경 시 거래비용을 줄이면서 비슷한 성과를 얻을 수 있습니다.',
      type: 'optimization',
      priority: 'medium',
      impact: 62,
      difficulty: '쉬움',
      timeframe: '즉시 적용 가능',
      category: '비용 최적화'
    },
    {
      id: '4',
      title: '인플레이션 헤지 자산 추가',
      description: '현재 경제 환경을 고려할 때 TIPS나 원자재 ETF 추가로 인플레이션 위험을 헤지하는 것을 권장합니다.',
      type: 'optimization',
      priority: 'medium',
      impact: 71,
      difficulty: '보통',
      timeframe: '2-4주',
      category: '경제 대응'
    },
    {
      id: '5',
      title: 'ESG 점수 개선',
      description: '지속가능투자에 관심이 있으시다면, 현재 포트폴리오의 ESG 점수를 B에서 A로 개선할 수 있는 방안을 제안합니다.',
      type: 'optimization',
      priority: 'low',
      impact: 45,
      difficulty: '보통',
      timeframe: '1-3개월',
      category: 'ESG'
    }
  ];

  // 위험성향별 맞춤 전략
  const riskBasedStrategies = [
    {
      profile: '보수적 투자자',
      description: '안정적인 수익을 추구하며 원금 손실을 최소화하려는 투자자',
      allocation: { stocks: 30, bonds: 60, alternatives: 5, cash: 5 },
      strategies: [
        '고등급 회사채와 국채 중심의 채권 포트폴리오',
        '배당수익률이 높은 우량 대형주 투자',
        '월지급식 배당 ETF로 현금흐름 확보',
        '원금보장형 ELS 상품 일부 활용'
      ],
      keyPoints: [
        '연간 목표 수익률: 4-6%',
        '최대 손실 한도: 5% 이내',
        '리밸런싱 주기: 반기별',
        '추천 자산: 미국 국채, 투자등급 회사채, 배당주'
      ],
      color: 'bg-green-50 border-green-200'
    },
    {
      profile: '균형 추구 투자자',
      description: '적정한 위험을 감수하여 꾸준한 성장을 추구하는 투자자',
      allocation: { stocks: 60, bonds: 30, alternatives: 7, cash: 3 },
      strategies: [
        '주식 60%, 채권 40%의 균형 포트폴리오',
        '글로벌 분산투자로 지역 리스크 완화',
        'REIT와 원자재로 대안투자 비중 확보',
        '시장 상황에 따른 전술적 자산배분 활용'
      ],
      keyPoints: [
        '연간 목표 수익률: 6-8%',
        '최대 손실 한도: 15% 이내',
        '리밸런싱 주기: 분기별',
        '추천 자산: S&P 500, 글로벌 채권, REIT'
      ],
      color: 'bg-blue-50 border-blue-200'
    },
    {
      profile: '적극적 투자자',
      description: '높은 수익을 위해 상당한 위험을 감수할 수 있는 투자자',
      allocation: { stocks: 80, bonds: 10, alternatives: 8, cash: 2 },
      strategies: [
        '성장주와 가치주의 균형잡힌 조합',
        '신흥국 시장과 소형주로 추가 수익 추구',
        '섹터별 순환투자 전략 활용',
        '레버리지 ETF 소량 활용으로 수익 확대'
      ],
      keyPoints: [
        '연간 목표 수익률: 8-12%',
        '최대 손실 한도: 25% 이내',
        '리밸런싱 주기: 월별',
        '추천 자산: 성장주, 신흥국 ETF, 섹터 ETF'
      ],
      color: 'bg-orange-50 border-orange-200'
    },
    {
      profile: '공격적 투자자',
      description: '높은 변동성을 감수하고 최대 수익을 추구하는 투자자',
      allocation: { stocks: 90, bonds: 0, alternatives: 10, cash: 0 },
      strategies: [
        '고성장 기술주와 바이오 주식 중점 투자',
        '암호화폐와 대안투자로 포트폴리오 다각화',
        '옵션 전략으로 추가 수익 창출',
        '개별 종목 선택을 통한 알파 추구'
      ],
      keyPoints: [
        '연간 목표 수익률: 12%+',
        '최대 손실 한도: 40% 이내',
        '리밸런싱 주기: 주간/월별',
        '추천 자산: 성장주, 암호화폐, 벤처투자'
      ],
      color: 'bg-red-50 border-red-200'
    }
  ];

  // 생애주기별 자산 배분 가이드
  const lifecycleStages: LifecycleStage[] = [
    {
      stage: '사회초년생 (20대)',
      age: '20-29세',
      goals: ['자산 형성의 기초 마련', '투자 습관 형성', '비상금 마련'],
      allocation: { stocks: 80, bonds: 10, alternatives: 5, cash: 5 },
      keyStrategies: [
        '소액 정기적립투자로 시작',
        '인덱스 펀드 중심의 분산투자',
        '급여의 20-30% 저축/투자',
        '비상금 3-6개월분 확보'
      ],
      considerations: [
        '높은 위험감수능력 활용',
        '장기 투자 관점 유지',
        '투자 지식 습득에 투자',
        '과도한 레버리지 피하기'
      ]
    },
    {
      stage: '자산형성기 (30대)',
      age: '30-39세',
      goals: ['주택구입 자금 마련', '결혼/육아 자금', '본격적인 자산 증식'],
      allocation: { stocks: 70, bonds: 20, alternatives: 7, cash: 3 },
      keyStrategies: [
        '목적별 투자 계좌 분리 운용',
        '주택구입 자금은 안전자산 위주',
        '장기 은퇴자금은 적극적 투자',
        '세제혜택 계좌 적극 활용'
      ],
      considerations: [
        '라이프 이벤트 자금 계획',
        '보험을 통한 리스크 관리',
        '투자 목적의 명확한 구분',
        '현금흐름 관리의 중요성'
      ]
    },
    {
      stage: '자산증식기 (40대)',
      age: '40-49세',
      goals: ['자녀 교육비 준비', '은퇴 준비 본격화', '자산 규모 확대'],
      allocation: { stocks: 60, bonds: 30, alternatives: 8, cash: 2 },
      keyStrategies: [
        '교육비와 은퇴자금의 균형',
        '다양한 자산군으로 분산투자',
        '세금 효율적인 투자 전략',
        '부동산 투자 검토'
      ],
      considerations: [
        '교육비 인플레이션 대비',
        '은퇴 목표 구체화',
        '투자 리스크 점진적 축소',
        '상속/증여 계획 수립'
      ]
    },
    {
      stage: '은퇴준비기 (50대)',
      age: '50-59세',
      goals: ['은퇴자금 최종 점검', '안정적 소득원 확보', '상속 계획'],
      allocation: { stocks: 50, bonds: 40, alternatives: 8, cash: 2 },
      keyStrategies: [
        '캐치업 기여금 활용',
        '배당 중심의 소득 창출',
        '연금보험 상품 검토',
        '부채 축소 계획'
      ],
      considerations: [
        '은퇴자금 부족분 점검',
        '헬스케어 비용 대비',
        '시장 변동성 관리',
        '연금 수령 전략 계획'
      ]
    },
    {
      stage: '은퇴기 (60대 이상)',
      age: '60세 이상',
      goals: ['안정적인 연금 수령', '의료비 대비', '상속 재산 관리'],
      allocation: { stocks: 30, bonds: 60, alternatives: 5, cash: 5 },
      keyStrategies: [
        '버킷 전략으로 현금흐름 관리',
        '인플레이션 대응 자산 유지',
        '세금 효율적인 인출 전략',
        '유동성 확보에 중점'
      ],
      considerations: [
        '장수 리스크 대비',
        '의료비 증가 대응',
        '상속세 최소화 방안',
        '인지능력 저하 대비책'
      ]
    }
  ];

  // 우선순위별 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 우선순위별 텍스트
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '일반';
    }
  };

  // 파이 차트 색상
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

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
                <h1 className="text-lg">개인화된 추천</h1>
              </div>

              {/* 현재 투자자 프로필 표시 */}
              {investorProfile && (
                <Card className="mb-6">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${investorProfile.color} flex items-center justify-center`}>
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{investorProfile.title}</h3>
                        <p className="text-sm text-muted-foreground">{investorProfile.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="ai-optimization" className="text-xs">AI 최적화</TabsTrigger>
                  <TabsTrigger value="risk-strategy" className="text-xs">성향별 전략</TabsTrigger>
                  <TabsTrigger value="lifecycle" className="text-xs">생애주기</TabsTrigger>
                </TabsList>

                {/* AI 최적화 추천 탭 */}
                <TabsContent value="ai-optimization" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        AI 기반 포트폴리오 최적화
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        머신러닝 분석을 통해 발견된 포트폴리오 개선 기회입니다.
                      </p>
                    </CardHeader>
                  </Card>

                  {aiRecommendations.map((rec) => (
                    <Card key={rec.id} className="border-l-4 border-blue-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-base">{rec.title}</CardTitle>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {getPriorityText(rec.priority)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-green-600">{rec.impact}%</div>
                            <div className="text-xs text-muted-foreground">예상 개선도</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-sm font-medium">난이도</div>
                            <div className="text-xs text-muted-foreground">{rec.difficulty}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">적용 시점</div>
                            <div className="text-xs text-muted-foreground">{rec.timeframe}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">카테고리</div>
                            <div className="text-xs text-muted-foreground">{rec.category}</div>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-4" variant="outline">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          상세 분석 보기
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* 위험성향별 전략 탭 */}
                <TabsContent value="risk-strategy" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        위험성향별 맞춤 투자 전략
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        투자자의 위험 감수 능력에 따른 최적 전략을 제안합니다.
                      </p>
                    </CardHeader>
                  </Card>

                  {riskBasedStrategies.map((strategy, index) => (
                    <Card key={index} className={strategy.color}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{strategy.profile}</CardTitle>
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 자산 배분 차트 */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">권장 자산 배분</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="h-32">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      { name: '주식', value: strategy.allocation.stocks },
                                      { name: '채권', value: strategy.allocation.bonds },
                                      { name: '대안투자', value: strategy.allocation.alternatives },
                                      { name: '현금', value: strategy.allocation.cash }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={50}
                                    dataKey="value"
                                  >
                                    {COLORS.map((color, i) => (
                                      <Cell key={`cell-${i}`} fill={color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                  <span className="text-sm">주식</span>
                                </div>
                                <span className="text-sm font-medium">{strategy.allocation.stocks}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                  <span className="text-sm">채권</span>
                                </div>
                                <span className="text-sm font-medium">{strategy.allocation.bonds}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                  <span className="text-sm">대안투자</span>
                                </div>
                                <span className="text-sm font-medium">{strategy.allocation.alternatives}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                  <span className="text-sm">현금</span>
                                </div>
                                <span className="text-sm font-medium">{strategy.allocation.cash}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 투자 전략 */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">핵심 투자 전략</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {strategy.strategies.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 주요 포인트 */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">주요 포인트</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {strategy.keyPoints.map((point, i) => (
                              <div key={i} className="text-xs bg-background/50 p-2 rounded border">
                                {point}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button variant="outline" className="w-full">
                          <Star className="h-4 w-4 mr-2" />
                          이 전략 적용하기
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* 생애주기별 가이드 탭 */}
                <TabsContent value="lifecycle" className="space-y-4">
                  {selectedLifecycleStage ? (
                    // 생애주기 상세 화면
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLifecycleStage(null)}
                          className="p-2 h-8 w-8 flex-shrink-0"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">생애주기 가이드로 돌아가기</span>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">{selectedLifecycleStage.stage}</CardTitle>
                          <p className="text-sm text-muted-foreground">{selectedLifecycleStage.age}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* 주요 목표 */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">주요 재정 목표</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {selectedLifecycleStage.goals.map((goal, i) => (
                                <li key={i}>• {goal}</li>
                              ))}
                            </ul>
                          </div>

                          {/* 권장 자산 배분 */}
                          <div>
                            <h4 className="text-sm font-medium mb-3">권장 자산 배분</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={[
                                        { name: '주식', value: selectedLifecycleStage.allocation.stocks },
                                        { name: '채권', value: selectedLifecycleStage.allocation.bonds },
                                        { name: '대안투자', value: selectedLifecycleStage.allocation.alternatives },
                                        { name: '현금', value: selectedLifecycleStage.allocation.cash }
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={50}
                                      dataKey="value"
                                    >
                                      {COLORS.map((color, i) => (
                                        <Cell key={`cell-${i}`} fill={color} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm">주식</span>
                                  </div>
                                  <span className="text-sm font-medium">{selectedLifecycleStage.allocation.stocks}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-sm">채권</span>
                                  </div>
                                  <span className="text-sm font-medium">{selectedLifecycleStage.allocation.bonds}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm">대안투자</span>
                                  </div>
                                  <span className="text-sm font-medium">{selectedLifecycleStage.allocation.alternatives}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm">현금</span>
                                  </div>
                                  <span className="text-sm font-medium">{selectedLifecycleStage.allocation.cash}%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 핵심 전략 */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">핵심 투자 전략</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {selectedLifecycleStage.keyStrategies.map((strategy, i) => (
                                <li key={i}>• {strategy}</li>
                              ))}
                            </ul>
                          </div>

                          {/* 주요 고려사항 */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">주요 고려사항</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {selectedLifecycleStage.considerations.map((consideration, i) => (
                                <li key={i}>• {consideration}</li>
                              ))}
                            </ul>
                          </div>

                          <Button className="w-full" variant="success">
                            <Zap className="h-4 w-4 mr-2" />
                            이 가이드 적용하기
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // 생애주기 목록
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            생애주기별 자산 배분 가이드
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            나이와 인생 단계에 따른 최적의 투자 전략을 확인하세요.
                          </p>
                        </CardHeader>
                      </Card>

                      {lifecycleStages.map((stage, index) => (
                        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="pt-4" onClick={() => setSelectedLifecycleStage(stage)}>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-medium">{stage.stage}</h3>
                                <p className="text-sm text-muted-foreground">{stage.age}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">주식 {stage.allocation.stocks}%</div>
                                <div className="text-xs text-muted-foreground">채권 {stage.allocation.bonds}%</div>
                              </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              <p>주요 목표: {stage.goals[0]}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}