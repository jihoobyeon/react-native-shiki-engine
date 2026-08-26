import { DemoControls } from '@shared/components/DemoControls'
import { TokenDisplay } from '@shared/components/TokenDisplay'
import { useShikiDemo } from '@shared/hooks/useShikiDemo'
import { styles } from '@shared/styles'
import React, { useCallback } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function ShikiExampleScreen() {
  const resolveEngineStatus = useCallback(
    (available: boolean) => (available ? 'Available' : 'Not Available'),
    [],
  )
  const { engineStatus, error, language, theme, tokens, setLanguage, setTheme } =
    useShikiDemo(resolveEngineStatus)

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>React Native Shiki Engine</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Engine Status:</Text>
          <Text style={styles.statusValue}>{engineStatus}</Text>
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
    </SafeAreaView>
  )
}
