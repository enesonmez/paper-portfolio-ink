import { data } from "react-router";

export function buildForbiddenFormState<TValues>(message: string, values: TValues) {
  return data<{
    errors: {
      form: string;
    };
    values: TValues;
  }>(
    {
      errors: {
        form: message,
      },
      values,
    },
    { status: 403 },
  );
}
