export const DASHBOARD_SKILLS_COPY = {
  actionBlockedTitle: "Action Blocked",
  createActionLabel: "Create Skill",
  createDescription:
    "Add a portfolio skill entry that can later be reused across public stack surfaces.",
  createTitle: "Create Skill",
  currentRoleLabel: "Current role",
  editActionLabel: "Update Skill",
  editDescription:
    "Refine icon, summary, and ordering metadata for an existing skill entry.",
  editTitle: "Edit Skill",
  emptyState: "No skills registered yet.",
  inventoryEyebrow: "Portfolio Taxonomy",
  registryTitle: "Skills Registry",
  restrictedDescription: "Bu flow'a erisim yetkiniz yoktur.",
  restrictedTitle: "Restricted Flow",
  tableActionsLabel: "Actions",
  tableCreatedLabel: "Created",
  tableIconLabel: "Icon",
  tableNameLabel: "Skill",
  tableSortLabel: "Sort",
  tableSlugLabel: "Key",
  tableSummaryLabel: "Summary",
} as const;

export const DASHBOARD_SKILLS_FORM_COPY = {
  cancelLabel: "Cancel",
  errors: {
    createDuplicateSkill: "Bu beceri zaten kayitli.",
    deleteMissingSkill: "Silinecek beceri bulunamadi.",
    forbidden: "Bu flow'a erisim yetkiniz yoktur.",
    updateDuplicateSkill: "Bu beceri baska bir kayitta zaten kullanimda.",
    updateMissingSkill: "Guncellenecek beceri bulunamadi.",
  },
  iconKey: {
    label: "Icon",
  },
  name: {
    label: "Skill Name",
    placeholder: "Cloudflare D1",
  },
  sortOrder: {
    label: "Sort Order",
    placeholder: "0",
  },
  summary: {
    label: "Summary",
    placeholder: "Edge database workflows for globally distributed product systems.",
  },
} as const;
