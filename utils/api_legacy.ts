interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

interface CoinGeckoSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

interface StockPrice {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
}

interface SearchedAsset {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  sector: string;
  type: 'stock' | 'crypto';
  geckoId?: string;
}

// Helper function to safely log warnings
function logAPIWarning(message: string) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message);
  }
}

// CoinGecko 검색 API - CORS 문제로 인해 fallback 데이터 우선 사용
export async function searchCrypto(query: string): Promise<SearchedAsset[]> {
  // 실제 CoinGecko API 호출 시도
  try {
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!searchResponse.ok) {
      throw new Error(`CoinGecko search API failed: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    const coins = searchData.coins?.slice(0, 10) || [];
    
    if (coins.length === 0) {
      throw new Error('No coins found in API response');
    }
    
    // 검색된 코인들의 가격 정보 가져오기
    const coinIds = coins.map((coin: CoinGeckoSearchResult) => coin.id).join(',');
    const priceResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!priceResponse.ok) {
      throw new Error(`CoinGecko price API failed: ${priceResponse.status}`);
    }
    
    const priceData: CoinGeckoPrice = await priceResponse.json();
    
    return coins.map((coin: CoinGeckoSearchResult) => {
      const price = priceData[coin.id];
      return {
        ticker: coin.symbol.toUpperCase(),
        name: coin.name,
        price: price?.usd || 0,
        changePercent: price?.usd_24h_change || 0,
        sector: getSectorByCoinId(coin.id),
        type: 'crypto' as const,
        geckoId: coin.id
      };
    });
    
  } catch (error) {
    // API 실패 시 fallback 데이터 사용 (개발 환경에서만 경고 출력)
    logAPIWarning('CoinGecko API unavailable, using mock data for search');
    
    const mockCryptos = [
      { id: 'bitcoin', symbol: 'BTC', name: '비트코인', price: 94250.67, changePercent: 2.10, sector: 'Digital Currency' },
      { id: 'ethereum', symbol: 'ETH', name: '이더리움', price: 3650.32, changePercent: -1.68, sector: 'Smart Contract' },
      { id: 'binancecoin', symbol: 'BNB', name: '바이낸스 코인', price: 310.45, changePercent: 4.14, sector: 'Exchange Token' },
      { id: 'ripple', symbol: 'XRP', name: '리플', price: 2.615, changePercent: 3.88, sector: 'Payment' },
      { id: 'cardano', symbol: 'ADA', name: '카르다노', price: 1.085, changePercent: -3.02, sector: 'Smart Contract' },
      { id: 'dogecoin', symbol: 'DOGE', name: '도지코인', price: 0.392, changePercent: 3.37, sector: 'Meme Coin' },
      { id: 'solana', symbol: 'SOL', name: '솔라나', price: 198.74, changePercent: 4.46, sector: 'Smart Contract' },
      { id: 'matic-network', symbol: 'MATIC', name: '폴리곤', price: 0.895, changePercent: -2.61, sector: 'Layer 2' },
      { id: 'polkadot', symbol: 'DOT', name: '폴카닷', price: 7.67, changePercent: 3.28, sector: 'Interoperability' },
      { id: 'avalanche-2', symbol: 'AVAX', name: '아발란체', price: 42.42, changePercent: 5.41, sector: 'Smart Contract' },
      { id: 'chainlink', symbol: 'LINK', name: '체인링크', price: 28.45, changePercent: 1.85, sector: 'Oracle' },
      { id: 'litecoin', symbol: 'LTC', name: '라이트코인', price: 108.23, changePercent: -0.95, sector: 'Digital Currency' },
      { id: 'uniswap', symbol: 'UNI', name: '유니스왑', price: 15.67, changePercent: 2.34, sector: 'DeFi' },
      { id: 'tron', symbol: 'TRX', name: '트론', price: 0.245, changePercent: 1.23, sector: 'Smart Contract' },
      { id: 'eos', symbol: 'EOS', name: 'EOS', price: 0.654, changePercent: -1.45, sector: 'Smart Contract' },
      { id: 'wrapped-bitcoin', symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 94100.23, changePercent: 2.05, sector: 'Wrapped Token' }
    ];

    const filteredCryptos = mockCryptos.filter(crypto => 
      crypto.name.toLowerCase().includes(query.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(query.toLowerCase())
    );

    return new Promise((resolve) => {
      setTimeout(() => {
        const results = filteredCryptos.slice(0, 10).map(crypto => ({
          ticker: crypto.symbol,
          name: crypto.name,
          price: crypto.price,
          changePercent: crypto.changePercent,
          sector: crypto.sector,
          type: 'crypto' as const,
          geckoId: crypto.id
        }));
        resolve(results);
      }, 300);
    });
  }
}

// 주식 검색 시뮬레이션 (실제로는 Yahoo Finance API 사용)
export async function searchStock(query: string): Promise<SearchedAsset[]> {
  const mockStocks = [
    { ticker: 'AAPL', name: '애플', sector: 'Technology', price: 192.53, changePercent: 1.24 },
    { ticker: 'MSFT', name: '마이크로소프트', sector: 'Technology', price: 415.26, changePercent: -0.36 },
    { ticker: 'GOOGL', name: '구글', sector: 'Technology', price: 175.84, changePercent: 0.63 },
    { ticker: 'AMZN', name: '아마존', sector: 'Consumer Discretionary', price: 151.94, changePercent: 1.2 },
    { ticker: 'TSLA', name: '테슬라', sector: 'Technology', price: 248.42, changePercent: -1.28 },
    { ticker: 'META', name: '메타', sector: 'Technology', price: 502.31, changePercent: -0.8 },
    { ticker: 'NVDA', name: '엔비디아', sector: 'Technology', price: 875.28, changePercent: 2.02 },
    { ticker: 'NFLX', name: '넷플릭스', sector: 'Communication Services', price: 486.71, changePercent: 2.1 },
    { ticker: 'BABA', name: '알리바바', sector: 'Consumer Discretionary', price: 85.42, changePercent: -0.85 },
    { ticker: 'V', name: '비자', sector: 'Financial', price: 267.82, changePercent: 0.5 },
    { ticker: 'JPM', name: 'JP모건', sector: 'Financial', price: 165.82, changePercent: 0.81 },
    { ticker: 'JNJ', name: '존슨앤존슨', sector: 'Healthcare', price: 158.24, changePercent: 0.29 },
    { ticker: 'PG', name: '프록터앤갤블', sector: 'Consumer Staples', price: 155.67, changePercent: 0.59 },
    { ticker: 'KO', name: '코카콜라', sector: 'Consumer Staples', price: 59.84, changePercent: 0.35 },
    { ticker: 'DIS', name: '디즈니', sector: 'Communication Services', price: 113.45, changePercent: -1.2 },
    { ticker: 'PYPL', name: '페이팔', sector: 'Financial', price: 78.45, changePercent: 1.45 },
    { ticker: 'ADBE', name: '어도비', sector: 'Technology', price: 564.23, changePercent: 0.82 },
    { ticker: 'CRM', name: '세일즈포스', sector: 'Technology', price: 285.67, changePercent: -0.45 },
    { ticker: 'UBER', name: '우버', sector: 'Technology', price: 72.34, changePercent: 2.15 },
    { ticker: 'SPOT', name: '스포티파이', sector: 'Communication Services', price: 385.92, changePercent: 1.67 },
    { ticker: 'BRK.B', name: '버크셔 해서웨이', sector: 'Financial', price: 445.67, changePercent: 0.42 },
    { ticker: 'WMT', name: '월마트', sector: 'Consumer Staples', price: 164.23, changePercent: 0.18 },
    { ticker: 'XOM', name: '엑손모빌', sector: 'Energy', price: 114.89, changePercent: -0.67 },
    // ETF 추가
    { ticker: 'TLT', name: '20년+ 미국 국채 ETF', sector: 'Bonds', price: 89.45, changePercent: -0.25 },
    { ticker: 'IEF', name: '7-10년 미국 국채 ETF', sector: 'Bonds', price: 97.82, changePercent: -0.15 },
    { ticker: 'SHY', name: '1-3년 미국 국채 ETF', sector: 'Bonds', price: 83.67, changePercent: -0.08 },
    { ticker: 'AGG', name: '종합 채권 ETF', sector: 'Bonds', price: 99.34, changePercent: -0.12 },
    { ticker: 'GLD', name: 'SPDR 금 ETF', sector: 'Precious Metals', price: 198.45, changePercent: 0.85 },
    { ticker: 'IAU', name: 'iShares 금 ETF', sector: 'Precious Metals', price: 38.92, changePercent: 0.82 },
    { ticker: 'SLV', name: 'iShares 은 ETF', sector: 'Precious Metals', price: 22.78, changePercent: 1.45 },
    { ticker: 'DBC', name: 'Invesco 원자재 ETF', sector: 'Commodities', price: 21.34, changePercent: 1.28 },
    { ticker: 'GSG', name: 'iShares 원자재 ETF', sector: 'Commodities', price: 17.89, changePercent: 0.95 },
    { ticker: 'USO', name: '미국 석유 ETF', sector: 'Commodities', price: 76.23, changePercent: 2.14 },
    { ticker: 'VNQ', name: 'Vanguard 리츠 ETF', sector: 'Real Estate ETF', price: 87.45, changePercent: 0.67 },
    { ticker: 'IYR', name: 'iShares 부동산 ETF', sector: 'Real Estate ETF', price: 89.12, changePercent: 0.54 },
    { ticker: 'VTI', name: 'Vanguard 전체 주식시장 ETF', sector: 'Broad Market ETF', price: 267.89, changePercent: 0.89 },
    { ticker: 'QQQ', name: 'Invesco 나스닥100 ETF', sector: 'Technology ETF', price: 421.56, changePercent: 1.23 },
    { ticker: 'SPY', name: 'SPDR S&P500 ETF', sector: 'Broad Market ETF', price: 478.92, changePercent: 0.76 },
    { ticker: 'EEM', name: '신흥시장 ETF', sector: 'Emerging Markets ETF', price: 41.67, changePercent: -0.34 },
    { ticker: 'VWO', name: 'Vanguard 신흥시장 ETF', sector: 'Emerging Markets ETF', price: 42.89, changePercent: -0.28 }
  ];
  
  const filteredStocks = mockStocks.filter(stock => 
    stock.name.toLowerCase().includes(query.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(query.toLowerCase())
  );
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = filteredStocks.slice(0, 8).map(stock => ({
        ticker: stock.ticker,
        name: stock.name,
        price: stock.price,
        changePercent: stock.changePercent,
        sector: stock.sector,
        type: 'stock' as const
      }));
      resolve(results);
    }, 500);
  });
}

// 통합 검색 함수
export async function searchAssets(query: string): Promise<SearchedAsset[]> {
  if (!query || query.length < 2) return [];
  
  try {
    const [cryptoResults, stockResults] = await Promise.all([
      searchCrypto(query),
      searchStock(query)
    ]);
    
    return [...cryptoResults, ...stockResults];
  } catch (error) {
    logAPIWarning(`Error searching assets: ${error}`);
    return [];
  }
}

function getSectorByCoinId(coinId: string): string {
  const sectorMap: Record<string, string> = {
    'bitcoin': 'Digital Currency',
    'ethereum': 'Smart Contract',
    'binancecoin': 'Exchange Token',
    'ripple': 'Payment',
    'cardano': 'Smart Contract',
    'solana': 'Smart Contract',
    'polkadot': 'Interoperability',
    'dogecoin': 'Meme Coin',
    'matic-network': 'Layer 2',
    'avalanche-2': 'Smart Contract',
    'chainlink': 'Oracle',
    'litecoin': 'Digital Currency',
    'uniswap': 'DeFi',
    'tron': 'Smart Contract',
    'eos': 'Smart Contract',
    'wrapped-bitcoin': 'Wrapped Token'
  };
  
  return sectorMap[coinId] || 'Cryptocurrency';
}

// CoinGecko API - 실제 코인 가격 가져오기
export async function fetchCryptoPrices(coinIds: string[]): Promise<Record<string, { price: number; changePercent: number }>> {
  try {
    const ids = coinIds.join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko price API failed: ${response.status}`);
    }
    
    const data: CoinGeckoPrice = await response.json();
    
    const result: Record<string, { price: number; changePercent: number }> = {};
    for (const [coinId, priceData] of Object.entries(data)) {
      result[coinId] = {
        price: priceData.usd,
        changePercent: priceData.usd_24h_change || 0
      };
    }
    
    return result;
  } catch (error) {
    logAPIWarning('CoinGecko price API unavailable, using fallback data');
    
    // Fallback 데이터
    const fallbackPrices: Record<string, { price: number; changePercent: number }> = {
      'bitcoin': { price: 94250.67, changePercent: 2.10 },
      'ethereum': { price: 3650.32, changePercent: -1.68 },
      'binancecoin': { price: 310.45, changePercent: 4.14 },
      'ripple': { price: 2.615, changePercent: 3.88 },
      'cardano': { price: 1.085, changePercent: -3.02 },
      'dogecoin': { price: 0.392, changePercent: 3.37 },
      'solana': { price: 198.74, changePercent: 4.46 },
      'matic-network': { price: 0.895, changePercent: -2.61 },
      'polkadot': { price: 7.67, changePercent: 3.28 },
      'avalanche-2': { price: 42.42, changePercent: 5.41 }
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        const result: Record<string, { price: number; changePercent: number }> = {};
        coinIds.forEach(coinId => {
          if (fallbackPrices[coinId]) {
            result[coinId] = fallbackPrices[coinId];
          }
        });
        resolve(result);
      }, 800);
    });
  }
}

// Mock 주식 및 ETF 가격 (실제 API 구조 시뮬레이션)
export async function fetchStockPrices(tickers: string[]): Promise<Record<string, { price: number; changePercent: number }>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockPrices: Record<string, { price: number; changePercent: number }> = {
        // 기존 주식
        'AAPL': { price: 192.53, changePercent: 1.24 },
        'MSFT': { price: 415.26, changePercent: -0.36 },
        'GOOGL': { price: 175.84, changePercent: 0.63 },
        'NVDA': { price: 875.28, changePercent: 2.02 },
        'TSLA': { price: 248.42, changePercent: -1.28 },
        'META': { price: 502.31, changePercent: -0.8 },
        'NFLX': { price: 486.71, changePercent: 2.1 },
        'JNJ': { price: 158.24, changePercent: 0.29 },
        'PFE': { price: 28.91, changePercent: -0.41 },
        'MRNA': { price: 65.33, changePercent: 2.95 },
        'JPM': { price: 165.82, changePercent: 0.81 },
        'BAC': { price: 32.15, changePercent: 0.72 },
        'WFC': { price: 43.67, changePercent: -0.34 },
        'V': { price: 267.82, changePercent: 0.5 },
        'NEE': { price: 62.45, changePercent: 0.29 },
        'SO': { price: 71.23, changePercent: -0.11 },
        'PG': { price: 155.67, changePercent: 0.59 },
        'KO': { price: 59.84, changePercent: 0.35 },
        'WMT': { price: 164.23, changePercent: 0.18 },
        'AMT': { price: 195.45, changePercent: 0.15 },
        'PLD': { price: 128.34, changePercent: -0.22 },
        'BRK.B': { price: 445.67, changePercent: 0.42 },
        'XOM': { price: 114.89, changePercent: -0.67 },
        'AMZN': { price: 151.94, changePercent: 1.2 },
        'DIS': { price: 113.45, changePercent: -1.2 },

        // ETF - 국채 (낮은 변동성, 안정적)
        'TLT': { price: 89.45, changePercent: -0.25 },    // 20년+ 미국 국채
        'IEF': { price: 97.82, changePercent: -0.15 },    // 7-10년 미국 국채
        'SHY': { price: 83.67, changePercent: -0.08 },    // 1-3년 미국 국채
        'AGG': { price: 99.34, changePercent: -0.12 },    // 종합 채권

        // ETF - 금/귀금속 (중간 변동성)
        'GLD': { price: 198.45, changePercent: 0.85 },    // SPDR 금
        'IAU': { price: 38.92, changePercent: 0.82 },     // iShares 금
        'SLV': { price: 22.78, changePercent: 1.45 },     // iShares 은

        // ETF - 원자재 (높은 변동성)
        'DBC': { price: 21.34, changePercent: 1.28 },     // Invesco 원자재
        'GSG': { price: 17.89, changePercent: 0.95 },     // iShares 원자재
        'USO': { price: 76.23, changePercent: 2.14 },     // 미국 석유

        // ETF - 부동산 (중간 변동성)
        'VNQ': { price: 87.45, changePercent: 0.67 },     // Vanguard 리츠
        'IYR': { price: 89.12, changePercent: 0.54 },     // iShares 부동산

        // ETF - 광범위 시장 (시장 따라 변동)
        'VTI': { price: 267.89, changePercent: 0.89 },    // Vanguard 전체 시장
        'QQQ': { price: 421.56, changePercent: 1.23 },    // 나스닥100
        'SPY': { price: 478.92, changePercent: 0.76 },    // S&P500

        // ETF - 신흥시장 (높은 변동성)
        'EEM': { price: 41.67, changePercent: -0.34 },    // 신흥시장
        'VWO': { price: 42.89, changePercent: -0.28 }     // Vanguard 신흥시장
      };
      
      const result: Record<string, { price: number; changePercent: number }> = {};
      tickers.forEach(ticker => {
        if (mockPrices[ticker]) {
          result[ticker] = mockPrices[ticker];
        }
      });
      
      resolve(result);
    }, 1000);
  });
}

// 코인 ID 매핑 (CoinGecko API용)
export const coinGeckoIds: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'SOL': 'solana',
  'MATIC': 'matic-network',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2'
};