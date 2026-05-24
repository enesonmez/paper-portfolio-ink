import { useRef, type FormEvent } from "react";

import { Button } from "~/components/ui/button";
import { FormError, TextField } from "~/components/ui/form-field";
import { LOGGING_FORM_FIELD } from "~/domain/logging/model";
import type { DashboardLoggingRangeFormState } from "~/features/dashboard/logging/state";

function buildOffsetMinutes(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return String(date.getTimezoneOffset());
}

interface DashboardLoggingRangeFormProps {
  canDeleteCurrentTab: boolean;
  canExportCurrentTab: boolean;
  deleteActionLabel: string;
  deleteIntent: string;
  endLabel: string;
  errorMessage?: string;
  exportAction: string;
  exportActionLabel: string;
  exportIntent: string;
  rangeForm: DashboardLoggingRangeFormState;
  startLabel: string;
}

export function DashboardLoggingRangeForm({
  canDeleteCurrentTab,
  canExportCurrentTab,
  deleteActionLabel,
  deleteIntent,
  endLabel,
  errorMessage,
  exportAction,
  exportActionLabel,
  exportIntent,
  rangeForm,
  startLabel,
}: DashboardLoggingRangeFormProps) {
  const startAtOffsetRef = useRef<HTMLInputElement>(null);
  const endAtOffsetRef = useRef<HTMLInputElement>(null);

  function syncOffsetField(args: { name: string; target: HTMLInputElement }) {
    const nextValue = buildOffsetMinutes(args.target.value);

    if (args.name === LOGGING_FORM_FIELD.startAt && startAtOffsetRef.current) {
      startAtOffsetRef.current.value = nextValue;
    }

    if (args.name === LOGGING_FORM_FIELD.endAt && endAtOffsetRef.current) {
      endAtOffsetRef.current.value = nextValue;
    }
  }

  function handleInput(event: FormEvent<HTMLFormElement>) {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (
      target.name === LOGGING_FORM_FIELD.startAt ||
      target.name === LOGGING_FORM_FIELD.endAt
    ) {
      syncOffsetField({
        name: target.name,
        target,
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const startAtInput = event.currentTarget.elements.namedItem(
      LOGGING_FORM_FIELD.startAt,
    );
    const endAtInput = event.currentTarget.elements.namedItem(LOGGING_FORM_FIELD.endAt);

    if (startAtInput instanceof HTMLInputElement) {
      syncOffsetField({
        name: LOGGING_FORM_FIELD.startAt,
        target: startAtInput,
      });
    }

    if (endAtInput instanceof HTMLInputElement) {
      syncOffsetField({
        name: LOGGING_FORM_FIELD.endAt,
        target: endAtInput,
      });
    }
  }

  return (
    <form
      method="post"
      className="grid gap-4 md:grid-cols-2"
      onInput={handleInput}
      onSubmitCapture={handleSubmit}
    >
      <TextField
        label={startLabel}
        name={LOGGING_FORM_FIELD.startAt}
        type="datetime-local"
        defaultValue={rangeForm.values.startAt}
        error={rangeForm.errors?.startAt}
      />
      <TextField
        label={endLabel}
        name={LOGGING_FORM_FIELD.endAt}
        type="datetime-local"
        defaultValue={rangeForm.values.endAt}
        error={rangeForm.errors?.endAt}
      />
      <input
        ref={startAtOffsetRef}
        type="hidden"
        name={LOGGING_FORM_FIELD.startAtOffsetMinutes}
        defaultValue=""
      />
      <input
        ref={endAtOffsetRef}
        type="hidden"
        name={LOGGING_FORM_FIELD.endAtOffsetMinutes}
        defaultValue=""
      />
      <div className="md:col-span-2">
        <FormError message={errorMessage} />
      </div>
      <div className="flex flex-wrap gap-3 md:col-span-2">
        {canExportCurrentTab ? (
          <Button
            type="submit"
            name={LOGGING_FORM_FIELD.intent}
            value={exportIntent}
            formAction={exportAction}
            formMethod="get"
          >
            {exportActionLabel}
          </Button>
        ) : null}
        {canDeleteCurrentTab ? (
          <Button
            type="submit"
            variant="destructive"
            name={LOGGING_FORM_FIELD.intent}
            value={deleteIntent}
          >
            {deleteActionLabel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
