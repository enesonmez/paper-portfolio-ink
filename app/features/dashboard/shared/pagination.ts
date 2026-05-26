export const DASHBOARD_PAGINATION_DIRECTION = {
  next: "next",
  previous: "previous",
} as const;

export type DashboardPaginationDirection =
  (typeof DASHBOARD_PAGINATION_DIRECTION)[keyof typeof DASHBOARD_PAGINATION_DIRECTION];

export interface DashboardPaginationState {
  currentCursor: string | null;
  direction: DashboardPaginationDirection;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  pageSize: number;
  previousCursor: string | null;
}

export function buildDashboardPaginationState(args: {
  currentCursor: string | null;
  direction: DashboardPaginationDirection;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string | null;
  pageSize: number;
  previousCursor?: string | null;
}): DashboardPaginationState {
  return {
    currentCursor: args.currentCursor,
    direction: args.direction,
    hasNextPage: args.hasNextPage ?? false,
    hasPreviousPage: args.hasPreviousPage ?? false,
    nextCursor: args.nextCursor ?? null,
    pageSize: args.pageSize,
    previousCursor: args.previousCursor ?? null,
  };
}

export function normalizeDashboardPaginationDirection(
  value: string | null,
): DashboardPaginationDirection {
  return value === DASHBOARD_PAGINATION_DIRECTION.previous
    ? DASHBOARD_PAGINATION_DIRECTION.previous
    : DASHBOARD_PAGINATION_DIRECTION.next;
}
