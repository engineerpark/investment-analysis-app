interface BenchmarkData {
  name: string;
  ticker: string;
  data: { date: string; value: number; return: number }[];
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  maxDrawdown: number;
}

interface PerformanceMetrics {
  sharpeRatio: number;
  alpha: number;
  beta: number;
  informationRatio: number;
  trackingError: number;
  calmarRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxGain: number;
  winRate: number;
  profitFactor: number;
}

interface PeriodPerformance {
  period: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  alpha: number;
  relativeReturn: number;
}

interface DrawdownPeriod {
  startDate: string;
  endDate: string;
  duration: number;
  maxDrawdown: number;
  recovery: boolean;
}

// 벤치마크 데이터 생성 (리밸런싱 반영)
export function generateBenchmarkData(period: string = '1y', rebalancingAmount: number = 0, rebalancingPeriod: string = 'quarterly'): BenchmarkData[] {
  const days = period === '1y' ? 365 : period === '3y' ? 1095 : period === '5y' ? 1825 : 252;
  const endDate = new Date();
  
  // 리밸런싱 주기별 일수 정의
  const rebalancingDays: { [key: string]: number } = {
    'monthly': 30,
    'quarterly': 90,
    'semiannual': 180,
    'annual': 365
  };
  
  const rebalancingInterval = rebalancingDays[rebalancingPeriod] || 90;
  
  const benchmarks = [
    { name: 'S&P 500', ticker: 'SPY', baseReturn: 0.10, volatility: 0.16 },
    { name: 'NASDAQ 100', ticker: 'QQQ', baseReturn: 0.12, volatility: 0.22 },
    { name: 'KOSPI', ticker: 'KOSPI', baseReturn: 0.08, volatility: 0.20 },
    { name: '미국 채권', ticker: 'AGG', baseReturn: 0.04, volatility: 0.05 },
    { name: '금', ticker: 'GLD', baseReturn: 0.06, volatility: 0.18 }
  ];

  return benchmarks.map(benchmark => {
    const data: { date: string; value: number; return: number }[] = [];
    let currentValue = 100;
    let totalInvested = 100; // 초기 투자금
    
    // 시드 고정으로 일관된 데이터 생성
    const seed = benchmark.ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = createSeededRandom(seed);
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      
      if (i === days) {
        data.push({
          date: date.toISOString().split('T')[0],
          value: currentValue,
          return: 0
        });
        continue;
      }
      
      // 리밸런싱 날짜 확인 (벤치마크도 동일하게 추가 투자)
      const isRebalancingDay = rebalancingAmount > 0 && i % rebalancingInterval === 0 && i !== days && i !== 0;
      
      // 리밸런싱 시 추가 투자 (벤치마크도 동일 조건으로 추가 투자)
      if (isRebalancingDay) {
        const additionalShares = rebalancingAmount / currentValue; // 현재 가격으로 추가 매수
        const valueBeforeReturn = currentValue;
        
        // 일일 수익률 계산 (정규분포 기반)
        const dailyReturn = (benchmark.baseReturn / 252) + 
                           (random() - 0.5) * benchmark.volatility * 2 / Math.sqrt(252);
        
        // 기존 자산에 수익률 적용 후 추가 투자 반영
        currentValue = currentValue * (1 + dailyReturn) + rebalancingAmount;
        totalInvested += rebalancingAmount;
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: currentValue,
          return: dailyReturn * 100
        });
      } else {
        // 일반적인 일일 수익률 계산
        const dailyReturn = (benchmark.baseReturn / 252) + 
                           (random() - 0.5) * benchmark.volatility * 2 / Math.sqrt(252);
        
        currentValue = currentValue * (1 + dailyReturn);
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: currentValue,
          return: dailyReturn * 100
        });
      }
    }
    
    // 성과 지표 계산 (총 투자금 대비)
    const returns = data.slice(1).map(d => d.return / 100);
    const totalReturn = (currentValue - totalInvested) / totalInvested; // 총 투자금 대비 수익률
    const annualizedReturn = Math.pow(1 + totalReturn, 252 / returns.length) - 1;
    const volatility = calculateVolatility(returns) * Math.sqrt(252);
    const maxDrawdown = calculateMaxDrawdown(data.map(d => d.value));
    
    return {
      name: benchmark.name,
      ticker: benchmark.ticker,
      data,
      totalReturn: totalReturn * 100,
      annualizedReturn: annualizedReturn * 100,
      volatility: volatility * 100,
      maxDrawdown
    };
  });
}

// 포트폴리오 성과 지표 계산
export function calculatePerformanceMetrics(
  portfolioReturns: number[],
  benchmarkReturns: number[],
  riskFreeRate: number = 0.025
): PerformanceMetrics {
  const portfolioExcessReturns = portfolioReturns.map(r => r - riskFreeRate / 252);
  const benchmarkExcessReturns = benchmarkReturns.map(r => r - riskFreeRate / 252);
  
  // 기본 통계
  const portfolioMean = mean(portfolioReturns);
  const portfolioStd = standardDeviation(portfolioReturns);
  const benchmarkMean = mean(benchmarkReturns);
  const benchmarkStd = standardDeviation(benchmarkReturns);
  
  // 베타 계산
  const beta = calculateBeta(portfolioReturns, benchmarkReturns);
  
  // 알파 계산 (CAPM)
  const alpha = (portfolioMean * 252) - (riskFreeRate + beta * (benchmarkMean * 252 - riskFreeRate));
  
  // 샤프 비율
  const sharpeRatio = (portfolioMean * 252 - riskFreeRate) / (portfolioStd * Math.sqrt(252));
  
  // 트래킹 에러
  const activeReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
  const trackingError = standardDeviation(activeReturns) * Math.sqrt(252);
  
  // 정보 비율
  const informationRatio = trackingError > 0 ? (mean(activeReturns) * 252) / trackingError : 0;
  
  // 최대 낙폭 및 상승폭
  const cumulativeReturns = portfolioReturns.reduce((acc, r) => {
    const lastValue = acc.length > 0 ? acc[acc.length - 1] : 1;
    acc.push(lastValue * (1 + r));
    return acc;
  }, [1]);
  
  const maxDrawdown = calculateMaxDrawdown(cumulativeReturns);
  const maxGain = calculateMaxGain(cumulativeReturns);
  
  // 칼마 비율
  const calmarRatio = maxDrawdown > 0 ? (portfolioMean * 252) / (maxDrawdown / 100) : 0;
  
  // 소르티노 비율 (하방 변동성 기준)
  const downside = portfolioReturns.filter(r => r < 0);
  const downsideStd = downside.length > 0 ? standardDeviation(downside) : portfolioStd;
  const sortinoRatio = (portfolioMean * 252 - riskFreeRate) / (downsideStd * Math.sqrt(252));
  
  // 승률
  const winRate = portfolioReturns.filter(r => r > 0).length / portfolioReturns.length * 100;
  
  // 수익 팩터
  const profits = portfolioReturns.filter(r => r > 0).reduce((sum, r) => sum + r, 0);
  const losses = Math.abs(portfolioReturns.filter(r => r < 0).reduce((sum, r) => sum + r, 0));
  const profitFactor = losses > 0 ? profits / losses : profits > 0 ? 10 : 1;
  
  return {
    sharpeRatio,
    alpha: alpha * 100,
    beta,
    informationRatio,
    trackingError: trackingError * 100,
    calmarRatio,
    sortinoRatio,
    maxDrawdown,
    maxGain,
    winRate,
    profitFactor
  };
}

// 기간별 성과 계산
export function calculatePeriodPerformance(
  portfolioData: { date: string; value: number; totalInvested?: number }[],
  benchmarkData: { date: string; value: number }[]
): PeriodPerformance[] {
  const periods = [];
  const currentDate = new Date();
  
  // 연도별 분석
  for (let i = 0; i < 3; i++) {
    const year = currentDate.getFullYear() - i;
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    
    const portfolioYearData = portfolioData.filter(d => d.date >= yearStart && d.date <= yearEnd);
    const benchmarkYearData = benchmarkData.filter(d => d.date >= yearStart && d.date <= yearEnd);
    
    if (portfolioYearData.length > 0 && benchmarkYearData.length > 0) {
      // 리밸런싱을 고려한 수익률 계산 (총 투자금 대비)
      const portfolioStart = portfolioYearData[0];
      const portfolioEnd = portfolioYearData[portfolioYearData.length - 1];
      const totalInvested = portfolioEnd.totalInvested || portfolioStart.value;
      
      const portfolioReturn = ((portfolioEnd.value - totalInvested) / totalInvested) * 100;
      const benchmarkReturn = (benchmarkYearData[benchmarkYearData.length - 1].value / benchmarkYearData[0].value - 1) * 100;
      
      periods.push({
        period: `${year}년`,
        portfolioReturn,
        benchmarkReturn,
        alpha: portfolioReturn - benchmarkReturn,
        relativeReturn: portfolioReturn - benchmarkReturn
      });
    }
  }
  
  // 분기별 분석 (최근 8분기)
  for (let i = 0; i < 8; i++) {
    const quarterDate = new Date(currentDate);
    quarterDate.setMonth(quarterDate.getMonth() - (i * 3));
    
    const quarter = Math.floor(quarterDate.getMonth() / 3) + 1;
    const year = quarterDate.getFullYear();
    
    const quarterStart = new Date(year, (quarter - 1) * 3, 1);
    const quarterEnd = new Date(year, quarter * 3, 0);
    
    const startStr = quarterStart.toISOString().split('T')[0];
    const endStr = quarterEnd.toISOString().split('T')[0];
    
    const portfolioQuarterData = portfolioData.filter(d => d.date >= startStr && d.date <= endStr);
    const benchmarkQuarterData = benchmarkData.filter(d => d.date >= startStr && d.date <= endStr);
    
    if (portfolioQuarterData.length > 0 && benchmarkQuarterData.length > 0) {
      // 분기별 리밸런싱을 고려한 수익률 계산
      const portfolioStart = portfolioQuarterData[0];
      const portfolioEnd = portfolioQuarterData[portfolioQuarterData.length - 1];
      const quarterTotalInvested = portfolioEnd.totalInvested || portfolioStart.value;
      
      const portfolioReturn = ((portfolioEnd.value - quarterTotalInvested) / quarterTotalInvested) * 100;
      const benchmarkReturn = (benchmarkQuarterData[benchmarkQuarterData.length - 1].value / benchmarkQuarterData[0].value - 1) * 100;
      
      periods.push({
        period: `${year}Q${quarter}`,
        portfolioReturn,
        benchmarkReturn,
        alpha: portfolioReturn - benchmarkReturn,
        relativeReturn: portfolioReturn - benchmarkReturn
      });
    }
  }
  
  return periods.reverse();
}

// 손익 구간 분석
export function analyzeDrawdownPeriods(data: { date: string; value: number }[]): DrawdownPeriod[] {
  const drawdowns: DrawdownPeriod[] = [];
  let peak = data[0].value;
  let peakDate = data[0].date;
  let currentDrawdown = 0;
  let drawdownStart = '';
  let inDrawdown = false;
  
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    
    if (current.value > peak) {
      // 새로운 고점
      if (inDrawdown) {
        // 손실 구간 종료
        drawdowns.push({
          startDate: drawdownStart,
          endDate: data[i - 1].date,
          duration: calculateDaysBetween(drawdownStart, data[i - 1].date),
          maxDrawdown: currentDrawdown,
          recovery: true
        });
        inDrawdown = false;
      }
      peak = current.value;
      peakDate = current.date;
      currentDrawdown = 0;
    } else {
      // 고점 이하
      const drawdown = (peak - current.value) / peak * 100;
      
      if (!inDrawdown && drawdown > 1) {
        // 새로운 손실 구간 시작 (1% 이상 하락)
        inDrawdown = true;
        drawdownStart = peakDate;
        currentDrawdown = drawdown;
      } else if (inDrawdown) {
        currentDrawdown = Math.max(currentDrawdown, drawdown);
      }
    }
  }
  
  // 미완료된 손실 구간
  if (inDrawdown) {
    drawdowns.push({
      startDate: drawdownStart,
      endDate: data[data.length - 1].date,
      duration: calculateDaysBetween(drawdownStart, data[data.length - 1].date),
      maxDrawdown: currentDrawdown,
      recovery: false
    });
  }
  
  return drawdowns.sort((a, b) => b.maxDrawdown - a.maxDrawdown);
}

// 유틸리티 함수들
function createSeededRandom(seed: number) {
  let m = 0x80000000;
  let a = 1103515245;
  let c = 12345;
  let state = seed ? seed : Math.floor(Math.random() * (m - 1));
  
  return function() {
    state = (a * state + c) % m;
    return state / (m - 1);
  };
}

function mean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

function calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
  const portfolioMean = mean(portfolioReturns);
  const benchmarkMean = mean(benchmarkReturns);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < portfolioReturns.length; i++) {
    numerator += (portfolioReturns[i] - portfolioMean) * (benchmarkReturns[i] - benchmarkMean);
    denominator += Math.pow(benchmarkReturns[i] - benchmarkMean, 2);
  }
  
  return denominator !== 0 ? numerator / denominator : 1;
}

function calculateVolatility(returns: number[]): number {
  return standardDeviation(returns);
}

function calculateMaxDrawdown(values: number[]): number {
  let maxDrawdown = 0;
  let peak = values[0];
  
  for (const value of values) {
    if (value > peak) {
      peak = value;
    } else {
      const drawdown = (peak - value) / peak * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  return maxDrawdown;
}

function calculateMaxGain(values: number[]): number {
  let maxGain = 0;
  let trough = values[0];
  
  for (const value of values) {
    if (value < trough) {
      trough = value;
    } else {
      const gain = (value - trough) / trough * 100;
      maxGain = Math.max(maxGain, gain);
    }
  }
  
  return maxGain;
}

function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export type { BenchmarkData, PerformanceMetrics, PeriodPerformance, DrawdownPeriod };