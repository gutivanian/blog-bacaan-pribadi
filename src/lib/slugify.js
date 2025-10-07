// lib/slugify.js
import slugifyLib from 'slugify';

export function generateSlug(text) {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

export function ensureUniqueSlug(baseSlug, existingSlugs) {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}