# 투자 성향 분석 모바일 앱

개선된 API 시스템을 사용하는 투자 성향 분석 모바일 앱입니다.

## 🚀 배포 방법

### 1. 로컬 개발
```bash
npm install
npm run dev
```

### 2. Vercel 배포 (권장)
```bash
npm install -g vercel
vercel --prod
```

### 3. Netlify 배포
```bash
npm run build
# dist 폴더를 Netlify에 업로드
```

### 4. GitHub Pages
```bash
npm run build
npm run export
# out 폴더를 GitHub Pages에 배포
```

## 🔧 개선된 API 기능

- **다중 데이터 소스**: Binance, CoinGecko, Yahoo Finance
- **캐싱 시스템**: 1분간 캐시로 성능 향상
- **폴백 메커니즘**: API 실패 시 안정적인 데이터 제공
- **환율 지원**: USD ↔ KRW 자동 변환
- **배치 처리**: 효율적인 다중 자산 조회

## 📱 모바일 최적화

- 393x852 모바일 화면 크기
- 터치 친화적 UI
- 반응형 디자인