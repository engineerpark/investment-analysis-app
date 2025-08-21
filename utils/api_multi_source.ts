/**
 * 다중 데이터 소스 API 시스템 v1.0.0
 * - Alpaca Market Data (실시간 WebSocket)
 * - Finnhub (백업 채널)
 * - Stooq (과거 EOD/분봉 벌크)
 * - Alpha Vantage (과거+인디케이터)
 * - Financial Modeling Prep (펀더멘털)
 */

// API 설정
const API_KEYS = {
  ALPACA_API_KEY: process.env.NEXT_PUBLIC_ALPACA_API_KEY || '',
  ALPACA_SECRET_KEY: process.env.ALPACA_SECRET_KEY || '',
  FINNHUB_API_KEY: process.env.NEXT_PUBLIC_FINNHUB_API_KEY || 'demo',
  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || 'W81KZ2JQNEQY76VG',
  FMP_API_KEY: process.env.NEXT_PUBLIC_FMP_API_KEY || 'demo',
};

const API_ENDPOINTS = {
  // Alpaca Market Data (실시간)
  ALPACA: {
    websocket: 'wss://stream.data.alpaca.markets/v2/iex', // Basic 플랜: IEX
    rest: 'https://data.alpaca.markets/v2',
  },
  
  // Finnhub (백업 실시간)
  FINNHUB: {
    websocket: 'wss://ws.finnhub.io',
    rest: 'https://finnhub.io/api/v1',
  },
  
  // Stooq (벌크 데이터)
  STOOQ: {
    daily_us: 'https://stooq.com/db/d/?b=us&i=d',
    intraday_us: 'https://stooq.com/db/h/?b=us_nasdaq_stocks_d&i=5',
  },
  
  // Alpha Vantage (과거 + 지표)
  ALPHA_VANTAGE: {
    base: 'https://www.alphavantage.co/query',
  },
  
  // Financial Modeling Prep (펀더멘털)
  FMP: {
    base: 'https://financialmodelingprep.com/api/v3',
  },
};

// 통합 자산 데이터 인터페이스
export interface MultiSourceAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector: string;
  exchange: string;
  currency: string;
  timestamp: number;
  dataSource: 'alpaca' | 'finnhub' | 'alpha_vantage' | 'fmp' | 'stooq';
  realtime: boolean;
}

// 실시간 가격 데이터 인터페이스
export interface RealtimePrice {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  bid?: number;
  ask?: number;
  source: 'alpaca' | 'finnhub';
}

// 1. Alpaca Market Data API 클래스
export class AlpacaDataService {
  private ws: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private callbacks: Map<string, (data: RealtimePrice) => void> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined') return; // 서버사이드에서는 실행하지 않음

    try {
      this.ws = new WebSocket(API_ENDPOINTS.ALPACA.websocket);
      
      this.ws.onopen = () => {
        console.log('✅ Alpaca WebSocket 연결됨');
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('❌ Alpaca WebSocket 연결 끊어짐, 재연결 시도...');
        setTimeout(() => this.connect(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error('Alpaca WebSocket 오류:', error);
      };
    } catch (error) {
      console.error('Alpaca WebSocket 연결 실패:', error);
    }
  }

  private authenticate() {
    if (!this.ws || !API_KEYS.ALPACA_API_KEY) return;
    
    this.ws.send(JSON.stringify({
      action: 'auth',
      key: API_KEYS.ALPACA_API_KEY,
      secret: API_KEYS.ALPACA_SECRET_KEY
    }));
  }

  private handleMessage(data: any) {
    if (data.T === 't') { // Trade data
      const price: RealtimePrice = {
        symbol: data.S,
        price: data.p,
        timestamp: new Date(data.t).getTime(),
        volume: data.s,
        source: 'alpaca'
      };
      
      const callback = this.callbacks.get(data.S);
      if (callback) {
        callback(price);
      }
    }
  }

  public subscribe(symbol: string, callback: (data: RealtimePrice) => void) {
    this.subscriptions.add(symbol);
    this.callbacks.set(symbol, callback);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // 최대 30개 심볼 제한 고려
      if (this.subscriptions.size <= 30) {
        this.ws.send(JSON.stringify({
          action: 'subscribe',
          trades: [`T.${symbol}`]
        }));
        console.log(`📊 Alpaca 구독 추가: ${symbol}`);
      }
    }
  }

  public unsubscribe(symbol: string) {
    this.subscriptions.delete(symbol);
    this.callbacks.delete(symbol);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        trades: [`T.${symbol}`]
      }));
    }
  }
}

// 2. Finnhub API 클래스 (백업 채널)
export class FinnhubDataService {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, (data: RealtimePrice) => void> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined') return;

    try {
      this.ws = new WebSocket(`${API_ENDPOINTS.FINNHUB.websocket}?token=${API_KEYS.FINNHUB_API_KEY}`);
      
      this.ws.onopen = () => {
        console.log('✅ Finnhub WebSocket 연결됨 (백업)');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'trade') {
          data.data.forEach((trade: any) => {
            const price: RealtimePrice = {
              symbol: trade.s,
              price: trade.p,
              timestamp: trade.t,
              volume: trade.v,
              source: 'finnhub'
            };
            
            const callback = this.callbacks.get(trade.s);
            if (callback) {
              callback(price);
            }
          });
        }
      };

      this.ws.onclose = () => {
        console.log('❌ Finnhub WebSocket 연결 끊어짐, 재연결 시도...');
        setTimeout(() => this.connect(), 5000);
      };
    } catch (error) {
      console.error('Finnhub WebSocket 연결 실패:', error);
    }
  }

  public subscribe(symbol: string, callback: (data: RealtimePrice) => void) {
    this.callbacks.set(symbol, callback);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol
      }));
      console.log(`📊 Finnhub 백업 구독: ${symbol}`);
    }
  }

  public unsubscribe(symbol: string) {
    this.callbacks.delete(symbol);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        symbol: symbol
      }));
    }
  }

  // REST API를 통한 실시간 호가 조회
  public async getQuote(symbol: string): Promise<MultiSourceAsset | null> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.FINNHUB.rest}/quote?symbol=${symbol}&token=${API_KEYS.FINNHUB_API_KEY}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        symbol: symbol,
        name: symbol,
        price: data.c || 0, // Current price
        change: data.d || 0, // Change
        changePercent: data.dp || 0, // Percent change
        volume: 0,
        sector: 'Unknown',
        exchange: 'US',
        currency: 'USD',
        timestamp: Date.now(),
        dataSource: 'finnhub',
        realtime: true
      };
    } catch (error) {
      console.error(`Finnhub ${symbol} 조회 실패:`, error);
      return null;
    }
  }
}

// 3. Stooq 벌크 데이터 서비스
export class StooqDataService {
  // 미국 일봉 전체 다운로드 (대용량)
  public async downloadDailyUS(): Promise<Blob | null> {
    try {
      console.log('📥 Stooq 미국 일봉 데이터 다운로드 시작...');
      const response = await fetch(API_ENDPOINTS.STOOQ.daily_us, {
        method: 'GET',
        headers: {
          'Accept': 'application/zip'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Stooq 다운로드 실패: ${response.status}`);
      }
      
      console.log('✅ Stooq 일봉 데이터 다운로드 완료');
      return await response.blob();
    } catch (error) {
      console.error('Stooq 다운로드 오류:', error);
      return null;
    }
  }

  // 분봉 데이터 다운로드
  public async downloadIntradayUS(): Promise<Blob | null> {
    try {
      console.log('📥 Stooq 미국 분봉 데이터 다운로드 시작...');
      const response = await fetch(API_ENDPOINTS.STOOQ.intraday_us);
      
      if (!response.ok) {
        throw new Error(`Stooq 분봉 다운로드 실패: ${response.status}`);
      }
      
      console.log('✅ Stooq 분봉 데이터 다운로드 완료');
      return await response.blob();
    } catch (error) {
      console.error('Stooq 분봉 다운로드 오류:', error);
      return null;
    }
  }
}

// 4. Alpha Vantage 시계열 + 지표 서비스
export class AlphaVantageService {
  // 일봉 시계열 조회
  public async getDailyTimeSeries(symbol: string): Promise<MultiSourceAsset | null> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.ALPHA_VANTAGE.base}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE_API_KEY}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        console.warn(`Alpha Vantage ${symbol} 제한:`, data['Error Message'] || data['Note']);
        return null;
      }

      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) return null;

      const dates = Object.keys(timeSeries).sort().reverse();
      const latest = timeSeries[dates[0]];
      const previous = timeSeries[dates[1]];

      const currentPrice = parseFloat(latest['4. close']);
      const previousPrice = parseFloat(previous?.['4. close'] || latest['4. close']);
      const change = currentPrice - previousPrice;
      const changePercent = (change / previousPrice) * 100;

      return {
        symbol: symbol,
        name: data['Meta Data']?.['2. Symbol'] || symbol,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: parseInt(latest['5. volume'] || '0'),
        sector: 'Unknown',
        exchange: 'US',
        currency: 'USD',
        timestamp: new Date(dates[0]).getTime(),
        dataSource: 'alpha_vantage',
        realtime: false
      };
    } catch (error) {
      console.error(`Alpha Vantage ${symbol} 조회 실패:`, error);
      return null;
    }
  }

  // 기술 지표 조회 (RSI 예시)
  public async getRSI(symbol: string, interval = 'daily', timePeriod = 14): Promise<any> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.ALPHA_VANTAGE.base}?function=RSI&symbol=${symbol}&interval=${interval}&time_period=${timePeriod}&series_type=close&apikey=${API_KEYS.ALPHA_VANTAGE_API_KEY}`
      );
      
      const data = await response.json();
      return data['Technical Analysis: RSI'] || null;
    } catch (error) {
      console.error(`Alpha Vantage RSI ${symbol} 조회 실패:`, error);
      return null;
    }
  }
}

// 5. Financial Modeling Prep 서비스 (펀더멘털)
export class FMPService {
  // 재무제표 조회
  public async getIncomeStatement(symbol: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.FMP.base}/income-statement/${symbol}?limit=5&apikey=${API_KEYS.FMP_API_KEY}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      console.log(`✅ FMP ${symbol} 재무제표 조회 성공`);
      return data;
    } catch (error) {
      console.error(`FMP ${symbol} 재무제표 조회 실패:`, error);
      return null;
    }
  }

  // 실시간 가격 조회
  public async getRealTimePrice(symbol: string): Promise<MultiSourceAsset | null> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.FMP.base}/quote-short/${symbol}?apikey=${API_KEYS.FMP_API_KEY}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (!data || data.length === 0) return null;

      const quote = data[0];
      
      return {
        symbol: quote.symbol,
        name: quote.symbol,
        price: quote.price || 0,
        change: quote.change || 0,
        changePercent: quote.changesPercentage || 0,
        volume: quote.volume || 0,
        sector: 'Unknown',
        exchange: 'US',
        currency: 'USD',
        timestamp: Date.now(),
        dataSource: 'fmp',
        realtime: true
      };
    } catch (error) {
      console.error(`FMP ${symbol} 가격 조회 실패:`, error);
      return null;
    }
  }

  // 회사 프로필 조회
  public async getCompanyProfile(symbol: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.FMP.base}/profile/${symbol}?apikey=${API_KEYS.FMP_API_KEY}`
      );
      
      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`FMP ${symbol} 프로필 조회 실패:`, error);
      return null;
    }
  }
}

// 6. 통합 다중 소스 매니저
export class MultiSourceDataManager {
  private alpaca: AlpacaDataService;
  private finnhub: FinnhubDataService;
  private stooq: StooqDataService;
  private alphaVantage: AlphaVantageService;
  private fmp: FMPService;
  private cache: Map<string, MultiSourceAsset> = new Map();
  private realtimeCallbacks: Map<string, (data: RealtimePrice) => void> = new Map();

  constructor() {
    this.alpaca = new AlpacaDataService();
    this.finnhub = new FinnhubDataService();
    this.stooq = new StooqDataService();
    this.alphaVantage = new AlphaVantageService();
    this.fmp = new FMPService();
  }

  // 다중 소스에서 최적 가격 조회
  public async getBestPrice(symbol: string): Promise<MultiSourceAsset | null> {
    console.log(`🔍 ${symbol} 다중 소스 가격 조회 시작`);
    
    const cacheKey = `${symbol}_${Math.floor(Date.now() / 30000)}`; // 30초 캐시
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`✅ ${symbol} 캐시에서 반환`);
      return cached;
    }

    const results: (MultiSourceAsset | null)[] = await Promise.allSettled([
      this.fmp.getRealTimePrice(symbol), // 1순위: FMP (빠름)
      this.finnhub.getQuote(symbol), // 2순위: Finnhub (백업)
      this.alphaVantage.getDailyTimeSeries(symbol) // 3순위: Alpha Vantage (느림)
    ]).then(results => 
      results.map(result => result.status === 'fulfilled' ? result.value : null)
    );

    // 실시간 데이터 우선, 그 다음 최신 데이터
    const realtimeResult = results.find(r => r?.realtime === true);
    const bestResult = realtimeResult || results.find(r => r !== null);

    if (bestResult) {
      this.cache.set(cacheKey, bestResult);
      console.log(`✅ ${symbol} ${bestResult.dataSource}에서 가격 조회: $${bestResult.price}`);
    } else {
      console.warn(`❌ ${symbol} 모든 소스에서 가격 조회 실패`);
    }

    return bestResult;
  }

  // 실시간 구독 (Alpaca 우선, Finnhub 백업)
  public subscribeRealtime(symbol: string, callback: (data: RealtimePrice) => void) {
    console.log(`📡 ${symbol} 실시간 구독 시작`);
    
    this.realtimeCallbacks.set(symbol, callback);
    
    // Alpaca 우선 구독
    this.alpaca.subscribe(symbol, (data) => {
      console.log(`📊 Alpaca 실시간: ${data.symbol} $${data.price}`);
      callback(data);
    });

    // Finnhub 백업 구독
    this.finnhub.subscribe(symbol, (data) => {
      console.log(`📊 Finnhub 백업: ${data.symbol} $${data.price}`);
      callback(data);
    });
  }

  // 구독 해제
  public unsubscribeRealtime(symbol: string) {
    this.realtimeCallbacks.delete(symbol);
    this.alpaca.unsubscribe(symbol);
    this.finnhub.unsubscribe(symbol);
    console.log(`📡 ${symbol} 실시간 구독 해제`);
  }

  // 펀더멘털 데이터 조회
  public async getFundamentals(symbol: string) {
    const [income, profile] = await Promise.all([
      this.fmp.getIncomeStatement(symbol),
      this.fmp.getCompanyProfile(symbol)
    ]);

    return { income, profile };
  }

  // 기술 지표 조회
  public async getTechnicalIndicators(symbol: string) {
    const rsi = await this.alphaVantage.getRSI(symbol);
    return { rsi };
  }

  // 벌크 데이터 동기화
  public async syncBulkData() {
    console.log('📥 벌크 데이터 동기화 시작...');
    
    const dailyData = await this.stooq.downloadDailyUS();
    if (dailyData) {
      console.log('✅ 일봉 벌크 데이터 다운로드 완료');
      // TODO: 압축 해제 및 파싱 로직 추가
    }

    const intradayData = await this.stooq.downloadIntradayUS();
    if (intradayData) {
      console.log('✅ 분봉 벌크 데이터 다운로드 완료');
      // TODO: 압축 해제 및 파싱 로직 추가
    }
  }
}

// 전역 인스턴스 생성
let globalDataManager: MultiSourceDataManager | null = null;

export function getDataManager(): MultiSourceDataManager {
  if (!globalDataManager) {
    globalDataManager = new MultiSourceDataManager();
  }
  return globalDataManager;
}

// 편의 함수들
export async function getRealtimePrice(symbol: string): Promise<MultiSourceAsset | null> {
  const manager = getDataManager();
  return await manager.getBestPrice(symbol);
}

export function subscribeRealtimePrice(symbol: string, callback: (data: RealtimePrice) => void) {
  const manager = getDataManager();
  manager.subscribeRealtime(symbol, callback);
}

export async function getCompanyFundamentals(symbol: string) {
  const manager = getDataManager();
  return await manager.getFundamentals(symbol);
}

export async function getTechnicalAnalysis(symbol: string) {
  const manager = getDataManager();
  return await manager.getTechnicalIndicators(symbol);
}

export default {
  getDataManager,
  getRealtimePrice,
  subscribeRealtimePrice,
  getCompanyFundamentals,
  getTechnicalAnalysis,
  MultiSourceDataManager,
  AlpacaDataService,
  FinnhubDataService,
  StooqDataService,
  AlphaVantageService,
  FMPService
};