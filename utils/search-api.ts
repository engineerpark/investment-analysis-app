/**
 * 통합 자산 검색 API
 * 다중 데이터 소스를 통해 자산을 검색합니다.
 */

export interface SearchAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  type: 'stock' | 'crypto' | 'etf';
  market: string;
  currency: string;
  source: string;
}

export interface SearchResult {
  query: string;
  results: SearchAsset[];
  timestamp: number;
  sources: string[];
  errors?: string[];
}

// 미국 주요 주식 목록 (샘플)
const US_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'ADBE', name: 'Adobe Inc.' }
];

// 주요 암호화폐 목록
const CRYPTO_LIST = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' }
];

/**
 * 통합 자산 검색 (서버사이드 API 사용)
 */
export async function searchAssets(query: string): Promise<SearchResult> {
  console.log('🔍 자산 검색 시작:', query);
  
  try {
    const response = await fetch(`/api/search-assets?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`검색 API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('검색 실패');
    }
    
    const searchResult: SearchResult = {
      query: data.query,
      results: data.results || [],
      timestamp: Date.now(),
      sources: data.sources || [],
      errors: data.errors
    };
    
    console.log(`🎯 검색 완료: ${searchResult.results.length}개 결과`);
    return searchResult;
    
  } catch (error: any) {
    console.error('검색 중 오류:', error);
    
    // 실패 시 빈 결과 반환
    return {
      query,
      results: [],
      timestamp: Date.now(),
      sources: [],
      errors: [error.message]
    };
  }
}

/**
 * 인기 자산 목록 조회
 */
export async function getPopularAssets(): Promise<SearchAsset[]> {
  console.log('📈 인기 자산 조회 중...');
  
  const popularSymbols = {
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
    crypto: ['bitcoin', 'ethereum', 'binancecoin']
  };
  
  const results: SearchAsset[] = [];
  
  try {
    // 주식 가격 조회
    for (const symbol of popularSymbols.stocks) {
      try {
        const response = await fetch(`/api/proxy-yahoo?symbol=${symbol}&interval=1d&range=1d`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const stockInfo = US_STOCKS.find(s => s.symbol === symbol);
            results.push({
              id: symbol,
              symbol: symbol,
              name: stockInfo?.name || symbol,
              price: data.data.price || 0,
              change: data.data.change || 0,
              changePercent: data.data.changePercent || 0,
              volume: data.data.volume || 0,
              type: 'stock',
              market: 'US',
              currency: 'USD',
              source: 'Yahoo Finance'
            });
          }
        }
      } catch (error) {
        console.warn(`인기 주식 ${symbol} 조회 실패:`, error);
      }
    }
    
    // 암호화폐 가격 조회
    const cryptoIds = popularSymbols.crypto.join(',');
    const cryptoResponse = await fetch(`/api/proxy-coingecko?endpoint=simple%2Fprice&ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`);
    
    if (cryptoResponse.ok) {
      const cryptoData = await cryptoResponse.json();
      if (cryptoData.success && cryptoData.data) {
        popularSymbols.crypto.forEach(cryptoId => {
          const priceData = cryptoData.data[cryptoId];
          const cryptoInfo = CRYPTO_LIST.find(c => c.id === cryptoId);
          
          if (priceData && priceData.usd && cryptoInfo) {
            const changePercent = priceData.usd_24h_change || 0;
            results.push({
              id: cryptoId,
              symbol: cryptoInfo.symbol.toUpperCase(),
              name: cryptoInfo.name,
              price: priceData.usd,
              change: (priceData.usd * changePercent) / 100,
              changePercent: changePercent,
              type: 'crypto',
              market: 'CRYPTO',
              currency: 'USD',
              source: 'CoinGecko'
            });
          }
        });
      }
    }
    
  } catch (error) {
    console.error('인기 자산 조회 오류:', error);
  }
  
  console.log(`✅ 인기 자산 ${results.length}개 조회 완료`);
  return results.slice(0, 8);
}

/**
 * 다중 자산 가격 조회
 */
export async function fetchMultipleAssetPrices(assets: Array<{symbol: string, type: 'stock' | 'crypto', id?: string}>): Promise<SearchAsset[]> {
  console.log('💰 다중 자산 가격 조회:', assets.length, '개');
  
  const results: SearchAsset[] = [];
  
  // 주식과 암호화폐 분리
  const stocks = assets.filter(a => a.type === 'stock');
  const cryptos = assets.filter(a => a.type === 'crypto');
  
  // 주식 가격 조회
  for (const stock of stocks) {
    try {
      const response = await fetch(`/api/proxy-yahoo?symbol=${stock.symbol}&interval=1d&range=1d`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const stockInfo = US_STOCKS.find(s => s.symbol === stock.symbol);
          results.push({
            id: stock.symbol,
            symbol: stock.symbol,
            name: stockInfo?.name || stock.symbol,
            price: data.data.price || 0,
            change: data.data.change || 0,
            changePercent: data.data.changePercent || 0,
            volume: data.data.volume || 0,
            type: 'stock',
            market: 'US',
            currency: 'USD',
            source: 'Yahoo Finance'
          });
        }
      }
    } catch (error) {
      console.warn(`주식 ${stock.symbol} 가격 조회 실패:`, error);
    }
  }
  
  // 암호화폐 가격 조회 (배치)
  if (cryptos.length > 0) {
    try {
      const cryptoIds = cryptos.map(c => c.id || c.symbol.toLowerCase()).join(',');
      const response = await fetch(`/api/proxy-coingecko?endpoint=simple%2Fprice&ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          cryptos.forEach(crypto => {
            const cryptoId = crypto.id || crypto.symbol.toLowerCase();
            const priceData = data.data[cryptoId];
            
            if (priceData && priceData.usd) {
              const cryptoInfo = CRYPTO_LIST.find(c => c.id === cryptoId || c.symbol.toLowerCase() === crypto.symbol.toLowerCase());
              const changePercent = priceData.usd_24h_change || 0;
              
              results.push({
                id: cryptoId,
                symbol: crypto.symbol.toUpperCase(),
                name: cryptoInfo?.name || crypto.symbol,
                price: priceData.usd,
                change: (priceData.usd * changePercent) / 100,
                changePercent: changePercent,
                type: 'crypto',
                market: 'CRYPTO',
                currency: 'USD',
                source: 'CoinGecko'
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn('암호화폐 배치 가격 조회 실패:', error);
    }
  }
  
  console.log(`✅ 다중 자산 가격 조회 완료: ${results.length}개`);
  return results;
}

export default {
  searchAssets,
  getPopularAssets,
  fetchMultipleAssetPrices
};