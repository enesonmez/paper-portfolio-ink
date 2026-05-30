type NestedStringValues<T> = T extends string
  ? T
  : {
      [TKey in keyof T]: NestedStringValues<T[TKey]>;
    }[keyof T];

export const APP_ERROR_ACTION = {
  access: "access",
  create: "create",
  delete: "delete",
  export: "export",
  filter: "filter",
  login: "login",
  manage: "manage",
  mutate: "mutate",
  read: "read",
  track: "track",
  update: "update",
  validate: "validate",
} as const;

export type AppErrorAction = (typeof APP_ERROR_ACTION)[keyof typeof APP_ERROR_ACTION];

export const APP_ERROR_RESOURCE = {
  analytics: "analytics",
  authLogin: "auth.login",
  dashboard: "dashboard",
  logs: "logs",
  posts: "posts",
  projects: "projects",
  publicBlog: "public.blog",
  resources: "resources",
  resourcesLocales: "resources.locales",
  resourcesTranslations: "resources.translations",
  settings: "settings",
  skills: "skills",
  users: "users",
} as const;

export type AppErrorResource =
  (typeof APP_ERROR_RESOURCE)[keyof typeof APP_ERROR_RESOURCE];

export const APP_ROUTE_ID = {
  authLogin: "auth.login",
  authLogout: "auth.logout",
  dashboardAnalytics: "dashboard.analytics",
  dashboardLayout: "dashboard.layout",
  dashboardIndex: "dashboard.index",
  dashboardLogging: "dashboard.logging",
  dashboardPosts: "dashboard.posts",
  dashboardProjects: "dashboard.projects",
  dashboardResourcesIndex: "dashboard.resources.index",
  dashboardResourcesLayout: "dashboard.resources.layout",
  dashboardResourcesLocales: "dashboard.resources.locales",
  dashboardResourcesTranslations: "dashboard.resources.translations",
  dashboardSettings: "dashboard.settings",
  dashboardSkills: "dashboard.skills",
  dashboardUsers: "dashboard.users",
  localeAction: "locale.action",
  publicBlogFeed: "public.blog.feed",
  publicBlogIndex: "public.blog.index",
  publicBlogSlug: "public.blog.slug",
  publicBlogTrack: "public.blog.track",
  publicHome: "public.home",
  publicProjectsFeed: "public.projects.feed",
  publicProjectsIndex: "public.projects.index",
  publicTheme: "public.theme",
  root: "root",
} as const;

export type AppRouteId = (typeof APP_ROUTE_ID)[keyof typeof APP_ROUTE_ID];

export const APP_ERROR_CODE = {
  auth: {
    login: {
      apiError: "auth.login.api_error",
      inactiveUser: "auth.login.inactive_user",
      invalidCredentials: "auth.login.invalid_credentials",
      rateLimited: "auth.login.rate_limited",
      providerException: "auth.login.provider_exception",
      providerFailure: "auth.login.provider_failure",
      validation: "auth.login.validation",
    },
  },
  analytics: {
    read: {
      forbidden: "analytics.read.forbidden",
    },
    track: {
      invalidOrigin: "analytics.track.invalid_origin",
    },
    validation: "analytics.validation",
  },
  dashboard: {
    read: {
      forbidden: "dashboard.read.forbidden",
    },
  },
  internal: {
    nonErrorThrow: "internal.non_error_throw",
    unexpected: "internal.unexpected",
  },
  logging: {
    delete: {
      forbidden: "logging.delete.forbidden",
    },
    export: {
      forbidden: "logging.export.forbidden",
      limitExceeded: "logging.export.limit_exceeded",
    },
    mutation: {
      invalidIntent: "logging.mutation.invalid_intent",
    },
    read: {
      forbidden: "logging.read.forbidden",
    },
    validation: {
      range: "logging.range.validation",
    },
  },
  posts: {
    create: {
      duplicateSlug: "posts.create.duplicate_slug",
      forbidden: "posts.create.forbidden",
      missingAuthor: "posts.create.missing_author",
    },
    delete: {
      forbidden: "posts.delete.forbidden",
      missingId: "posts.delete.missing_id",
    },
    read: {
      forbidden: "posts.read.forbidden",
    },
    mutation: {
      invalidIntent: "posts.mutation.invalid_intent",
    },
    update: {
      duplicateSlug: "posts.update.duplicate_slug",
      forbidden: "posts.update.forbidden",
      missingId: "posts.update.missing_id",
    },
    validation: "posts.validation",
  },
  projects: {
    create: {
      duplicateSlug: "projects.create.duplicate_slug",
      forbidden: "projects.create.forbidden",
    },
    delete: {
      forbidden: "projects.delete.forbidden",
      missingId: "projects.delete.missing_id",
    },
    mutation: {
      invalidIntent: "projects.mutation.invalid_intent",
    },
    read: {
      forbidden: "projects.read.forbidden",
    },
    update: {
      duplicateSlug: "projects.update.duplicate_slug",
      forbidden: "projects.update.forbidden",
      missingId: "projects.update.missing_id",
    },
    validation: "projects.validation",
  },
  public: {
    blog: {
      postNotFound: "public.blog.post_not_found",
    },
  },
  resources: {
    locales: {
      create: {
        duplicateCode: "resources.locales.create.duplicate_code",
        forbidden: "resources.locales.create.forbidden",
      },
      delete: {
        forbidden: "resources.locales.delete.forbidden",
        defaultGuard: "resources.locales.delete.default_guard",
        lastActiveGuard: "resources.locales.delete.last_active_guard",
        missingId: "resources.locales.delete.missing_id",
        notFound: "resources.locales.delete.not_found",
      },
      update: {
        defaultGuard: "resources.locales.update.default_guard",
        duplicateCode: "resources.locales.update.duplicate_code",
        forbidden: "resources.locales.update.forbidden",
        lastActiveGuard: "resources.locales.update.last_active_guard",
        missingId: "resources.locales.update.missing_id",
        notFound: "resources.locales.update.not_found",
      },
      validation: "resources.locales.validation",
    },
    mutation: {
      invalidIntent: "resources.mutation.invalid_intent",
    },
    read: {
      forbidden: "resources.read.forbidden",
    },
    translations: {
      create: {
        duplicateKey: "resources.translations.create.duplicate_key",
        forbidden: "resources.translations.create.forbidden",
        missingLocale: "resources.translations.create.missing_locale",
      },
      delete: {
        forbidden: "resources.translations.delete.forbidden",
        missingId: "resources.translations.delete.missing_id",
        notFound: "resources.translations.delete.not_found",
      },
      missingLocaleRegistry: "resources.translations.missing_locale_registry",
      update: {
        duplicateKey: "resources.translations.update.duplicate_key",
        forbidden: "resources.translations.update.forbidden",
        missingId: "resources.translations.update.missing_id",
        missingLocale: "resources.translations.update.missing_locale",
        notFound: "resources.translations.update.not_found",
      },
      validation: "resources.translations.validation",
    },
  },
  settings: {
    delete: {
      forbidden: "settings.delete.forbidden",
    },
    mutation: {
      invalidIntent: "settings.mutation.invalid_intent",
    },
    read: {
      forbidden: "settings.read.forbidden",
    },
    update: {
      forbidden: "settings.update.forbidden",
    },
    validation: "settings.validation",
  },
  skills: {
    create: {
      duplicateSlug: "skills.create.duplicate_slug",
      forbidden: "skills.create.forbidden",
    },
    delete: {
      forbidden: "skills.delete.forbidden",
      missingId: "skills.delete.missing_id",
    },
    mutation: {
      invalidIntent: "skills.mutation.invalid_intent",
    },
    read: {
      forbidden: "skills.read.forbidden",
    },
    update: {
      duplicateSlug: "skills.update.duplicate_slug",
      forbidden: "skills.update.forbidden",
      missingId: "skills.update.missing_id",
    },
    validation: "skills.validation",
  },
  users: {
    create: {
      duplicateEmail: "users.create.duplicate_email",
      forbidden: "users.create.forbidden",
    },
    delete: {
      forbidden: "users.delete.forbidden",
      lastAdminGuard: "users.delete.last_admin_guard",
      missingId: "users.delete.missing_id",
    },
    mutation: {
      invalidIntent: "users.mutation.invalid_intent",
    },
    read: {
      forbidden: "users.read.forbidden",
    },
    update: {
      duplicateEmail: "users.update.duplicate_email",
      forbidden: "users.update.forbidden",
      lastAdminGuard: "users.update.last_admin_guard",
      missingId: "users.update.missing_id",
      staleAuthzVersion: "users.update.stale_authz_version",
    },
    validation: "users.validation",
  },
} as const;

export type AppErrorCode = NestedStringValues<typeof APP_ERROR_CODE>;
