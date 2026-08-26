import type { HighlighterCore } from '@shikijs/core'
import type { NativeEngineOptions, NativeRegexEngine } from 'react-native-shiki-engine'
import type { HighlighterContextType } from './context'
import { createHighlighterCore } from '@shikijs/core'
import rust from '@shikijs/langs/rust'
import typescript from '@shikijs/langs/typescript'
import dracula from '@shikijs/themes/dracula'
import githubDark from '@shikijs/themes/github-dark'
import React from 'react'
import {
  attachMemoryPressureHandler,
  createNativeEngine,
  isNativeEngineAvailable,
} from 'react-native-shiki-engine'
import { HighlighterContext } from './context'

let highlighterInstance: HighlighterCore | null = null
let nativeEngine: NativeRegexEngine | null = null
let detachMemoryPressure: (() => void) | null = null
let initializationPromise: Promise<void> | null = null

export interface NativeHighlighterProviderProps {
  children: React.ReactNode
  engineOptions?: NativeEngineOptions
}

export function NativeHighlighterProvider({
  children,
  engineOptions,
}: NativeHighlighterProviderProps) {
  const value = React.useMemo<HighlighterContextType>(
    () => ({
      initialize: async () => {
        initializationPromise ??= (async () => {
          const available = isNativeEngineAvailable()
          if (!available) throw new Error('Native engine not available.')

          nativeEngine = createNativeEngine(engineOptions)
          detachMemoryPressure = attachMemoryPressureHandler(nativeEngine)

          highlighterInstance = await createHighlighterCore({
            langs: [rust, typescript],
            themes: [dracula, githubDark],
            engine: nativeEngine,
          })
        })()

        await initializationPromise
      },

      tokenize: (code: string, options: { lang: string; theme: string }) => {
        if (!highlighterInstance)
          throw new Error('Highlighter not initialized. Call initialize() first.')
        return highlighterInstance.codeToTokensBase(code, options)
      },

      dispose: () => {
        detachMemoryPressure?.()
        detachMemoryPressure = null
        nativeEngine?.dispose()
        nativeEngine = null
        if (highlighterInstance) {
          highlighterInstance.dispose()
          highlighterInstance = null
        }
        initializationPromise = null
      },
    }),
    [engineOptions],
  )

  React.useEffect(() => {
    return () => {
      value.dispose()
    }
  }, [value])

  return <HighlighterContext value={value}>{children}</HighlighterContext>
}
