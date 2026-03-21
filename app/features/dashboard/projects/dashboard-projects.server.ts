import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { purgePublicHomeDataCache } from "~/features/public/home/public-home.server";
import { purgePublicProjectsDataCache } from "~/features/public/projects/public-projects.server";
import {
  buildProjectFormValues,
  type ProjectFormState,
} from "~/features/projects/project-form.shared";
import {
  DASHBOARD_PROJECTS_QUERY_PARAM,
  PROJECT_FORM_FIELD,
  PROJECT_MUTATION_INTENT,
} from "~/features/projects/project.shared";
import {
  hasParsedProjectData,
  parseProjectFormData,
} from "~/lib/projects/project-form.server";
import {
  createProject,
  deleteProject,
  findAvailableProjectSlug,
  isProjectSlugTaken,
  listProjects,
  updateProject,
} from "~/lib/projects/projects.server";
import { isUniqueSlugConstraintError } from "~/lib/slug";

import { DASHBOARD_PROJECTS_FORM_COPY } from "./dashboard-projects.constants";
import {
  buildDashboardProjectsMetrics,
  resolveDashboardProjectsForm,
  type DashboardProjectsLoaderData,
} from "./dashboard-projects.shared";

type DbContextShape = Pick<AppLoadContext, "cache" | "db" | "runtime">;

type ProjectActionValues = Omit<ProjectFormState["values"], "sortOrder"> & {
  sortOrder?: number | string;
};

function buildProjectActionValues(values: ProjectActionValues) {
  return buildProjectFormValues({
    ...values,
    sortOrder: values.sortOrder?.toString() ?? "0",
  });
}

async function buildDuplicateProjectSlugState(
  context: DbContextShape,
  values: ProjectActionValues,
  projectId?: string,
) {
  const db = getDbFromContext(context);

  return data<ProjectFormState>(
    {
      errors: {
        slug: "Bu slug zaten kullanimda. Baska bir slug sec.",
      },
      slugSuggestion: await findAvailableProjectSlug(db, values.title, projectId),
      values: buildProjectActionValues(values),
    },
    { status: 409 },
  );
}

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export async function loadDashboardProjectsData(
  context: DbContextShape,
  request: Request,
): Promise<DashboardProjectsLoaderData> {
  const db = getDbFromContext(context);
  const projects = await listProjects(db);
  const url = new URL(request.url);

  return {
    form: resolveDashboardProjectsForm({
      editId: url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.edit),
      modal: url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.modal),
      projects,
    }),
    metrics: buildDashboardProjectsMetrics(projects),
    projects,
  };
}

export async function handleDashboardProjectsAction(
  context: DbContextShape,
  request: Request,
) {
  const db = getDbFromContext(context);
  const formData = await request.formData();
  const intent = readStringField(formData, PROJECT_FORM_FIELD.intent);
  const projectId = readStringField(formData, PROJECT_FORM_FIELD.projectId);

  if (intent === PROJECT_MUTATION_INTENT.delete) {
    if (!projectId) {
      return data<ProjectFormState>(
        {
          errors: {
            form: DASHBOARD_PROJECTS_FORM_COPY.errors.deleteMissingProject,
          },
          values: buildProjectFormValues(),
        },
        { status: 400 },
      );
    }

    await deleteProject(db, projectId);
    await Promise.all([
      purgePublicHomeDataCache(context, request),
      purgePublicProjectsDataCache(context, request),
    ]);

    return redirect("/dashboard/projects");
  }

  const submission = parseProjectFormData(formData);

  if (!hasParsedProjectData(submission)) {
    return data<ProjectFormState>(submission, { status: 400 });
  }

  if (intent === PROJECT_MUTATION_INTENT.update) {
    if (!projectId) {
      return data<ProjectFormState>(
        {
          errors: {
            form: DASHBOARD_PROJECTS_FORM_COPY.errors.updateMissingProject,
          },
          values: buildProjectActionValues(submission.data),
        },
        { status: 400 },
      );
    }

    if (await isProjectSlugTaken(db, submission.data.slug, projectId)) {
      return buildDuplicateProjectSlugState(context, submission.data, projectId);
    }

    try {
      await updateProject(db, projectId, submission.data);
    } catch (error) {
      if (isUniqueSlugConstraintError(error, "projects")) {
        return buildDuplicateProjectSlugState(context, submission.data, projectId);
      }

      throw error;
    }

    await Promise.all([
      purgePublicHomeDataCache(context, request),
      purgePublicProjectsDataCache(context, request),
    ]);

    return redirect("/dashboard/projects");
  }

  if (await isProjectSlugTaken(db, submission.data.slug)) {
    return buildDuplicateProjectSlugState(context, submission.data);
  }

  try {
    await createProject(db, submission.data);
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "projects")) {
      return buildDuplicateProjectSlugState(context, submission.data);
    }

    throw error;
  }

  await Promise.all([
    purgePublicHomeDataCache(context, request),
    purgePublicProjectsDataCache(context, request),
  ]);

  return redirect("/dashboard/projects");
}
