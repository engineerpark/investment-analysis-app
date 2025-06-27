# 🛠️ Claude Code 도구 및 GitHub 통합 가이드

> GitHub 앱 설치 및 유용한 툴링(CC Usage, Claude Code Flow) 활용 가이드

## 📌 목차
1. [GitHub 앱 설치](#github-앱-설치)
2. [CC Usage - 사용량 관리 도구](#cc-usage---사용량-관리-도구)
3. [Claude Code Flow - 자율 코드 작성 도구](#claude-code-flow---자율-코드-작성-도구)
4. [통합 활용 방법](#통합-활용-방법)

---

## 🔧 GitHub 앱 설치

### 설치 방법
```bash
# Claude Code에서 직접 설치
claude
/install-github-app
```

### 주요 기능
- **PR 자동 리뷰**: `@claude` 멘션으로 코드 리뷰 요청
- **이슈 자동 해결**: GitHub 이슈에서 직접 코드 수정 요청
- **자동 PR 생성**: 이슈 해결 후 자동으로 PR 생성

### GitHub Actions 설정
```yaml
# .github/workflows/claude-code.yml
name: Claude Code GitHub Integration
on:
  issue_comment:
    types: [created]
  pull_request_comment:
    types: [created]

jobs:
  claude-action:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          allowed_tools: "Bash, Read, Write, Edit"
          disallowed_tools: "Bash(rm -rf)"
```

### 사용 예시
```markdown
# GitHub PR 코멘트에서
@claude 이 함수의 테스트 커버리지를 높여주세요

# GitHub 이슈에서
@claude 이 버그를 수정하고 PR을 만들어주세요
```

---

## 📊 CC Usage - 사용량 관리 도구

### 개요
**개발자**: ryoppippi  
**저장소**: [github.com/ryoppippi/ccusage](https://github.com/ryoppippi/ccusage)  
**용도**: Claude Code 토큰 사용량 및 비용 분석

### 설치
```bash
# npm으로 전역 설치
npm install -g ccusage

# 또는 npx로 직접 실행
npx ccusage
```

### 주요 기능

#### 1. **대시보드 및 리포팅**
- 일일/월간/세션별 사용량 분석
- 토큰 사용량 및 예상 비용 (USD)
- 캐시 토큰 별도 추적
- JSON 내보내기 지원

#### 2. **실시간 모니터링**
```bash
# 실시간 대시보드 (1초마다 갱신)
ccusage blocks --live

# 기능:
# - 실시간 사용량 추적
# - 번 레이트(소진 속도) 계산
# - 청구 블록 예상치
# - 토큰 한계 경고
```

#### 3. **명령어 모음**
```bash
# 기본 명령어
ccusage              # 일일 리포트 (기본)
ccusage daily        # 일일 토큰 사용량 및 비용
ccusage monthly      # 월간 집계 리포트
ccusage session      # 대화별 사용량
ccusage blocks --live # 실시간 모니터링

# 고급 옵션
ccusage --json       # JSON 형식 출력
ccusage --export     # 데이터 내보내기
ccusage --threshold  # 경고 임계값 설정
```

#### 4. **Raycast 확장**
- 메뉴바에서 실시간 모니터링
- AI 확장 지원
- 빠른 접근 단축키

### 활용 예시
```bash
# 프로젝트 작업 전 사용량 확인
ccusage daily

# 작업 중 실시간 모니터링
ccusage blocks --live

# 월말 비용 분석
ccusage monthly --json > usage-report.json
```

### 비용 최적화 팁
1. **캐시 활용**: 반복 작업 시 캐시 토큰 활용
2. **세션 관리**: 불필요한 대화 정리
3. **임계값 설정**: 일일 한도 설정으로 과도한 사용 방지

---

## 🚀 Claude Code Flow - 자율 코드 작성 도구

### 개요
**개발자**: ruvnet  
**저장소**: [github.com/ruvnet/claude-code-flow](https://github.com/ruvnet/claude-code-flow)  
**용도**: 코드 우선 스웜 오케스트레이션 레이어

### 설치
```bash
# 한 줄 설치!
npx claude-flow@latest

# SPARC 모드로 초기화
npx claude-flow@latest init --sparc
```

### 핵심 기능

#### 1. **다중 에이전트 조정**
- **병렬 실행**: 최대 10개 에이전트 동시 실행
- **스마트 조정**: 지능적 작업 분배 및 로드 밸런싱
- **메모리 공유**: 모든 에이전트 간 지속적 지식 공유
- **실시간 모니터링**: 에이전트 상태 라이브 대시보드

#### 2. **17가지 특화 모드**
```bash
# 사용 가능한 모드
- Architect    # 아키텍처 설계
- Coder        # 코드 작성
- TDD          # 테스트 주도 개발
- Security     # 보안 검사
- DevOps       # 배포 자동화
- Reviewer     # 코드 리뷰
- Documenter   # 문서화
- Optimizer    # 성능 최적화
# ... 등 17가지 모드
```

#### 3. **자동화 기능**
```json
// 자동 생성되는 .claude/settings.json
{
  "automation": {
    "timeout": 300000,      // 5분 기본값
    "maxTimeout": 600000,   // 10분 최대값
    "outputLimit": 500000,  // 500KB 출력 제한
    "autoAccept": true      // 경고 자동 수락
  }
}
```

#### 4. **SPARC 방법론 통합**
```bash
# SPARC 워크플로우
# S - Specification (명세)
# P - Pseudocode (의사코드)
# A - Architecture (아키텍처)
# R - Refinement (개선)
# C - Completion (완성)

npx claude-flow@latest sparc "새로운 결제 시스템 구현"
```

### 사용 예시

#### 기본 사용
```bash
# 단일 작업
npx claude-flow@latest code "사용자 인증 시스템 구현"

# 다중 에이전트
npx claude-flow@latest swarm "전체 프로젝트 리팩토링"
```

#### 고급 워크플로우
```bash
# TDD 모드로 기능 개발
npx claude-flow@latest tdd "결제 API 엔드포인트"

# 보안 검사와 최적화 동시 실행
npx claude-flow@latest parallel "security,optimizer" "프로덕션 배포 준비"
```

#### Boomerang 패턴
```bash
# 반복적 개선 (코드 → 테스트 → 리팩토링 → 반복)
npx claude-flow@latest boomerang "성능 최적화" --iterations 5
```

### 프로젝트 통합
```bash
# 1. 프로젝트 초기화
cd /path/to/project
npx claude-flow@latest init --sparc

# 2. 자동 설정 확인
cat .claude/settings.json

# 3. 워크플로우 실행
npx claude-flow@latest workflow "프로젝트 전체 개선"
```

---

## 🔄 통합 활용 방법

### 1️⃣ **일일 개발 워크플로우**
```bash
# 아침: 사용량 확인
ccusage daily

# GitHub 이슈 작업
@claude 이슈 #123 해결해주세요

# 복잡한 기능 개발
npx claude-flow@latest sparc "새로운 대시보드 기능"

# 실시간 비용 모니터링
ccusage blocks --live

# 저녁: 일일 사용량 리포트
ccusage session
```

### 2️⃣ **팀 협업 시나리오**
```bash
# 1. PR 리뷰 자동화
# GitHub PR에서: @claude 이 코드 리뷰해주세요

# 2. 다중 에이전트로 대규모 리팩토링
npx claude-flow@latest swarm "레거시 코드 현대화"

# 3. 팀 전체 사용량 분석
ccusage monthly --export > team-usage.json
```

### 3️⃣ **비용 효율적 개발**
```bash
# 작업 전 예산 확인
ccusage blocks --live

# 효율적인 작업 분배
npx claude-flow@latest parallel "작은작업1,작은작업2"

# 캐시 활용 모니터링
ccusage session | grep "cache"
```

### 4️⃣ **CI/CD 통합**
```yaml
# .github/workflows/ai-powered-ci.yml
name: AI Powered CI/CD
on: [push, pull_request]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      # Claude Code로 자동 리뷰
      - uses: anthropics/claude-code-action@v1
      
      # Claude Flow로 테스트 생성
      - run: npx claude-flow@latest tdd "새 기능 테스트"
      
      # 사용량 리포트
      - run: npx ccusage daily --json > usage.json
      - uses: actions/upload-artifact@v3
        with:
          name: usage-report
          path: usage.json
```

### 5️⃣ **프로젝트별 설정**
```bash
# investment-analysis-app 프로젝트용
cd /Users/jehyeon/investment-analysis-app

# Claude Flow 초기화
npx claude-flow@latest init --sparc

# 커스텀 워크플로우 생성
cat > .claude/workflows/deploy.json << 'EOF'
{
  "name": "Vercel 배포 워크플로우",
  "steps": [
    {"mode": "test", "command": "npm test"},
    {"mode": "build", "command": "npm run build"},
    {"mode": "deploy", "command": "git push origin main"}
  ]
}
EOF

# 사용량 추적 시작
ccusage blocks --live &
```

## 💡 베스트 프랙티스

### 효율성 극대화
1. **작업 배치**: 관련 작업들을 묶어서 실행
2. **캐시 활용**: 반복 작업 시 이전 결과 재사용
3. **모드 선택**: 작업에 맞는 적절한 모드 사용

### 비용 관리
1. **일일 한도 설정**: `ccusage --set-limit 10.00`
2. **정기 리포트**: 주간/월간 사용량 분석
3. **효율적인 프롬프트**: 명확하고 간결한 지시

### 팀 표준화
1. **공통 워크플로우**: `.claude/workflows/` 공유
2. **사용량 가이드라인**: 팀 예산 및 한도 설정
3. **자동화 템플릿**: 반복 작업 자동화

---

## 🎯 결론

Claude Code의 강력한 도구들을 활용하면:
- 🚀 **개발 속도**: 자동화로 10배 빠른 개발
- 💰 **비용 효율**: 실시간 모니터링으로 예산 관리
- 🤝 **팀 협업**: GitHub 통합으로 원활한 협업
- 🔧 **품질 향상**: 다중 에이전트로 철저한 검증

이 도구들을 프로젝트에 통합하여 AI 기반 개발의 잠재력을 최대한 활용하세요!