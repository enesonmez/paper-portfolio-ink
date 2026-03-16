export const LOGIN_META = [
  { title: "Dashboard girisi | Enes Ink" },
  {
    name: "description",
    content: "Yonetim paneline erisim icin Better Auth ile korunan giris sayfasi.",
  },
] as const;

export const LOGIN_COPY = {
  adminBadge: "Admin",
  buildLabel: "Build: v2.4.2-stable",
  buttonIdle: "Login_To_Terminal",
  buttonSubmitting: "Logging_In...",
  emailLabel: "E-posta",
  emailPlaceholder: "ADMIN_USER@INK.DEV",
  footerSecurity: "HttpOnly / Secure / SameSite=Lax",
  heading: "Access Granted",
  headingHighlight: "Only",
  headingTail: "To Admins",
  nodeLabel: "Node: TR-IST-01",
  passwordLabel: "Parola",
  returnToSite: "Return_To_Site",
  securityDescription:
    "Session monitoring active. Unauthorized attempts will be logged.",
  securityLevel: "Security Level: Alpha",
  siteName: "Paper Enes Ink",
} as const;
