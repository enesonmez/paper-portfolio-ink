import { data, Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { DashboardStatusBadge } from "~/components/dashboard/status-badge";
import { cn } from "~/lib/utils";
import { getDbFromContext } from "../../db/context";
import {
  buildProjectFormValues,
  hasParsedProjectData,
  parseProjectFormData,
  type ProjectFormState,
  type ProjectFormValues,
} from "../lib/projects/project-form.server";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "../lib/projects/projects.server";
import type { Route } from "./+types/dashboard.projects";

const projectStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
] as const;

function readIntent(formData: FormData) {
  const intent = formData.get("intent");

  return typeof intent === "string" ? intent : "";
}

function readProjectId(formData: FormData) {
  const projectId = formData.get("projectId");

  return typeof projectId === "string" ? projectId : "";
}

function getStatusTone(status: "draft" | "published" | "archived") {
  if (status === "published") {
    return "success" as const;
  }

  if (status === "draft") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function normalizeProjectFormValues(
  values: Partial<ProjectFormValues> = {},
): ProjectFormValues {
  return buildProjectFormValues(values);
}

function formatProjectTitle(title: string) {
  return title.toUpperCase().replaceAll(" ", "_");
}

function buildProjectsRouteHref(params?: {
  editId?: string | null;
  modal?: "create" | null;
}) {
  const searchParams = new URLSearchParams();

  if (params?.modal) {
    searchParams.set("modal", params.modal);
  }

  if (params?.editId) {
    searchParams.set("edit", params.editId);
  }

  const search = searchParams.toString();

  return search ? `/dashboard/projects?${search}` : "/dashboard/projects";
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const db = getDbFromContext(context);
  const projectList = await listProjects(db);
  const url = new URL(request.url);
  const modal = url.searchParams.get("modal");
  const editId = url.searchParams.get("edit");
  const editingProject = projectList.find((project) => project.id === editId);
  const modalMode =
    modal === "create"
      ? ("create" as const)
      : editingProject
        ? ("edit" as const)
        : null;

  return {
    form: {
      editingProjectId: editingProject?.id ?? null,
      isOpen: modalMode !== null,
      mode: modalMode,
      values: normalizeProjectFormValues(
        editingProject
          ? {
              coverImageUrl: editingProject.coverImageUrl ?? "",
              description: editingProject.description ?? "",
              isFeatured: editingProject.isFeatured,
              liveUrl: editingProject.liveUrl ?? "",
              repositoryUrl: editingProject.repositoryUrl ?? "",
              slug: editingProject.slug,
              sortOrder: editingProject.sortOrder.toString(),
              status: editingProject.status,
              summary: editingProject.summary,
              title: editingProject.title,
            }
          : {},
      ),
    },
    metrics: {
      featuredCount: projectList.filter((project) => project.isFeatured).length,
      liveCount: projectList.filter((project) => project.liveUrl).length,
      totalCount: projectList.length,
    },
    projects: projectList,
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const db = getDbFromContext(context);
  const formData = await request.formData();
  const intent = readIntent(formData);
  const projectId = readProjectId(formData);

  if (intent === "delete") {
    if (!projectId) {
      return data<ProjectFormState>(
        {
          errors: {
            form: "Silinecek proje bulunamadi.",
          },
          values: buildProjectFormValues(),
        },
        { status: 400 },
      );
    }

    await deleteProject(db, projectId);

    return redirect("/dashboard/projects");
  }

  const submission = parseProjectFormData(formData);

  if (!hasParsedProjectData(submission)) {
    return data<ProjectFormState>(submission, { status: 400 });
  }

  if (intent === "update") {
    if (!projectId) {
      return data<ProjectFormState>(
        {
          errors: {
            form: "Duzenlenecek proje bulunamadi.",
          },
          values: buildProjectFormValues({
            ...submission.data,
            sortOrder: submission.data.sortOrder.toString(),
          }),
        },
        { status: 400 },
      );
    }

    await updateProject(db, projectId, submission.data);

    return redirect("/dashboard/projects");
  }

  await createProject(db, submission.data);

  return redirect("/dashboard/projects");
}

interface DashboardProjectsScreenProps {
  form: {
    editingProjectId?: string | null;
    errors?: ProjectFormState["errors"];
    isOpen: boolean;
    mode: "create" | "edit" | null;
    values: ProjectFormValues;
  };
  metrics: {
    featuredCount: number;
    liveCount: number;
    totalCount: number;
  };
  projects: Awaited<ReturnType<typeof loader>>["projects"];
}

export function DashboardProjectsScreen({
  form,
  metrics,
  projects,
}: DashboardProjectsScreenProps) {
  const actionLabel = form.mode === "edit" ? "Update Project" : "Create New Project";
  const modalTitle = form.mode === "edit" ? "Edit Project" : "Create Project";
  const modalDescription =
    form.mode === "edit"
      ? "Mevcut proje kaydini guncelle ve degisiklikleri server tarafinda kaydet."
      : "Yeni bir proje olustur ve dashboard kaydina ekle.";

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label="Total Projects"
          value={String(metrics.totalCount)}
        />
        <DashboardMetricCard
          accent="primary"
          label="Featured Nodes"
          value={String(metrics.featuredCount)}
        />
        <DashboardMetricCard label="Live Links" value={String(metrics.liveCount)} />
      </section>

      <section className="space-y-4">
        <DashboardSectionHeading
          eyebrow="Live Inventory"
          title="Project Registry"
          action={
            <Link
              to={buildProjectsRouteHref({ modal: "create" })}
              className="bg-primary inline-flex items-center justify-center gap-2 border-2 border-black px-5 py-3 font-sans text-sm font-bold tracking-[0.14em] text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
            >
              <Plus className="size-4" aria-hidden="true" />
              Create New Project
            </Link>
          }
        />

        <DashboardPanel className="overflow-x-auto p-0">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-muted border-b-2 border-black">
              <tr>
                <th className="p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  Project Name
                </th>
                <th className="p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  Summary
                </th>
                <th className="p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  Status
                </th>
                <th className="p-4 text-right font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="font-sans">
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-sm font-bold uppercase"
                  >
                    Henüz proje eklenmedi.
                  </td>
                </tr>
              ) : null}

              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-black/10 last:border-b-0"
                >
                  <td className="p-4 align-top">
                    <div className="space-y-2">
                      <p className="font-display text-3xl leading-none uppercase">
                        {formatProjectTitle(project.title)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.isFeatured ? (
                          <DashboardStatusBadge label="Featured" tone="warning" />
                        ) : null}
                        <DashboardStatusBadge
                          label={`Sort ${project.sortOrder}`}
                          tone="neutral"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <p className="text-foreground text-sm font-bold">
                      {project.summary}
                    </p>
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-[11px] font-bold tracking-[0.12em] uppercase">
                      <span>{project.createdAtLabel}</span>
                      {project.repositoryUrl ? <span>Repo</span> : null}
                      {project.liveUrl ? <span>Live</span> : null}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <DashboardStatusBadge
                      label={project.status}
                      tone={getStatusTone(project.status)}
                    />
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={buildProjectsRouteHref({ editId: project.id })}
                        className="bg-primary border-2 border-black p-2 text-black transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
                        aria-label={`Edit ${formatProjectTitle(project.title)}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Link>
                      <Form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="projectId" value={project.id} />
                        <button
                          type="submit"
                          className="bg-destructive text-destructive-foreground border-2 border-black p-2 transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
                          aria-label={`Delete ${formatProjectTitle(project.title)}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </Form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardPanel>
      </section>

      {form.isOpen && form.mode ? (
        <DashboardModal
          description={modalDescription}
          title={modalTitle}
          to="/dashboard/projects"
        >
          <Form method="post" className="space-y-4">
            <input
              type="hidden"
              name="intent"
              value={form.mode === "edit" ? "update" : "create"}
            />
            {form.mode === "edit" && form.editingProjectId ? (
              <input type="hidden" name="projectId" value={form.editingProjectId} />
            ) : null}

            <ProjectField
              error={form.errors?.title}
              label="Project Name"
              name="title"
              placeholder="CYBER_STORE_FRONT"
              value={form.values.title}
            />
            <ProjectField
              error={form.errors?.slug}
              label="Slug"
              name="slug"
              placeholder="cyber-store-front"
              value={form.values.slug}
            />
            <ProjectField
              error={form.errors?.summary}
              label="Summary"
              name="summary"
              placeholder="Edge-first commerce frontend for a retro showcase."
              value={form.values.summary}
            />
            <ProjectTextarea
              error={form.errors?.description}
              label="Description"
              name="description"
              value={form.values.description}
            />
            <div className="grid gap-4 xl:grid-cols-2">
              <ProjectField
                error={form.errors?.repositoryUrl}
                label="Repository URL"
                name="repositoryUrl"
                placeholder="https://github.com/..."
                value={form.values.repositoryUrl}
              />
              <ProjectField
                error={form.errors?.liveUrl}
                label="Live URL"
                name="liveUrl"
                placeholder="https://project.example"
                value={form.values.liveUrl}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_11rem_11rem]">
              <ProjectField
                error={form.errors?.coverImageUrl}
                label="Cover Image URL"
                name="coverImageUrl"
                placeholder="https://images..."
                value={form.values.coverImageUrl}
              />
              <ProjectSelect
                error={form.errors?.status}
                label="Status"
                name="status"
                options={projectStatusOptions}
                value={form.values.status}
              />
              <ProjectField
                error={form.errors?.sortOrder}
                label="Sort Order"
                name="sortOrder"
                placeholder="0"
                type="number"
                value={form.values.sortOrder}
              />
            </div>

            <label className="flex items-center gap-3 font-sans text-xs font-bold tracking-[0.16em] uppercase">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={form.values.isFeatured}
                className="size-4 border-2 border-black"
              />
              Featured Project
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
                to="/dashboard/projects"
                className="bg-card text-foreground inline-flex items-center justify-center border-2 border-black px-5 py-3 font-sans text-sm font-bold tracking-[0.14em] uppercase"
              >
                Cancel
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
      ) : null}
    </div>
  );
}

function ProjectField({
  error,
  label,
  name,
  placeholder,
  type = "text",
  value,
}: {
  error?: string;
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={name}
        className="font-sans text-xs font-bold tracking-[0.18em] uppercase"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "dark:focus-visible:outline-primary w-full min-w-0 border-2 border-black bg-white px-4 py-3 font-sans text-sm font-bold tracking-[0.04em] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:tracking-[0.06em] dark:bg-stone-800",
          error ? "border-destructive" : undefined,
        )}
      />
      {error ? (
        <p
          id={`${name}-error`}
          className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 font-sans text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ProjectTextarea({
  error,
  label,
  name,
  value,
}: {
  error?: string;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={name}
        className="font-sans text-xs font-bold tracking-[0.18em] uppercase"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={value}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "dark:focus-visible:outline-primary w-full min-w-0 border-2 border-black bg-white px-4 py-3 font-sans text-sm font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-stone-800",
          error ? "border-destructive" : undefined,
        )}
      />
      {error ? (
        <p
          id={`${name}-error`}
          className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 font-sans text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ProjectSelect({
  error,
  label,
  name,
  options,
  value,
}: {
  error?: string;
  label: string;
  name: string;
  options: typeof projectStatusOptions;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={name}
        className="font-sans text-xs font-bold tracking-[0.18em] uppercase"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "dark:focus-visible:outline-primary w-full min-w-0 border-2 border-black bg-white px-4 py-3 font-sans text-sm font-bold uppercase outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-stone-800",
          error ? "border-destructive" : undefined,
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p
          id={`${name}-error`}
          className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 font-sans text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function DashboardProjectsRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const form =
    actionData && typeof actionData === "object" && "values" in actionData
      ? {
          editingProjectId: loaderData.form.editingProjectId,
          errors: actionData.errors,
          isOpen: loaderData.form.isOpen,
          mode: loaderData.form.mode,
          values: actionData.values,
        }
      : {
          editingProjectId: loaderData.form.editingProjectId,
          errors: undefined,
          isOpen: loaderData.form.isOpen,
          mode: loaderData.form.mode,
          values: loaderData.form.values,
        };

  return (
    <DashboardProjectsScreen
      form={form}
      metrics={loaderData.metrics}
      projects={loaderData.projects}
    />
  );
}
