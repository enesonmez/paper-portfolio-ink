import { LOGGING_FORM_FIELD, LOGGING_MUTATION_INTENT } from "~/domain/logging/model";
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

const DATE_TIME_LOCAL_PATTERN =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2})$/;
const MAX_TIMEZONE_OFFSET_MINUTES = 14 * 60;
const timezoneOffsetSchema = z
  .string()
  .trim()
  .regex(/^-?\d+$/)
  .transform(Number)
  .pipe(
    z.number().int().min(-MAX_TIMEZONE_OFFSET_MINUTES).max(MAX_TIMEZONE_OFFSET_MINUTES),
  );

const rangeSchema = z
  .object({
    endAt: z.string().trim().min(1),
    endAtOffsetMinutes: timezoneOffsetSchema,
    intent: z.enum([
      LOGGING_MUTATION_INTENT.deleteHistory,
      LOGGING_MUTATION_INTENT.deleteErrors,
      LOGGING_MUTATION_INTENT.exportHistory,
      LOGGING_MUTATION_INTENT.exportErrors,
    ]),
    startAt: z.string().trim().min(1),
    startAtOffsetMinutes: timezoneOffsetSchema,
  })
  .superRefine((value, ctx) => {
    const startAt = parseDateTimeLocalToUtcDate(
      value.startAt,
      value.startAtOffsetMinutes,
    );
    const endAt = parseDateTimeLocalToUtcDate(
      value.endAt,
      value.endAtOffsetMinutes,
      "end",
    );

    if (!startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid start date",
        path: ["startAt"],
      });
    }

    if (!endAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid end date",
        path: ["endAt"],
      });
    }

    if (startAt && endAt && startAt > endAt) {
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
    endAtOffsetMinutes: "0",
    intent: LOGGING_MUTATION_INTENT.exportHistory,
    startAt: rawValues.startAt,
    startAtOffsetMinutes: "0",
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
    endAt: readStringField(formData, LOGGING_FORM_FIELD.endAt),
    startAt: readStringField(formData, LOGGING_FORM_FIELD.startAt),
  };
  const parsed = rangeSchema.safeParse({
    endAt: rawValues.endAt,
    endAtOffsetMinutes: readStringField(
      formData,
      LOGGING_FORM_FIELD.endAtOffsetMinutes,
    ),
    intent: readStringField(formData, LOGGING_FORM_FIELD.intent),
    startAt: rawValues.startAt,
    startAtOffsetMinutes: readStringField(
      formData,
      LOGGING_FORM_FIELD.startAtOffsetMinutes,
    ),
  });

  if (!parsed.success) {
    throw buildValidationError<DashboardLoggingActionData>({
      action: APP_ERROR_ACTION.filter,
      code: APP_ERROR_CODE.logging.validation.range,
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
    endAt: parseDateTimeLocalToUtcDate(
      parsed.data.endAt,
      parsed.data.endAtOffsetMinutes,
      "end",
    )!,
    intent: parsed.data.intent,
    startAt: parseDateTimeLocalToUtcDate(
      parsed.data.startAt,
      parsed.data.startAtOffsetMinutes,
    )!,
    values: rawValues,
  };
}

export function parseLoggingRangeSearchParams(
  searchParams: URLSearchParams,
  t: ReturnType<typeof createTranslator>,
) {
  const rawValues = {
    endAt: searchParams.get(LOGGING_FORM_FIELD.endAt) ?? "",
    startAt: searchParams.get(LOGGING_FORM_FIELD.startAt) ?? "",
  };
  const parsed = rangeSchema.safeParse({
    endAt: rawValues.endAt,
    endAtOffsetMinutes: searchParams.get(LOGGING_FORM_FIELD.endAtOffsetMinutes) ?? "",
    intent: searchParams.get(LOGGING_FORM_FIELD.intent) ?? "",
    startAt: rawValues.startAt,
    startAtOffsetMinutes:
      searchParams.get(LOGGING_FORM_FIELD.startAtOffsetMinutes) ?? "",
  });

  if (!parsed.success) {
    throw buildValidationError<DashboardLoggingActionData>({
      action: APP_ERROR_ACTION.filter,
      code: APP_ERROR_CODE.logging.validation.range,
      message: "Logging range search param validation failed",
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
    endAt: parseDateTimeLocalToUtcDate(
      parsed.data.endAt,
      parsed.data.endAtOffsetMinutes,
      "end",
    )!,
    intent: parsed.data.intent,
    startAt: parseDateTimeLocalToUtcDate(
      parsed.data.startAt,
      parsed.data.startAtOffsetMinutes,
    )!,
    values: rawValues,
  };
}

function parseDateTimeLocalToUtcDate(
  value: string,
  offsetMinutes: number,
  boundary: "end" | "start" = "start",
) {
  const match = DATE_TIME_LOCAL_PATTERN.exec(value);

  if (!match?.groups) {
    return null;
  }

  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const hour = Number(match.groups.hour);
  const minute = Number(match.groups.minute);
  const utcTimestamp =
    Date.UTC(year, month - 1, day, hour, minute) +
    offsetMinutes * 60_000 +
    (boundary === "end" ? 59_999 : 0);
  const normalizedLocalDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

  if (
    normalizedLocalDate.getUTCFullYear() !== year ||
    normalizedLocalDate.getUTCMonth() !== month - 1 ||
    normalizedLocalDate.getUTCDate() !== day ||
    normalizedLocalDate.getUTCHours() !== hour ||
    normalizedLocalDate.getUTCMinutes() !== minute
  ) {
    return null;
  }

  return new Date(utcTimestamp);
}
