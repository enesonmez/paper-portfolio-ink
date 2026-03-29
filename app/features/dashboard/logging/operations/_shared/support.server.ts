import type { parseLoggingRangeFormData } from "~/lib/logging/logging-range-form.server";

import type { DashboardLoggingActionData } from "../../state";

export type DashboardLoggingRangeSubmission = ReturnType<
  typeof parseLoggingRangeFormData
>;

export function buildLoggingRangeActionData(
  message: string,
): DashboardLoggingActionData {
  return {
    rangeForm: {
      errors: {
        form: message,
      },
      values: {
        endAt: "",
        startAt: "",
      },
    },
  };
}
