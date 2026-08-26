import type { DemoLanguage, DemoTheme } from '../hooks/useShikiDemo'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { styles } from '../styles'

const LANGUAGES: readonly DemoLanguage[] = ['rust', 'typescript']
const THEMES: readonly DemoTheme[] = ['dracula', 'github-dark']

export interface DemoControlsProps {
  language: DemoLanguage
  theme: DemoTheme
  setLanguage: (language: DemoLanguage) => void
  setTheme: (theme: DemoTheme) => void
}

export function DemoControls({ language, theme, setLanguage, setTheme }: DemoControlsProps) {
  return (
    <View style={styles.controls}>
      {LANGUAGES.map(lang => {
        const active = language === lang
        return (
          <Pressable
            key={lang}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => {
              setLanguage(lang)
            }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{lang}</Text>
          </Pressable>
        )
      })}
      {THEMES.map(nextTheme => {
        const active = theme === nextTheme
        return (
          <Pressable
            key={nextTheme}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => {
              setTheme(nextTheme)
            }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{nextTheme}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
