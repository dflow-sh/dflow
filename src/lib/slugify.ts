export const slugify = (val: string): string =>
  val
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '') // Allow only a-z, A-Z, 0-9, and hyphen
    .toLowerCase()

export const slugifyWithUnderscore = (val: string): string =>
  val
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-_]/g, '') // Allow a-z, A-Z, 0-9, hyphen, underscore
    .toLowerCase()

export const slugifyWithSlash = (val: string): string =>
  val
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9\-\/._]/g, '') // Allow a-z, A-Z, 0-9, hyphen, slash, period, underscore
    .toLowerCase()
