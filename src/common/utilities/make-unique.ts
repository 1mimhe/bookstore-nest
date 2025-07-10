import { randomBytes } from 'crypto';

export function makeUnique(value: string) {
  if (!value) return '';

  const baseSlug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const randomSuffix = randomBytes(3).toString('hex');
  return `${baseSlug}-${randomSuffix}`;
}
