#!/usr/bin/env node
// oxlint-disable no-console
import fs from 'node:fs'
import { styleText } from 'node:util'

const dirs = ['android/app', 'android/build', 'lib', 'build']

console.log(styleText('cyan', 'Cleaning...'))
dirs.forEach((p) => {
  try {
    fs.rmSync(p, { recursive: true, force: true })
    console.log(styleText('green', '✓'), p)
  }
  catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(styleText('red', '✗'), p, error.message)
    }
  }
})
console.log(styleText('cyan', 'Done!'))
