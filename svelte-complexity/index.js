#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { parse } = require('svelte/compiler')

function reportError(writeError, code, message) {
  writeError(`ERROR[${code}]: ${message}`)
}

function findSvelteFiles(directory) {
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        files.push(...findSvelteFiles(path.join(directory, entry.name)))
      }
    } else if (entry.isFile() && entry.name.endsWith('.svelte')) {
      files.push(path.join(directory, entry.name))
    }
  }

  return files
}

function countComplexity(node, seen = new Set()) {
  if (!node || typeof node !== 'object' || seen.has(node)) return 0
  seen.add(node)

  let complexity = ['IfBlock', 'EachBlock'].includes(node.type) ? 1 : 0

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) complexity += countComplexity(child, seen)
    } else if (value && typeof value === 'object') {
      complexity += countComplexity(value, seen)
    }
  }

  return complexity
}

function getComplexity(source, filename) {
  const component = parse(source, { filename, modern: true })
  return 1 + countComplexity(component.fragment)
}

function run(args = process.argv.slice(2), directory = process.cwd(), writeError = console.error) {
  const rawThreshold = args[0]
  const complexityThreshold = rawThreshold === undefined ? 10 : Number(rawThreshold)

  if (!Number.isFinite(complexityThreshold)) {
    reportError(writeError, 'INVALID_THRESHOLD', 'The complexity threshold must be a number.')
    return 1
  }

  let exitCode = 0
  for (const file of findSvelteFiles(directory)) {
    let source
    try {
      source = fs.readFileSync(file, 'utf8')
    } catch (error) {
      reportError(writeError, 'FILE_READ_ERROR', `Could not read ${file}: ${error.message}`)
      exitCode = 1
      continue
    }

    let complexity
    try {
      complexity = getComplexity(source, file)
    } catch (error) {
      reportError(writeError, 'SVELTE_PARSE_ERROR', `Could not parse ${file}: ${error.message}`)
      exitCode = 1
      continue
    }

    if (complexity > complexityThreshold) {
      reportError(
        writeError,
        'COMPLEXITY_THRESHOLD_EXCEEDED',
        `${path.relative(directory, file)} has complexity ${complexity} (threshold: ${complexityThreshold}).`
      )
      exitCode = 1
    }
  }

  return exitCode
}

if (require.main === module) process.exitCode = run()

module.exports = { run }
