import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, BookOpen, TrendingUp, Shield, Search, Play, Award, Clock, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface EducationCenterProps {
  onBack: () => void;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  rating: number;
  lessons: number;
  category: string;
}

interface Glossary {
  term: string;
  definition: string;
  category: string;
  example?: string;
}

export default function EducationCenter({ onBack }: EducationCenterProps) {
  const [selectedTab, setSelectedTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 교육 과정 데이터
  const courses: Course[] = [
    {
      id: '1',
      title: '포트폴리오 이론의 기초',
      description: '해리 마코위츠의 현대 포트폴리오 이론부터 효율적 투자선까지 체계적으로 학습합니다.',
      duration: '2시간 30분',
      difficulty: 'beginner',
      progress: 75,
      rating: 4.8,
      lessons: 8,
      category: 'theory'
    },
    {
      id: '2',
      title: '자산 배분 전략 마스터하기',
      description: '전략적 자산 배분과 전술적 자산 배분의 차이점과 실무 적용법을 배웁니다.',
      duration: '3시간 15분',
      difficulty: 'intermediate',
      progress: 45,
      rating: 4.9,
      lessons: 12,
      category: 'strategy'
    },
    {
      id: '3',
      title: '시장 위기 상황별 대응 전략',
      description: '2008 금융위기, 2020 팬데믹 등 과거 사례를 통해 위기 대응법을 학습합니다.',
      duration: '2시간 45분',
      difficulty: 'advanced',
      progress: 0,
      rating: 4.7,
      lessons: 10,
      category: 'crisis'
    },
    {
      id: '4',
      title: '리스크 관리와 VaR 이해하기',
      description: 'Value at Risk, 스트레스 테스트 등 리스크 관리 도구들의 실무 활용법을 배웁니다.',
      duration: '4시간 20분',
      difficulty: 'advanced',
      progress: 20,
      rating: 4.6,
      lessons: 15,
      category: 'risk'
    },
    {
      id: '5',
      title: 'ESG 투자와 지속가능 포트폴리오',
      description: '환경, 사회, 지배구조를 고려한 ESG 투자 전략과 포트폴리오 구성법을 학습합니다.',
      duration: '1시간 50분',
      difficulty: 'intermediate',
      progress: 0,
      rating: 4.5,
      lessons: 7,
      category: 'esg'
    },
    {
      id: '6',
      title: '행동재무학과 투자 심리',
      description: '투자자의 인지편향과 심리적 함정들을 이해하고 극복하는 방법을 배웁니다.',
      duration: '2시간 10분',
      difficulty: 'beginner',
      progress: 0,
      rating: 4.7,
      lessons: 9,
      category: 'psychology'
    }
  ];

  // 용어사전 데이터
  const glossary: Glossary[] = [
    {
      term: '알파 (Alpha)',
      definition: '시장 대비 초과 수익률을 나타내는 지표. 포트폴리오 매니저의 실력을 평가하는 중요한 척도입니다.',
      category: '성과지표',
      example: '알파가 2%라면 시장 대비 연간 2% 초과 수익을 얻었다는 의미입니다.'
    },
    {
      term: '베타 (Beta)',
      definition: '시장 전체의 움직임에 대한 개별 자산의 민감도를 나타내는 지표입니다.',
      category: '위험지표',
      example: '베타가 1.2라면 시장이 10% 상승할 때 해당 자산은 12% 상승할 가능성이 높습니다.'
    },
    {
      term: '샤프 비율 (Sharpe Ratio)',
      definition: '위험 조정 수익률을 측정하는 지표로, 단위 위험당 얻는 초과 수익률을 나타냅니다.',
      category: '성과지표',
      example: '샤프 비율이 높을수록 같은 위험 대비 더 높은 수익을 얻었다는 의미입니다.'
    },
    {
      term: 'VaR (Value at Risk)',
      definition: '특정 신뢰구간과 기간 하에서 예상되는 최대 손실 금액을 나타내는 위험 측정 도구입니다.',
      category: '위험관리',
      example: '95% 신뢰구간의 1일 VaR이 100만원이라면, 20일 중 1일은 100만원 이상 손실이 발생할 수 있습니다.'
    },
    {
      term: '상관관계 (Correlation)',
      definition: '두 자산 가격의 움직임이 얼마나 비슷한지를 나타내는 지표로, -1부터 1까지의 값을 가집니다.',
      category: '포트폴리오',
      example: '상관관계가 0.8이면 강한 양의 상관관계로, 한 자산이 오르면 다른 자산도 오를 가능성이 높습니다.'
    },
    {
      term: '분산투자 (Diversification)',
      definition: '위험을 줄이기 위해 여러 자산에 투자를 분산하는 투자 전략입니다.',
      category: '투자전략',
      example: '주식, 채권, 부동산 등 서로 다른 자산군에 투자하여 리스크를 분산시킵니다.'
    },
    {
      term: '리밸런싱 (Rebalancing)',
      definition: '목표 자산 배분 비율을 유지하기 위해 주기적으로 포트폴리오를 조정하는 과정입니다.',
      category: '포트폴리오',
      example: '주식 60%, 채권 40% 목표 비율이 70%, 30%로 변했을 때 원래 비율로 조정합니다.'
    },
    {
      term: 'ESG 투자',
      definition: '환경(Environmental), 사회(Social), 지배구조(Governance) 요소를 고려한 투자 방식입니다.',
      category: '투자전략',
      example: '친환경 기업, 사회적 책임을 다하는 기업에 우선적으로 투자합니다.'
    },
    {
      term: '최대낙폭 (Maximum Drawdown)',
      definition: '특정 기간 동안 포트폴리오 가치가 최고점에서 최저점까지 하락한 최대 폭을 나타냅니다.',
      category: '위험지표',
      example: '포트폴리오 가치가 1000만원에서 800만원까지 떨어졌다면 최대낙폭은 20%입니다.'
    },
    {
      term: '변동성 (Volatility)',
      definition: '자산 가격의 변동 정도를 나타내는 지표로, 높을수록 위험이 크다고 볼 수 있습니다.',
      category: '위험지표',
      example: '연간 변동성이 20%인 자산은 1년 후 가격이 ±20% 범위 내에서 움직일 확률이 68%입니다.'
    }
  ];

  // 시장 상황별 대응 전략
  const marketScenarios = [
    {
      situation: '강세장 (Bull Market)',
      characteristics: ['지속적인 상승 추세', '경제 성장', '투자 심리 긍정적'],
      strategy: ['성장주 비중 확대', '위험 자산 비중 증가', '수익 실현 타이밍 고려'],
      warning: '과도한 낙관론에 주의하고 리스크 관리를 소홀히 하지 않도록 주의',
      color: 'bg-green-50 border-green-200'
    },
    {
      situation: '약세장 (Bear Market)',
      characteristics: ['지속적인 하락 추세', '경제 침체', '투자 심리 부정적'],
      strategy: ['안전 자산 비중 확대', '현금 보유 비율 증가', '분할 매수 전략 고려'],
      warning: '패닉 매도를 피하고 장기적 관점을 유지하는 것이 중요',
      color: 'bg-red-50 border-red-200'
    },
    {
      situation: '횡보장 (Sideways Market)',
      characteristics: ['특정 범위 내 등락', '방향성 부재', '변동성 확대'],
      strategy: ['섹터 순환 투자', '배당주 비중 확대', '옵션 전략 활용'],
      warning: '거래 비용 증가에 주의하고 인내심을 갖고 기다리는 것이 필요',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      situation: '고변동성 시장',
      characteristics: ['급격한 가격 변동', '불확실성 증가', '뉴스에 민감한 반응'],
      strategy: ['포트폴리오 리밸런싱 빈도 증가', 'VaR 모니터링 강화', '헤지 전략 고려'],
      warning: '감정적 판단을 피하고 사전에 정한 투자 원칙을 고수하는 것이 중요',
      color: 'bg-purple-50 border-purple-200'
    }
  ];

  // 필터링된 과정
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 필터링된 용어사전
  const filteredGlossary = glossary.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 난이도별 색상
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 난이도별 텍스트
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return '일반';
    }
  };

  // 학습 진행률 데이터
  const progressData = [
    { category: '포트폴리오 이론', completed: 3, total: 5 },
    { category: '리스크 관리', completed: 2, total: 4 },
    { category: '자산 배분', completed: 1, total: 3 },
    { category: '행동재무학', completed: 0, total: 2 }
  ];

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
                <h1 className="text-lg">투자 교육 센터</h1>
              </div>

              {/* 검색 바 */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="강의나 용어를 검색하세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="courses" className="text-xs">강의</TabsTrigger>
                  <TabsTrigger value="strategy" className="text-xs">전략</TabsTrigger>
                  <TabsTrigger value="glossary" className="text-xs">용어사전</TabsTrigger>
                  <TabsTrigger value="progress" className="text-xs">진도</TabsTrigger>
                </TabsList>

                {/* 강의 탭 */}
                <TabsContent value="courses" className="space-y-4">
                  {selectedCourse ? (
                    // 강의 상세 화면
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCourse(null)}
                          className="p-2 h-8 w-8 flex-shrink-0"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">강의로 돌아가기</span>
                      </div>

                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base mb-2">{selectedCourse.title}</CardTitle>
                              <p className="text-sm text-muted-foreground mb-3">{selectedCourse.description}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {selectedCourse.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Play className="h-3 w-3" />
                                  {selectedCourse.lessons}개 강의
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {selectedCourse.rating}
                                </div>
                              </div>
                            </div>
                            <Badge className={getDifficultyColor(selectedCourse.difficulty)}>
                              {getDifficultyText(selectedCourse.difficulty)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">진행률</span>
                                <span className="text-sm text-muted-foreground">{selectedCourse.progress}%</span>
                              </div>
                              <Progress value={selectedCourse.progress} className="h-2" />
                            </div>
                            
                            <Button className="w-full" variant="primary">
                              <Play className="h-4 w-4 mr-2" />
                              {selectedCourse.progress > 0 ? '학습 계속하기' : '학습 시작하기'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 강의 목차 (예시) */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">강의 목차</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Array.from({ length: selectedCourse.lessons }, (_, i) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                    i < Math.floor(selectedCourse.lessons * selectedCourse.progress / 100)
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {i + 1}
                                  </div>
                                  <span className="text-sm">
                                    {selectedCourse.category === 'theory' && i === 0 && '포트폴리오 이론의 역사'}
                                    {selectedCourse.category === 'theory' && i === 1 && '위험과 수익률의 관계'}
                                    {selectedCourse.category === 'theory' && i === 2 && '효율적 투자선 이해하기'}
                                    {selectedCourse.category === 'strategy' && i === 0 && '전략적 vs 전술적 자산배분'}
                                    {selectedCourse.category === 'strategy' && i === 1 && '글로벌 자산 배분'}
                                    {selectedCourse.category === 'crisis' && i === 0 && '2008 금융위기 분석'}
                                    {!['theory', 'strategy', 'crisis'].includes(selectedCourse.category) && `강의 ${i + 1}`}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {Math.floor(Math.random() * 20) + 10}분
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // 강의 목록
                    <div className="space-y-4">
                      {filteredCourses.map((course) => (
                        <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="pt-4" onClick={() => setSelectedCourse(course)}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-medium mb-1">{course.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {course.duration}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Play className="h-3 w-3" />
                                    {course.lessons}개 강의
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {course.rating}
                                  </div>
                                </div>
                              </div>
                              <Badge className={getDifficultyColor(course.difficulty)}>
                                {getDifficultyText(course.difficulty)}
                              </Badge>
                            </div>
                            
                            {course.progress > 0 && (
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">진행률</span>
                                  <span className="text-xs text-muted-foreground">{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-1" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* 시장 상황별 전략 탭 */}
                <TabsContent value="strategy" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">시장 상황별 대응 전략</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        다양한 시장 환경에서의 투자 전략과 대응 방법을 학습하세요.
                      </p>
                    </CardHeader>
                  </Card>

                  {marketScenarios.map((scenario, index) => (
                    <Card key={index} className={`border-l-4 ${scenario.color}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{scenario.situation}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">주요 특징</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {scenario.characteristics.map((char, i) => (
                              <li key={i}>• {char}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">추천 전략</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {scenario.strategy.map((strategy, i) => (
                              <li key={i}>• {strategy}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">주의사항</p>
                              <p className="text-xs text-muted-foreground mt-1">{scenario.warning}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* 용어사전 탭 */}
                <TabsContent value="glossary" className="space-y-4">
                  <div className="space-y-3">
                    {filteredGlossary.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium">{item.term}</h3>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.definition}</p>
                          {item.example && (
                            <div className="p-2 bg-muted/50 rounded text-xs">
                              <span className="font-medium">예시: </span>
                              {item.example}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* 학습 진도 탭 */}
                <TabsContent value="progress" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        나의 학습 현황
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">6</div>
                          <div className="text-sm text-muted-foreground">완료한 강의</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">75%</div>
                          <div className="text-sm text-muted-foreground">평균 이해도</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">카테고리별 진행률</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="category" 
                              tick={{ fontSize: 10 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                value,
                                name === 'completed' ? '완료' : '전체'
                              ]}
                            />
                            <Bar dataKey="completed" fill="hsl(var(--chart-1))" />
                            <Bar dataKey="total" fill="hsl(var(--muted))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">최근 학습 활동</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">포트폴리오 이론의 기초 - 7강 완료</p>
                            <p className="text-xs text-muted-foreground">2시간 전</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">자산 배분 전략 - 5강 학습 중</p>
                            <p className="text-xs text-muted-foreground">어제</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">리스크 관리 - 퀴즈 80점</p>
                            <p className="text-xs text-muted-foreground">3일 전</p>
                          </div>
                        </div>
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