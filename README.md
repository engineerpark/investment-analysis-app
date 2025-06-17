# 투자 포트폴리오 분석 앱

AI 기반 투자 포트폴리오 추천, 백테스팅, 미래예측을 제공하는 웹 애플리케이션입니다.

## 🌐 라이브 데모

### GitHub Pages 배포
**🔗 https://engineerpark.github.io/investment-analysis-app/**

### Vercel 배포 (추천)
Vercel에서 이 GitHub 저장소를 연결하여 자동 배포하세요:
1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub에서 `investment-analysis-app` 저장소 선택
4. 자동으로 배포됩니다

## 🚀 주요 기능

### ✅ 완료된 기능
- **🎯 투자 성향 분석**: 개인 맞춤형 투자 프로필 생성
- **📊 포트폴리오 추천**: AI 기반 자산 배분 추천
- **⚖️ 비중 조정**: 인터랙티브 슬라이더로 포트폴리오 비중 조정
- **📈 백테스팅**: 1/3/5/10년 기간별 포트폴리오 성과 분석
- **🔮 AI 미래예측**: 딥러닝 LSTM 모델 기반 수익률 예측
- **💾 포트폴리오 저장**: 개인 포트폴리오 관리
- **🎨 직관적 UI**: Semantic 색상 시스템 (파란색=주요, 초록색=성공, 빨간색=위험)

### 🎯 핵심 특징
1. **기본 포트폴리오 자동 선택**: 투자자 성향별 디폴트 자산 배치
2. **백테스팅 전용 화면**: 시계열 그래프 + 리밸런싱 마커 표시
3. **미래예측 화면**: 학습 데이터(실선) vs 예측 데이터(점선) 구분
4. **테스트 플로우**: `/test-flow.html`에서 모든 기능 검증 가능

## 🛠 기술 스택

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Charts**: Recharts
- **Build**: Next.js Static Export
- **Deployment**: GitHub Pages, Vercel

## 📱 화면 구성

### 1. 홈 화면
- 투자 성향 분석 시작
- 기존 포트폴리오 로그인

### 2. 투자 성향 설문
- 5가지 질문으로 투자 성향 분석
- 보수적/균형/성장/초고위험 4가지 프로필

### 3. 포트폴리오 추천
- **NEW**: 성향별 기본 자산 자동 선택
- 실시간 자산 검색 및 추가
- 비중 조정하기 또는 바로 저장

### 4. 비중 조정
- 인터랙티브 슬라이더
- 실시간 배분 비율 계산
- 포트폴리오 저장

### 5. 포트폴리오 대시보드
- 총 포트폴리오 가치 및 일일 변동
- 최근 30일 성과 차트
- **NEW**: 백테스팅 버튼
- **NEW**: AI 미래예측 버튼

### 6. 백테스팅 화면 ⭐
- 1/3/5/10년 기간 선택
- 시계열 그래프 with 리밸런싱 마커
- 총 수익률, 연평균 수익률, 최대 낙폭, 샤프 비율

### 7. AI 미래예측 화면 ⭐
- 6개월/1년 예측 기간 선택
- 3년 학습 데이터 (실선) + 예측 데이터 (점선)
- 예측 신뢰도, 모델 정확도, 경제 지표 반영

## 🚀 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/engineerpark/investment-analysis-app.git
cd investment-analysis-app

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 열기
open http://localhost:3000
```

## 📦 빌드 및 배포

```bash
# 정적 빌드 생성
npm run build

# 로컬에서 빌드 확인
npm run start
```

## 🧪 테스트

전체 기능 테스트는 `/test-flow.html`에서 확인할 수 있습니다:
- http://localhost:3000/test-flow.html (로컬)
- https://engineerpark.github.io/investment-analysis-app/test-flow.html (배포)

## 📁 프로젝트 구조

```
investment-analysis-app/
├── components/
│   ├── ui/                    # UI 컴포넌트
│   ├── HomeScreen.tsx         # 홈 화면
│   ├── InvestmentSurvey.tsx   # 투자 성향 설문
│   ├── PortfolioRecommendation.tsx  # 포트폴리오 추천
│   ├── PortfolioAnalysis.tsx  # 비중 조정
│   ├── PortfolioDashboard.tsx # 포트폴리오 대시보드
│   ├── BacktestingScreen.tsx  # 🆕 백테스팅 화면
│   └── FuturePredictionScreen.tsx  # 🆕 미래예측 화면
├── pages/
│   ├── _app.tsx              # App 설정
│   └── index.tsx             # 메인 페이지
├── public/
│   └── test-flow.html        # 🆕 기능 테스트 페이지
├── utils/
│   └── api_enhanced.ts       # API 유틸리티
└── types/
    └── common.ts             # 타입 정의
```

## 🎨 UI/UX 특징

### Semantic 버튼 색상 시스템
- **Primary (파란색)**: 주요 액션 버튼
- **Success (초록색)**: 긍정적 액션 (저장, 다음 단계)
- **Danger (빨간색)**: 위험한 액션 (삭제)
- **Warning (주황색)**: 주의 액션 (경고)
- **Info (하늘색)**: 정보성 액션 (미래예측)
- **Analysis (보라색)**: 분석 관련 액션 (백테스팅)

### 모바일 최적화
- 393px × 852px 모바일 뷰포트 최적화
- 터치 친화적 버튼 크기 (44px 이상)
- 스크롤 영역과 고정 버튼 분리

## 🤖 AI 기능

### 백테스팅 시뮬레이션
- 포트폴리오별 고정 시드 생성으로 일관된 결과
- 자산 타입별 차별화된 수익률 모델
- 리밸런싱 주기별 추가 투자 반영

### 딥러닝 미래예측
- LSTM 모델 시뮬레이션
- 경제 지표 반영 (금리, 실업률, 인플레이션, GDP)
- 시간 감쇠를 고려한 신뢰도 계산

## 📄 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

---

**🧪 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**