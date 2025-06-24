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
    <div className="w-full bg-background responsive-container">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-8">
            <div className="w-full max-w-none mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">포트폴리오 전략 추천</h1>
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}