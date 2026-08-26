import type { ThemedToken } from '@shikijs/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isNativeEngineAvailable } from 'react-native-shiki-engine'
import { rustExample } from '../snippets/rust-example'
import { typescriptExample } from '../snippets/typescript-example'
import { useHighlighter } from './useHighlighter'

type DemoLanguage = 'rust' | 'typescript'
type DemoTheme = 'dracula' | 'github-dark'

const SNIPPETS: Record<DemoLanguage, string> = {
  rust: rustExample,
  typescript: typescriptExample,
}

export interface ShikiDemoState {
  engineStatus: string
  error: string
  language: DemoLanguage
  theme: DemoTheme
  tokens: ThemedToken[][]
  setLanguage: (language: DemoLanguage) => void
  setTheme: (theme: DemoTheme) => void
}

export function useShikiDemo(resolveEngineStatus: (available: boolean) => string): ShikiDemoState {
  const highlighter = useHighlighter()
  const [engineStatus, setEngineStatus] = useState('Initializing...')
  const [tokens, setTokens] = useState<ThemedToken[][]>([])
  const [error, setError] = useState('')
  const [language, setLanguage] = useState<DemoLanguage>('rust')
  const [theme, setTheme] = useState<DemoTheme>('dracula')
  const readyRef = useRef(false)

  const tokenize = useCallback(
    (nextLanguage: DemoLanguage, nextTheme: DemoTheme) => {
      const tokenized = highlighter.tokenize(SNIPPETS[nextLanguage], {
        lang: nextLanguage,
        theme: nextTheme,
      })
      setTokens(tokenized)
    },
    [highlighter],
  )

  useEffect(() => {
    void (async () => {
      try {
        const available = isNativeEngineAvailable()
        setEngineStatus(resolveEngineStatus(available))
        await highlighter.initialize()
        readyRef.current = true
        tokenize('rust', 'dracula')
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
          console.error('Tokenization error:', err)
        } else {
          setError('An unknown error occurred.')
          console.error('Unknown error:', err)
        }
      }
    })()
  }, [highlighter, resolveEngineStatus, tokenize])

  const selectLanguage = useCallback(
    (next: DemoLanguage) => {
      setLanguage(next)
      if (!readyRef.current) return
      setError('')
      try {
        tokenize(next, theme)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.')
      }
    },
    [theme, tokenize],
  )

  const selectTheme = useCallback(
    (next: DemoTheme) => {
      setTheme(next)
      if (!readyRef.current) return
      setError('')
      try {
        tokenize(language, next)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.')
      }
    },
    [language, tokenize],
  )

  return {
    engineStatus,
    error,
    language,
    theme,
    tokens,
    setLanguage: selectLanguage,
    setTheme: selectTheme,
  }
}
