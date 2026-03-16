export const DASHBOARD_PROJECTS_COPY = {
  createActionLabel: "Create New Project",
  createDescription: "Yeni bir proje olustur ve dashboard kaydina ekle.",
  createTitle: "Create Project",
  editActionLabel: "Update Project",
  editDescription:
    "Mevcut proje kaydini guncelle ve degisiklikleri server tarafinda kaydet.",
  editTitle: "Edit Project",
  emptyState: "Henüz proje eklenmedi.",
  featuredLabel: "Featured",
  featuredToggleLabel: "Featured Project",
  inventoryEyebrow: "Live Inventory",
  registryTitle: "Project Registry",
  tableActionsLabel: "Actions",
  tableNameLabel: "Project Name",
  tableStatusLabel: "Status",
  tableSummaryLabel: "Summary",
} as const;

export const DASHBOARD_PROJECTS_FORM_COPY = {
  cancelLabel: "Cancel",
  coverImageUrl: {
    label: "Cover Image URL",
    placeholder: "https://images...",
  },
  description: {
    label: "Description",
  },
  errors: {
    deleteMissingProject: "Silinecek proje bulunamadi.",
    updateMissingProject: "Duzenlenecek proje bulunamadi.",
  },
  liveUrl: {
    label: "Live URL",
    placeholder: "https://project.example",
  },
  repositoryUrl: {
    label: "Repository URL",
    placeholder: "https://github.com/...",
  },
  slug: {
    label: "Slug",
    placeholder: "cyber-store-front",
  },
  sortOrder: {
    label: "Sort Order",
    placeholder: "0",
  },
  status: {
    label: "Status",
  },
  summary: {
    label: "Summary",
    placeholder: "Edge-first commerce frontend for a retro showcase.",
  },
  title: {
    label: "Project Name",
    placeholder: "CYBER_STORE_FRONT",
  },
} as const;
