import { NativeHighlighterProvider } from '@shared/contexts/highlighter/NativeHighlighterProvider'
import React from 'react'

export function HighlighterProvider({ children }: { children: React.ReactNode }) {
  return <NativeHighlighterProvider>{children}</NativeHighlighterProvider>
}
