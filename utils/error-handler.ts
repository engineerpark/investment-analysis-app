/**
 * 통합 에러 처리 시스템
 * - API 에러 분류 및 처리
 * - 사용자 친화적 에러 메시지 제공
 * - 에러 복구 전략 구현
 */

export interface APIError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  recoverable: boolean;
  retryAfter?: number;
}

export class APIErrorHandler {
  private static readonly ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    API_LIMIT_EXCEEDED: 'API_LIMIT_EXCEEDED',
    INVALID_SYMBOL: 'INVALID_SYMBOL',
    NO_DATA: 'NO_DATA',
    TIMEOUT: 'TIMEOUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SERVER_ERROR: 'SERVER_ERROR'
  };

  static handleAPIError(error: any, context: string): APIError {
    console.error(`API Error in ${context}:`, error);

    // 네트워크 오류
    if (error.name === 'NetworkError' || !navigator.onLine) {
      return {
        code: this.ERROR_CODES.NETWORK_ERROR,
        message: '네트워크 연결을 확인해주세요.',
        severity: 'high',
        recoverable: true,
        retryAfter: 5000
      };
    }

    // HTTP 상태 코드별 처리
    if (error.status) {
      switch (error.status) {
        case 429:
          return {
            code: this.ERROR_CODES.API_LIMIT_EXCEEDED,
            message: 'API 호출 한도 초과. 잠시 후 다시 시도해주세요.',
            severity: 'medium',
            recoverable: true,
            retryAfter: 60000
          };

        case 401:
        case 403:
          return {
            code: this.ERROR_CODES.UNAUTHORIZED,
            message: 'API 키 설정을 확인해주세요.',
            severity: 'high',
            recoverable: false
          };

        case 404:
          return {
            code: this.ERROR_CODES.INVALID_SYMBOL,
            message: '요청한 자산을 찾을 수 없습니다.',
            severity: 'low',
            recoverable: false
          };

        case 500:
        case 502:
        case 503:
          return {
            code: this.ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            severity: 'medium',
            recoverable: true,
            retryAfter: 10000
          };
      }
    }

    // 타임아웃 오류
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return {
        code: this.ERROR_CODES.TIMEOUT,
        message: '요청 시간이 초과되었습니다.',
        severity: 'medium',
        recoverable: true,
        retryAfter: 3000
      };
    }

    // 기본 오류
    return {
      code: this.ERROR_CODES.SERVER_ERROR,
      message: '알 수 없는 오류가 발생했습니다.',
      severity: 'medium',
      recoverable: true,
      retryAfter: 5000
    };
  }

  static getRetryStrategy(error: APIError): {shouldRetry: boolean, delay: number} {
    if (!error.recoverable) {
      return { shouldRetry: false, delay: 0 };
    }

    const delay = error.retryAfter || 5000;
    
    switch (error.code) {
      case this.ERROR_CODES.API_LIMIT_EXCEEDED:
        return { shouldRetry: true, delay: 60000 }; // 1분 후 재시도
      
      case this.ERROR_CODES.NETWORK_ERROR:
        return { shouldRetry: true, delay: 5000 }; // 5초 후 재시도
      
      case this.ERROR_CODES.TIMEOUT:
        return { shouldRetry: true, delay: 3000 }; // 3초 후 재시도
      
      default:
        return { shouldRetry: true, delay };
    }
  }
}

// 재시도 가능한 fetch 함수
export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  maxRetries: number = 3,
  context: string = 'API'
): Promise<Response> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${context} 요청 시도 ${attempt}/${maxRetries}: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ ${context} 요청 성공 (${attempt}회차)`);
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error: any) {
      lastError = error;
      console.warn(`❌ ${context} 요청 실패 (${attempt}회차):`, error.message);
      
      if (attempt === maxRetries) break;
      
      const apiError = APIErrorHandler.handleAPIError(error, context);
      const { shouldRetry, delay } = APIErrorHandler.getRetryStrategy(apiError);
      
      if (!shouldRetry) break;
      
      console.log(`⏳ ${delay/1000}초 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw APIErrorHandler.handleAPIError(lastError, context);
}

// 로딩 상태 관리
export class LoadingStateManager {
  private loadingStates = new Map<string, boolean>();
  private callbacks = new Map<string, ((loading: boolean) => void)[]>();

  setLoading(key: string, loading: boolean) {
    this.loadingStates.set(key, loading);
    const callbacks = this.callbacks.get(key) || [];
    callbacks.forEach(callback => callback(loading));
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  subscribe(key: string, callback: (loading: boolean) => void) {
    const callbacks = this.callbacks.get(key) || [];
    callbacks.push(callback);
    this.callbacks.set(key, callbacks);
    
    // 현재 상태 즉시 전달
    callback(this.isLoading(key));
  }

  unsubscribe(key: string, callback: (loading: boolean) => void) {
    const callbacks = this.callbacks.get(key) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      this.callbacks.set(key, callbacks);
    }
  }
}

export const globalLoadingManager = new LoadingStateManager();