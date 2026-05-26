import {
  buildLocaleFormValues,
  buildTranslationFormValues,
  toResourceBooleanValue,
  type LocaleFormState,
  type LocaleFormValues,
  type TranslationFormState,
  type TranslationFormValues,
} from "~/domain/resources/form";
import type {
  LocaleResourceRecord,
  TranslationResourceRecord,
} from "~/lib/resources/resources.server";
import {
  buildDashboardPaginationState,
  type DashboardPaginationState,
} from "../shared/pagination";
import { DASHBOARD_RESOURCES_MODAL } from "./routing/href";

export interface DashboardResourcesMetrics {
  activeLocales: number;
  selectedLocaleTranslations: number;
  totalLocales: number;
  totalTranslations: number;
}

export interface DashboardResourcesTranslationPagination extends DashboardPaginationState {
  totalItems: number;
}

export interface DashboardResourcesSectionPermissions {
  canCreate: boolean;
  canDelete: boolean;
  canRead: boolean;
  canUpdate: boolean;
}

export interface DashboardResourcesPermissions {
  locales: DashboardResourcesSectionPermissions;
  translations: DashboardResourcesSectionPermissions;
}

type DashboardResourcesFormMode = "create" | "edit" | null;

export interface DashboardResourcesLocaleFormState {
  editingCode: string | null;
  errors?: LocaleFormState["errors"];
  isOpen: boolean;
  mode: DashboardResourcesFormMode;
  values: LocaleFormValues;
}

export interface DashboardResourcesTranslationFormState {
  editingKey: string | null;
  editingLocale: string | null;
  errors?: TranslationFormState["errors"];
  isOpen: boolean;
  mode: DashboardResourcesFormMode;
  values: TranslationFormValues;
}

export interface DashboardResourcesGrantedLoaderData {
  access: "granted";
  localeForm: DashboardResourcesLocaleFormState;
  locales: LocaleResourceRecord[];
  metrics: DashboardResourcesMetrics;
  permissions: DashboardResourcesPermissions;
  selectedTranslationLocale: string;
  translationPagination: DashboardResourcesTranslationPagination;
  translationSearchQuery: string;
  translationForm: DashboardResourcesTranslationFormState;
  translations: TranslationResourceRecord[];
}

export interface DashboardResourcesDeniedLoaderData {
  access: "denied";
}

export type DashboardResourcesLoaderData =
  | DashboardResourcesDeniedLoaderData
  | DashboardResourcesGrantedLoaderData;

export interface DashboardResourcesActionState {
  actionError?: string;
  localeForm?: DashboardResourcesLocaleFormState;
  translationForm?: DashboardResourcesTranslationFormState;
}

export interface DashboardResourcesRouteContext {
  localeForm: DashboardResourcesLocaleFormState;
  locales: LocaleResourceRecord[];
  metrics: DashboardResourcesMetrics;
  permissions: DashboardResourcesPermissions;
  selectedTranslationLocale: string;
  translationPagination: DashboardResourcesTranslationPagination;
  translationSearchQuery: string;
  translationForm: DashboardResourcesTranslationFormState;
  translations: TranslationResourceRecord[];
}

interface ResolveDashboardResourcesStateArgs {
  editLocaleCode: string | null;
  editTranslationKey: string | null;
  editTranslationLocale: string | null;
  localeRows: LocaleResourceRecord[];
  modal: string | null;
  selectedTranslationLocale: string;
  translationRecord: TranslationResourceRecord | null;
}

export function buildDashboardResourcesTranslationPagination(args: {
  currentCursor: string | null;
  direction: "next" | "previous";
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  pageSize?: number;
  previousCursor: string | null;
  totalItems: number;
}): DashboardResourcesTranslationPagination {
  const pageSize = args.pageSize ?? 20;

  return {
    ...buildDashboardPaginationState({
      currentCursor: args.currentCursor,
      direction: args.direction,
      hasNextPage: args.hasNextPage,
      hasPreviousPage: args.hasPreviousPage,
      nextCursor: args.nextCursor,
      pageSize,
      previousCursor: args.previousCursor,
    }),
    totalItems: args.totalItems,
  };
}

function buildDashboardResourcesLocaleFormState(args: {
  editingCode?: string | null;
  errors?: LocaleFormState["errors"];
  mode: DashboardResourcesFormMode;
  values: LocaleFormValues;
}): DashboardResourcesLocaleFormState {
  return {
    editingCode: args.editingCode ?? null,
    errors: args.errors,
    isOpen: args.mode !== null,
    mode: args.mode,
    values: args.values,
  };
}

function buildDashboardResourcesTranslationFormState(args: {
  editingKey?: string | null;
  editingLocale?: string | null;
  errors?: TranslationFormState["errors"];
  mode: DashboardResourcesFormMode;
  values: TranslationFormValues;
}): DashboardResourcesTranslationFormState {
  return {
    editingKey: args.editingKey ?? null,
    editingLocale: args.editingLocale ?? null,
    errors: args.errors,
    isOpen: args.mode !== null,
    mode: args.mode,
    values: args.values,
  };
}

function toLocaleFormValues(localeRow: LocaleResourceRecord): LocaleFormValues {
  return buildLocaleFormValues({
    code: localeRow.code,
    isActive: toResourceBooleanValue(localeRow.isActive),
    isDefault: toResourceBooleanValue(localeRow.isDefault),
    label: localeRow.label,
    sortOrder: localeRow.sortOrder.toString(),
  });
}

function toTranslationFormValues(
  translationRecord: TranslationResourceRecord,
): TranslationFormValues {
  return buildTranslationFormValues({
    key: translationRecord.key,
    locale: translationRecord.locale,
    value: translationRecord.value,
  });
}

export function buildDashboardResourcesMetrics(
  localeRows: LocaleResourceRecord[],
  selectedLocaleTranslationsCount: number,
): DashboardResourcesMetrics {
  return {
    activeLocales: localeRows.filter((localeRow) => localeRow.isActive).length,
    selectedLocaleTranslations: selectedLocaleTranslationsCount,
    totalLocales: localeRows.length,
    totalTranslations: localeRows.reduce(
      (sum, localeRow) => sum + localeRow.translationCount,
      0,
    ),
  };
}

export function buildDeniedDashboardResourcesLoaderData(): DashboardResourcesDeniedLoaderData {
  return {
    access: "denied",
  };
}

export function resolveDashboardResourcesState({
  editLocaleCode,
  editTranslationKey,
  editTranslationLocale,
  localeRows,
  modal,
  selectedTranslationLocale,
  translationRecord,
}: ResolveDashboardResourcesStateArgs) {
  const localeRowToEdit = localeRows.find(
    (localeRow) => localeRow.code === editLocaleCode,
  );
  const localeMode =
    modal === DASHBOARD_RESOURCES_MODAL.createLocale
      ? "create"
      : modal === DASHBOARD_RESOURCES_MODAL.editLocale && localeRowToEdit
        ? "edit"
        : null;
  const translationMode =
    modal === DASHBOARD_RESOURCES_MODAL.createTranslation
      ? "create"
      : modal === DASHBOARD_RESOURCES_MODAL.editTranslation && translationRecord
        ? "edit"
        : null;

  return {
    localeForm: buildDashboardResourcesLocaleFormState({
      editingCode: localeRowToEdit?.code,
      mode: localeMode,
      values: localeRowToEdit
        ? toLocaleFormValues(localeRowToEdit)
        : buildLocaleFormValues(),
    }),
    translationForm: buildDashboardResourcesTranslationFormState({
      editingKey: translationMode === "edit" ? editTranslationKey : null,
      editingLocale: translationMode === "edit" ? editTranslationLocale : null,
      mode: translationMode,
      values:
        translationRecord && translationMode === "edit"
          ? toTranslationFormValues(translationRecord)
          : buildTranslationFormValues({
              locale: selectedTranslationLocale,
            }),
    }),
  };
}

export function mergeDashboardResourcesLocaleFormState(
  loaderForm: DashboardResourcesLocaleFormState,
  actionData?: DashboardResourcesActionState,
) {
  return actionData?.localeForm ?? loaderForm;
}

export function mergeDashboardResourcesTranslationFormState(
  loaderForm: DashboardResourcesTranslationFormState,
  actionData?: DashboardResourcesActionState,
) {
  return actionData?.translationForm ?? loaderForm;
}
