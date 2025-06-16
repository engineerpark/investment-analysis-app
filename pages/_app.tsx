import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { initializeAPI } from '../utils/api_improved'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // API 시스템 초기화
    initializeAPI()
  }, [])

  return <Component {...pageProps} />
}