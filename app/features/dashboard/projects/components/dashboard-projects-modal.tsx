import { Plus } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardModal } from "~/components/dashboard/modal";
import { SlugSuggestionField } from "~/components/dashboard/slug-suggestion-field";
import { Button } from "~/components/ui/button";
import {
  FormError,
  SelectField,
  TextField,
  TextareaField,
} from "~/components/ui/form-field";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";
import { PROJECT_FORM_FIELD, PROJECT_MUTATION_INTENT } from "~/domain/projects/model";

import { useDashboardProjectsCopy } from "../copy";
import {
  buildDashboardProjectsHref,
  useDashboardProjectStatusOptions,
  type DashboardProjectsFormState,
} from "../state";

interface DashboardProjectsModalProps {
  form: DashboardProjectsFormState;
}

export function DashboardProjectsModalView({ form }: DashboardProjectsModalProps) {
  const to = useLocalizedPath();
  const { copy, formCopy } = useDashboardProjectsCopy();
  const statusOptions = useDashboardProjectStatusOptions();

  if (!form.isOpen || !form.mode) {
    return null;
  }

  const actionLabel =
    form.mode === "edit" ? copy.editActionLabel : copy.createActionLabel;
  const title = form.mode === "edit" ? copy.editTitle : copy.createTitle;
  const description =
    form.mode === "edit" ? copy.editDescription : copy.createDescription;
  const titleInputId = "dashboard-project-title";

  return (
    <DashboardModal
      description={description}
      title={title}
      to={to("/dashboard/projects")}
    >
      <Form method="post" className="space-y-4">
        <input
          type="hidden"
          name={PROJECT_FORM_FIELD.intent}
          value={
            form.mode === "edit"
              ? PROJECT_MUTATION_INTENT.update
              : PROJECT_MUTATION_INTENT.create
          }
        />
        {form.mode === "edit" && form.editingProjectId ? (
          <input
            type="hidden"
            name={PROJECT_FORM_FIELD.projectId}
            value={form.editingProjectId}
          />
        ) : null}

        <TextField
          error={form.errors?.title}
          id={titleInputId}
          inputClassName="tracking-[0.04em] sm:tracking-[0.06em]"
          label={formCopy.title.label}
          name={PROJECT_FORM_FIELD.title}
          placeholder={formCopy.title.placeholder}
          defaultValue={form.values.title}
        />
        <SlugSuggestionField
          defaultValue={form.values.slug}
          error={form.errors?.slug}
          id={PROJECT_FORM_FIELD.slug}
          initialTitleValue={form.values.title}
          inputClassName="tracking-[0.04em] sm:tracking-[0.06em]"
          label={formCopy.slug.label}
          name={PROJECT_FORM_FIELD.slug}
          placeholder={formCopy.slug.placeholder}
          serverSuggestion={form.slugSuggestion}
          titleInputId={titleInputId}
        />
        <TextField
          error={form.errors?.summary}
          inputClassName="tracking-[0.04em] sm:tracking-[0.06em]"
          label={formCopy.summary.label}
          name={PROJECT_FORM_FIELD.summary}
          placeholder={formCopy.summary.placeholder}
          defaultValue={form.values.summary}
        />
        <TextareaField
          error={form.errors?.description}
          label={formCopy.description.label}
          name={PROJECT_FORM_FIELD.description}
          defaultValue={form.values.description}
          rows={5}
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <TextField
            error={form.errors?.repositoryUrl}
            inputClassName="tracking-[0.04em] sm:tracking-[0.06em]"
            label={formCopy.repositoryUrl.label}
            name={PROJECT_FORM_FIELD.repositoryUrl}
            placeholder={formCopy.repositoryUrl.placeholder}
            defaultValue={form.values.repositoryUrl}
          />
          <TextField
            error={form.errors?.liveUrl}
            inputClassName="tracking-[0.04em] sm:tracking-[0.06em]"
            label={formCopy.liveUrl.label}
            name={PROJECT_FORM_FIELD.liveUrl}
            placeholder={formCopy.liveUrl.placeholder}
            defaultValue={form.values.liveUrl}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_11rem_11rem]">
          <TextField
            error={form.errors?.coverImageUrl}
            inputClassName="tracking-[0.04em] sm:tracking-[0.06em]"
            label={formCopy.coverImageUrl.label}
            name={PROJECT_FORM_FIELD.coverImageUrl}
            placeholder={formCopy.coverImageUrl.placeholder}
            defaultValue={form.values.coverImageUrl}
          />
          <SelectField
            error={form.errors?.status}
            label={formCopy.status.label}
            name={PROJECT_FORM_FIELD.status}
            options={statusOptions}
            defaultValue={form.values.status}
          />
          <TextField
            error={form.errors?.sortOrder}
            inputClassName="tracking-[0.04em] sm:tracking-[0.06em]"
            label={formCopy.sortOrder.label}
            name={PROJECT_FORM_FIELD.sortOrder}
            placeholder={formCopy.sortOrder.placeholder}
            type="number"
            defaultValue={form.values.sortOrder}
          />
        </div>

        <label className="flex items-center gap-3 font-sans text-xs font-bold tracking-[0.16em] uppercase">
          <input
            type="checkbox"
            name={PROJECT_FORM_FIELD.isFeatured}
            defaultChecked={form.values.isFeatured}
            className="size-4 border-2 border-black"
          />
          {copy.featuredToggleLabel}
        </label>

        <FormError message={form.errors?.form} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="secondary" className="tracking-[0.14em]">
            <Link to={to(buildDashboardProjectsHref())}>{formCopy.cancelLabel}</Link>
          </Button>
          <Button
            type="submit"
            className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Plus className="size-4" aria-hidden="true" />
            {actionLabel}
          </Button>
        </div>
      </Form>
    </DashboardModal>
  );
}
