# 로컬 서버 연결 가이드

## 🚀 성공한 접속 방식 (2025-06-22)

### 📋 단계별 절차

#### 1. 프로세스 정리
```bash
# Next.js 프로세스 종료
pkill -f "next" 2>/dev/null || true

# 포트 3000 정리
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

#### 2. 작업 디렉토리 확인
```bash
pwd
# 결과: /Users/jehyeon/investment-analysis-app

ls -la
# package.json, App.tsx 등 확인
```

#### 3. 개발 서버 시작 (성공 방식)
```bash
npm run dev &
```

**중요 포인트:**
- `&` 백그라운드 실행 사용
- 타임아웃 2분 설정으로 충분한 시간 확보
- 컴파일 완료까지 대기

#### 4. 서버 상태 확인
```bash
# 프로세스 확인
ps aux | grep next

# 포트 확인 (선택사항)
netstat -an | grep 3000
```

#### 5. 브라우저 접속
```bash
# Chrome으로 접속
open -a "Google Chrome" http://localhost:3000

# 또는 기본 브라우저
open http://localhost:3000
```

### ✅ 성공 지표

#### 서버 로그 확인사항
```
> investment-analysis-app@2.0.0 dev
> next dev

  ▲ Next.js 14.2.30
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 1130ms
 ○ Compiling / ...
 ✓ Compiled / in 1451ms (1078 modules)
 ✓ Compiled in 144ms (1078 modules)
 GET / 200 in 1859ms
```

**핵심 성공 요소:**
- `Ready` 메시지 확인
- 1078개 모듈 컴파일 완료
- HTTP 200 응답 (GET 요청 성공)

### 🔧 환경 설정

#### package.json 스크립트
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

#### .env.local
```
COINGECKO_API_KEY=CG-XDJgFHwfoyMMnxq5UuWfqvaw
ALPHA_VANTAGE_API_KEY=W81KZ2JQNEQY76VG
NODE_ENV=development
```

### 🚨 문제 해결

#### 연결 안 될 때 체크리스트
1. **포트 충돌 확인**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **프로세스 정리**
   ```bash
   pkill -f "next"
   ```

3. **캐시 정리** (필요시)
   ```bash
   rm -rf .next
   npm run build
   ```

4. **의존성 확인**
   ```bash
   npm install
   ```

### 📝 현재 작동 중인 기능

#### 주요 컴포넌트
- `App.tsx` - 메인 애플리케이션
- `HomeScreen.tsx` - 초기 화면
- `PortfolioRecommendation.tsx` - 자산 검색
- `PortfolioDashboard.tsx` - 실시간 대시보드

#### API 연동
- **CoinGecko API** - 암호화폐 실시간 가격
- **Alpha Vantage API** - 주식 데이터
- **Yahoo Finance API** - 백업 데이터

#### 검색 가능 자산
- **암호화폐 70+개**: BTC, ETH, SOL, PEPE 등
- **미국 주식 80+개**: AAPL, TSLA, NVDA 등
- **ETF 40+개**: SPY, QQQ, ARKK 등

### 🎯 테스트 시나리오

#### 1. 기본 접속 테스트
1. 브라우저에서 http://localhost:3000 접속
2. "포트폴리오 전략 추천" 화면 확인
3. "투자 성향 분석" 버튼 클릭

#### 2. 자산 검색 테스트
1. 포트폴리오 추천 화면 진입
2. 검색창에 "bitcoin" 입력
3. 실시간 가격 정보 확인

#### 3. 실시간 업데이트 테스트
1. 포트폴리오 대시보드 진입
2. 새로고침 버튼 클릭
3. 30초 자동 업데이트 확인

### 📱 지원 브라우저
- Google Chrome ✅
- Safari ✅
- Firefox ✅
- Edge ✅

### 📊 성능 지표
- **빌드 시간**: ~1.4초
- **모듈 수**: 1078개
- **응답 시간**: ~1.8초 (초기 로드)
- **파일 크기**: 239KB (총 번들)

### 🔄 재시작 방법

```bash
# 1. 서버 중지
pkill -f "next"

# 2. 포트 정리  
lsof -ti:3000 | xargs kill -9

# 3. 서버 재시작
npm run dev &

# 4. 브라우저 접속
open -a "Google Chrome" http://localhost:3000
```

---

**📅 작성일**: 2025-06-22 16:18  
**✅ 상태**: 정상 작동 확인  
**🔧 버전**: Next.js 14.2.30  
**💻 환경**: macOS Development