import { TokenDisplay } from '@shared/components/TokenDisplay'
import { useShikiDemo } from '@shared/hooks/useShikiDemo'
import { styles } from '@shared/styles'
import React, { useCallback } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
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
    </SafeAreaView>
  )
}
