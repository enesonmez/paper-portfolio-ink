import {
  buildProjectFormValues,
  type ProjectFormState,
  type ProjectFormValues,
} from "~/features/projects/project-form.shared";
import {
  DASHBOARD_PROJECTS_MODAL,
  DASHBOARD_PROJECTS_QUERY_PARAM,
  PROJECT_STATUS,
  PROJECT_STATUS_OPTIONS,
  type DashboardProjectsModalMode,
  type ProjectStatus,
} from "~/features/projects/project.shared";
import type { ProjectOverview } from "~/lib/projects/projects.server";

export type DashboardStatusTone = "danger" | "neutral" | "success" | "warning";

export interface DashboardProjectsMetrics {
  featuredCount: number;
  liveCount: number;
  totalCount: number;
}

export interface DashboardProjectsFormState {
  editingProjectId: string | null;
  errors?: ProjectFormState["errors"];
  isOpen: boolean;
  mode: DashboardProjectsModalMode | null;
  values: ProjectFormValues;
}

export interface DashboardProjectsLoaderData {
  form: DashboardProjectsFormState;
  metrics: DashboardProjectsMetrics;
  projects: ProjectOverview[];
}

export interface DashboardProjectsHrefParams {
  editId?: string | null;
  modal?: Extract<DashboardProjectsModalMode, "create"> | null;
}

interface ResolveDashboardProjectsFormArgs {
  editId: string | null;
  modal: string | null;
  projects: ProjectOverview[];
}

function toProjectFormValues(project: ProjectOverview): ProjectFormValues {
  return buildProjectFormValues({
    coverImageUrl: project.coverImageUrl ?? "",
    description: project.description ?? "",
    isFeatured: project.isFeatured,
    liveUrl: project.liveUrl ?? "",
    repositoryUrl: project.repositoryUrl ?? "",
    slug: project.slug,
    sortOrder: project.sortOrder.toString(),
    status: project.status,
    summary: project.summary,
    title: project.title,
  });
}

export function buildDashboardProjectsHref(
  params: DashboardProjectsHrefParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.modal) {
    searchParams.set(DASHBOARD_PROJECTS_QUERY_PARAM.modal, params.modal);
  }

  if (params.editId) {
    searchParams.set(DASHBOARD_PROJECTS_QUERY_PARAM.edit, params.editId);
  }

  const search = searchParams.toString();

  return search ? `/dashboard/projects?${search}` : "/dashboard/projects";
}

export function getProjectStatusTone(status: ProjectStatus): DashboardStatusTone {
  switch (status) {
    case PROJECT_STATUS.published:
      return "success";
    case PROJECT_STATUS.draft:
      return "warning";
    default:
      return "neutral";
  }
}

export function formatDashboardProjectTitle(title: string) {
  return title.toUpperCase().replaceAll(" ", "_");
}

export function buildDashboardProjectsMetrics(
  projects: ProjectOverview[],
): DashboardProjectsMetrics {
  return {
    featuredCount: projects.filter((project) => project.isFeatured).length,
    liveCount: projects.filter((project) => project.liveUrl).length,
    totalCount: projects.length,
  };
}

export function resolveDashboardProjectsForm({
  editId,
  modal,
  projects,
}: ResolveDashboardProjectsFormArgs): DashboardProjectsFormState {
  const editingProject = projects.find((project) => project.id === editId);
  const mode =
    modal === DASHBOARD_PROJECTS_MODAL.create
      ? DASHBOARD_PROJECTS_MODAL.create
      : editingProject
        ? DASHBOARD_PROJECTS_MODAL.edit
        : null;

  return {
    editingProjectId: editingProject?.id ?? null,
    isOpen: mode !== null,
    mode,
    values: editingProject
      ? toProjectFormValues(editingProject)
      : buildProjectFormValues(),
  };
}

export function mergeDashboardProjectsFormState(
  loaderForm: DashboardProjectsFormState,
  actionData?: ProjectFormState,
): DashboardProjectsFormState {
  if (!actionData) {
    return {
      ...loaderForm,
      errors: undefined,
    };
  }

  return {
    editingProjectId: loaderForm.editingProjectId,
    errors: actionData.errors,
    isOpen: loaderForm.isOpen,
    mode: loaderForm.mode,
    values: actionData.values,
  };
}

export const dashboardProjectStatusOptions = PROJECT_STATUS_OPTIONS;
