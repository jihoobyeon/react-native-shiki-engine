import { DemoControls } from '@shared/components/DemoControls'
import { TokenDisplay } from '@shared/components/TokenDisplay'
import { useShikiDemo } from '@shared/hooks/useShikiDemo'
import { styles } from '@shared/styles'
import React, { useCallback } from 'react'
import { Platform, ScrollView, StatusBar, Text, View } from 'react-native'

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

      <DemoControls
        language={language}
        theme={theme}
        setLanguage={setLanguage}
        setTheme={setTheme}
      />

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
