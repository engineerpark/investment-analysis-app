import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { InvestorProfile } from '../App';

interface Question {
  id: number;
  question: string;
  options: { text: string; score: number }[];
}

interface InvestmentSurveyProps {
  onComplete: (profile: InvestorProfile) => void;
  onBack?: () => void;
}

const questions: Question[] = [
  {
    id: 1,
    question: "투자 가능 기간은 어느 정도입니까?",
    options: [
      { text: "1년 이내", score: 1 },
      { text: "1-3년", score: 2 },
      { text: "3-7년", score: 3 },
      { text: "7년 이상", score: 4 }
    ]
  },
  {
    id: 2,
    question: "원금 손실을 어느 정도까지 감수할 수 있습니까?",
    options: [
      { text: "원금 보장 필수", score: 1 },
      { text: "10% 이내 손실 가능", score: 2 },
      { text: "20-30% 손실 감수 가능", score: 3 },
      { text: "50% 이상 손실도 감수 가능", score: 4 }
    ]
  },
  {
    id: 3,
    question: "투자 경험과 지식 수준은 어느 정도입니까?",
    options: [
      { text: "투자 경험 없음", score: 1 },
      { text: "예적금, 펀드 경험", score: 2 },
      { text: "주식 투자 경험 있음", score: 3 },
      { text: "다양한 투자 상품 경험", score: 4 }
    ]
  },
  {
    id: 4,
    question: "목표 수익률은 어느 정도입니까?",
    options: [
      { text: "연 3-5% (안정적)", score: 1 },
      { text: "연 5-10% (보수적)", score: 2 },
      { text: "연 10-20% (중간)", score: 3 },
      { text: "연 20% 이상 (공격적)", score: 4 }
    ]
  },
  {
    id: 5,
    question: "투자 손실 시 어떻게 대응하시겠습니까?",
    options: [
      { text: "즉시 손절매", score: 1 },
      { text: "추가 하락 방지를 위해 매도", score: 2 },
      { text: "시장 회복을 기다림", score: 3 },
      { text: "추가 매수 검토", score: 4 }
    ]
  }
];

const investorProfiles: Record<string, InvestorProfile> = {
  'very-conservative': {
    type: "very-conservative",
    title: "매우 보수적 투자자",
    description: "절대적 안정성을 추구하며 원금 보장을 최우선으로 하는 투자자입니다.",
    characteristics: [
      "원금 보장 절대 중시",
      "최소한의 위험만 감수",
      "예금, 국채 위주 투자",
      "안정적 배당 수익 선호"
    ],
    color: "bg-slate-100 text-slate-800"
  },
  conservative: {
    type: "conservative",
    title: "보수적 투자자",
    description: "안정성을 중시하며 낮은 위험을 감수할 수 있는 투자자입니다.",
    characteristics: [
      "낮은 위험, 낮은 수익 추구",
      "우량주, 배당주 선호",
      "장기적 안정성 중시",
      "채권, 리츠 투자 적합"
    ],
    color: "bg-blue-100 text-blue-800"
  },
  moderate: {
    type: "moderate",
    title: "중립적 투자자",
    description: "적당한 위험을 감수하며 균형잡힌 포트폴리오를 선호하는 투자자입니다.",
    characteristics: [
      "중간 수준의 위험과 수익",
      "분산 투자 선호",
      "주식과 채권의 균형",
      "펀드, ETF 투자 적합"
    ],
    color: "bg-green-100 text-green-800"
  },
  aggressive: {
    type: "aggressive",
    title: "공격적 투자자",
    description: "높은 수익을 위해 높은 위험을 감수할 수 있는 투자자입니다.",
    characteristics: [
      "높은 위험, 높은 수익 추구",
      "변동성에 대한 높은 내성",
      "성장주 투자 선호",
      "개별 주식, 신흥시장 적합"
    ],
    color: "bg-orange-100 text-orange-800"
  },
  'very-aggressive': {
    type: "very-aggressive",
    title: "매우 공격적 투자자",
    description: "극도로 높은 수익을 추구하며 큰 손실도 감수할 수 있는 투자자입니다.",
    characteristics: [
      "극고위험, 극고수익 추구",
      "변동성을 기회로 활용",
      "투기적 투자 감행",
      "코인, 파생상품 선호"
    ],
    color: "bg-red-100 text-red-800"
  }
};

export default function InvestmentSurvey({ onComplete, onBack }: InvestmentSurveyProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (score: number) => {
    setSelectedOption(score);
    
    // 답변 저장
    const newAnswers = { ...answers, [questions[currentQuestion].id]: score };
    setAnswers(newAnswers);
    
    // 약간의 지연을 주어 선택 상태를 보여준 후 다음 질문으로 이동
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[questions[currentQuestion - 1].id] || null);
    }
  };

  const calculateResult = (): InvestorProfile => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / questions.length;

    if (averageScore <= 1.5) {
      return investorProfiles['very-conservative'];
    } else if (averageScore <= 2.0) {
      return investorProfiles.conservative;
    } else if (averageScore <= 2.5) {
      return investorProfiles.moderate;
    } else if (averageScore <= 3.5) {
      return investorProfiles.aggressive;
    } else {
      return investorProfiles['very-aggressive'];
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleViewPortfolio = () => {
    const result = calculateResult();
    onComplete(result);
  };

  // 기본 포트폴리오로 바로 이동하는 함수
  const handleSkipToPortfolio = () => {
    // 중립적 투자자로 기본 설정
    const defaultProfile = investorProfiles.moderate;
    onComplete(defaultProfile);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResult) {
    const result = calculateResult();
    return (
      <div className="w-full min-h-screen bg-background flex flex-col responsive-container">
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="w-full max-w-none mx-auto">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xl">✓</span>
                </div>
                <h1 className="text-xl">분석 완료!</h1>
              </div>

              <Card className="w-full">
                <CardHeader className="text-center pb-4">
                  <Badge className={`${result.color} w-fit mx-auto`}>
                    {result.title}
                  </Badge>
                  <CardTitle className="text-lg">{result.description}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="mb-2">투자 성향 특징</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {result.characteristics.map((characteristic, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span className="flex-1">{characteristic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button 
                  onClick={handleViewPortfolio}
                  variant="success"
                  className="w-full h-12"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  다음: 포트폴리오 추천
                </Button>
                <Button 
                  onClick={handleRestart}
                  variant="outline"
                  className="w-full h-12"
                >
                  다시 테스트하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background flex flex-col responsive-container">
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="w-full max-w-none mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {onBack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <h1 className="text-lg">투자 성향 분석</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 mb-6">
              <CardHeader>
                <CardTitle className="text-base leading-6">
                  {questions[currentQuestion].question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* 4지선다를 1열로 배치 */}
                <div className="grid grid-cols-1 gap-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.score)}
                      className={`w-full p-4 text-left border rounded-lg transition-colors ${
                        selectedOption === option.score
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-sm">{option.text}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="space-y-3">
              {currentQuestion > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="w-full h-12"
                >
                  이전
                </Button>
              )}
              
              {/* 첫 번째 질문에서 건너뛰기 버튼 표시 */}
              {currentQuestion === 0 && (
                <Button
                  variant="info"
                  onClick={handleSkipToPortfolio}
                  className="w-full h-12"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  테스트 건너뛰고 포트폴리오 보기
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}