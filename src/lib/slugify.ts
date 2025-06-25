export const slugify = (val: string): string =>
  val
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '') // Remove all non-alphanumeric and non-hyphen characters
    .toLowerCase()

export const slugifyWithSlash = (val: string): string =>
  val
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-/.]/g, '') // Allow a-z, A-Z, 0-9, hyphen, slash, and period
    .toLowerCase()
