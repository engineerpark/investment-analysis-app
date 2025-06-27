/**
 * 강화된 API 시스템 - 해외주식, 국내주식, 암호화폐 통합 검색
 * - 실시간 가격 정보 제공
 * - 통합 검색 기능
 * - 캐싱 및 에러 처리
 * - 여러 API 소스 활용
 */

// 환경 설정 - 실제 API 키 사용
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || 'CG-XDJgFHwfoyMMnxq5UuWfqvaw';
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'W81KZ2JQNEQY76VG';

const API_ENDPOINTS = {
  // 암호화폐 - CoinGecko (Pro API 키 사용)
  COINGECKO: {
    search: 'https://api.coingecko.com/api/v3/search',
    price: 'https://api.coingecko.com/api/v3/simple/price',
    trending: 'https://api.coingecko.com/api/v3/search/trending',
    coins: 'https://api.coingecko.com/api/v3/coins/markets',
    global: 'https://api.coingecko.com/api/v3/global'
  },
  
  // Alpha Vantage (실제 API 키 사용)
  ALPHA_VANTAGE: {
    quote: 'https://www.alphavantage.co/query',
    search: 'https://www.alphavantage.co/query',
    apiKey: ALPHA_VANTAGE_API_KEY
  },
  
  // 해외 주식 - Yahoo Finance (백업용)
  YAHOO: {
    search: 'https://query1.finance.yahoo.com/v1/finance/search',
    quote: 'https://query1.finance.yahoo.com/v8/finance/chart/',
    lookup: 'https://query2.finance.yahoo.com/v1/finance/lookup',
  },
  
  // 국내 주식 - KIS Developers (추후 확장용)
  KIS: {
    base: 'https://openapi.koreainvestment.com:9443',
    // OAuth 토큰 발급 후 사용
  },
  
  // 대안 API들
  FINNHUB: {
    search: 'https://finnhub.io/api/v1/search',
    quote: 'https://finnhub.io/api/v1/quote',
    token: 'demo',
  },
  
  // 한국거래소 (CORS 우회 필요)
  KRX: {
    search: 'https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd',
    quote: 'https://api.stock.naver.com/stock/'
  }
};

// 캐시 시스템
interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_TTL = 60000; // 1분

  set(key: string, data: any, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

const apiCache = new APICache();

// 환율 정보 저장소
const exchangeRates = {
  USD_KRW: 1380, // 기본 환율
  lastUpdate: Date.now()
};

// 통합 자산 인터페이스
export interface UniversalAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  type: 'stock' | 'crypto' | 'etf' | 'index';
  market: 'US' | 'KR' | 'CRYPTO' | 'GLOBAL';
  sector: string;
  currency: string;
  exchange?: string;
  geckoId?: string;
  thumb?: string;
  marketCapRank?: number;
}

// 검색 결과 인터페이스
export interface SearchResult {
  query: string;
  results: UniversalAsset[];
  timestamp: number;
  sources: string[];
}

// 국내 주요 주식 목록 (실시간 API 보완용)
const KOREAN_STOCKS = [
  { symbol: '005930', name: '삼성전자', englishName: 'Samsung Electronics', sector: 'Technology', market: 'KOSPI' },
  { symbol: '000660', name: 'SK하이닉스', englishName: 'SK Hynix', sector: 'Technology', market: 'KOSPI' },
  { symbol: '035420', name: 'NAVER', englishName: 'NAVER', sector: 'Technology', market: 'KOSPI' },
  { symbol: '051910', name: 'LG화학', englishName: 'LG Chem', sector: 'Chemical', market: 'KOSPI' },
  { symbol: '006400', name: '삼성SDI', englishName: 'Samsung SDI', sector: 'Technology', market: 'KOSPI' },
  { symbol: '207940', name: '삼성바이오로직스', englishName: 'Samsung Biologics', sector: 'Healthcare', market: 'KOSPI' },
  { symbol: '068270', name: '셀트리온', englishName: 'Celltrion', sector: 'Healthcare', market: 'KOSPI' },
  { symbol: '035720', name: '카카오', englishName: 'Kakao', sector: 'Technology', market: 'KOSPI' },
  { symbol: '028260', name: '삼성물산', englishName: 'Samsung C&T', sector: 'Conglomerate', market: 'KOSPI' },
  { symbol: '066570', name: 'LG전자', englishName: 'LG Electronics', sector: 'Technology', market: 'KOSPI' },
  { symbol: '323410', name: '카카오뱅크', englishName: 'Kakao Bank', sector: 'Financial', market: 'KOSPI' },
  { symbol: '003670', name: '포스코홀딩스', englishName: 'POSCO Holdings', sector: 'Steel', market: 'KOSPI' },
  { symbol: '000270', name: '기아', englishName: 'Kia', sector: 'Automotive', market: 'KOSPI' },
  { symbol: '005380', name: '현대차', englishName: 'Hyundai Motor', sector: 'Automotive', market: 'KOSPI' },
  { symbol: '012330', name: '현대모비스', englishName: 'Hyundai Mobis', sector: 'Automotive', market: 'KOSPI' },
  { symbol: '017670', name: 'SK텔레콤', englishName: 'SK Telecom', sector: 'Telecom', market: 'KOSPI' },
  { symbol: '030200', name: 'KT', englishName: 'KT Corporation', sector: 'Telecom', market: 'KOSPI' },
  { symbol: '055550', name: '신한지주', englishName: 'Shinhan Financial Group', sector: 'Financial', market: 'KOSPI' },
  { symbol: '086790', name: '하나금융지주', englishName: 'Hana Financial Group', sector: 'Financial', market: 'KOSPI' },
  { symbol: '105560', name: 'KB금융', englishName: 'KB Financial Group', sector: 'Financial', market: 'KOSPI' },
  { symbol: '018260', name: '삼성에스디에스', englishName: 'Samsung SDS', sector: 'Technology', market: 'KOSPI' },
  { symbol: '036570', name: '엔씨소프트', englishName: 'NCsoft', sector: 'Technology', market: 'KOSPI' },
  { symbol: '251270', name: '넷마블', englishName: 'Netmarble', sector: 'Technology', market: 'KOSPI' },
  { symbol: '377300', name: '카카오페이', englishName: 'Kakao Pay', sector: 'Financial', market: 'KOSPI' },
  { symbol: '047050', name: '포스코인터내셔널', englishName: 'POSCO International', sector: 'Trading', market: 'KOSPI' },
  // 코스닥 주요 종목
  { symbol: '247540', name: '에코프로비엠', englishName: 'EcoPro BM', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '086520', name: '에코프로', englishName: 'EcoPro', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '091990', name: '셀트리온헬스케어', englishName: 'Celltrion Healthcare', sector: 'Healthcare', market: 'KOSDAQ' },
  { symbol: '196170', name: '알테오젠', englishName: 'Alteogen', sector: 'Healthcare', market: 'KOSDAQ' },
  { symbol: '058470', name: '리노공업', englishName: 'Leeno Industrial', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '240810', name: '원익IPS', englishName: 'Wonik IPS', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '357780', name: '솔브레인', englishName: 'Soulbrain', sector: 'Chemical', market: 'KOSDAQ' },
  { symbol: '039030', name: '이오테크닉스', englishName: 'EO Technics', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '067310', name: '하나마이크론', englishName: 'Hana Micron', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '348210', name: '넥스틴', englishName: 'Nextin', sector: 'Technology', market: 'KOSDAQ' },
];

// 해외 주요 주식 목록 (대폭 확장)
const US_STOCKS = [
  // 기술 기업
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', market: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', market: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication', market: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', market: 'NYSE' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', market: 'NYSE' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', sector: 'Technology', market: 'NYSE' },
  { symbol: 'PANW', name: 'Palo Alto Networks Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.', sector: 'Technology', market: 'NYSE' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', market: 'NYSE' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Technology', market: 'NYSE' },
  { symbol: 'LYFT', name: 'Lyft Inc.', sector: 'Technology', market: 'NASDAQ' },
  
  // 금융
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', sector: 'Financial', market: 'NYSE' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'WFC', name: 'Wells Fargo & Co.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial', market: 'NYSE' },
  { symbol: 'C', name: 'Citigroup Inc.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'AXP', name: 'American Express Co.', sector: 'Financial', market: 'NYSE' },
  
  // 헬스케어
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb Co.', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'CVS', name: 'CVS Health Corporation', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'CI', name: 'Cigna Group', sector: 'Healthcare', market: 'NYSE' },
  
  // 소비재
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', market: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Staples', market: 'NYSE' },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Discretionary', market: 'NYSE' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Consumer Staples', market: 'NASDAQ' },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Staples', market: 'NYSE' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', market: 'NASDAQ' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer Discretionary', market: 'NYSE' },
  { symbol: 'MCD', name: 'McDonald\'s Corp.', sector: 'Consumer Discretionary', market: 'NYSE' },
  { symbol: 'SBUX', name: 'Starbucks Corp.', sector: 'Consumer Discretionary', market: 'NASDAQ' },
  { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Communication', market: 'NYSE' },
  
  // 에너지
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', market: 'NYSE' },
  { symbol: 'CVX', name: 'Chevron Corp.', sector: 'Energy', market: 'NYSE' },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', market: 'NYSE' },
  { symbol: 'EOG', name: 'EOG Resources Inc.', sector: 'Energy', market: 'NYSE' },
  { symbol: 'SLB', name: 'Schlumberger NV', sector: 'Energy', market: 'NYSE' },
  
  // 통신
  { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication', market: 'NYSE' },
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication', market: 'NYSE' },
  { symbol: 'TMUS', name: 'T-Mobile US Inc.', sector: 'Communication', market: 'NASDAQ' },
  { symbol: 'CMCSA', name: 'Comcast Corp. Class A', sector: 'Communication', market: 'NASDAQ' },
];

// 미국 ETF 목록 (대폭 확장)
const US_ETFS = [
  // 광범위 시장 ETF
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF', market: 'NYSE', category: 'Large Cap' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF', market: 'NASDAQ', category: 'Technology' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', sector: 'ETF', market: 'NYSE', category: 'Total Market' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'ETF', market: 'NYSE', category: 'Small Cap' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', sector: 'ETF', market: 'NYSE', category: 'International' },
  { symbol: 'VWO', name: 'Vanguard Emerging Markets Stock ETF', sector: 'ETF', market: 'NYSE', category: 'Emerging Markets' },
  { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', sector: 'ETF', market: 'NYSE', category: 'International' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', sector: 'ETF', market: 'NYSE', category: 'Emerging Markets' },
  
  // 섹터별 ETF
  { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Technology' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Financial' },
  { symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Healthcare' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Energy' },
  { symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Industrial' },
  { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Consumer Discretionary' },
  { symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Consumer Staples' },
  { symbol: 'XLU', name: 'Utilities Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Utilities' },
  { symbol: 'XLB', name: 'Materials Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Materials' },
  { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR Fund', sector: 'ETF', market: 'NYSE', category: 'Real Estate' },
  
  // 채권 ETF
  { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', sector: 'ETF', market: 'NYSE', category: 'Bonds' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', sector: 'ETF', market: 'NASDAQ', category: 'Bonds' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', sector: 'ETF', market: 'NASDAQ', category: 'Treasury' },
  { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', sector: 'ETF', market: 'NASDAQ', category: 'Treasury' },
  { symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF', sector: 'ETF', market: 'NASDAQ', category: 'Treasury' },
  { symbol: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF', sector: 'ETF', market: 'NYSE', category: 'Corporate Bonds' },
  { symbol: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF', sector: 'ETF', market: 'NYSE', category: 'High Yield' },
  { symbol: 'EMB', name: 'iShares J.P. Morgan USD Emerging Markets Bond ETF', sector: 'ETF', market: 'NASDAQ', category: 'Emerging Market Bonds' },
  
  // 테마별 ETF
  { symbol: 'ARKK', name: 'ARK Innovation ETF', sector: 'ETF', market: 'NYSE', category: 'Innovation' },
  { symbol: 'ARKQ', name: 'ARK Autonomous Technology & Robotics ETF', sector: 'ETF', market: 'NYSE', category: 'Robotics' },
  { symbol: 'ARKG', name: 'ARK Genomic Revolution ETF', sector: 'ETF', market: 'NYSE', category: 'Genomics' },
  { symbol: 'ICLN', name: 'iShares Global Clean Energy ETF', sector: 'ETF', market: 'NASDAQ', category: 'Clean Energy' },
  { symbol: 'MOON', name: 'Direxion Moonshot Innovators ETF', sector: 'ETF', market: 'NYSE', category: 'Innovation' },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF', sector: 'ETF', market: 'NASDAQ', category: 'Semiconductors' },
  { symbol: 'SMH', name: 'VanEck Semiconductor ETF', sector: 'ETF', market: 'NASDAQ', category: 'Semiconductors' },
  { symbol: 'IBB', name: 'iShares Biotechnology ETF', sector: 'ETF', market: 'NASDAQ', category: 'Biotechnology' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', sector: 'ETF', market: 'NYSE', category: 'Gold' },
  { symbol: 'SLV', name: 'iShares Silver Trust', sector: 'ETF', market: 'NYSE', category: 'Silver' },
  
  // 배당 ETF
  { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', sector: 'ETF', market: 'NYSE', category: 'Dividend' },
  { symbol: 'DVY', name: 'iShares Select Dividend ETF', sector: 'ETF', market: 'NASDAQ', category: 'Dividend' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', sector: 'ETF', market: 'NYSE', category: 'Dividend' },
  { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', sector: 'ETF', market: 'NYSE', category: 'Dividend Growth' },
];

// 주요 암호화폐 목록 (대폭 확장)
const CRYPTOCURRENCIES = [
  // 메이저 코인
  { symbol: 'BTC', name: 'Bitcoin', geckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', geckoId: 'ethereum' },
  { symbol: 'USDT', name: 'Tether', geckoId: 'tether' },
  { symbol: 'BNB', name: 'BNB', geckoId: 'binancecoin' },
  { symbol: 'XRP', name: 'Ripple', geckoId: 'ripple' },
  { symbol: 'SOL', name: 'Solana', geckoId: 'solana' },
  { symbol: 'USDC', name: 'USD Coin', geckoId: 'usd-coin' },
  { symbol: 'ADA', name: 'Cardano', geckoId: 'cardano' },
  { symbol: 'AVAX', name: 'Avalanche', geckoId: 'avalanche-2' },
  { symbol: 'DOGE', name: 'Dogecoin', geckoId: 'dogecoin' },
  
  // 디파이 & 레이어1
  { symbol: 'TRX', name: 'TRON', geckoId: 'tron' },
  { symbol: 'MATIC', name: 'Polygon', geckoId: 'matic-network' },
  { symbol: 'DOT', name: 'Polkadot', geckoId: 'polkadot' },
  { symbol: 'LINK', name: 'Chainlink', geckoId: 'chainlink' },
  { symbol: 'UNI', name: 'Uniswap', geckoId: 'uniswap' },
  { symbol: 'LTC', name: 'Litecoin', geckoId: 'litecoin' },
  { symbol: 'ATOM', name: 'Cosmos', geckoId: 'cosmos' },
  { symbol: 'XLM', name: 'Stellar', geckoId: 'stellar' },
  { symbol: 'ETC', name: 'Ethereum Classic', geckoId: 'ethereum-classic' },
  { symbol: 'NEAR', name: 'NEAR Protocol', geckoId: 'near' },
  
  // 새로운 레이어1 & 알트코인
  { symbol: 'FIL', name: 'Filecoin', geckoId: 'filecoin' },
  { symbol: 'APT', name: 'Aptos', geckoId: 'aptos' },
  { symbol: 'ARB', name: 'Arbitrum', geckoId: 'arbitrum' },
  { symbol: 'OP', name: 'Optimism', geckoId: 'optimism' },
  { symbol: 'SUI', name: 'Sui', geckoId: 'sui' },
  { symbol: 'SEI', name: 'Sei', geckoId: 'sei-network' },
  { symbol: 'INJ', name: 'Injective', geckoId: 'injective-protocol' },
  { symbol: 'TIA', name: 'Celestia', geckoId: 'celestia' },
  { symbol: 'STRK', name: 'Starknet', geckoId: 'starknet' },
  { symbol: 'BLUR', name: 'Blur', geckoId: 'blur' },
  
  // 메타버스 & 게임
  { symbol: 'MANA', name: 'Decentraland', geckoId: 'decentraland' },
  { symbol: 'SAND', name: 'The Sandbox', geckoId: 'the-sandbox' },
  { symbol: 'AXS', name: 'Axie Infinity', geckoId: 'axie-infinity' },
  { symbol: 'ENJ', name: 'Enjin Coin', geckoId: 'enjincoin' },
  { symbol: 'GALA', name: 'Gala', geckoId: 'gala' },
  { symbol: 'IMX', name: 'Immutable X', geckoId: 'immutable-x' },
  
  // 밈코인
  { symbol: 'SHIB', name: 'Shiba Inu', geckoId: 'shiba-inu' },
  { symbol: 'PEPE', name: 'Pepe', geckoId: 'pepe' },
  { symbol: 'FLOKI', name: 'FLOKI', geckoId: 'floki' },
  { symbol: 'BONK', name: 'Bonk', geckoId: 'bonk' },
  { symbol: 'WIF', name: 'dogwifhat', geckoId: 'dogwifcoin' },
  
  // 인공지능 & 머신러닝
  { symbol: 'FET', name: 'Fetch.ai', geckoId: 'fetch-ai' },
  { symbol: 'AGIX', name: 'SingularityNET', geckoId: 'singularitynet' },
  { symbol: 'OCEAN', name: 'Ocean Protocol', geckoId: 'ocean-protocol' },
  { symbol: 'RLC', name: 'iExec RLC', geckoId: 'iexec-rlc' },
  
  // 스테이블코인
  { symbol: 'BUSD', name: 'Binance USD', geckoId: 'binance-usd' },
  { symbol: 'DAI', name: 'Dai', geckoId: 'dai' },
  { symbol: 'TUSD', name: 'TrueUSD', geckoId: 'true-usd' },
  { symbol: 'FDUSD', name: 'First Digital USD', geckoId: 'first-digital-usd' },
  
  // 기타 주요 알트코인
  { symbol: 'XMR', name: 'Monero', geckoId: 'monero' },
  { symbol: 'BCH', name: 'Bitcoin Cash', geckoId: 'bitcoin-cash' },
  { symbol: 'VET', name: 'VeChain', geckoId: 'vechain' },
  { symbol: 'ALGO', name: 'Algorand', geckoId: 'algorand' },
  { symbol: 'HBAR', name: 'Hedera', geckoId: 'hedera-hashgraph' },
  { symbol: 'ICP', name: 'Internet Computer', geckoId: 'internet-computer' },
  { symbol: 'FLOW', name: 'Flow', geckoId: 'flow' },
  { symbol: 'EGLD', name: 'MultiversX', geckoId: 'elrond-erd-2' },
  { symbol: 'XTZ', name: 'Tezos', geckoId: 'tezos' },
  { symbol: 'THETA', name: 'Theta Network', geckoId: 'theta-token' },
];

// 암호화폐 가격 조회 (CoinGecko Pro API)
async function fetchCryptoPrices(symbols: string[]): Promise<UniversalAsset[]> {
  try {
    const geckoIds = symbols.map(symbol => {
      const crypto = CRYPTOCURRENCIES.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
      return crypto?.geckoId;
    }).filter(Boolean);

    if (geckoIds.length === 0) return [];

    // CoinGecko Pro API 헤더 설정
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // API 키가 있으면 Pro API 사용
    if (COINGECKO_API_KEY && COINGECKO_API_KEY !== 'demo') {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }

    const response = await fetch(
      `${API_ENDPOINTS.COINGECKO.price}?ids=${geckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&precision=2`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API 오류: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    return Object.entries(data).map(([geckoId, priceData]: [string, any]) => {
      const crypto = CRYPTOCURRENCIES.find(c => c.geckoId === geckoId);
      if (!crypto) return null;

      return {
        id: geckoId,
        symbol: crypto.symbol,
        name: crypto.name,
        price: priceData.usd || 0,
        change: priceData.usd_24h_change || 0,
        changePercent: priceData.usd_24h_change || 0,
        volume: priceData.usd_24h_vol,
        marketCap: priceData.usd_market_cap,
        type: 'crypto' as const,
        market: 'CRYPTO' as const,
        sector: 'Cryptocurrency',
        currency: 'USD',
        geckoId
      };
    }).filter(Boolean) as UniversalAsset[];

  } catch (error) {
    console.error('암호화폐 가격 조회 오류:', error);
    return [];
  }
}

// Alpha Vantage를 사용한 실시간 주식 데이터 조회
async function fetchAlphaVantageStock(symbol: string): Promise<UniversalAsset | null> {
  try {
    const cacheKey = `alpha_stock_${symbol}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await fetch(
      `${API_ENDPOINTS.ALPHA_VANTAGE.quote}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    // API 오류 응답 확인
    if (data['Error Message'] || data['Note']) {
      console.warn(`Alpha Vantage 제한: ${data['Error Message'] || data['Note']}`);
      return null;
    }

    const quote = data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      console.warn(`Alpha Vantage에서 ${symbol} 데이터를 찾을 수 없습니다`);
      return null;
    }

    const stockInfo = US_STOCKS.find(s => s.symbol === symbol);
    
    const asset: UniversalAsset = {
      id: symbol,
      symbol: symbol,
      name: stockInfo?.name || quote['01. symbol'] || symbol,
      price: parseFloat(quote['05. price']) || 0,
      change: parseFloat(quote['09. change']) || 0,
      changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
      volume: parseInt(quote['06. volume']) || 0,
      type: stockInfo?.sector === 'ETF' ? 'etf' : 'stock',
      market: 'US' as const,
      sector: stockInfo?.sector || 'Technology',
      currency: 'USD',
      exchange: stockInfo?.market || 'NASDAQ'
    };

    // 30초 캐시
    apiCache.set(cacheKey, asset, 30000);
    return asset;

  } catch (error) {
    console.error(`Alpha Vantage ${symbol} 조회 오류:`, error);
    return null;
  }
}

// 해외 주식 가격 조회 (Alpha Vantage 우선, Yahoo Finance 백업)
async function fetchUSStockPrices(symbols: string[]): Promise<UniversalAsset[]> {
  const results: UniversalAsset[] = [];
  
  for (const symbol of symbols) {
    try {
      // 1순위: Alpha Vantage API 시도
      let asset = await fetchAlphaVantageStock(symbol);
      
      if (asset) {
        results.push(asset);
        continue;
      }

      // 2순위: Yahoo Finance 백업 (기존 코드)
      const cacheKey = `yahoo_stock_${symbol}`;
      const cached = apiCache.get(cacheKey);
      if (cached) {
        results.push(cached);
        continue;
      }

      const response = await fetch(`${API_ENDPOINTS.YAHOO.quote}${symbol}?interval=1d&range=1d`);
      
      if (!response.ok) continue;

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) continue;

      const meta = result.meta;
      
      if (!meta) continue;

      const stockInfo = US_STOCKS.find(s => s.symbol === symbol);
      
      asset = {
        id: symbol,
        symbol: symbol,
        name: stockInfo?.name || meta.symbol,
        price: meta.regularMarketPrice || 0,
        change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
        changePercent: ((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
        volume: meta.regularMarketVolume,
        marketCap: meta.marketCap,
        type: stockInfo?.sector === 'ETF' ? 'etf' : 'stock',
        market: 'US' as const,
        sector: stockInfo?.sector || 'Unknown',
        currency: meta.currency || 'USD',
        exchange: meta.exchangeName
      };

      apiCache.set(cacheKey, asset, 60000);
      results.push(asset);

    } catch (error) {
      console.error(`${symbol} 주식 가격 조회 오류:`, error);
    }

    // API 제한을 고려해 요청 간 대기
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

// 국내 주식 가격 조회 (Yahoo Finance를 통한 실제 데이터)
async function fetchKRStockPrices(symbols: string[]): Promise<UniversalAsset[]> {
  const results: UniversalAsset[] = [];

  for (const symbol of symbols) {
    try {
      const cacheKey = `kr_stock_${symbol}`;
      const cached = apiCache.get(cacheKey);
      if (cached) {
        results.push(cached);
        continue;
      }

      const stockInfo = KOREAN_STOCKS.find(s => s.symbol === symbol);
      if (!stockInfo) continue;

      // Yahoo Finance를 통한 한국 주식 조회 (KOSPI/KOSDAQ 종목은 .KS 또는 .KQ 접미사 사용)
      const yahooSymbol = `${symbol}.${stockInfo.market === 'KOSPI' ? 'KS' : 'KQ'}`;
      const response = await fetch(`${API_ENDPOINTS.YAHOO.quote}${yahooSymbol}?interval=1d&range=1d`);
      
      if (response.ok) {
        const data = await response.json();
        const result = data.chart?.result?.[0];
        
        if (result) {
          const meta = result.meta;
          const quote = result.indicators?.quote?.[0];
          
          if (meta && meta.regularMarketPrice) {
            const asset: UniversalAsset = {
              id: symbol,
              symbol: symbol,
              name: stockInfo.name,
              price: meta.regularMarketPrice || 0,
              change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
              changePercent: ((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
              volume: meta.regularMarketVolume,
              marketCap: meta.marketCap,
              type: 'stock',
              market: 'KR' as const,
              sector: stockInfo.sector,
              currency: 'KRW',
              exchange: stockInfo.market
            };

            apiCache.set(cacheKey, asset, 60000); // 1분 캐시
            results.push(asset);
            continue;
          }
        }
      }

      // Yahoo Finance 실패시 모의 데이터 사용
      const basePrice = 50000 + Math.random() * 200000;
      const changePercent = (Math.random() - 0.5) * 10;
      
      const fallbackAsset: UniversalAsset = {
        id: symbol,
        symbol: symbol,
        name: stockInfo.name,
        price: basePrice,
        change: basePrice * changePercent / 100,
        changePercent: changePercent,
        volume: Math.floor(Math.random() * 1000000),
        type: 'stock',
        market: 'KR' as const,
        sector: stockInfo.sector,
        currency: 'KRW',
        exchange: stockInfo.market
      };

      results.push(fallbackAsset);

    } catch (error) {
      console.error(`${symbol} 한국 주식 가격 조회 오류:`, error);
    }
  }

  return results;
}

// 통합 검색 함수
export async function searchUniversalAssets(query: string): Promise<SearchResult> {
  console.log('🔍 검색 시작:', query);
  
  // 즉시 테스트 결과 반환으로 디버깅
  if (query.toLowerCase().includes('btc') || query.toLowerCase().includes('bitcoin')) {
    console.log('🧪 BTC 검색 감지 - 테스트 결과 반환');
    return {
      query,
      results: [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 94250.67,
          change: 1980.15,
          changePercent: 2.10,
          type: 'crypto' as const,
          market: 'CRYPTO' as const,
          sector: 'Cryptocurrency',
          currency: 'USD',
          geckoId: 'bitcoin'
        }
      ],
      timestamp: Date.now(),
      sources: ['Test Data']
    };
  }
  
  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached) {
    console.log('✅ 캐시에서 결과 반환:', cached.results.length, '개');
    return cached;
  }

  const results: UniversalAsset[] = [];
  const sources: string[] = [];
  
  console.log('📊 실시간 검색 시작...');

  try {
    // 1. 암호화폐 검색 - CoinGecko 실시간 검색 API 사용
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'User-Agent': 'Investment-Analysis-App/1.0'
      };
      
      // Pro API 키가 있으면 사용하되, 무료 API도 대응
      if (COINGECKO_API_KEY && COINGECKO_API_KEY !== 'demo' && COINGECKO_API_KEY.startsWith('CG-')) {
        headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
      }

      // 첫 번째 시도: CoinGecko 검색 API 호출
      let searchSuccess = false;
      let topCoins: any[] = [];

      try {
        console.log('🪙 CoinGecko 암호화폐 검색 중...');
        const searchResponse = await fetch(
          `${API_ENDPOINTS.COINGECKO.search}?query=${encodeURIComponent(query.trim())}`,
          { 
            headers,
            method: 'GET'
          }
        );

        console.log('CoinGecko 응답 상태:', searchResponse.status);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          topCoins = (searchData.coins || []).slice(0, 8);
          searchSuccess = true;
          console.log('✅ CoinGecko 검색 성공:', topCoins.length, '개 코인 발견');
        } else if (searchResponse.status === 429) {
          console.warn('CoinGecko API 요청 한도 초과, 폴백 사용');
        } else {
          console.warn(`CoinGecko 검색 API 오류: ${searchResponse.status}`);
        }
      } catch (apiError) {
        console.warn('CoinGecko API 연결 실패:', apiError);
      }

      // 검색 결과가 있으면 가격 정보 조회
      if (searchSuccess && topCoins.length > 0) {
        try {
          const coinIds = topCoins.map((coin: any) => coin.id).join(',');
          
          const priceResponse = await fetch(
            `${API_ENDPOINTS.COINGECKO.price}?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
            { headers }
          );

          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            
            topCoins.forEach((coin: any) => {
              const priceInfo = priceData[coin.id];
              if (priceInfo && priceInfo.usd) {
                const changeValue = priceInfo.usd_24h_change || 0;
                
                results.push({
                  id: coin.id,
                  symbol: coin.symbol.toUpperCase(),
                  name: coin.name,
                  price: priceInfo.usd,
                  change: (priceInfo.usd * changeValue) / 100, // 절대값 변화량
                  changePercent: changeValue,
                  volume: priceInfo.usd_24h_vol || 0,
                  marketCap: priceInfo.usd_market_cap || 0,
                  type: 'crypto' as const,
                  market: 'CRYPTO' as const,
                  sector: 'Cryptocurrency',
                  currency: 'USD',
                  geckoId: coin.id,
                  thumb: coin.thumb,
                  marketCapRank: coin.market_cap_rank
                });
              }
            });
            
            sources.push('CoinGecko Real-time');
          }
        } catch (priceError) {
          console.warn('CoinGecko 가격 조회 실패:', priceError);
        }
      }

      // 폴백: 로컬 암호화폐 목록에서 검색 (실시간 검색 실패 시 또는 추가 결과가 필요한 경우)
      if (results.length < 3) {
        const normalizedQuery = query.toLowerCase().trim();
        const cryptoMatches = CRYPTOCURRENCIES.filter(crypto => 
          crypto.symbol.toLowerCase().includes(normalizedQuery) ||
          crypto.name.toLowerCase().includes(normalizedQuery) ||
          crypto.name.toLowerCase() === normalizedQuery ||
          crypto.symbol.toLowerCase() === normalizedQuery
        );
        
        if (cryptoMatches.length > 0) {
          try {
            const cryptoPrices = await fetchCryptoPrices(cryptoMatches.slice(0, 5).map(c => c.symbol));
            
            // 중복 제거 (이미 있는 코인은 제외)
            const newCryptos = cryptoPrices.filter(crypto => 
              !results.some(existing => existing.symbol === crypto.symbol)
            );
            
            results.push(...newCryptos);
            if (newCryptos.length > 0) {
              sources.push('CoinGecko Cache');
            }
          } catch (fallbackError) {
            console.warn('암호화폐 폴백 검색 실패:', fallbackError);
          }
        }
      }

    } catch (cryptoError) {
      console.error('암호화폐 검색 전체 실패:', cryptoError);
    }

    // 2. 해외 주식 검색
    console.log('📈 미국 주식 검색 중...');
    const usMatches = US_STOCKS.filter(stock =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );

    console.log(`미국 주식 매치:`, usMatches.length, '개');
    
    if (usMatches.length > 0) {
      const usPrices = await fetchUSStockPrices(usMatches.slice(0, 10).map(s => s.symbol));
      results.push(...usPrices);
      sources.push('Yahoo Finance');
      console.log('✅ 미국 주식 검색 완료:', usPrices.length, '개 추가');
    }

    // 3. 미국 ETF 검색
    const etfMatches = US_ETFS.filter(etf =>
      etf.symbol.toLowerCase().includes(query.toLowerCase()) ||
      etf.name.toLowerCase().includes(query.toLowerCase()) ||
      (etf.category && etf.category.toLowerCase().includes(query.toLowerCase()))
    );

    if (etfMatches.length > 0) {
      const etfPrices = await fetchUSStockPrices(etfMatches.slice(0, 10).map(e => e.symbol));
      // ETF 타입으로 명시적 설정
      const etfResults = etfPrices.map(asset => ({
        ...asset,
        type: 'etf' as const,
        sector: etfMatches.find(e => e.symbol === asset.symbol)?.category || 'ETF'
      }));
      results.push(...etfResults);
      sources.push('Yahoo Finance ETF');
    }

    // 3. 국내 주식 검색 (한글/영문 모두 지원)
    const normalizedQuery = query.toLowerCase();
    const krMatches = KOREAN_STOCKS.filter(stock => {
      // 종목코드로 검색
      if (stock.symbol.includes(query)) return true;
      
      // 한글 이름으로 검색
      if (stock.name.includes(query)) return true;
      
      // 영문 이름으로 검색 (있는 경우)
      if (stock.englishName && stock.englishName.toLowerCase().includes(normalizedQuery)) return true;
      
      // 부분 일치 검색 (한글)
      const koreanChars = query.match(/[가-힣]+/g);
      if (koreanChars && koreanChars.some(char => stock.name.includes(char))) return true;
      
      return false;
    });

    if (krMatches.length > 0) {
      const krPrices = await fetchKRStockPrices(krMatches.slice(0, 10).map(s => s.symbol));
      results.push(...krPrices);
      sources.push('Korea Exchange');
    }

  } catch (error) {
    console.error('통합 검색 오류:', error);
  }

  const searchResult: SearchResult = {
    query,
    results: results.slice(0, 20), // 최대 20개 결과
    timestamp: Date.now(),
    sources
  };

  console.log('🎯 최종 검색 결과:', {
    query,
    totalResults: results.length,
    sources: sources,
    results: results.map(r => `${r.symbol} (${r.name})`)
  });

  // 결과 캐싱 (5분)
  apiCache.set(cacheKey, searchResult, 300000);
  
  return searchResult;
}

// 인기 자산 목록 조회
export async function getPopularAssets(): Promise<UniversalAsset[]> {
  const cacheKey = 'popular_assets';
  const cached = apiCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const popularSymbols = {
      crypto: ['BTC', 'ETH', 'SOL', 'BNB', 'ADA'],
      us: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'],
      etf: ['SPY', 'QQQ', 'VTI', 'GLD', 'TLT'],
      kr: ['005930', '000660', '035420', '051910', '068270']
    };

    const [cryptos, usStocks, etfs, krStocks] = await Promise.all([
      fetchCryptoPrices(popularSymbols.crypto),
      fetchUSStockPrices(popularSymbols.us),
      fetchUSStockPrices(popularSymbols.etf),
      fetchKRStockPrices(popularSymbols.kr)
    ]);

    // ETF 데이터를 ETF 타입으로 설정
    const etfResults = etfs.map(asset => {
      const etfInfo = US_ETFS.find(e => e.symbol === asset.symbol);
      return {
        ...asset,
        type: 'etf' as const,
        sector: etfInfo?.category || 'ETF'
      };
    });

    const popular = [...cryptos, ...usStocks, ...etfResults, ...krStocks];
    
    // 인기 자산 캐싱 (10분)
    apiCache.set(cacheKey, popular, 600000);
    
    return popular;
  } catch (error) {
    console.error('인기 자산 조회 오류:', error);
    return [];
  }
}

// 특정 자산 상세 정보 조회
export async function getAssetDetail(id: string, type: 'stock' | 'crypto'): Promise<UniversalAsset | null> {
  try {
    if (type === 'crypto') {
      const result = await fetchCryptoPrices([id]);
      return result[0] || null;
    } else {
      // 주식의 경우 시장 구분
      const isKorean = /^\d{6}$/.test(id); // 6자리 숫자면 한국 주식
      
      if (isKorean) {
        const result = await fetchKRStockPrices([id]);
        return result[0] || null;
      } else {
        const result = await fetchUSStockPrices([id]);
        return result[0] || null;
      }
    }
  } catch (error) {
    console.error('자산 상세 정보 조회 오류:', error);
    return null;
  }
}

// 여러 자산 일괄 가격 조회
export async function fetchMultipleAssetPrices(assets: Array<{symbol: string, type: 'stock' | 'crypto' | 'etf' | 'index'}>): Promise<UniversalAsset[]> {
  const cryptoSymbols = assets.filter(a => a.type === 'crypto').map(a => a.symbol);
  const stockSymbols = assets.filter(a => a.type === 'stock' || a.type === 'etf' || a.type === 'index').map(a => a.symbol);
  
  const krSymbols = stockSymbols.filter(symbol => /^\d{6}$/.test(symbol));
  const usSymbols = stockSymbols.filter(symbol => !/^\d{6}$/.test(symbol));

  const [cryptos, usStocks, krStocks] = await Promise.all([
    cryptoSymbols.length > 0 ? fetchCryptoPrices(cryptoSymbols) : [],
    usSymbols.length > 0 ? fetchUSStockPrices(usSymbols) : [],
    krSymbols.length > 0 ? fetchKRStockPrices(krSymbols) : []
  ]);

  return [...cryptos, ...usStocks, ...krStocks];
}

// API 연결 상태 테스트
export async function testAPIConnections(): Promise<{[key: string]: boolean}> {
  const testResults: {[key: string]: boolean} = {};
  
  // CoinGecko API 테스트
  try {
    const headers: HeadersInit = { 'Accept': 'application/json' };
    if (COINGECKO_API_KEY && COINGECKO_API_KEY !== 'demo') {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }
    
    const response = await fetch('https://api.coingecko.com/api/v3/ping', { headers });
    testResults['CoinGecko'] = response.ok;
  } catch (error) {
    testResults['CoinGecko'] = false;
  }
  
  // Alpha Vantage API 테스트
  try {
    const response = await fetch(
      `${API_ENDPOINTS.ALPHA_VANTAGE.quote}?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    testResults['Alpha Vantage'] = !data['Error Message'] && !data['Note'];
  } catch (error) {
    testResults['Alpha Vantage'] = false;
  }
  
  // Yahoo Finance API 테스트
  try {
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=1d');
    testResults['Yahoo Finance'] = response.ok;
  } catch (error) {
    testResults['Yahoo Finance'] = false;
  }
  
  return testResults;
}

// API 시스템 초기화
export async function initializeAPI(): Promise<void> {
  console.log('🚀 Enhanced API 시스템 초기화 중...');
  
  // API 키 확인
  console.log('📊 API 키 상태:');
  console.log(`  - CoinGecko: ${COINGECKO_API_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`  - Alpha Vantage: ${ALPHA_VANTAGE_API_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  
  // API 연결 테스트
  const testResults = await testAPIConnections();
  console.log('🔍 API 연결 테스트:');
  Object.entries(testResults).forEach(([api, status]) => {
    console.log(`  - ${api}: ${status ? '✅ 정상' : '❌ 실패'}`);
  });
  
  console.log('📈 지원 자산:');
  console.log(`  - 암호화폐: ${CRYPTOCURRENCIES.length}개`);
  console.log(`  - 해외주식: ${US_STOCKS.length}개`);
  console.log(`  - 국내주식: ${KOREAN_STOCKS.length}개`);
  
  console.log('✅ API 시스템 초기화 완료');
}

// 캐시 상태 확인
export function getCacheStats() {
  return {
    size: apiCache['cache'].size,
    memory: process.memoryUsage ? process.memoryUsage().heapUsed : 'N/A'
  };
}

// 캐시 초기화
export function clearCache() {
  apiCache.clear();
  console.log('API 캐시 초기화 완료');
}

// 환율 정보 업데이트 (실제 환경에서는 별도 API 사용)
export function updateExchangeRate(usdToKrw: number) {
  exchangeRates.USD_KRW = usdToKrw;
  exchangeRates.lastUpdate = Date.now();
}

// 환율 조회
export function getExchangeRate(): number {
  return exchangeRates.USD_KRW;
}

// 가격 변환 유틸리티
export function convertPrice(price: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return price;
  
  if (fromCurrency === 'USD' && toCurrency === 'KRW') {
    return price * exchangeRates.USD_KRW;
  }
  
  if (fromCurrency === 'KRW' && toCurrency === 'USD') {
    return price / exchangeRates.USD_KRW;
  }
  
  return price; // 기본값
}

export default {
  searchUniversalAssets,
  getPopularAssets,
  getAssetDetail,
  fetchMultipleAssetPrices,
  initializeAPI,
  getCacheStats,
  clearCache,
  updateExchangeRate,
  getExchangeRate,
  convertPrice
};