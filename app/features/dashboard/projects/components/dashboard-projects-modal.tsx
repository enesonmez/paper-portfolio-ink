import { Plus } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardModal } from "~/components/dashboard/modal";
import {
  PROJECT_FORM_FIELD,
  PROJECT_MUTATION_INTENT,
} from "~/features/projects/project.shared";

import {
  DASHBOARD_PROJECTS_COPY,
  DASHBOARD_PROJECTS_FORM_COPY,
} from "../dashboard-projects.constants";
import {
  buildDashboardProjectsHref,
  dashboardProjectStatusOptions,
  type DashboardProjectsFormState,
} from "../dashboard-projects.shared";
import { ProjectField, ProjectSelect, ProjectTextarea } from "./project-form-fields";

interface DashboardProjectsModalProps {
  form: DashboardProjectsFormState;
}

export function DashboardProjectsModalView({
  form,
}: DashboardProjectsModalProps) {
  if (!form.isOpen || !form.mode) {
    return null;
  }

  const actionLabel =
    form.mode === "edit"
      ? DASHBOARD_PROJECTS_COPY.editActionLabel
      : DASHBOARD_PROJECTS_COPY.createActionLabel;
  const title =
    form.mode === "edit"
      ? DASHBOARD_PROJECTS_COPY.editTitle
      : DASHBOARD_PROJECTS_COPY.createTitle;
  const description =
    form.mode === "edit"
      ? DASHBOARD_PROJECTS_COPY.editDescription
      : DASHBOARD_PROJECTS_COPY.createDescription;

  return (
    <DashboardModal description={description} title={title} to="/dashboard/projects">
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

        <ProjectField
          error={form.errors?.title}
          label={DASHBOARD_PROJECTS_FORM_COPY.title.label}
          name={PROJECT_FORM_FIELD.title}
          placeholder={DASHBOARD_PROJECTS_FORM_COPY.title.placeholder}
          value={form.values.title}
        />
        <ProjectField
          error={form.errors?.slug}
          label={DASHBOARD_PROJECTS_FORM_COPY.slug.label}
          name={PROJECT_FORM_FIELD.slug}
          placeholder={DASHBOARD_PROJECTS_FORM_COPY.slug.placeholder}
          value={form.values.slug}
        />
        <ProjectField
          error={form.errors?.summary}
          label={DASHBOARD_PROJECTS_FORM_COPY.summary.label}
          name={PROJECT_FORM_FIELD.summary}
          placeholder={DASHBOARD_PROJECTS_FORM_COPY.summary.placeholder}
          value={form.values.summary}
        />
        <ProjectTextarea
          error={form.errors?.description}
          label={DASHBOARD_PROJECTS_FORM_COPY.description.label}
          name={PROJECT_FORM_FIELD.description}
          value={form.values.description}
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <ProjectField
            error={form.errors?.repositoryUrl}
            label={DASHBOARD_PROJECTS_FORM_COPY.repositoryUrl.label}
            name={PROJECT_FORM_FIELD.repositoryUrl}
            placeholder={DASHBOARD_PROJECTS_FORM_COPY.repositoryUrl.placeholder}
            value={form.values.repositoryUrl}
          />
          <ProjectField
            error={form.errors?.liveUrl}
            label={DASHBOARD_PROJECTS_FORM_COPY.liveUrl.label}
            name={PROJECT_FORM_FIELD.liveUrl}
            placeholder={DASHBOARD_PROJECTS_FORM_COPY.liveUrl.placeholder}
            value={form.values.liveUrl}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_11rem_11rem]">
          <ProjectField
            error={form.errors?.coverImageUrl}
            label={DASHBOARD_PROJECTS_FORM_COPY.coverImageUrl.label}
            name={PROJECT_FORM_FIELD.coverImageUrl}
            placeholder={DASHBOARD_PROJECTS_FORM_COPY.coverImageUrl.placeholder}
            value={form.values.coverImageUrl}
          />
          <ProjectSelect
            error={form.errors?.status}
            label={DASHBOARD_PROJECTS_FORM_COPY.status.label}
            name={PROJECT_FORM_FIELD.status}
            options={dashboardProjectStatusOptions}
            value={form.values.status}
          />
          <ProjectField
            error={form.errors?.sortOrder}
            label={DASHBOARD_PROJECTS_FORM_COPY.sortOrder.label}
            name={PROJECT_FORM_FIELD.sortOrder}
            placeholder={DASHBOARD_PROJECTS_FORM_COPY.sortOrder.placeholder}
            type="number"
            value={form.values.sortOrder}
          />
        </div>

        <label className="flex items-center gap-3 font-sans text-xs font-bold tracking-[0.16em] uppercase">
          <input
            type="checkbox"
            name={PROJECT_FORM_FIELD.isFeatured}
            defaultChecked={form.values.isFeatured}
            className="size-4 border-2 border-black"
          />
          {DASHBOARD_PROJECTS_COPY.featuredToggleLabel}
        </label>

        {form.errors?.form ? (
          <p
            className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 font-sans text-sm"
            role="alert"
          >
            {form.errors.form}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to={buildDashboardProjectsHref()}
            className="bg-card text-foreground inline-flex items-center justify-center border-2 border-black px-5 py-3 font-sans text-sm font-bold tracking-[0.14em] uppercase"
          >
            {DASHBOARD_PROJECTS_FORM_COPY.cancelLabel}
          </Link>
          <button
            type="submit"
            className="bg-primary flex items-center justify-center gap-2 border-2 border-black px-5 py-3 font-sans text-sm font-bold tracking-[0.14em] text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
          >
            <Plus className="size-4" aria-hidden="true" />
            {actionLabel}
          </button>
        </div>
      </Form>
    </DashboardModal>
  );
}
