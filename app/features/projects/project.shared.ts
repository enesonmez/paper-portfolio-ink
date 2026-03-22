import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

type ValueOf<T> = T[keyof T];

export const PROJECT_STATUS = {
  archived: "archived",
  draft: "draft",
  published: "published",
} as const;

export type ProjectStatus = ValueOf<typeof PROJECT_STATUS>;

export const PROJECT_STATUS_VALUES = [
  PROJECT_STATUS.draft,
  PROJECT_STATUS.published,
  PROJECT_STATUS.archived,
] as const;

export const PROJECT_DEFAULT_STATUS = PROJECT_STATUS.draft;

export interface ProjectStatusOption {
  label: string;
  value: ProjectStatus;
}

export function buildProjectStatusOptions(
  t: I18nTranslator,
): readonly ProjectStatusOption[] {
  return [
    {
      label: t("model.projectStatus.draft"),
      value: PROJECT_STATUS.draft,
    },
    {
      label: t("model.projectStatus.published"),
      value: PROJECT_STATUS.published,
    },
    {
      label: t("model.projectStatus.archived"),
      value: PROJECT_STATUS.archived,
    },
  ];
}

export function useProjectStatusOptions() {
  const t = useT();

  return buildProjectStatusOptions(t);
}

export const PROJECT_MUTATION_INTENT = {
  create: "create",
  delete: "delete",
  update: "update",
} as const;

export type ProjectMutationIntent = ValueOf<typeof PROJECT_MUTATION_INTENT>;

export const PROJECT_FORM_FIELD = {
  coverImageUrl: "coverImageUrl",
  description: "description",
  intent: "intent",
  isFeatured: "isFeatured",
  liveUrl: "liveUrl",
  projectId: "projectId",
  repositoryUrl: "repositoryUrl",
  slug: "slug",
  sortOrder: "sortOrder",
  status: "status",
  summary: "summary",
  title: "title",
} as const;

export const DASHBOARD_PROJECTS_QUERY_PARAM = {
  edit: "edit",
  modal: "modal",
} as const;

export const DASHBOARD_PROJECTS_MODAL = {
  create: "create",
  edit: "edit",
} as const;

export type DashboardProjectsModalMode = ValueOf<typeof DASHBOARD_PROJECTS_MODAL>;
