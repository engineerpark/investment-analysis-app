# 투자 분석 앱 디자인 시스템

## 🎨 색상 팔레트

### Primary Colors (주요 색상)
```css
--primary-blue: #3b82f6;      /* 메인 브랜드 색상 */
--primary-blue-dark: #1d4ed8; /* 호버/액티브 상태 */
--primary-blue-light: #93c5fd; /* 비활성 상태 */
```

### Secondary Colors (보조 색상)
```css
--success-green: #10b981;     /* 성공, 수익 표시 */
--danger-red: #ef4444;        /* 에러, 손실 표시 */
--warning-yellow: #f59e0b;    /* 경고, 주의 표시 */
--info-blue: #06b6d4;         /* 정보 표시 */
```

### Neutral Colors (중성 색상)
```css
--gray-50: #f9fafb;          /* 배경색 */
--gray-100: #f3f4f6;         /* 카드 배경 */
--gray-200: #e5e7eb;         /* 구분선 */
--gray-300: #d1d5db;         /* 비활성 텍스트 */
--gray-500: #6b7280;         /* 보조 텍스트 */
--gray-700: #374151;         /* 일반 텍스트 */
--gray-900: #111827;         /* 제목 텍스트 */
--white: #ffffff;            /* 카드/모달 배경 */
```

### Investment Colors (투자 관련 색상)
```css
--stock-blue: #2563eb;       /* 주식 */
--crypto-orange: #f97316;    /* 암호화폐 */
--bond-purple: #7c3aed;      /* 채권 */
--etf-emerald: #059669;      /* ETF */
--reit-pink: #db2777;        /* 리츠 */
```

## 📱 레이아웃 시스템

### 모바일 기본 스펙
```css
.app-container {
  width: 393px;
  height: 852px;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
}

.screen-container {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background: var(--gray-50);
}
```

### 간격 시스템 (Spacing)
```css
--space-xs: 4px;    /* 8px */
--space-sm: 8px;    /* 12px */
--space-md: 12px;   /* 16px */
--space-lg: 16px;   /* 24px */
--space-xl: 24px;   /* 32px */
--space-2xl: 32px;  /* 48px */
--space-3xl: 48px;  /* 64px */
```

### 터치 영역 최소 크기
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-md);
}
```

## 🔤 타이포그래피

### 폰트 계층 구조
```css
.text-3xl {         /* 페이지 제목 */
  font-size: 30px;
  font-weight: 700;
  line-height: 36px;
  letter-spacing: -0.025em;
}

.text-2xl {         /* 섹션 제목 */
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
}

.text-xl {          /* 카드 제목 */
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.text-lg {          /* 중요 텍스트 */
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
}

.text-base {        /* 일반 텍스트 */
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}

.text-sm {          /* 보조 텍스트 */
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.text-xs {          /* 캡션 텍스트 */
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}
```

## 🎯 버튼 시스템

### Primary Button (주요 버튼)
```css
.btn-primary {
  background: var(--primary-blue);
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 44px;
}

.btn-primary:hover {
  background: var(--primary-blue-dark);
  transform: translateY(-1px);
}

.btn-primary:active {
  background: var(--primary-blue-dark);
  transform: translateY(0);
}
```

### Secondary Button (보조 버튼)
```css
.btn-secondary {
  background: white;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 44px;
}

.btn-secondary:hover {
  background: var(--primary-blue);
  color: white;
}
```

### Icon Button (아이콘 버튼)
```css
.btn-icon {
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--gray-200);
}
```

### Danger Button (위험 버튼)
```css
.btn-danger {
  background: var(--danger-red);
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  min-height: 44px;
}
```

## 📋 카드 시스템

### 기본 카드
```css
.card {
  background: white;
  border-radius: 12px;
  padding: var(--space-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  margin-bottom: var(--space-md);
}

.card-hover {
  transition: all 0.2s ease;
  cursor: pointer;
}

.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### 투자 자산 카드
```css
.asset-card {
  background: white;
  border-radius: 8px;
  padding: var(--space-md);
  border-left: 4px solid var(--stock-blue);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.asset-card.crypto {
  border-left-color: var(--crypto-orange);
}

.asset-card.bond {
  border-left-color: var(--bond-purple);
}
```

## 📊 데이터 시각화

### 수익률 표시
```css
.profit-positive {
  color: var(--success-green);
  font-weight: 600;
}

.profit-negative {
  color: var(--danger-red);
  font-weight: 600;
}

.profit-neutral {
  color: var(--gray-500);
  font-weight: 400;
}
```

### 진행률 표시기
```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-blue);
  transition: width 0.3s ease;
  border-radius: 4px;
}
```

## 🔄 상태 시스템

### 로딩 상태
```css
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-200);
  border-top: 2px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### 에러 상태
```css
.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--danger-red);
  padding: var(--space-md);
  border-radius: 8px;
  font-size: 14px;
}
```

### 성공 상태
```css
.success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: var(--success-green);
  padding: var(--space-md);
  border-radius: 8px;
  font-size: 14px;
}
```

## 📱 반응형 브레이크포인트

```css
/* Mobile First */
.container {
  width: 100%;
  max-width: 393px;
  margin: 0 auto;
}

/* 작은 모바일 */
@media (max-width: 375px) {
  .container {
    padding: var(--space-sm);
  }
}

/* 큰 모바일 */
@media (min-width: 414px) {
  .container {
    max-width: 414px;
  }
}

/* 태블릿 */
@media (min-width: 768px) {
  .container {
    max-width: 500px;
  }
}
```

## 🎯 접근성 가이드라인

### 색상 대비
- 모든 텍스트는 WCAG 2.1 AA 기준 충족
- 최소 4.5:1 대비율 유지
- 중요 정보는 색상 외 다른 방법으로도 구분

### 터치 영역
- 최소 44px × 44px 크기 보장
- 인접한 터치 영역 간 8px 이상 간격
- 명확한 시각적 피드백 제공

### 키보드 네비게이션
```css
.focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}
```

이 디자인 시스템을 바탕으로 다음 단계인 개발 구현으로 진행하겠습니다.