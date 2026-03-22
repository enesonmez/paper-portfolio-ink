import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { useT } from "~/shared/i18n/i18n-react";

interface DashboardAuthorizationAccessDeniedScreenProps {
  currentRoleLabel: string;
  description: string;
  title: string;
  viewerRole: string;
}

export function DashboardAuthorizationAccessDeniedScreen({
  currentRoleLabel,
  description,
  title,
  viewerRole,
}: DashboardAuthorizationAccessDeniedScreenProps) {
  const t = useT();

  return (
    <div className="space-y-4">
      <DashboardSectionHeading eyebrow={t("common.roleGuard")} title={title} />
      <DashboardPanel className="space-y-3">
        <p className="font-sans text-sm font-bold">{description}</p>
        <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.14em] uppercase">
          {currentRoleLabel}: {viewerRole}
        </p>
      </DashboardPanel>
    </div>
  );
}
