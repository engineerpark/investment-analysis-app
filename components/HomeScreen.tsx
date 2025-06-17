import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, PieChart, Target, Users, LogIn } from 'lucide-react';

interface HomeScreenProps {
  onStartInvestmentSurvey: () => void;
  onLogin: () => void;
}

export default function HomeScreen({ 
  onStartInvestmentSurvey, 
  onLogin
}: HomeScreenProps) {
  return (
    <div className="w-full bg-background" style={{ width: '393px', height: '852px' }}>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-8">
            <div className="w-full max-w-none mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Figma Make 투자</h1>
                <p className="text-muted-foreground">
                  AI 기반 스마트 포트폴리오 관리
                </p>
              </div>

              {/* Main Actions */}
              <div className="space-y-4 mb-8">
                <Button onClick={onStartInvestmentSurvey} variant="primary" className="w-full h-14" size="lg">
                  <PieChart className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="text-base font-medium">투자 성향 분석</div>
                    <div className="text-xs opacity-90">맞춤형 포트폴리오 추천받기</div>
                  </div>
                </Button>

                <Button onClick={onLogin} variant="secondary" className="w-full h-14" size="lg">
                  <LogIn className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="text-base font-medium">기존 포트폴리오 관리</div>
                    <div className="text-xs opacity-90">저장된 포트폴리오 확인하기</div>
                  </div>
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <h3 className="text-lg font-medium">주요 기능</h3>
                
                <div className="grid gap-3">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">AI 기반 자산 배분</h4>
                          <p className="text-xs text-muted-foreground">개인 성향에 맞는 최적 포트폴리오</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">실시간 성과 분석</h4>
                          <p className="text-xs text-muted-foreground">백테스트와 딥러닝 미래예측</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">리스크 관리</h4>
                          <p className="text-xs text-muted-foreground">VaR, 스트레스 테스트, 상관관계 분석</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Stats */}
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-primary">500+</div>
                      <div className="text-xs text-muted-foreground">지원 자산</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">98%</div>
                      <div className="text-xs text-muted-foreground">예측 정확도</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">24/7</div>
                      <div className="text-xs text-muted-foreground">실시간 모니터링</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}