import { z } from "zod";

import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { readStringField } from "~/shared/forms/form-data.server";
import type { createTranslator } from "~/shared/i18n/i18n.shared";
import type {
  DashboardLoggingActionData,
  DashboardLoggingRangeFormState,
} from "~/features/dashboard/logging/state";

const rangeSchema = z
  .object({
    endAt: z.string().trim().min(1),
    intent: z.enum(["delete-errors", "export-errors"]),
    startAt: z.string().trim().min(1),
  })
  .superRefine((value, ctx) => {
    const startAt = new Date(value.startAt);
    const endAt = new Date(value.endAt);

    if (Number.isNaN(startAt.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid start date",
        path: ["startAt"],
      });
    }

    if (Number.isNaN(endAt.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid end date",
        path: ["endAt"],
      });
    }

    if (
      !Number.isNaN(startAt.getTime()) &&
      !Number.isNaN(endAt.getTime()) &&
      startAt > endAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be before end date",
        path: ["endAt"],
      });
    }
  });

function buildRangeValidationState(
  rawValues: DashboardLoggingRangeFormState["values"],
  t: ReturnType<typeof createTranslator>,
) {
  const parsed = rangeSchema.safeParse({
    endAt: rawValues.endAt,
    intent: "export-errors",
    startAt: rawValues.startAt,
  });

  if (parsed.success) {
    return null;
  }

  const fieldErrors = parsed.error.flatten().fieldErrors;

  return {
    errors: {
      endAt: fieldErrors.endAt?.[0]
        ? t("dashboard.logging.validation.endAt")
        : undefined,
      startAt: fieldErrors.startAt?.[0]
        ? t("dashboard.logging.validation.startAt")
        : undefined,
    },
    values: rawValues,
  } satisfies DashboardLoggingRangeFormState;
}

export function parseLoggingRangeFormData(
  formData: FormData,
  t: ReturnType<typeof createTranslator>,
) {
  const rawValues = {
    endAt: readStringField(formData, "endAt"),
    startAt: readStringField(formData, "startAt"),
  };
  const parsed = rangeSchema.safeParse({
    endAt: rawValues.endAt,
    intent: readStringField(formData, "intent"),
    startAt: rawValues.startAt,
  });

  if (!parsed.success) {
    throw buildValidationError<DashboardLoggingActionData>({
      action: APP_ERROR_ACTION.filter,
      code: APP_ERROR_CODE.logging.rangeValidation,
      message: "Logging range form validation failed",
      resource: APP_ERROR_RESOURCE.logs,
      responseData: {
        rangeForm: buildRangeValidationState(rawValues, t) ?? {
          values: rawValues,
        },
      },
      status: 400,
    });
  }

  return {
    endAt: new Date(parsed.data.endAt),
    intent: parsed.data.intent,
    startAt: new Date(parsed.data.startAt),
    values: rawValues,
  };
}
