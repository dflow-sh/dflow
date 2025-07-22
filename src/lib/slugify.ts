export const slugify = (val: string): string =>
  val
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '') // Allow only a-z, A-Z, 0-9, and hyphen
    .toLowerCase()

export const slugifyWithUnderscore = (val: string): string =>
  val
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-_/\.]/g, '')
    .toLowerCase()
