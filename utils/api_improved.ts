/**
 * 개선된 API 시스템
 * - 여러 무료 API 소스 활용
 * - 캐싱 및 폴백 시스템
 * - 실시간 가격 정보 제공
 */

// API 설정
const API_CONFIG = {
  // Binance API (암호화폐 - 무료, 제한 없음)
  BINANCE: {
    ticker24hr: 'https://api.binance.com/api/v3/ticker/24hr',
    price: 'https://api.binance.com/api/v3/ticker/price',
  },
  
  // CoinGecko API (암호화폐 - 무료 티어: 분당 10-30회 호출)
  COINGECKO: {
    search: 'https://api.coingecko.com/api/v3/search',
    price: 'https://api.coingecko.com/api/v3/simple/price',
    trending: 'https://api.coingecko.com/api/v3/search/trending',
  },
  
  // Alpha Vantage (주식 - 무료 API 키 필요, 분당 5회)
  ALPHA_VANTAGE: {
    key: 'demo', // 'demo' 키는 제한된 심볼만 지원
    quote: 'https://www.alphavantage.co/query',
  },
  
  // Twelve Data (주식 - 무료 티어: 일 800회)
  TWELVE_DATA: {
    key: 'demo', // 실제 사용시 무료 키 발급 필요
    quote: 'https://api.twelvedata.com/quote',
    search: 'https://api.twelvedata.com/symbol_search',
  },
  
  // Yahoo Finance (비공식 API)
  YAHOO: {
    quote: 'https://query1.finance.yahoo.com/v8/finance/chart/',
  },
  
  // 한국 주식 (KRX 비공식)
  KRX: {
    // KRX 공식 API는 인증 필요, 대안으로 크롤링 서비스 활용
  }
};

// 캐시 시스템
const priceCache = new Map<string, {
  price: number;
  changePercent: number;
  timestamp: number;
}>();

const CACHE_DURATION = 60000; // 1분

// 환율 정보 (실시간 API 대신 일일 업데이트)
let exchangeRates = {
  USD_KRW: 1380,
  lastUpdate: Date.now()
};

// 인터페이스 정의
export interface AssetData {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  sector: string;
  type: 'stock' | 'crypto' | 'etf' | 'commodity';
  exchange?: string;
  currency: string;
}

// Binance API를 통한 암호화폐 가격 조회
async function fetchCryptoPriceFromBinance(symbol: string): Promise<AssetData | null> {
  try {
    const response = await fetch(`${API_CONFIG.BINANCE.ticker24hr}?symbol=${symbol}USDT`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      ticker: symbol,
      name: getCryptoNameBySymbol(symbol),
      price: parseFloat(data.lastPrice),
      changePercent: parseFloat(data.priceChangePercent),
      volume: parseFloat(data.volume),
      sector: 'Cryptocurrency',
      type: 'crypto',
      currency: 'USD'
    };
  } catch (error) {
    console.error(`Binance API error for ${symbol}:`, error);
    return null;
  }
}

// CoinGecko API를 통한 암호화폐 가격 조회 (백업)
async function fetchCryptoPriceFromCoinGecko(geckoId: string): Promise<AssetData | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.COINGECKO.price}?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const coinData = data[geckoId];
    
    if (!coinData) return null;
    
    return {
      ticker: geckoIdToSymbol[geckoId] || geckoId.toUpperCase(),
      name: getCryptoNameById(geckoId),
      price: coinData.usd,
      changePercent: coinData.usd_24h_change || 0,
      volume: coinData.usd_24h_vol,
      marketCap: coinData.usd_market_cap,
      sector: 'Cryptocurrency',
      type: 'crypto',
      currency: 'USD'
    };
  } catch (error) {
    console.error(`CoinGecko API error for ${geckoId}:`, error);
    return null;
  }
}

// Yahoo Finance를 통한 주식 가격 조회
async function fetchStockPriceFromYahoo(ticker: string): Promise<AssetData | null> {
  try {
    const response = await fetch(`${API_CONFIG.YAHOO.quote}${ticker}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const quote = data.chart.result[0];
    const price = quote.meta.regularMarketPrice;
    const previousClose = quote.meta.previousClose;
    const changePercent = ((price - previousClose) / previousClose) * 100;
    
    return {
      ticker: ticker,
      name: getStockNameByTicker(ticker),
      price: price,
      changePercent: changePercent,
      volume: quote.meta.regularMarketVolume,
      sector: getSectorByTicker(ticker),
      type: getAssetTypeByTicker(ticker),
      exchange: quote.meta.exchangeName,
      currency: quote.meta.currency
    };
  } catch (error) {
    console.error(`Yahoo Finance error for ${ticker}:`, error);
    return null;
  }
}

// 통합 가격 조회 함수
export async function fetchAssetPrice(
  identifier: string, 
  assetType: 'stock' | 'crypto'
): Promise<AssetData | null> {
  // 캐시 확인
  const cached = priceCache.get(identifier);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      ticker: identifier,
      name: assetType === 'crypto' ? getCryptoNameBySymbol(identifier) : getStockNameByTicker(identifier),
      price: cached.price,
      changePercent: cached.changePercent,
      sector: assetType === 'crypto' ? 'Cryptocurrency' : getSectorByTicker(identifier),
      type: assetType,
      currency: 'USD'
    };
  }
  
  let result: AssetData | null = null;
  
  if (assetType === 'crypto') {
    // 1차: Binance 시도
    result = await fetchCryptoPriceFromBinance(identifier);
    
    // 2차: CoinGecko 시도
    if (!result) {
      const geckoId = symbolToGeckoId[identifier];
      if (geckoId) {
        result = await fetchCryptoPriceFromCoinGecko(geckoId);
      }
    }
  } else {
    // 주식: Yahoo Finance 시도
    result = await fetchStockPriceFromYahoo(identifier);
  }
  
  // 캐시 업데이트
  if (result) {
    priceCache.set(identifier, {
      price: result.price,
      changePercent: result.changePercent,
      timestamp: Date.now()
    });
  }
  
  return result;
}

// 여러 자산 동시 조회 (배치 처리)
export async function fetchMultipleAssetPrices(
  assets: Array<{ identifier: string; type: 'stock' | 'crypto' }>
): Promise<Record<string, AssetData | null>> {
  const results: Record<string, AssetData | null> = {};
  
  // 암호화폐와 주식 분리
  const cryptos = assets.filter(a => a.type === 'crypto');
  const stocks = assets.filter(a => a.type === 'stock');
  
  // 암호화폐 배치 처리 (CoinGecko)
  if (cryptos.length > 0) {
    const geckoIds = cryptos
      .map(c => symbolToGeckoId[c.identifier])
      .filter(Boolean)
      .join(',');
    
    if (geckoIds) {
      try {
        const response = await fetch(
          `${API_CONFIG.COINGECKO.price}?ids=${geckoIds}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          for (const crypto of cryptos) {
            const geckoId = symbolToGeckoId[crypto.identifier];
            if (geckoId && data[geckoId]) {
              const coinData = data[geckoId];
              results[crypto.identifier] = {
                ticker: crypto.identifier,
                name: getCryptoNameBySymbol(crypto.identifier),
                price: coinData.usd,
                changePercent: coinData.usd_24h_change || 0,
                sector: 'Cryptocurrency',
                type: 'crypto',
                currency: 'USD'
              };
              
              // 캐시 업데이트
              priceCache.set(crypto.identifier, {
                price: coinData.usd,
                changePercent: coinData.usd_24h_change || 0,
                timestamp: Date.now()
              });
            }
          }
        }
      } catch (error) {
        console.error('Batch crypto fetch error:', error);
      }
    }
  }
  
  // 주식은 개별 처리 (Yahoo Finance는 배치 API 제한적)
  await Promise.all(
    stocks.map(async (stock) => {
      results[stock.identifier] = await fetchAssetPrice(stock.identifier, 'stock');
    })
  );
  
  return results;
}

// 검색 기능
export async function searchAssets(query: string): Promise<AssetData[]> {
  if (!query || query.length < 2) return [];
  
  const results: AssetData[] = [];
  const upperQuery = query.toUpperCase();
  
  // 1. 로컬 데이터베이스에서 검색
  const localResults = searchLocalDatabase(query);
  results.push(...localResults);
  
  // 2. 인기 자산 중 매칭
  const popularMatches = POPULAR_ASSETS.filter(asset => 
    asset.ticker.includes(upperQuery) || 
    asset.name.toLowerCase().includes(query.toLowerCase())
  );
  
  // 실시간 가격 업데이트
  const pricePromises = popularMatches.map(asset => 
    fetchAssetPrice(asset.ticker, asset.type)
  );
  
  const priceResults = await Promise.all(pricePromises);
  
  priceResults.forEach((priceData, index) => {
    if (priceData) {
      results.push(priceData);
    } else {
      // 가격 조회 실패시 기본 데이터 사용
      results.push(popularMatches[index]);
    }
  });
  
  return results.slice(0, 20); // 최대 20개 결과
}

// 환율 정보 업데이트
export async function updateExchangeRate(): Promise<number> {
  try {
    // 무료 환율 API (exchangerate-api.com)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.ok) {
      const data = await response.json();
      exchangeRates.USD_KRW = data.rates.KRW;
      exchangeRates.lastUpdate = Date.now();
    }
  } catch (error) {
    console.error('Exchange rate update failed:', error);
  }
  
  return exchangeRates.USD_KRW;
}

// 한국 원화로 변환
export function convertToKRW(usdAmount: number): number {
  return usdAmount * exchangeRates.USD_KRW;
}

// 심볼과 CoinGecko ID 매핑
const symbolToGeckoId: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'SOL': 'solana',
  'MATIC': 'matic-network',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'LTC': 'litecoin',
  'ATOM': 'cosmos',
  'XLM': 'stellar',
  'ALGO': 'algorand',
  'VET': 'vechain',
  'FTM': 'fantom',
  'NEAR': 'near',
  'SAND': 'the-sandbox'
};

const geckoIdToSymbol: Record<string, string> = Object.entries(symbolToGeckoId).reduce(
  (acc, [symbol, id]) => ({ ...acc, [id]: symbol }), {}
);

// 도우미 함수들
function getCryptoNameBySymbol(symbol: string): string {
  const names: Record<string, string> = {
    'BTC': '비트코인',
    'ETH': '이더리움',
    'BNB': '바이낸스 코인',
    'XRP': '리플',
    'ADA': '카르다노',
    'DOGE': '도지코인',
    'SOL': '솔라나',
    'MATIC': '폴리곤',
    'DOT': '폴카닷',
    'AVAX': '아발란체',
    'LINK': '체인링크',
    'UNI': '유니스왑',
    'LTC': '라이트코인',
    'ATOM': '코스모스',
    'XLM': '스텔라',
    'ALGO': '알고랜드',
    'VET': '비체인',
    'FTM': '팬텀',
    'NEAR': '니어',
    'SAND': '샌드박스'
  };
  
  return names[symbol] || symbol;
}

function getCryptoNameById(geckoId: string): string {
  const symbol = geckoIdToSymbol[geckoId];
  return symbol ? getCryptoNameBySymbol(symbol) : geckoId;
}

function getStockNameByTicker(ticker: string): string {
  const names: Record<string, string> = {
    'AAPL': '애플',
    'MSFT': '마이크로소프트',
    'GOOGL': '구글',
    'AMZN': '아마존',
    'TSLA': '테슬라',
    'META': '메타',
    'NVDA': '엔비디아',
    'SPY': 'S&P 500 ETF',
    'QQQ': '나스닥 100 ETF',
    'TLT': '20년+ 미국채 ETF',
    'GLD': '금 ETF',
    'VTI': '전체 주식시장 ETF',
    'BRK.B': '버크셔 해서웨이',
    'JPM': 'JP모건',
    'JNJ': '존슨앤존슨',
    'V': '비자',
    'PG': '프록터앤갬블',
    'UNH': '유나이티드헬스',
    'HD': '홈디포',
    'MA': '마스터카드',
    'DIS': '디즈니',
    'NFLX': '넷플릭스'
  };
  
  return names[ticker] || ticker;
}

function getSectorByTicker(ticker: string): string {
  const sectors: Record<string, string> = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOGL': 'Technology',
    'AMZN': 'Consumer Discretionary',
    'TSLA': 'Consumer Discretionary',
    'META': 'Technology',
    'NVDA': 'Technology',
    'JPM': 'Financial',
    'JNJ': 'Healthcare',
    'V': 'Financial',
    'PG': 'Consumer Staples',
    'UNH': 'Healthcare',
    'HD': 'Consumer Discretionary',
    'MA': 'Financial',
    'DIS': 'Communication Services',
    'NFLX': 'Communication Services',
    'SPY': 'Broad Market ETF',
    'QQQ': 'Technology ETF',
    'TLT': 'Bond ETF',
    'GLD': 'Commodity ETF',
    'VTI': 'Broad Market ETF'
  };
  
  return sectors[ticker] || 'Other';
}

function getAssetTypeByTicker(ticker: string): 'stock' | 'etf' | 'commodity' {
  const etfs = ['SPY', 'QQQ', 'TLT', 'GLD', 'VTI', 'IWM', 'EEM', 'VNQ', 'AGG', 'DIA'];
  return etfs.includes(ticker) ? 'etf' : 'stock';
}

// 인기 자산 목록 (검색 및 기본 표시용)
const POPULAR_ASSETS: AssetData[] = [
  // 주요 암호화폐
  { ticker: 'BTC', name: '비트코인', price: 95000, changePercent: 0, sector: 'Cryptocurrency', type: 'crypto', currency: 'USD' },
  { ticker: 'ETH', name: '이더리움', price: 3800, changePercent: 0, sector: 'Cryptocurrency', type: 'crypto', currency: 'USD' },
  { ticker: 'BNB', name: '바이낸스 코인', price: 320, changePercent: 0, sector: 'Cryptocurrency', type: 'crypto', currency: 'USD' },
  { ticker: 'SOL', name: '솔라나', price: 210, changePercent: 0, sector: 'Cryptocurrency', type: 'crypto', currency: 'USD' },
  
  // 주요 주식
  { ticker: 'AAPL', name: '애플', price: 195, changePercent: 0, sector: 'Technology', type: 'stock', currency: 'USD' },
  { ticker: 'MSFT', name: '마이크로소프트', price: 420, changePercent: 0, sector: 'Technology', type: 'stock', currency: 'USD' },
  { ticker: 'NVDA', name: '엔비디아', price: 880, changePercent: 0, sector: 'Technology', type: 'stock', currency: 'USD' },
  { ticker: 'TSLA', name: '테슬라', price: 250, changePercent: 0, sector: 'Consumer Discretionary', type: 'stock', currency: 'USD' },
  
  // 주요 ETF
  { ticker: 'SPY', name: 'S&P 500 ETF', price: 480, changePercent: 0, sector: 'Broad Market ETF', type: 'etf', currency: 'USD' },
  { ticker: 'QQQ', name: '나스닥 100 ETF', price: 425, changePercent: 0, sector: 'Technology ETF', type: 'etf', currency: 'USD' },
  { ticker: 'TLT', name: '20년+ 미국채 ETF', price: 90, changePercent: 0, sector: 'Bond ETF', type: 'etf', currency: 'USD' },
  { ticker: 'GLD', name: '금 ETF', price: 200, changePercent: 0, sector: 'Commodity ETF', type: 'etf', currency: 'USD' }
];

// 로컬 데이터베이스 검색 (오프라인 지원)
function searchLocalDatabase(query: string): AssetData[] {
  const upperQuery = query.toUpperCase();
  return POPULAR_ASSETS.filter(asset => 
    asset.ticker.includes(upperQuery) || 
    asset.name.toLowerCase().includes(query.toLowerCase())
  );
}

// 트렌딩 자산 조회
export async function getTrendingAssets(): Promise<AssetData[]> {
  try {
    // CoinGecko 트렌딩 API
    const response = await fetch(API_CONFIG.COINGECKO.trending);
    if (response.ok) {
      const data = await response.json();
      const trendingCoins = data.coins.slice(0, 5);
      
      // 트렌딩 코인 가격 정보 조회
      const pricePromises = trendingCoins.map((coin: any) => 
        fetchCryptoPriceFromCoinGecko(coin.item.id)
      );
      
      const results = await Promise.all(pricePromises);
      return results.filter(Boolean) as AssetData[];
    }
  } catch (error) {
    console.error('Failed to fetch trending assets:', error);
  }
  
  // 폴백: 인기 자산 반환
  return POPULAR_ASSETS.slice(0, 8);
}

// 초기화 함수
export async function initializeAPI() {
  // 환율 정보 업데이트
  await updateExchangeRate();
  
  // 24시간마다 환율 업데이트
  setInterval(() => {
    updateExchangeRate();
  }, 24 * 60 * 60 * 1000);
}

// Export all functions
export default {
  fetchAssetPrice,
  fetchMultipleAssetPrices,
  searchAssets,
  getTrendingAssets,
  updateExchangeRate,
  convertToKRW,
  initializeAPI
};