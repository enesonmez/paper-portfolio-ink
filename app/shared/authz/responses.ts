export function buildForbiddenFormState<TValues>(message: string, values: TValues) {
  return {
    errors: {
      form: message,
    },
    values,
  } satisfies {
    errors: {
      form: string;
    };
    values: TValues;
  };
}
