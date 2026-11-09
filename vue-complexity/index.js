#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { parse: parseSfc } = require('@vue/compiler-sfc')
const { parse: parseTemplate } = require('@vue/compiler-dom')

const rawThreshold = process.argv[2]
const complexityThreshold = rawThreshold === undefined ? 10 : Number(rawThreshold)

if (!Number.isFinite(complexityThreshold)) {
  reportError('INVALID_THRESHOLD', 'The complexity threshold must be a number.')
  process.exit(1)
}

function reportError(code, message) {
  console.error(`ERROR[${code}]: ${message}`)
}

function findVueFiles(directory) {
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        files.push(...findVueFiles(path.join(directory, entry.name)))
      }
    } else if (entry.isFile() && entry.name.endsWith('.vue')) {
      files.push(path.join(directory, entry.name))
    }
  }

  return files
}

function countComplexity(node) {
  let complexity = 0

  if (node.type === 1) {
    for (const prop of node.props) {
      if (prop.type === 7 && ['if', 'else-if', 'for'].includes(prop.name)) {
        complexity++
      }
    }
  }

  if (node.children) {
    for (const child of node.children) {
      complexity += countComplexity(child)
    }
  }

  return complexity
}

for (const file of findVueFiles(process.cwd())) {
  let source
  try {
    source = fs.readFileSync(file, 'utf8')
  } catch (error) {
    reportError('FILE_READ_ERROR', `Could not read ${file}: ${error.message}`)
    process.exitCode = 1
    continue
  }

  const { descriptor, errors } = parseSfc(source, { filename: file })

  if (errors.length > 0) {
    reportError('SFC_PARSE_ERROR', `Could not parse ${file}: ${errors[0].message}`)
    process.exitCode = 1
    continue
  }

  if (!descriptor.template) continue

  const template = parseTemplate(descriptor.template.content, { filename: file })
  if (template.errors && template.errors.length > 0) {
    reportError('TEMPLATE_PARSE_ERROR', `Could not parse template in ${file}: ${template.errors[0].message}`)
    process.exitCode = 1
    continue
  }

  const complexity = 1 + countComplexity(template)

  if (complexity > complexityThreshold) {
    reportError(
      'COMPLEXITY_THRESHOLD_EXCEEDED',
      `${path.relative(process.cwd(), file)} has complexity ${complexity} (threshold: ${complexityThreshold}).`
    )
    process.exitCode = 1
  }
}
