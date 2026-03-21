import { Link } from "react-router";
import { Plus } from "lucide-react";

import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import type { SkillOverview } from "~/lib/skills/skills.server";

import { DASHBOARD_SKILLS_COPY } from "./dashboard-skills.constants";
import {
  buildDashboardSkillsHref,
  type DashboardSkillsFormState,
  type DashboardSkillsMetrics,
} from "./dashboard-skills.shared";
import { DashboardSkillsModalView } from "./components/dashboard-skills-modal";
import { DashboardSkillsTable } from "./components/dashboard-skills-table";

export interface DashboardSkillsScreenProps {
  actionError?: string;
  form: DashboardSkillsFormState;
  metrics: DashboardSkillsMetrics;
  skills: SkillOverview[];
}

export function DashboardSkillsScreen({
  actionError,
  form,
  metrics,
  skills,
}: DashboardSkillsScreenProps) {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Total Skills" value={String(metrics.totalCount)} />
      </section>

      <section className="space-y-4">
        <DashboardSectionHeading
          action={
            <Button
              asChild
              className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              <Link to={buildDashboardSkillsHref({ modal: "create" })}>
                <Plus className="size-4" aria-hidden="true" />
                {DASHBOARD_SKILLS_COPY.createActionLabel}
              </Link>
            </Button>
          }
          eyebrow={DASHBOARD_SKILLS_COPY.inventoryEyebrow}
          title={DASHBOARD_SKILLS_COPY.registryTitle}
        />

        <DashboardSkillsTable skills={skills} />
      </section>

      <DashboardSkillsModalView form={form} />
      {!form.isOpen && actionError ? (
        <DashboardModal
          title={DASHBOARD_SKILLS_COPY.actionBlockedTitle}
          description={actionError}
          to="/dashboard/skills"
        >
          <div className="space-y-4">
            <DashboardPanel className="bg-destructive text-destructive-foreground">
              <p className="font-sans text-sm font-bold" role="alert">
                {actionError}
              </p>
            </DashboardPanel>
            <div className="flex justify-end">
              <Button asChild className="tracking-[0.14em]">
                <Link to="/dashboard/skills">Dismiss</Link>
              </Button>
            </div>
          </div>
        </DashboardModal>
      ) : null}
    </div>
  );
}

export function DashboardSkillsAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  return (
    <div className="space-y-4">
      <DashboardSectionHeading
        eyebrow="Role Guard"
        title={DASHBOARD_SKILLS_COPY.restrictedTitle}
      />
      <DashboardPanel className="space-y-3">
        <p className="font-sans text-sm font-bold">
          {DASHBOARD_SKILLS_COPY.restrictedDescription}
        </p>
        <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.14em] uppercase">
          {DASHBOARD_SKILLS_COPY.currentRoleLabel}: {viewerRole}
        </p>
      </DashboardPanel>
    </div>
  );
}
