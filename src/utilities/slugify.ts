export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[čć]/g, 'c') // Replace č and ć with c
    .replace(/[š]/g, 's') // Replace š with s
    .replace(/[ž]/g, 'z') // Replace ž with z
    .replace(/[đ]/g, 'd') // Replace đ with d
    .replace(/[^a-z0-9-]/g, '-') // Replace any other non-alphanumeric chars with -
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}
