# 🚀 Vercel 배포 가이드

## ⚠️ 중요: 브랜치 설정 변경 필요

현재 Vercel이 `gh-pages` 브랜치를 사용하고 있어 오류가 발생합니다. 
`main` 브랜치로 변경해야 합니다.

## 📋 Vercel 설정 변경 방법

### 1. Vercel 대시보드에서 설정 변경
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. `investment-analysis-app` 프로젝트 선택
3. **Settings** → **Git** 탭으로 이동
4. **Production Branch** 설정을 찾아서:
   - 현재: `gh-pages` ❌
   - 변경: `main` ✅
5. 저장 후 재배포

### 2. 또는 프로젝트 재연결
1. Vercel에서 프로젝트 삭제
2. "New Project" 클릭
3. GitHub에서 `investment-analysis-app` 저장소 선택
4. **Configure Project**에서:
   - Branch: `main` 선택
   - Root Directory: `.` (기본값)
   - Framework Preset: Next.js (자동 감지됨)
5. Deploy 클릭

## 🔧 프로젝트 구조 확인

```
investment-analysis-app/ (main 브랜치)
├── package.json          ✅ Next.js 의존성 포함
├── next.config.js        ✅ Next.js 설정
├── vercel.json          ✅ Vercel 설정
├── components/          ✅ React 컴포넌트
├── pages/               ✅ Next.js 페이지
├── public/              ✅ 정적 파일
└── out/                 ✅ 빌드 출력 (자동 생성)
```

## 📌 올바른 설정값

- **Branch**: `main`
- **Root Directory**: 비워두기 (기본값)
- **Build Command**: 자동 감지 (또는 `npm run build`)
- **Output Directory**: 자동 감지 (또는 `out`)
- **Install Command**: 자동 감지 (또는 `npm install`)

## 🎯 배포 후 확인사항

1. ✅ 플로팅 버튼이 모든 화면에서 표시
2. ✅ 백테스팅/미래예측 화면 정상 작동
3. ✅ 포트폴리오 기본 선택 기능
4. ✅ 반응형 디자인 (모바일/태블릿/PC)

## 🚨 문제 해결

### "No Next.js version detected" 오류
→ `main` 브랜치를 사용하도록 변경

### 빌드 실패
→ Root Directory가 올바른지 확인

### 404 오류
→ `vercel.json`의 rewrites 설정 확인

---

**참고**: GitHub Pages와 Vercel 모두 사용 가능합니다:
- GitHub Pages: https://engineerpark.github.io/investment-analysis-app/
- Vercel: https://your-app-name.vercel.app/ (설정 후)