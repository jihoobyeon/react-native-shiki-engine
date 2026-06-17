#!/usr/bin/env node
// oxlint-disable no-console
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { styleText } from 'node:util'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const rootDirs = ['node_modules', '.idea', '.pnpm-store']

const searchDirs = ['packages', 'examples']
const targetDirNames = [
  'node_modules',
  'lib',
  'build',
  'Pods',
  '.gradle',
  'vendor',
  '.cxx',
  '.expo',
]

const specificPaths = [
  'examples/expo-app/android',
  'examples/expo-app/ios',
]

function removeDirRecursive(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true })
    console.log(styleText('green', '✓'), dirPath)
  }
  catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(styleText('red', '✗'), dirPath, error.message)
    }
  }
}

function findAndRemove(dir, targetNames) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory())
        continue

      const fullPath = path.join(dir, entry.name)

      if (targetNames.includes(entry.name)) {
        removeDirRecursive(fullPath)
        continue
      }

      findAndRemove(fullPath, targetNames)
    }
  }
  catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(styleText('red', 'Error scanning'), dir, error.message)
    }
  }
}

console.log(styleText('cyan', 'Cleaning root directories...'))
rootDirs.forEach((dir) => {
  const fullPath = path.join(rootDir, dir)
  removeDirRecursive(fullPath)
})

console.log(styleText('cyan', 'Cleaning nested directories...'))
searchDirs.forEach((dir) => {
  const fullPath = path.join(rootDir, dir)
  if (fs.existsSync(fullPath)) {
    findAndRemove(fullPath, targetDirNames)
  }
})

specificPaths.forEach((p) => {
  const fullPath = path.join(rootDir, p)
  removeDirRecursive(fullPath)
})

console.log(styleText('cyan', 'Done!'))
