export function hslToCSSVariable(hsl: string): string {
  const match = hsl.match(
    /^hsl\(\s*([\d.]+)\s*,\s*([\d.]+%)\s*,\s*([\d.]+%)\s*\)$/i,
  )

  // returning black color for invalid hsl values
  if (!match) {
    return '0 0 0'
  }

  const [, h, s, l] = match
  return `${h} ${s} ${l}`
}
