import fs from 'fs'
import path from 'path'

/* ---------------------------------------------
   CONFIG: ADD ALL IMPORT REWRITES HERE
--------------------------------------------- */
const rules = [
  { from: /^@\/lib\//, to: '@core/lib/' },
  { from: /^@\/components\//, to: '@core/components/' },
  { from: /^@\/hooks\//, to: '@core/hooks/' },
  { from: /^@\/providers\//, to: '@core/providers/' },
  { from: /^@\/stores\//, to: '@core/stores/' },
  { from: /^@\/queues\//, to: '@core/queues/' },
  { from: /^@\/emails\//, to: '@core/emails/' },
  { from: /^@\/actions\//, to: '@core/actions/' },
  { from: /^@\/payload-types/, to: '@core/payload-types' },
  { from: /^@\/payload\//, to: '@core/payload/' },
  { from: /^@\/scripts\//, to: '@core/scripts/' },

  // replace env → @core/keys
  { from: /^env$/, to: '@core/keys' },

  // @payload-config → @core/payload.config
  { from: /^@payload-config$/, to: '@core/payload.config' },
]

/* ---------------------------------------------
   SPECIAL REPLACEMENT FOR:
   import { env } from 'env'
--------------------------------------------- */
function rewriteSpecial(code) {
  return code.replace(
    /import\s+{([^}]+)}\s+from\s+['"]env['"];?/g,
    `import { keys as env } from '@core/keys';`,
  )
}

/* ---------------------------------------------
   REWRITE NORMAL IMPORTS
--------------------------------------------- */
function rewriteImports(code) {
  return code.replace(/from ["']([^"']+)["']/g, (match, importPath) => {
    for (const rule of rules) {
      if (rule.from.test(importPath)) {
        const newPath = importPath.replace(rule.from, rule.to)
        return `from "${newPath}"`
      }
    }
    return match
  })
}

/* ---------------------------------------------
   WALK DIRECTORY
--------------------------------------------- */
function walk(dir, callback) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file)
    if (fs.statSync(full).isDirectory()) {
      walk(full, callback)
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      callback(full)
    }
  }
}

/* ---------------------------------------------
   RUN SCRIPT
--------------------------------------------- */

// IMPORTANT FIX ✔
const CORE_SRC = path.resolve('./src')

console.log('Updating core imports...')

walk(CORE_SRC, filePath => {
  const oldCode = fs.readFileSync(filePath, 'utf8')

  let newCode = rewriteSpecial(oldCode)
  newCode = rewriteImports(newCode)

  if (oldCode !== newCode) {
    fs.writeFileSync(filePath, newCode)
    console.log('Updated:', filePath)
  }
})

console.log('Done!')
