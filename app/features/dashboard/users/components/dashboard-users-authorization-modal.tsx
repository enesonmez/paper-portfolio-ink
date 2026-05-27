import { ShieldCheck, ShieldOff } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardStatusBadge } from "~/components/dashboard/status-badge";
import { Button } from "~/components/ui/button";
import { FormError, SelectField } from "~/components/ui/form-field";
import { USER_FORM_FIELD, USER_MUTATION_INTENT } from "~/domain/users/model";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";

import { useDashboardUsersCopy } from "../copy";
import {
  buildDashboardUsersHref,
  type DashboardUsersAuthorizationFormState,
  type DashboardUsersHrefParams,
  useDashboardUserRoleOptions,
} from "../state";

interface DashboardUsersAuthorizationModalProps {
  form: DashboardUsersAuthorizationFormState;
  listHrefState: Pick<
    DashboardUsersHrefParams,
    "active" | "cursor" | "direction" | "role" | "search"
  >;
}

function formatClaimScopeLabel(scope: string | null, fallback: string) {
  if (!scope) {
    return fallback;
  }

  return scope.toUpperCase();
}

export function DashboardUsersAuthorizationModalView({
  form,
  listHrefState,
}: DashboardUsersAuthorizationModalProps) {
  const to = useLocalizedPath();
  const t = useT();
  const { copy, formCopy } = useDashboardUsersCopy();
  const roleOptions = useDashboardUserRoleOptions();

  if (!form.isOpen || form.mode !== "access" || !form.editingUserId) {
    return null;
  }

  return (
    <DashboardModal
      description={copy.accessDescription}
      title={copy.accessTitle}
      to={to(buildDashboardUsersHref(listHrefState))}
    >
      <div className="space-y-4">
        <DashboardPanel className="space-y-3">
          <div className="space-y-1">
            <p className="font-display text-3xl leading-none uppercase">
              {form.editingUserName}
            </p>
            <p className="font-sans text-sm font-bold">{form.editingUserEmail}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DashboardStatusBadge
              label={form.isUserActive ? t("common.active") : t("common.inactive")}
              tone={form.isUserActive ? "warning" : "danger"}
            />
            <DashboardStatusBadge
              label={`${copy.accessVersionLabel} ${form.authzVersion ?? "-"}`}
              tone="neutral"
            />
          </div>
          <Form method="post" className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <input
              type="hidden"
              name={USER_FORM_FIELD.intent}
              value={USER_MUTATION_INTENT.updateAccessRole}
            />
            <input
              type="hidden"
              name={USER_FORM_FIELD.userId}
              value={form.editingUserId}
            />
            <input
              type="hidden"
              name={USER_FORM_FIELD.authzVersion}
              value={form.values.authzVersion}
            />
            <SelectField
              defaultValue={form.values.role}
              error={form.errors?.role}
              label={formCopy.role.label}
              name={USER_FORM_FIELD.role}
              options={roleOptions}
            />
            <Button
              type="submit"
              className="self-end tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              {copy.accessRoleSaveLabel}
            </Button>
          </Form>
          <FormError message={form.errors?.form} />
        </DashboardPanel>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl leading-none uppercase">
              {copy.claimRegistryTitle}
            </h2>
            <p className="text-muted-foreground font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
              {copy.claimEffectiveLabel}
            </p>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {form.claims.map((claim) => {
              const nextIntent = claim.isEffective
                ? USER_MUTATION_INTENT.revokeClaim
                : USER_MUTATION_INTENT.grantClaim;
              const actionLabel = claim.isEffective
                ? copy.claimRemoveLabel
                : copy.claimDefineLabel;
              const actionIcon = claim.isEffective ? ShieldOff : ShieldCheck;
              const sourceLabel =
                claim.effect === "grant"
                  ? copy.claimOverrideGrantLabel
                  : claim.effect === "revoke"
                    ? copy.claimOverrideRevokeLabel
                    : copy.claimRoleDefaultLabel;
              const ActionIcon = actionIcon;

              return (
                <DashboardPanel key={claim.claimKey} className="space-y-3 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="bg-background inline-flex border-2 border-black px-2 py-1 font-mono text-[11px] font-bold">
                          {claim.claimKey}
                        </code>
                        <DashboardStatusBadge
                          label={
                            claim.isEffective
                              ? copy.claimGrantedLabel
                              : copy.claimRevokedLabel
                          }
                          tone={claim.isEffective ? "warning" : "danger"}
                        />
                        <DashboardStatusBadge label={sourceLabel} tone="neutral" />
                      </div>
                      <p className="font-sans text-sm font-bold">{claim.description}</p>
                      <p className="text-muted-foreground font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
                        {`${claim.resource} / ${claim.action} / ${copy.claimScopeLabel} ${formatClaimScopeLabel(claim.scope, copy.claimScopeNoneLabel)}`}
                      </p>
                    </div>

                    <Form method="post" className="shrink-0">
                      <input
                        type="hidden"
                        name={USER_FORM_FIELD.intent}
                        value={nextIntent}
                      />
                      <input
                        type="hidden"
                        name={USER_FORM_FIELD.userId}
                        value={form.editingUserId ?? ""}
                      />
                      <input
                        type="hidden"
                        name={USER_FORM_FIELD.authzVersion}
                        value={form.values.authzVersion}
                      />
                      <input
                        type="hidden"
                        name={USER_FORM_FIELD.role}
                        value={form.values.role}
                      />
                      <input
                        type="hidden"
                        name={USER_FORM_FIELD.claimKey}
                        value={claim.claimKey}
                      />
                      <Button
                        type="submit"
                        variant={claim.isEffective ? "destructive" : "default"}
                        className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                      >
                        <ActionIcon className="size-4" aria-hidden="true" />
                        {actionLabel}
                      </Button>
                    </Form>
                  </div>
                </DashboardPanel>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button asChild variant="secondary" className="tracking-[0.14em]">
            <Link to={to(buildDashboardUsersHref(listHrefState))}>
              {formCopy.cancelLabel}
            </Link>
          </Button>
        </div>
      </div>
    </DashboardModal>
  );
}
