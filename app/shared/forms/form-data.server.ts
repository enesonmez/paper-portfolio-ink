export function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export function compactFieldErrors<T extends Record<string, string | undefined>>(
  errors: T,
) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => typeof value === "string"),
  ) as Partial<T>;
}
