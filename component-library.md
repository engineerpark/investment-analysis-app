# 컴포넌트 라이브러리 스펙

## 🔄 네비게이션 컴포넌트

### BackButton (뒤로가기 버튼)
```tsx
interface BackButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'icon' | 'text' | 'combined';
  disabled?: boolean;
}

// 용도: 모든 화면에서 이전 단계로 돌아가기
// 위치: 화면 상단 좌측
// 스타일: 아이콘 + 텍스트 조합
```

### NextButton (다음 단계 버튼)
```tsx
interface NextButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

// 용도: 다음 단계로 진행
// 위치: 화면 하단 고정
// 스타일: 전체 너비, 강조 색상
```

### ProgressIndicator (진행 표시기)
```tsx
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

// 용도: 현재 진행 단계 표시
// 위치: 화면 상단
// 스타일: 도트 또는 바 형태
```

## 🔍 검색 및 선택 컴포넌트

### UniversalSearch (통합 검색)
```tsx
interface UniversalSearchProps {
  onSearch: (query: string) => void;
  placeholder: string;
  loading?: boolean;
  results: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
}

interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'etf';
  price: number;
  change: number;
  changePercent: number;
  market: 'US' | 'KR' | 'CRYPTO';
}

// 용도: 모든 자산 유형 통합 검색
// 기능: 실시간 검색, 자동완성, 필터링
// API: 해외주식, 국내주식, 암호화폐 동시 검색
```

### AssetSelector (자산 선택기)
```tsx
interface AssetSelectorProps {
  selectedAssets: Asset[];
  onAssetAdd: (asset: Asset) => void;
  onAssetRemove: (assetId: string) => void;
  maxSelections?: number;
  categories: AssetCategory[];
}

interface AssetCategory {
  id: string;
  name: string;
  assets: Asset[];
  color: string;
}

// 용도: 포트폴리오 구성 자산 선택
// 기능: 카테고리별 필터링, 다중 선택
// 제한: 최대 선택 개수 설정 가능
```

## 📊 데이터 표시 컴포넌트

### AssetCard (자산 카드)
```tsx
interface AssetCardProps {
  asset: Asset;
  allocation?: number;
  onSelect?: (asset: Asset) => void;
  onRemove?: (assetId: string) => void;
  showAllocation?: boolean;
  showControls?: boolean;
  variant?: 'compact' | 'detailed' | 'selectable';
}

// 용도: 개별 자산 정보 표시
// 레이아웃: 심볼, 이름, 가격, 변동률, 할당비율
// 상태: 선택 가능, 편집 가능, 읽기 전용
```

### PortfolioSummary (포트폴리오 요약)
```tsx
interface PortfolioSummaryProps {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  assets: Asset[];
  allocations: Record<string, number>;
  showDetails?: boolean;
}

// 용도: 포트폴리오 전체 현황 요약
// 표시: 총 가치, 일일 변동, 자산 구성
// 차트: 원형 차트로 구성 비율 시각화
```

### PriceChart (가격 차트)
```tsx
interface PriceChartProps {
  data: PriceData[];
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  onTimeframeChange: (timeframe: string) => void;
  height?: number;
  showVolume?: boolean;
}

interface PriceData {
  timestamp: number;
  price: number;
  volume?: number;
}

// 용도: 자산 가격 추이 시각화
// 기능: 시간 범위 선택, 확대/축소
// 스타일: 라인 차트, 반응형
```

## 📝 입력 및 폼 컴포넌트

### AllocationSlider (할당 비율 슬라이더)
```tsx
interface AllocationSliderProps {
  assetId: string;
  assetName: string;
  value: number;
  onChange: (assetId: string, value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

// 용도: 포트폴리오 자산 할당 비율 조정
// 제한: 전체 합계 100% 유지
// 피드백: 실시간 값 표시 및 검증
```

### InvestmentAmountInput (투자 금액 입력)
```tsx
interface InvestmentAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  currency: 'USD' | 'KRW';
  min?: number;
  max?: number;
  placeholder?: string;
  label: string;
}

// 용도: 투자 금액 설정
// 기능: 통화 형식화, 유효성 검증
// 제한: 최소/최대 금액 설정
```

### RiskToleranceSelector (리스크 성향 선택)
```tsx
interface RiskToleranceSelectorProps {
  value: RiskLevel;
  onChange: (level: RiskLevel) => void;
  options: RiskOption[];
}

type RiskLevel = 'conservative' | 'moderate' | 'aggressive';

interface RiskOption {
  level: RiskLevel;
  title: string;
  description: string;
  color: string;
  icon: string;
}

// 용도: 투자 성향 설문조사
// 표시: 시각적 아이콘과 설명
// 상태: 단일 선택, 명확한 구분
```

## 📱 레이아웃 컴포넌트

### ScrollContainer (스크롤 컨테이너)
```tsx
interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  onScroll?: (event: React.UIEvent) => void;
  showScrollbar?: boolean;
  maxHeight?: string;
}

// 용도: 모든 화면의 스크롤 가능 영역
// 기능: 자동 오버플로우 처리
// 스타일: 부드러운 스크롤, 모바일 최적화
```

### FixedBottomBar (하단 고정 바)
```tsx
interface FixedBottomBarProps {
  children: React.ReactNode;
  show?: boolean;
  backgroundColor?: string;
  shadow?: boolean;
}

// 용도: 주요 액션 버튼 고정 영역
// 위치: 화면 하단 고정
// 스타일: 그림자, 배경 블러 효과
```

### TabContainer (탭 컨테이너)
```tsx
interface TabContainerProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
}

// 용도: 카테고리별 컨텐츠 구분
// 스타일: 탭, 필, 언더라인 방식
// 기능: 배지, 아이콘 지원
```

## 🔔 피드백 컴포넌트

### LoadingSpinner (로딩 스피너)
```tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  overlay?: boolean;
  message?: string;
}

// 용도: 비동기 작업 진행 표시
// 변형: 오버레이, 인라인, 메시지 포함
// 애니메이션: 부드러운 회전 효과
```

### Toast (토스트 메시지)
```tsx
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  position?: 'top' | 'bottom';
}

// 용도: 임시 알림 메시지
// 스타일: 타입별 색상 구분
// 동작: 자동 닫힘, 스와이프 제거
```

### ErrorBoundary (에러 경계)
```tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

// 용도: 예상치 못한 에러 처리
// 표시: 사용자 친화적 에러 메시지
// 복구: 다시 시도 버튼 제공
```

## 🎯 특수 목적 컴포넌트

### PopularPortfolioCard (인기 포트폴리오 카드)
```tsx
interface PopularPortfolioCardProps {
  portfolio: PopularPortfolio;
  onSelect: (portfolio: PopularPortfolio) => void;
  onViewDetails: (portfolioId: string) => void;
  showAuthor?: boolean;
  showStats?: boolean;
}

interface PopularPortfolio {
  id: string;
  name: string;
  author: string;
  performance: number;
  riskLevel: RiskLevel;
  assets: string[];
  followers: number;
  likes: number;
}

// 용도: 인기 포트폴리오 선택 인터페이스
// 기능: 상세 보기, 바로 선택, 좋아요
// 표시: 수익률, 리스크, 구성 자산
```

### InvestmentSurveyStep (설문 단계)
```tsx
interface InvestmentSurveyStepProps {
  step: SurveyStep;
  onAnswer: (answer: SurveyAnswer) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

interface SurveyStep {
  id: string;
  question: string;
  description?: string;
  options: SurveyOption[];
  multiSelect?: boolean;
}

// 용도: 투자 성향 분석 설문
// 기능: 단계별 진행, 답변 검증
// 스타일: 명확한 옵션 구분
```

## 📋 사용 가이드라인

### 컴포넌트 조합 원칙
1. **일관성**: 모든 화면에서 동일한 컴포넌트 사용
2. **재사용성**: 프로퍼티를 통한 유연한 커스터마이징
3. **접근성**: 키보드 네비게이션 및 스크린 리더 지원
4. **성능**: 필요시에만 렌더링, 메모이제이션 적용

### 스타일링 규칙
1. **Tailwind CSS**: 유틸리티 클래스 우선 사용
2. **CSS 변수**: 디자인 토큰을 통한 일관된 스타일
3. **반응형**: 모바일 퍼스트 접근
4. **애니메이션**: 사용자 경험 향상을 위한 적절한 전환 효과

### 상태 관리
1. **로컬 상태**: useState for component-specific state
2. **글로벌 상태**: Context API for shared state
3. **서버 상태**: React Query for API data
4. **폼 상태**: React Hook Form for complex forms

이 컴포넌트 라이브러리를 바탕으로 개발 단계에서 실제 구현을 진행하겠습니다.