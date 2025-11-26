import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(process.cwd(), 'src') // core/src
const ALIAS = '@core'

function walk(dir, files = []) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item)
    if (fs.statSync(full).isDirectory()) {
      walk(full, files)
    } else if (/\.(tsx?|jsx?)$/.test(item)) {
      files.push(full)
    }
  }
  return files
}

// Convert relative → @core/xxx
function convertImport(filePath, content) {
  return content.replace(/from\s+["'](\..*?)["']/g, (match, relPath) => {
    const abs = path.resolve(path.dirname(filePath), relPath)

    if (!abs.startsWith(ROOT)) return match

    const relativeToSrc = abs.replace(ROOT + '/', '')
    return `from "${ALIAS}/${relativeToSrc}"`
  })
}

function run() {
  console.log('Updating imports inside packages/core...')

  const files = walk(ROOT)

  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8')
    const updated = convertImport(file, code)
    fs.writeFileSync(file, updated, 'utf8')
  }

  console.log('✔ Done! All imports rewritten to @core/*')
}

run()
