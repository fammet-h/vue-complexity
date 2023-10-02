#!/usr/bin/env node
const fs = require('fs')
let glob = require('glob')

let complexityThreshold = process.argv[2]
if (complexityThreshold === undefined) {
  complexityThreshold = 10
}


glob('**/*.vue', (err, files) => {
  files.forEach(file => {
    if (file.includes('node_modules')) {
      return
    }
    let text = fs.readFileSync(file, 'utf8')
    let lines = text.toString().split('\n')
    for(let i = 0, complexity = 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes('v-if')) {
        complexity++
      }
      if (line.includes('v-else-if')) {
        complexity++
      }
      if (line.includes('v-for')) {
        complexity++
      }
      if (i === lines.length - 1 && complexity > complexityThreshold) {
        console.log(complexity, file)
      }
    }
  })
})
