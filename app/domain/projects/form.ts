import { PROJECT_DEFAULT_STATUS, type ProjectStatus } from "./model";

export type ProjectFormValues = {
  coverImageUrl: string;
  description: string;
  isFeatured: boolean;
  liveUrl: string;
  repositoryUrl: string;
  slug: string;
  sortOrder: string;
  status: ProjectStatus;
  summary: string;
  title: string;
};

export interface ProjectFormState {
  errors?: Partial<Record<keyof ProjectFormValues, string>> & {
    form?: string;
  };
  slugSuggestion?: string | null;
  values: ProjectFormValues;
}

export function getDefaultProjectFormValues(): ProjectFormValues {
  return {
    coverImageUrl: "",
    description: "",
    isFeatured: false,
    liveUrl: "",
    repositoryUrl: "",
    slug: "",
    sortOrder: "0",
    status: PROJECT_DEFAULT_STATUS,
    summary: "",
    title: "",
  };
}

export function buildProjectFormValues(
  values: Partial<ProjectFormValues> = {},
): ProjectFormValues {
  return {
    ...getDefaultProjectFormValues(),
    ...values,
  };
}
