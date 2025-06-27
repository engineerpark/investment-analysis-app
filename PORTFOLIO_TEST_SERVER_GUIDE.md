# 🚀 포트폴리오 투자관리 테스트 서버 실행 가이드

> **빠른 실행**: "포트폴리오 투자관리 테스트 서버 실행해달라" 요청 시 이 문서를 참고하여 즉시 실행

## 📋 현재 상태 (2025-01-25 23:50)

- **프로젝트**: investment-analysis-app
- **버전**: 2.0.3
- **상태**: ✅ 정상 작동 중
- **로컬 서버**: http://localhost:3000
- **프레임워크**: Next.js 14.2.30

## ⚡ 즉시 실행 명령어

```bash
# 1. 기존 프로세스 정리
pkill -f "next" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# 2. 디렉토리 이동
cd /Users/jehyeon/investment-analysis-app

# 3. 로컬 서버 시작 (백그라운드)
npm run dev &

# 4. 3초 대기 후 연결 테스트
sleep 3
curl -s http://localhost:3000 | head -5

# 5. 테스트 페이지들 열기
open -a "Safari" http://localhost:3000
open -a "Safari" "/Users/jehyeon/investment-analysis-app/preview.html"
open -a "Safari" "/Users/jehyeon/investment-analysis-app/public/responsive-test.html"
```

## 📱 사용 가능한 테스트 페이지

### 1. **메인 앱** - http://localhost:3000
- 투자 성향 분석 화면
- 포트폴리오 전략 추천
- 기존 포트폴리오 관리

### 2. **미리보기 페이지** - `preview.html`
- 📱 모바일 프레임 (375x812)
- 📱 태블릿 프레임 (768x1024)
- 🖥️ 데스크톱 프레임 (전체화면)
- ⚡ 10초 자동 새로고침
- 🔄 디바이스 전환 시 수동 새로고침

### 3. **반응형 테스트** - `public/responsive-test.html`
- 📱 Mobile Small (320px)
- 📱 Mobile Medium (375px)
- 📱 iPhone 14 (393px)
- 📱 Tablet (768px)
- 실시간 반응형 테스트

### 4. **테스트 플로우** - `public/test-flow.html`
- 전체 투자 앱 플로우 테스트
- 사용자 시나리오별 테스트
- 예상 문제점 및 해결방안

### 5. **서버 연결 테스트** - `test-server.html`
- 서버 연결 상태 확인
- 완료된 기능 리스트
- 자동 서버 감지

## 🔧 주요 기능 테스트 항목

### ✅ 완료된 기능들
- [x] **실시간 CoinGecko API 연동**
- [x] **코인 검색 기능** (BTC, ETH, 이더리움 등)
- [x] **포트폴리오 실시간 가치 계산**
- [x] **백테스팅 화면**
- [x] **AI 미래예측 화면**
- [x] **반응형 플로팅 버튼**
- [x] **투자 성향 분석**
- [x] **다중 디바이스 대응**

### 🧪 테스트 시나리오
1. **홈 화면** → 투자성향분석 버튼 클릭
2. **투자 성향 분석** → 맞춤형 포트폴리오 추천
3. **포트폴리오 저장** → 기존 포트폴리오 관리
4. **코인 검색** → 실시간 가격 확인
5. **백테스팅** → 과거 성과 분석

## 🛠️ 문제 해결

### 문제 1: iframe이 비어있음
```bash
# 해결: iframe src 경로 확인
grep -r "src=" *.html public/*.html | grep iframe
# 모든 iframe이 http://localhost:3000을 가리켜야 함
```

### 문제 2: 서버가 시작되지 않음
```bash
# 해결: 포트 충돌 해결
lsof -ti:3000 | xargs kill -9
npm install
npm run dev
```

### 문제 3: React 컴포넌트가 로딩되지 않음
```bash
# 해결: 브라우저 캐시 정리 + 새로고침
# Chrome: Cmd+Shift+R
# Safari: Cmd+Option+R
```

## 📊 성능 모니터링

### 로컬 서버 상태 확인
```bash
# 서버 응답 확인
curl -I http://localhost:3000

# React 컴포넌트 로딩 확인
curl -s http://localhost:3000 | grep -o "포트폴리오"

# 프로세스 확인
ps aux | grep next
```

### 메모리 사용량
```bash
# Next.js 개발 서버 메모리 사용량 확인
ps aux | grep next | awk '{print $6, $11}'
```

## 📝 Quick Commands (복사 & 붙여넣기)

### 서버 재시작
```bash
pkill -f "next"; sleep 2; cd /Users/jehyeon/investment-analysis-app; npm run dev &
```

### 모든 테스트 페이지 열기
```bash
open -a "Safari" http://localhost:3000 "/Users/jehyeon/investment-analysis-app/preview.html" "/Users/jehyeon/investment-analysis-app/public/responsive-test.html"
```

### 서버 상태 체크
```bash
curl -s http://localhost:3000 > /dev/null && echo "✅ 서버 정상" || echo "❌ 서버 오류"
```

## 🔄 자동화 스크립트

### 전체 테스트 환경 설정
```bash
#!/bin/bash
echo "🚀 포트폴리오 투자관리 테스트 서버 시작..."

# 프로세스 정리
pkill -f "next" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 디렉토리 이동
cd /Users/jehyeon/investment-analysis-app

# 서버 시작
npm run dev &

# 서버 시작 대기
sleep 5

# 연결 테스트
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 서버 시작 완료: http://localhost:3000"
    
    # 테스트 페이지 열기
    open -a "Safari" http://localhost:3000
    open -a "Safari" "$(pwd)/preview.html"
    
    echo "📱 테스트 페이지가 Safari에서 열렸습니다"
    echo "🎯 투자 성향 분석 기능을 테스트해보세요!"
else
    echo "❌ 서버 시작 실패"
fi
```

## 📞 지원 정보

- **생성일**: 2025-01-25
- **최종 업데이트**: v2.0.3 
- **문제 발생 시**: 이 문서의 명령어들을 순차적으로 실행
- **추가 도움**: Claude Code에게 "PORTFOLIO_TEST_SERVER_GUIDE.md 참고해서 테스트 서버 실행해줘" 요청

---
*이 가이드를 사용하면 토큰 소모를 최소화하고 빠르게 테스트 환경을 구축할 수 있습니다.*