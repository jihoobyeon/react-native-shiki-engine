import { TokenDisplay } from '@shared/components/TokenDisplay'
import { useShikiDemo } from '@shared/hooks/useShikiDemo'
import { styles } from '@shared/styles'
import React, { useCallback } from 'react'
import { Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native'

export function ShikiExampleScreen() {
  const resolveEngineStatus = useCallback((available: boolean) => {
    if (Platform.OS === 'web') return 'WASM Engine'
    return available ? 'Native Engine' : 'Not Available'
  }, [])
  const { engineStatus, error, language, theme, tokens, setLanguage, setTheme } =
    useShikiDemo(resolveEngineStatus)

  const platformName = Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'
  const statusBarHeight = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ?? 0)

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      <View style={styles.header}>
        <Text style={styles.title}>React Native Shiki Engine</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Engine:</Text>
          <Text style={styles.statusValue}>{engineStatus}</Text>
          <View style={styles.platformBadge}>
            <Text style={styles.platformText}>{platformName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[styles.chip, language === 'rust' && styles.chipActive]}
          onPress={() => {
            setLanguage('rust')
          }}
        >
          <Text style={[styles.chipText, language === 'rust' && styles.chipTextActive]}>rust</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, language === 'typescript' && styles.chipActive]}
          onPress={() => {
            setLanguage('typescript')
          }}
        >
          <Text style={[styles.chipText, language === 'typescript' && styles.chipTextActive]}>
            typescript
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, theme === 'dracula' && styles.chipActive]}
          onPress={() => {
            setTheme('dracula')
          }}
        >
          <Text style={[styles.chipText, theme === 'dracula' && styles.chipTextActive]}>
            dracula
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, theme === 'github-dark' && styles.chipActive]}
          onPress={() => {
            setTheme('github-dark')
          }}
        >
          <Text style={[styles.chipText, theme === 'github-dark' && styles.chipTextActive]}>
            github-dark
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.demoSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.languageTag}>{language}</Text>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <TokenDisplay tokens={tokens} />
        )}
      </ScrollView>
    </View>
  )
}
