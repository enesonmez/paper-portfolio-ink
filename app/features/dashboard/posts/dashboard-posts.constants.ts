export const DASHBOARD_POSTS_COPY = {
  createActionLabel: "Create New Post",
  createDescription:
    "Yayin hattina yeni bir hikaye ekle ve durumunu dashboard icinden yonet.",
  composeEyebrow: "Draft / Saved locally",
  createTitle: "Create Post",
  editActionLabel: "Update Post",
  editDescription: "Mevcut hikayenin govdesini, yayin tarihini ve durumunu guncelle.",
  editTitle: "Edit Post",
  emptyState: "Henüz post yok. Ilk hikayeni ekle.",
  inventoryEyebrow: "Publishing Pipeline",
  publishedLabel: "Published",
  registryTitle: "Post Registry",
  tableActionsLabel: "Actions",
  tableNameLabel: "Post Name",
  tableStatusLabel: "Status",
  tableSummaryLabel: "Summary",
} as const;

export const DASHBOARD_POSTS_FORM_COPY = {
  backToListLabel: "Back To Posts",
  closeFullscreenLabel: "Close Editor",
  content: {
    label: "Story Body",
    placeholder: "Tell your story...",
  },
  coverImageUrl: {
    label: "Cover Image URL",
    placeholder: "https://cdn.paper-portfolio-ink.dev/posts/edge-cache.webp",
  },
  errors: {
    deleteMissingPost: "Silinecek yazi bulunamadi.",
    missingAuthor: "Aktif kullanici cozulemedi. Tekrar giris yap.",
    updateMissingPost: "Duzenlenecek yazi kimligi eksik.",
  },
  editor: {
    imagePromptLabel: "Gorsel adresini gir",
    linkPromptLabel: "Baglanti adresini gir",
    loadingLabel: "Editor is preparing...",
    urlDefaultValue: "https://",
  },
  excerpt: {
    label: "Excerpt",
    placeholder: "Yazinin liste ekraninda gosterilecek kisa ozeti.",
  },
  fullscreenTitlePlaceholder: "Tell your story...",
  heroHelper: "Minimal yazim akisini koruyup yayin metadata'sini sag panelde yonet.",
  publishedAt: {
    label: "Published On",
  },
  slug: {
    label: "Slug",
    placeholder: "edge-cache-rollout",
  },
  status: {
    label: "Status",
  },
  title: {
    label: "Post Title",
    placeholder: "Edge Cache Rollout Notes",
  },
} as const;
