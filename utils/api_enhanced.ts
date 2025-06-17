/**
 * 강화된 API 시스템 - 해외주식, 국내주식, 암호화폐 통합 검색
 * - 실시간 가격 정보 제공
 * - 통합 검색 기능
 * - 캐싱 및 에러 처리
 * - 여러 API 소스 활용
 */

// 환경 설정
const API_ENDPOINTS = {
  // 암호화폐 - CoinGecko (무료, 신뢰도 높음)
  COINGECKO: {
    search: 'https://api.coingecko.com/api/v3/search',
    price: 'https://api.coingecko.com/api/v3/simple/price',
    trending: 'https://api.coingecko.com/api/v3/search/trending',
    coins: 'https://api.coingecko.com/api/v3/coins/markets',
  },
  
  // 해외 주식 - Yahoo Finance (무료, 광범위)
  YAHOO: {
    search: 'https://query1.finance.yahoo.com/v1/finance/search',
    quote: 'https://query1.finance.yahoo.com/v8/finance/chart/',
    lookup: 'https://query2.finance.yahoo.com/v1/finance/lookup',
  },
  
  // 국내 주식 - KIS Developers (무료 티어 제공)
  KIS: {
    base: 'https://openapi.koreainvestment.com:9443',
    // 실제 구현시 OAuth 토큰 필요
  },
  
  // 대안 주식 API - Finnhub (무료 티어)
  FINNHUB: {
    search: 'https://finnhub.io/api/v1/search',
    quote: 'https://finnhub.io/api/v1/quote',
    token: 'demo', // 실제 사용시 토큰 필요
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
  { symbol: '005930', name: '삼성전자', sector: 'Technology', market: 'KOSPI' },
  { symbol: '000660', name: 'SK하이닉스', sector: 'Technology', market: 'KOSPI' },
  { symbol: '035420', name: 'NAVER', sector: 'Technology', market: 'KOSPI' },
  { symbol: '051910', name: 'LG화학', sector: 'Chemical', market: 'KOSPI' },
  { symbol: '006400', name: '삼성SDI', sector: 'Technology', market: 'KOSPI' },
  { symbol: '207940', name: '삼성바이오로직스', sector: 'Healthcare', market: 'KOSPI' },
  { symbol: '068270', name: '셀트리온', sector: 'Healthcare', market: 'KOSPI' },
  { symbol: '035720', name: '카카오', sector: 'Technology', market: 'KOSPI' },
  { symbol: '028260', name: '삼성물산', sector: 'Conglomerate', market: 'KOSPI' },
  { symbol: '066570', name: 'LG전자', sector: 'Technology', market: 'KOSPI' },
  { symbol: '323410', name: '카카오뱅크', sector: 'Financial', market: 'KOSPI' },
  { symbol: '003670', name: '포스코홀딩스', sector: 'Steel', market: 'KOSPI' },
  { symbol: '000270', name: '기아', sector: 'Automotive', market: 'KOSPI' },
  { symbol: '005380', name: '현대차', sector: 'Automotive', market: 'KOSPI' },
  { symbol: '012330', name: '현대모비스', sector: 'Automotive', market: 'KOSPI' },
  { symbol: '017670', name: 'SK텔레콤', sector: 'Telecom', market: 'KOSPI' },
  { symbol: '030200', name: 'KT', sector: 'Telecom', market: 'KOSPI' },
  { symbol: '055550', name: '신한지주', sector: 'Financial', market: 'KOSPI' },
  { symbol: '086790', name: '하나금융지주', sector: 'Financial', market: 'KOSPI' },
  { symbol: '105560', name: 'KB금융', sector: 'Financial', market: 'KOSPI' },
  { symbol: '018260', name: '삼성에스디에스', sector: 'Technology', market: 'KOSPI' },
  { symbol: '036570', name: '엔씨소프트', sector: 'Technology', market: 'KOSPI' },
  { symbol: '251270', name: '넷마블', sector: 'Technology', market: 'KOSPI' },
  { symbol: '377300', name: '카카오페이', sector: 'Financial', market: 'KOSPI' },
  { symbol: '047050', name: '포스코인터내셔널', sector: 'Trading', market: 'KOSPI' },
  // 코스닥 주요 종목
  { symbol: '247540', name: '에코프로비엠', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '086520', name: '에코프로', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '091990', name: '셀트리온헬스케어', sector: 'Healthcare', market: 'KOSDAQ' },
  { symbol: '196170', name: '알테오젠', sector: 'Healthcare', market: 'KOSDAQ' },
  { symbol: '058470', name: '리노공업', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '240810', name: '원익IPS', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '357780', name: '솔브레인', sector: 'Chemical', market: 'KOSDAQ' },
  { symbol: '039030', name: '이오테크닉스', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '067310', name: '하나마이크론', sector: 'Technology', market: 'KOSDAQ' },
  { symbol: '348210', name: '넥스틴', sector: 'Technology', market: 'KOSDAQ' },
];

// 해외 주요 주식 목록
const US_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', market: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', market: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', market: 'NASDAQ' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', market: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Staples', market: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Discretionary', market: 'NYSE' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial', market: 'NYSE' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', market: 'NYSE' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Consumer Staples', market: 'NASDAQ' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication', market: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', market: 'NYSE' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', market: 'NYSE' },
  { symbol: 'ACN', name: 'Accenture plc', sector: 'Technology', market: 'NYSE' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', sector: 'Technology', market: 'NASDAQ' },
  // ETF 추가
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF', market: 'NYSE' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF', market: 'NASDAQ' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', sector: 'ETF', market: 'NYSE' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', sector: 'ETF', market: 'NYSE' },
  { symbol: 'VWO', name: 'Vanguard Emerging Markets Stock ETF', sector: 'ETF', market: 'NYSE' },
];

// 주요 암호화폐 목록
const CRYPTOCURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin', geckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', geckoId: 'ethereum' },
  { symbol: 'BNB', name: 'BNB', geckoId: 'binancecoin' },
  { symbol: 'XRP', name: 'Ripple', geckoId: 'ripple' },
  { symbol: 'SOL', name: 'Solana', geckoId: 'solana' },
  { symbol: 'ADA', name: 'Cardano', geckoId: 'cardano' },
  { symbol: 'AVAX', name: 'Avalanche', geckoId: 'avalanche-2' },
  { symbol: 'DOGE', name: 'Dogecoin', geckoId: 'dogecoin' },
  { symbol: 'TRX', name: 'TRON', geckoId: 'tron' },
  { symbol: 'MATIC', name: 'Polygon', geckoId: 'matic-network' },
  { symbol: 'DOT', name: 'Polkadot', geckoId: 'polkadot' },
  { symbol: 'SHIB', name: 'Shiba Inu', geckoId: 'shiba-inu' },
  { symbol: 'LTC', name: 'Litecoin', geckoId: 'litecoin' },
  { symbol: 'UNI', name: 'Uniswap', geckoId: 'uniswap' },
  { symbol: 'LINK', name: 'Chainlink', geckoId: 'chainlink' },
  { symbol: 'ATOM', name: 'Cosmos', geckoId: 'cosmos' },
  { symbol: 'XLM', name: 'Stellar', geckoId: 'stellar' },
  { symbol: 'ETC', name: 'Ethereum Classic', geckoId: 'ethereum-classic' },
  { symbol: 'NEAR', name: 'NEAR Protocol', geckoId: 'near' },
  { symbol: 'FIL', name: 'Filecoin', geckoId: 'filecoin' },
];

// 암호화폐 가격 조회 (CoinGecko)
async function fetchCryptoPrices(symbols: string[]): Promise<UniversalAsset[]> {
  try {
    const geckoIds = symbols.map(symbol => {
      const crypto = CRYPTOCURRENCIES.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
      return crypto?.geckoId;
    }).filter(Boolean);

    if (geckoIds.length === 0) return [];

    const response = await fetch(
      `${API_ENDPOINTS.COINGECKO.price}?ids=${geckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
    );

    if (!response.ok) throw new Error('CoinGecko API 오류');

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

// 해외 주식 가격 조회 (Yahoo Finance)
async function fetchUSStockPrices(symbols: string[]): Promise<UniversalAsset[]> {
  const results: UniversalAsset[] = [];
  
  for (const symbol of symbols) {
    try {
      const cacheKey = `us_stock_${symbol}`;
      const cached = apiCache.get(cacheKey);
      if (cached) {
        results.push(cached);
        continue;
      }

      // Yahoo Finance API 호출
      const response = await fetch(`${API_ENDPOINTS.YAHOO.quote}${symbol}?interval=1d&range=1d`);
      
      if (!response.ok) continue;

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) continue;

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      
      if (!meta || !quote) continue;

      const stockInfo = US_STOCKS.find(s => s.symbol === symbol);
      
      const asset: UniversalAsset = {
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

      apiCache.set(cacheKey, asset);
      results.push(asset);

    } catch (error) {
      console.error(`${symbol} 주식 가격 조회 오류:`, error);
    }
  }

  return results;
}

// 국내 주식 가격 조회 (모의 데이터 - 실제 API 연동 필요)
async function fetchKRStockPrices(symbols: string[]): Promise<UniversalAsset[]> {
  const results: UniversalAsset[] = [];

  for (const symbol of symbols) {
    const stockInfo = KOREAN_STOCKS.find(s => s.symbol === symbol);
    if (!stockInfo) continue;

    // 실제 환경에서는 KIS API 또는 다른 한국 주식 API 사용
    // 현재는 모의 데이터 생성
    const basePrice = 50000 + Math.random() * 200000;
    const changePercent = (Math.random() - 0.5) * 10;
    
    const asset: UniversalAsset = {
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

    results.push(asset);
  }

  return results;
}

// 통합 검색 함수
export async function searchUniversalAssets(query: string): Promise<SearchResult> {
  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const results: UniversalAsset[] = [];
  const sources: string[] = [];

  try {
    // 1. 암호화폐 검색
    const cryptoMatches = CRYPTOCURRENCIES.filter(crypto => 
      crypto.symbol.toLowerCase().includes(query.toLowerCase()) ||
      crypto.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (cryptoMatches.length > 0) {
      const cryptoPrices = await fetchCryptoPrices(cryptoMatches.map(c => c.symbol));
      results.push(...cryptoPrices);
      sources.push('CoinGecko');
    }

    // 2. 해외 주식 검색
    const usMatches = US_STOCKS.filter(stock =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );

    if (usMatches.length > 0) {
      const usPrices = await fetchUSStockPrices(usMatches.slice(0, 10).map(s => s.symbol));
      results.push(...usPrices);
      sources.push('Yahoo Finance');
    }

    // 3. 국내 주식 검색
    const krMatches = KOREAN_STOCKS.filter(stock =>
      stock.symbol.includes(query) ||
      stock.name.includes(query)
    );

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
      crypto: ['BTC', 'ETH', 'BNB', 'XRP', 'ADA'],
      us: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'],
      kr: ['005930', '000660', '035420', '051910', '068270']
    };

    const [cryptos, usStocks, krStocks] = await Promise.all([
      fetchCryptoPrices(popularSymbols.crypto),
      fetchUSStockPrices(popularSymbols.us),
      fetchKRStockPrices(popularSymbols.kr)
    ]);

    const popular = [...cryptos, ...usStocks, ...krStocks];
    
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
export async function fetchMultipleAssetPrices(assets: Array<{symbol: string, type: 'stock' | 'crypto'}>): Promise<UniversalAsset[]> {
  const cryptoSymbols = assets.filter(a => a.type === 'crypto').map(a => a.symbol);
  const stockSymbols = assets.filter(a => a.type === 'stock').map(a => a.symbol);
  
  const krSymbols = stockSymbols.filter(symbol => /^\d{6}$/.test(symbol));
  const usSymbols = stockSymbols.filter(symbol => !/^\d{6}$/.test(symbol));

  const [cryptos, usStocks, krStocks] = await Promise.all([
    cryptoSymbols.length > 0 ? fetchCryptoPrices(cryptoSymbols) : [],
    usSymbols.length > 0 ? fetchUSStockPrices(usSymbols) : [],
    krSymbols.length > 0 ? fetchKRStockPrices(krSymbols) : []
  ]);

  return [...cryptos, ...usStocks, ...krStocks];
}

// API 시스템 초기화
export function initializeAPI(): Promise<void> {
  return new Promise((resolve) => {
    console.log('Enhanced API 시스템 초기화 완료');
    console.log('지원 자산:', {
      암호화폐: CRYPTOCURRENCIES.length,
      해외주식: US_STOCKS.length,
      국내주식: KOREAN_STOCKS.length
    });
    resolve();
  });
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