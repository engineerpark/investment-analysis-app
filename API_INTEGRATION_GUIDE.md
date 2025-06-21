# 🔌 외부 API 연동 가이드

투자 분석 앱에서 실시간 금융 데이터를 가져오기 위한 외부 API 연동 방법을 안내합니다.

## 📋 목차
1. [현재 지원 API](#현재-지원-api)
2. [API 키 설정 방법](#api-키-설정-방법)
3. [무료 API 서비스](#무료-api-서비스)
4. [유료 API 서비스](#유료-api-서비스)
5. [환경 변수 설정](#환경-변수-설정)
6. [API 연동 코드 수정](#api-연동-코드-수정)
7. [문제 해결](#문제-해결)

## 🔗 현재 지원 API

### 암호화폐 (무료)
- **CoinGecko API**
- **사용처**: 암호화폐 실시간 가격, 시가총액, 거래량
- **제한**: 분당 100회 요청
- **가격**: 무료

### 해외 주식 (무료)
- **Yahoo Finance API**
- **사용처**: 미국 주식, ETF 실시간 가격
- **제한**: 비공식 API로 제한 있음
- **가격**: 무료 (하지만 불안정)

### 국내 주식 (유료)
- **한국투자증권 KIS Developers API**
- **Alpha Vantage API (한국 주식 지원)**
- **사용처**: KOSPI/KOSDAQ 실시간 시세
- **제한**: API별 상이
- **가격**: 무료 티어 제공

## 🔑 API 키 설정 방법

### 1. CoinGecko API (암호화폐) - 무료
```bash
# 1. CoinGecko 계정 생성
https://www.coingecko.com/en/developers/dashboard

# 2. API 키 발급 (Pro 플랜)
- 무료 플랜: API 키 불필요
- Pro 플랜: 월 $129 (더 높은 속도 제한)
```

**설정 방법:**
```typescript
// utils/api_enhanced.ts에서 수정
const COINGECKO_API_KEY = "your_coingecko_api_key_here";

// API 호출시 헤더에 추가
headers: {
  'x-cg-pro-api-key': COINGECKO_API_KEY
}
```

### 2. Alpha Vantage API (주식) - 무료/유료
```bash
# 1. Alpha Vantage 계정 생성
https://www.alphavantage.co/support/#api-key

# 2. 무료 API 키 발급
- 무료: 분당 5회, 일 500회 요청
- 프리미엄: 월 $49.99부터
```

**설정 방법:**
```typescript
// .env.local 파일 생성
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

// utils/api_enhanced.ts에서 사용
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
```

### 3. Finnhub API (주식) - 무료/유료
```bash
# 1. Finnhub 계정 생성
https://finnhub.io/register

# 2. 무료 API 키 발급
- 무료: 분당 60회 요청
- 프리미엄: 월 $39.99부터
```

### 4. 한국투자증권 KIS Developers API (국내 주식)
```bash
# 1. 한국투자증권 계정 필요
https://developers.koreainvestment.com/

# 2. 실전/모의투자 선택
- 모의투자: 무료
- 실전투자: 계좌 개설 필요

# 3. API 신청 후 승인 (1-2일 소요)
```

**OAuth 토큰 발급:**
```typescript
// KIS API 토큰 발급 예제
const getKISToken = async () => {
  const response = await fetch('https://openapi.koreainvestment.com:9443/oauth2/tokenP', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: process.env.KIS_APP_KEY,
      appsecret: process.env.KIS_APP_SECRET
    })
  });
  
  const data = await response.json();
  return data.access_token;
};
```

### 5. Financial Modeling Prep API (종합 금융 데이터)
```bash
# 1. FMP 계정 생성
https://financialmodelingprep.com/developer/docs

# 2. API 키 발급
- 무료: 일 250회 요청
- 스타터: 월 $14.99
```

## 🌍 무료 API 서비스

### 추천 무료 API 조합

| API | 용도 | 제한 | 등록 필요 |
|-----|------|------|-----------|
| **CoinGecko** | 암호화폐 | 분당 100회 | X |
| **Yahoo Finance** | 해외 주식 | 비공식, 불안정 | X |
| **Alpha Vantage** | 모든 주식 | 일 500회 | O |
| **Finnhub** | 주식 + 뉴스 | 분당 60회 | O |
| **IEX Cloud** | 미국 주식 | 월 50만회 | O |

### 무료 플랜으로 시작하기

1. **Alpha Vantage 가입** (가장 추천)
   - 무료로 일 500회 요청
   - 한국 주식도 지원
   - 안정적인 서비스

2. **Finnhub 가입** (보조용)
   - 뉴스 데이터 추가
   - 기업 재무 정보

## 💳 유료 API 서비스 (실운영용)

### 프로덕션 환경 추천

| API | 월 비용 | 제공 데이터 | 요청 제한 |
|-----|---------|-------------|-----------|
| **Alpha Vantage Premium** | $49.99 | 글로벌 주식, 암호화폐, 외환 | 분당 75회 |
| **Finnhub Premium** | $39.99 | 주식, 뉴스, 재무제표 | 분당 300회 |
| **CoinGecko Pro** | $129 | 암호화폐 전문 | 분당 500회 |
| **IEX Cloud Scale** | $99 | 미국 주식 전문 | 월 500만회 |

## ⚙️ 환경 변수 설정

### .env.local 파일 생성
```bash
# 프로젝트 루트에 .env.local 파일 생성
touch .env.local
```

### 환경 변수 내용
```bash
# Alpha Vantage API
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Finnhub API
FINNHUB_API_KEY=your_finnhub_key_here

# CoinGecko Pro API (선택사항)
COINGECKO_API_KEY=your_coingecko_pro_key_here

# 한국투자증권 KIS API
KIS_APP_KEY=your_kis_app_key_here
KIS_APP_SECRET=your_kis_app_secret_here
KIS_ACCOUNT_NUMBER=your_account_number_here

# Yahoo Finance 대안 (Rapid API)
RAPIDAPI_KEY=your_rapidapi_key_here

# Financial Modeling Prep
FMP_API_KEY=your_fmp_key_here

# 환율 API (선택사항)
EXCHANGE_RATE_API_KEY=your_exchange_rate_key_here
```

### Next.js에서 환경 변수 사용
```typescript
// next.config.js에서 환경 변수 노출 (클라이언트용)
module.exports = {
  env: {
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
  },
}

// 서버사이드에서만 사용할 경우
const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
```

## 🔧 API 연동 코드 수정

### 1. Alpha Vantage 연동 추가

```typescript
// utils/api_enhanced.ts에 추가
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

// 실시간 주식 가격 조회
async function fetchAlphaVantageStock(symbol: string): Promise<UniversalAsset | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote) return null;
    
    return {
      id: symbol,
      symbol: symbol,
      name: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      type: 'stock',
      market: 'US',
      sector: 'Unknown',
      currency: 'USD'
    };
  } catch (error) {
    console.error('Alpha Vantage API 오류:', error);
    return null;
  }
}
```

### 2. Finnhub 연동 추가

```typescript
// Finnhub 실시간 주식 데이터
async function fetchFinnhubStock(symbol: string): Promise<UniversalAsset | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    const data = await response.json();
    
    return {
      id: symbol,
      symbol: symbol,
      name: symbol,
      price: data.c, // current price
      change: data.d, // change
      changePercent: data.dp, // change percent
      type: 'stock',
      market: 'US',
      sector: 'Unknown',
      currency: 'USD'
    };
  } catch (error) {
    console.error('Finnhub API 오류:', error);
    return null;
  }
}
```

### 3. 한국투자증권 KIS API 연동

```typescript
// KIS API 한국 주식 실시간 시세
async function fetchKISStock(symbol: string): Promise<UniversalAsset | null> {
  try {
    // 1. 토큰 발급
    const token = await getKISToken();
    
    // 2. 실시간 시세 조회
    const response = await fetch(
      `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
          'appkey': process.env.KIS_APP_KEY!,
          'appsecret': process.env.KIS_APP_SECRET!,
          'tr_id': 'FHKST01010100'
        },
        params: new URLSearchParams({
          fid_cond_mrkt_div_code: 'J',
          fid_input_iscd: symbol
        })
      }
    );
    
    const data = await response.json();
    const output = data.output;
    
    return {
      id: symbol,
      symbol: symbol,
      name: output.hts_kor_isnm,
      price: parseInt(output.stck_prpr),
      change: parseInt(output.prdy_vrss),
      changePercent: parseFloat(output.prdy_ctrt),
      type: 'stock',
      market: 'KR',
      sector: 'Unknown',
      currency: 'KRW'
    };
  } catch (error) {
    console.error('KIS API 오류:', error);
    return null;
  }
}
```

## 🔄 API 호출 최적화

### 1. 캐싱 전략
```typescript
// 메모리 캐시 설정
const CACHE_DURATION = {
  REALTIME: 10 * 1000,    // 10초 (실시간 데이터)
  DAILY: 24 * 60 * 60 * 1000,  // 24시간 (일일 데이터)
  WEEKLY: 7 * 24 * 60 * 60 * 1000  // 7일 (정적 데이터)
};

// Redis 캐시 사용 (선택사항)
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getCachedData(key: string) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}
```

### 2. Rate Limiting 처리
```typescript
// 요청 제한 관리
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  canMakeRequest(apiKey: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(apiKey) || [];
    
    // 윈도우 밖의 요청 제거
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(apiKey, validRequests);
    return true;
  }
}
```

### 3. 폴백 전략
```typescript
// 여러 API를 순차적으로 시도
async function fetchStockWithFallback(symbol: string): Promise<UniversalAsset | null> {
  // 1순위: Alpha Vantage
  try {
    const result = await fetchAlphaVantageStock(symbol);
    if (result) return result;
  } catch (error) {
    console.warn('Alpha Vantage 실패, Finnhub 시도');
  }
  
  // 2순위: Finnhub
  try {
    const result = await fetchFinnhubStock(symbol);
    if (result) return result;
  } catch (error) {
    console.warn('Finnhub 실패, Yahoo Finance 시도');
  }
  
  // 3순위: Yahoo Finance (무료)
  try {
    const result = await fetchYahooStock(symbol);
    if (result) return result;
  } catch (error) {
    console.error('모든 API 실패');
  }
  
  return null;
}
```

## 🐛 문제 해결

### 자주 발생하는 문제

#### 1. CORS 오류
```typescript
// 해결방법: Next.js API 라우트 사용
// pages/api/stocks/[symbol].ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { symbol } = req.query;
  
  try {
    const stock = await fetchStockWithFallback(symbol as string);
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'API 호출 실패' });
  }
}
```

#### 2. Rate Limit 초과
```typescript
// 해결방법: 요청 큐 사용
class APIQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  
  async add<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }
  
  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const apiCall = this.queue.shift()!;
      await apiCall();
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    }
    
    this.processing = false;
  }
}
```

#### 3. API 키 보안
```typescript
// 서버 사이드에서만 API 키 사용
// pages/api/secure-data.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // API 키는 서버에서만 사용 (클라이언트에 노출되지 않음)
  const apiKey = process.env.SECRET_API_KEY;
  
  const data = await fetch(`https://api.example.com/data?key=${apiKey}`);
  const result = await data.json();
  
  // 민감한 정보 제거 후 클라이언트에 전송
  res.json({ publicData: result.publicField });
}
```

### 환경별 설정

#### 개발 환경
```bash
# .env.local (개발용)
ALPHA_VANTAGE_API_KEY=demo
FINNHUB_API_KEY=demo
NODE_ENV=development
```

#### 프로덕션 환경
```bash
# Vercel 환경 변수 설정
vercel env add ALPHA_VANTAGE_API_KEY production
vercel env add FINNHUB_API_KEY production
```

## 📊 API 사용량 모니터링

### 사용량 추적 코드
```typescript
// API 사용량 로깅
class APIUsageTracker {
  private usage: Map<string, number> = new Map();
  
  trackUsage(apiName: string) {
    const current = this.usage.get(apiName) || 0;
    this.usage.set(apiName, current + 1);
    
    // 일일 로그 저장
    console.log(`${apiName} API 호출: ${current + 1}회`);
  }
  
  getDailyUsage() {
    return Object.fromEntries(this.usage);
  }
}
```

## 🚀 배포 시 주의사항

1. **환경 변수 보안**: API 키는 절대 Git에 커밋하지 말 것
2. **서버사이드 렌더링**: 민감한 API 호출은 서버에서만
3. **캐싱 전략**: 불필요한 API 호출 최소화
4. **에러 처리**: 폴백 데이터 준비
5. **모니터링**: API 사용량과 응답시간 모니터링

## 📞 지원 및 문의

API 연동 관련 문제가 발생하면:
1. 각 API 공식 문서 확인
2. GitHub Issues에 문제 보고
3. 개발자 커뮤니티에서 도움 요청

---

**마지막 업데이트**: 2024년 12월 21일  
**작성자**: Claude Code  
**버전**: 1.0.0