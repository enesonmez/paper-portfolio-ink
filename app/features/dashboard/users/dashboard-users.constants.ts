export const DASHBOARD_USERS_COPY = {
  actionBlockedTitle: "Action Blocked",
  createActionLabel: "Create New User",
  createDescription:
    "Create a credential-backed dashboard user with scoped role access.",
  createTitle: "Create User",
  currentRoleLabel: "Current role",
  editActionLabel: "Update User",
  editDescription:
    "Update identity fields, role access, or rotate the credential password.",
  editTitle: "Edit User",
  emptyState: "No dashboard users provisioned yet.",
  inventoryEyebrow: "Access Control",
  registryTitle: "User Registry",
  restrictedDescription: "Bu flow'a erişim yetkiniz yoktur.",
  restrictedTitle: "Restricted Flow",
  selfLabel: "You",
  tableActionsLabel: "Actions",
  tableIdentityLabel: "Identity",
  tableMetaLabel: "Meta",
  tableRoleLabel: "Role",
} as const;

export const DASHBOARD_USERS_FORM_COPY = {
  avatarUrl: {
    label: "Avatar URL",
    placeholder: "https://images.paper-portfolio-ink.dev/avatar.webp",
  },
  bio: {
    label: "Bio",
    placeholder: "Short operational context for the dashboard team.",
  },
  cancelLabel: "Cancel",
  displayName: {
    label: "Display Name",
    placeholder: "Ayla Author",
  },
  email: {
    label: "Email",
    placeholder: "author@paper-portfolio-ink.dev",
  },
  errors: {
    createDuplicateEmail: "Bu e-posta adresi zaten kullanimda.",
    deactivateMissingUser: "Pasiflestirilecek kullanici bulunamadi.",
    forbidden: "Bu flow'a erişim yetkiniz yoktur.",
    lastActiveAdminDeactivate:
      "Son aktif admin hesabi pasiflestirilemez.",
    lastActiveAdminDemotion:
      "Son aktif admin hesabi author rolune dusurulemez.",
    lastActiveAdminDelete:
      "Son aktif admin hesabi kaldirilamaz.",
    updateDuplicateEmail: "Bu e-posta adresi baska bir kullaniciya ait.",
    updateMissingUser: "Guncellenecek kullanici bulunamadi.",
  },
  password: {
    editHint: "Bos birakilirsa mevcut parola korunur.",
    label: "Password",
    placeholder: "PaperInk1234!",
  },
  role: {
    label: "Role",
  },
  statusLabel: "Keep account active",
} as const;
