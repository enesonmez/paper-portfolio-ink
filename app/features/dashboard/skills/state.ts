import {
  buildSkillFormValues,
  type SkillFormState,
  type SkillFormValues,
} from "~/domain/skills/form";
import {} from "~/domain/skills/model";
import type { SkillOverview } from "~/lib/skills/skills.server";

type ValueOf<T> = T[keyof T];

export const DASHBOARD_SKILLS_QUERY_PARAM = {
  edit: "edit",
  modal: "modal",
} as const;

export const DASHBOARD_SKILLS_MODAL = {
  create: "create",
  edit: "edit",
} as const;

export type DashboardSkillsModalMode = ValueOf<typeof DASHBOARD_SKILLS_MODAL>;

export interface DashboardSkillsMetrics {
  totalCount: number;
}

export interface DashboardSkillsFormState {
  editingSkillId: string | null;
  errors?: SkillFormState["errors"];
  isOpen: boolean;
  mode: DashboardSkillsModalMode | null;
  values: SkillFormValues;
}

export interface DashboardSkillsGrantedLoaderData {
  access: "granted";
  form: DashboardSkillsFormState;
  metrics: DashboardSkillsMetrics;
  skills: SkillOverview[];
}

export interface DashboardSkillsDeniedLoaderData {
  access: "denied";
}

export type DashboardSkillsLoaderData =
  | DashboardSkillsDeniedLoaderData
  | DashboardSkillsGrantedLoaderData;

interface ResolveDashboardSkillsFormArgs {
  editId: string | null;
  modal: string | null;
  skills: SkillOverview[];
}

interface BuildDashboardSkillsFormStateArgs {
  editingSkillId?: string | null;
  errors?: SkillFormState["errors"];
  mode: DashboardSkillsModalMode | null;
  values: SkillFormValues;
}

export interface DashboardSkillsHrefParams {
  editId?: string | null;
  modal?: Extract<DashboardSkillsModalMode, "create"> | null;
}

function toSkillFormValues(skill: SkillOverview): SkillFormValues {
  return buildSkillFormValues({
    iconKey: skill.iconKey,
    name: skill.name,
    sortOrder: skill.sortOrder.toString(),
    summary: skill.summary,
  });
}

function buildDashboardSkillsFormState({
  editingSkillId,
  errors,
  mode,
  values,
}: BuildDashboardSkillsFormStateArgs): DashboardSkillsFormState {
  return {
    editingSkillId: editingSkillId ?? null,
    errors,
    isOpen: mode !== null,
    mode,
    values,
  };
}

export function buildDashboardSkillsHref(params: DashboardSkillsHrefParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.modal) {
    searchParams.set(DASHBOARD_SKILLS_QUERY_PARAM.modal, params.modal);
  }

  if (params.editId) {
    searchParams.set(DASHBOARD_SKILLS_QUERY_PARAM.edit, params.editId);
  }

  const search = searchParams.toString();

  return search ? `/dashboard/skills?${search}` : "/dashboard/skills";
}

export function buildDashboardSkillsMetrics(
  skillRows: SkillOverview[],
): DashboardSkillsMetrics {
  return {
    totalCount: skillRows.length,
  };
}

export function formatDashboardSkillName(name: string) {
  return name.toUpperCase().replaceAll(" ", "_");
}

export function resolveDashboardSkillsForm({
  editId,
  modal,
  skills,
}: ResolveDashboardSkillsFormArgs): DashboardSkillsFormState {
  const editingSkill = skills.find((skill) => skill.id === editId);
  const mode =
    modal === DASHBOARD_SKILLS_MODAL.create
      ? DASHBOARD_SKILLS_MODAL.create
      : editingSkill
        ? DASHBOARD_SKILLS_MODAL.edit
        : null;

  return buildDashboardSkillsFormState({
    editingSkillId: editingSkill?.id,
    mode,
    values: editingSkill ? toSkillFormValues(editingSkill) : buildSkillFormValues(),
  });
}

export function mergeDashboardSkillsFormState(
  loaderForm: DashboardSkillsFormState,
  actionData?: SkillFormState,
): DashboardSkillsFormState {
  if (!actionData) {
    return buildDashboardSkillsFormState({
      editingSkillId: loaderForm.editingSkillId,
      mode: loaderForm.mode,
      values: loaderForm.values,
    });
  }

  return buildDashboardSkillsFormState({
    editingSkillId: loaderForm.editingSkillId,
    errors: actionData.errors,
    mode: loaderForm.mode,
    values: actionData.values,
  });
}
