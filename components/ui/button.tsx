import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "primary" | "danger" | "success" | "analysis" | "warning" | "info"
  size?: "default" | "sm" | "lg" | "icon" | "touch"
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = "", 
    variant = "default", 
    size = "default", 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
    
    const focusRings = {
      default: "focus-visible:ring-emerald-500",
      primary: "focus-visible:ring-blue-500", 
      outline: "focus-visible:ring-slate-500",
      secondary: "focus-visible:ring-slate-500",
      ghost: "focus-visible:ring-slate-500",
      danger: "focus-visible:ring-red-500",
      success: "focus-visible:ring-emerald-500",
      analysis: "focus-visible:ring-purple-500",
      warning: "focus-visible:ring-orange-500",
      info: "focus-visible:ring-sky-500"
    }
    
    const variants = {
      // 기본 주요 액션 - 성공/긍정적 액션용 초록색
      default: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-md hover:shadow-lg",
      // 주요 액션 - 브랜드 블루
      primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg",
      // 아웃라인 - 보조 액션용
      outline: "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100",
      // 보조 액션 - 중성적인 회색
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 border border-slate-200",
      // 고스트 - 네비게이션용
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200",
      // 위험한 액션 - 빨간색
      danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg",
      // 성공/확인 액션 - 초록색  
      success: "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-md hover:shadow-lg",
      // 분석/데이터 관련 - 보라색
      analysis: "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 shadow-md hover:shadow-lg",
      // 경고/주의 - 주황색
      warning: "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-md hover:shadow-lg",
      // 정보/학습 - 하늘색
      info: "bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 shadow-md hover:shadow-lg"
    }
    
    const sizes = {
      default: "h-10 px-4 py-2 min-w-[80px]",
      sm: "h-8 px-3 py-1 text-xs min-w-[60px]",
      lg: "h-12 px-6 py-3 text-base min-w-[120px]",
      icon: "h-10 w-10 p-0",
      touch: "h-12 px-6 py-3 text-base min-w-[120px] min-h-[44px]" // 터치 친화적 크기
    }
    
    const isDisabled = disabled || loading;
    
    return (
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${focusRings[variant]} ${className}`}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }