export function suggestSlugFromTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function findNextAvailableSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>,
) {
  if (baseSlug.length === 0) {
    return null;
  }

  if (!(await isTaken(baseSlug))) {
    return baseSlug;
  }

  let suffix = 2;

  while (await isTaken(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

export function isUniqueSlugConstraintError(error: unknown, tableName: string) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes(`UNIQUE constraint failed: ${tableName}.slug`);
}
