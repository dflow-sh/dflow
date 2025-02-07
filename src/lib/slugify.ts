export const slugify = (val: string): string =>
  val
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '') // Remove all non-alphanumeric and non-hyphen characters
    .toLowerCase()
