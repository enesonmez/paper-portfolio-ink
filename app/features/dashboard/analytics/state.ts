import {
  buildDashboardPaginationState,
  DASHBOARD_PAGINATION_DIRECTION,
  normalizeDashboardPaginationDirection,
  type DashboardPaginationDirection,
  type DashboardPaginationState,
} from "../shared/pagination";

export const DASHBOARD_ANALYTICS_PAGE_SIZE = 20;

export const DASHBOARD_ANALYTICS_QUERY_PARAM = {
  search: "search",
  view: "view",
  cursor: "cursor",
  direction: "direction",
} as const;

export interface DashboardAnalyticsMetrics {
  totalViews: number;
  avgScrollRate: number;
  avgTimeSpent: number;
}

export interface DashboardAnalyticsFilters {
  searchQuery: string;
}

export interface DashboardAnalyticsPermissions {
  canReadAny: boolean;
  canReadOwn: boolean;
}

export interface PostAnalyticsRow {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  viewsCount: number;
  avgScrollRate: number;
  avgSecondsSpent: number;
}

export interface ViewsDataPoint {
  date: string;
  count: number;
}

export interface MonthlyViewsDataPoint {
  month: string;
  count: number;
}

export interface DashboardAnalyticsFormState {
  viewId: string | null;
  isOpen: boolean;
  selectedPostTitle: string;
  postDailyViews: ViewsDataPoint[];
  postMonthlyViews: MonthlyViewsDataPoint[];
}

export interface DashboardAnalyticsGrantedLoaderData {
  access: "granted";
  filters: DashboardAnalyticsFilters;
  metrics: DashboardAnalyticsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardAnalyticsPermissions;
  posts: PostAnalyticsRow[];
  dailyViews: ViewsDataPoint[];
  monthlyViews: MonthlyViewsDataPoint[];
  form: DashboardAnalyticsFormState;
}

export interface DashboardAnalyticsDeniedLoaderData {
  access: "denied";
  filters: DashboardAnalyticsFilters;
  metrics: DashboardAnalyticsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardAnalyticsPermissions;
  posts: PostAnalyticsRow[];
  dailyViews: ViewsDataPoint[];
  monthlyViews: MonthlyViewsDataPoint[];
  form: DashboardAnalyticsFormState;
}

export type DashboardAnalyticsLoaderData =
  | DashboardAnalyticsDeniedLoaderData
  | DashboardAnalyticsGrantedLoaderData;

export interface DashboardAnalyticsHrefParams {
  search?: string | null;
  view?: string | null;
  cursor?: string | null;
  direction?: DashboardPaginationDirection | null;
}

export interface DashboardAnalyticsViewState {
  searchQuery: string;
  cursor: string | null;
  direction: DashboardPaginationDirection;
}

export function buildDashboardAnalyticsHref(params: DashboardAnalyticsHrefParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set(DASHBOARD_ANALYTICS_QUERY_PARAM.search, params.search);
  }

  if (params.view) {
    searchParams.set(DASHBOARD_ANALYTICS_QUERY_PARAM.view, params.view);
  }

  if (params.cursor) {
    searchParams.set(DASHBOARD_ANALYTICS_QUERY_PARAM.cursor, params.cursor);
  }

  if (
    params.direction &&
    (params.direction !== DASHBOARD_PAGINATION_DIRECTION.next || params.cursor)
  ) {
    searchParams.set(DASHBOARD_ANALYTICS_QUERY_PARAM.direction, params.direction);
  }

  const search = searchParams.toString();

  return search ? `/dashboard/analytics?${search}` : "/dashboard/analytics";
}

export function buildDashboardAnalyticsFilters(
  viewState: DashboardAnalyticsViewState,
): DashboardAnalyticsFilters {
  return {
    searchQuery: viewState.searchQuery,
  };
}

export function normalizeDashboardAnalyticsSearchQuery(value: string | null) {
  return value?.trim() ?? "";
}

export function buildDashboardAnalyticsViewState(
  url: URL,
): DashboardAnalyticsViewState {
  return {
    searchQuery: normalizeDashboardAnalyticsSearchQuery(
      url.searchParams.get(DASHBOARD_ANALYTICS_QUERY_PARAM.search),
    ),
    cursor: url.searchParams.get(DASHBOARD_ANALYTICS_QUERY_PARAM.cursor),
    direction: normalizeDashboardPaginationDirection(
      url.searchParams.get(DASHBOARD_ANALYTICS_QUERY_PARAM.direction),
    ),
  };
}

export function buildDashboardAnalyticsPaginationState(args: {
  currentCursor: string | null;
  direction: DashboardPaginationDirection;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string | null;
  previousCursor?: string | null;
  pageSize?: number;
}): DashboardPaginationState {
  return buildDashboardPaginationState({
    currentCursor: args.currentCursor,
    direction: args.direction,
    hasNextPage: args.hasNextPage,
    hasPreviousPage: args.hasPreviousPage,
    nextCursor: args.nextCursor,
    pageSize: args.pageSize ?? DASHBOARD_ANALYTICS_PAGE_SIZE,
    previousCursor: args.previousCursor,
  });
}

export function buildDeniedDashboardAnalyticsLoaderData(): DashboardAnalyticsDeniedLoaderData {
  return {
    access: "denied",
    filters: { searchQuery: "" },
    metrics: { totalViews: 0, avgScrollRate: 0, avgTimeSpent: 0 },
    pagination: buildDashboardAnalyticsPaginationState({
      currentCursor: null,
      direction: DASHBOARD_PAGINATION_DIRECTION.next,
      hasNextPage: false,
      hasPreviousPage: false,
      nextCursor: null,
      previousCursor: null,
    }),
    permissions: { canReadAny: false, canReadOwn: false },
    posts: [],
    dailyViews: [],
    monthlyViews: [],
    form: {
      viewId: null,
      isOpen: false,
      selectedPostTitle: "",
      postDailyViews: [],
      postMonthlyViews: [],
    },
  };
}
