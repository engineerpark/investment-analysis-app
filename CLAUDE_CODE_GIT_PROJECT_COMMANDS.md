# 🚀 Claude Code Git & 프로젝트 관리 명령어 가이드

> awesome-claude-code 저장소의 핵심 Git 및 프로젝트 관리 slash commands 정리

## 📌 목차
1. [Git 버전 관리 명령어](#git-버전-관리-명령어)
2. [프로젝트 관리 명령어](#프로젝트-관리-명령어)
3. [커스텀 명령어 생성 방법](#커스텀-명령어-생성-방법)
4. [활용 방법 및 베스트 프랙티스](#활용-방법-및-베스트-프랙티스)

---

## 🔄 Git 버전 관리 명령어

### 1. `/2-commit-fast` - 빠른 커밋 자동화
**작성자**: steadycursor  
**기능**: Git 커밋 프로세스를 자동화하여 빠르게 실행
- 첫 번째 제안 메시지 자동 선택
- 구조화된 커밋 메시지 생성
- 수동 확인 단계 건너뛰기
- Claude 공동 저자 푸터 제거

**사용 예시**:
```bash
/2-commit-fast
# 자동으로 변경사항을 분석하고 적절한 커밋 메시지 생성
```

### 2. `/commit` - Conventional Commit 생성
**기능**: 프로젝트 표준에 따른 설명적인 커밋 메시지 생성
- Conventional Commit 형식 준수
- 적절한 이모지 자동 추가
- 변경사항 기반 메시지 작성

**커스텀 명령어 예시**:
```markdown
---
allowed-tools: Bash(git add:*, git status:*, git commit:*)
description: Create a git commit
---

## Context
- Current git status: !`git status`
- Current git diff: !`git diff HEAD`
- Current branch: !`git branch --show-current`

## Your task
Based on the above changes, create a single git commit with:
1. Conventional commit format (feat/fix/docs/style/refactor/test/chore)
2. Appropriate emoji prefix
3. Clear and concise message
4. Co-authored by Claude footer

Example: 
🚀 feat: Add user authentication system

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 3. `/create-pr` - PR 생성 워크플로우
**작성자**: toyamarinyon  
**기능**: 풀 리퀘스트 생성 전체 워크플로우 자동화
- 새 브랜치 생성
- 변경사항 커밋
- Biome로 수정된 파일 포맷팅
- PR 제출

**워크플로우**:
```bash
1. Create new branch from current
2. Stage and commit all changes
3. Format files with Biome
4. Push to remote
5. Create PR with descriptive title and body
```

### 4. `/create-pull-request` - 상세 PR 가이드
**작성자**: liam-hq  
**기능**: GitHub CLI를 사용한 포괄적인 PR 생성 가이드
- 타이틀 컨벤션 강제
- 템플릿 구조 준수
- 구체적인 명령어 예시 제공

**사용 예시**:
```bash
/create-pull-request
# GitHub CLI로 다음 작업 수행:
# - PR 템플릿 확인
# - 타이틀 컨벤션 적용
# - 상세한 설명 작성
# - 리뷰어 자동 할당
```

### 5. `/fix-github-issue` - GitHub 이슈 자동 수정
**기능**: GitHub 이슈를 체계적으로 분석하고 수정
- 이슈 세부사항 조회 (`gh issue view`)
- 관련 파일 검색
- 필요한 변경사항 구현
- 테스트 작성 및 실행
- 설명적인 커밋과 PR 생성

**커스텀 명령어 예시**:
```markdown
# .claude/commands/fix-issue.md
Please analyze and fix the GitHub issue: $ARGUMENTS

1. Use `gh issue view` to get issue details
2. Search codebase for relevant files
3. Implement necessary changes
4. Write and run tests
5. Create descriptive commit and PR with:
   - Link to original issue
   - Summary of changes
   - Test results
```

---

## 📊 프로젝트 관리 명령어

### 1. **n8n_agent** by kingler
**기능**: SDLC 전체를 위한 포괄적인 명령어 세트
- **코드 분석**: 복잡도, 품질, 보안 검사
- **QA**: 자동화된 테스트 생성 및 실행
- **설계**: 아키텍처 다이어그램 생성
- **문서화**: API 문서 자동 생성
- **프로젝트 구조**: 디렉토리 구조 최적화
- **프로젝트 관리**: 작업 추적 및 진행 상황 보고
- **최적화**: 성능 개선 제안

### 2. **Project Bootstrapping** by steadycursor
**기능**: 새 프로젝트 부트스트래핑 및 관리
- 프로젝트 초기 설정 자동화
- 메타 명령어로 커스텀 slash-commands 생성/편집
- 표준 프로젝트 구조 생성

**프로젝트 초기화 예시**:
```bash
/project:bootstrap
# 다음 작업 자동 수행:
# 1. 프로젝트 디렉토리 구조 생성
# 2. 필수 설정 파일 생성
# 3. Git 초기화
# 4. README 및 문서 생성
# 5. 개발 환경 설정
```

### 3. **Slash-commands megalist** by wcygan
**기능**: 88개의 slash 명령어 포함
- **에이전트 오케스트레이션**: 다중 작업 조정
- **코드 리뷰**: 자동화된 코드 품질 검사
- **보안**: 취약점 스캔 및 수정
- **문서화**: 다양한 형식의 문서 생성
- **자체 평가**: 코드 품질 메트릭스

### 4. **SDLC 워크플로우 베스트 프랙티스**
Anthropic 권장 구조화된 워크플로우:

```markdown
## 1. 문제 연구 및 이해
/research-problem
- 문제의 근본 원인 분석
- 관련 코드베이스 탐색
- 기존 솔루션 검토

## 2. 접근 방법 계획
/plan-solution
- 단계별 해결 방안 작성
- 필요한 변경사항 목록화
- 리스크 평가

## 3. 솔루션 구현
/implement
- 계획에 따른 코드 작성
- 단위 테스트 포함
- 코드 리뷰 준비

## 4. 커밋 및 PR 생성
/commit-and-pr
- 의미 있는 커밋 메시지
- PR 설명 자동 생성
- 리뷰어 할당
```

---

## 🛠️ 커스텀 명령어 생성 방법

### 1. **프로젝트별 명령어**
```bash
# 위치: .claude/commands/[명령어이름].md
# 접근: /project:명령어이름

# 예시: .claude/commands/deploy.md
---
allowed-tools: Bash, Read, Write
description: Deploy to production
---

Deploy the application to production:
1. Run tests: !`npm test`
2. Build: !`npm run build`
3. Deploy: !`npm run deploy`
4. Verify deployment
```

### 2. **개인 전역 명령어**
```bash
# 위치: ~/.claude/commands/[명령어이름].md
# 접근: /명령어이름
# 모든 프로젝트에서 사용 가능
```

### 3. **매개변수 사용**
```markdown
# $ARGUMENTS 키워드로 매개변수 전달
Fix the issue: $ARGUMENTS

Example usage:
/fix-issue "Authentication bug in login flow"
```

### 4. **도구 제한**
```yaml
---
allowed-tools: 
  - Bash(git:*, npm:*)
  - Read
  - Write
disallowed-tools:
  - Bash(rm -rf)
---
```

---

## 💡 활용 방법 및 베스트 프랙티스

### 1. **일일 개발 워크플로우**
```bash
# 아침: 프로젝트 상태 확인
/project:status

# 이슈 작업 시작
/fix-github-issue #123

# 기능 개발
/implement-feature "새로운 결제 시스템"

# 커밋 및 PR
/2-commit-fast
/create-pr
```

### 2. **팀 협업 강화**
- **표준화**: 팀 전체가 동일한 커밋 형식 사용
- **자동화**: 반복 작업 최소화
- **일관성**: 코드 스타일 및 프로젝트 구조 유지

### 3. **CI/CD 통합**
```yaml
# GitHub Actions와 통합
name: Claude Code Workflow
on: [push, pull_request]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          trigger-phrase: "@claude"
```

### 4. **생산성 향상 팁**
1. **자주 사용하는 명령어 커스터마이징**
   - 프로젝트 특성에 맞게 수정
   - 팀 컨벤션 반영

2. **명령어 체이닝**
   ```bash
   /research-problem && /plan-solution && /implement
   ```

3. **컨텍스트 활용**
   - CLAUDE.md 파일에 프로젝트 정보 저장
   - 명령어에서 컨텍스트 참조

4. **정기적인 명령어 업데이트**
   - 새로운 요구사항 반영
   - 비효율적인 부분 개선

### 5. **문제 해결 시나리오**

#### 시나리오 1: 긴급 버그 수정
```bash
/fix-github-issue #critical-bug
/2-commit-fast
/create-pr
# PR에 "URGENT" 라벨 추가
```

#### 시나리오 2: 새 기능 개발
```bash
/research-problem "사용자 요구사항"
/plan-solution
/implement-feature
/write-tests
/commit
/create-pr
```

#### 시나리오 3: 코드 리팩토링
```bash
/analyze-code
/refactor-suggestions
/implement-refactoring
/verify-tests
/commit "refactor: 성능 최적화"
```

---

## 📚 추가 리소스

- **awesome-claude-code 저장소**: [GitHub](https://github.com/hesreallyhim/awesome-claude-code)
- **Claude Code 공식 문서**: [Anthropic Docs](https://docs.anthropic.com/en/docs/claude-code)
- **커뮤니티 예시**: 다양한 사용자들의 커스텀 명령어 공유

---

## 🎯 결론

Claude Code의 slash commands는 개발 워크플로우를 혁신적으로 개선할 수 있는 강력한 도구입니다. 
특히 Git 작업과 프로젝트 관리에서 반복적인 작업을 자동화하고, 
팀 전체의 일관성을 유지하며, 생산성을 크게 향상시킬 수 있습니다.

**핵심 포인트**:
- 🚀 빠른 실행과 일관된 결과
- 🤝 팀 협업 강화
- 📈 생산성 극대화
- 🔧 커스터마이징 가능

이 가이드를 참고하여 프로젝트에 맞는 최적의 워크플로우를 구축하세요!