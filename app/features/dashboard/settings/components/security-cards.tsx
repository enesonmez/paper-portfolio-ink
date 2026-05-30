import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { DashboardPanel } from "~/components/dashboard/panel";
import { ConfirmModal } from "~/components/dashboard/confirm-modal";
import { parseReadableUserAgent } from "~/shared/utils/user-agent";
import {
  ACCOUNT_CONFIGURATION_FORM_FIELD,
  ACCOUNT_CONFIGURATION_MUTATION_INTENT,
} from "~/domain/configuration/model";
import { useDashboardSettingsCopy } from "../copy";
import type { DashboardSettingsSecuritySession } from "../state";

export function DashboardSettingsSecurityCards({
  sessions,
}: {
  sessions: readonly DashboardSettingsSecuritySession[];
}) {
  const copy = useDashboardSettingsCopy();
  const [confirmingSessionRevoke, setConfirmingSessionRevoke] = useState<string | null>(
    null,
  );

  if (sessions.length === 0) {
    return (
      <div className="col-span-2 space-y-6">
        <DashboardPanel className="py-8 text-center">
          <p className="text-muted-foreground font-sans text-sm font-bold">
            {copy.securityNoSessions}
          </p>
        </DashboardPanel>
      </div>
    );
  }

  return (
    <div className="col-span-2 space-y-6">
      {sessions.map((session) => (
        <DashboardPanel key={session.id} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-2xl leading-none">
                  {session.user.displayName}
                </p>
                <span className="border-2 border-black bg-stone-200 px-2 py-0.5 font-sans text-xs font-bold text-stone-800 uppercase dark:bg-stone-700 dark:text-stone-200">
                  {session.user.role}
                </span>
                <span className="border-2 border-black bg-cyan-400 px-2 py-0.5 font-sans text-xs font-bold text-black uppercase">
                  {parseReadableUserAgent(
                    session.userAgent,
                    copy.securityUnknownDevice,
                  )}
                </span>
                {session.isCurrent && (
                  <span className="border-2 border-black bg-yellow-400 px-2 py-0.5 font-sans text-xs font-bold text-black uppercase">
                    {copy.securityCurrentSession}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground font-sans text-sm font-bold">
                {session.user.email}
              </p>
            </div>

            {!session.isCurrent && (
              <form
                id={`revoke-session-form-${session.id}`}
                method="post"
                onSubmit={(e) => {
                  e.preventDefault();
                  setConfirmingSessionRevoke(session.id);
                }}
              >
                <input
                  type="hidden"
                  name={ACCOUNT_CONFIGURATION_FORM_FIELD.intent}
                  value={ACCOUNT_CONFIGURATION_MUTATION_INTENT.revokeSession}
                />
                <input type="hidden" name="sessionId" value={session.id} />
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full border-2 border-black font-sans font-bold sm:w-auto"
                >
                  {copy.securityRevokeSession}
                </Button>
              </form>
            )}
          </div>

          <div className="grid gap-4 border-t-2 border-black pt-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div>
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.securityIpAddress}
                </p>
                <p className="mt-1 font-sans text-sm font-bold">
                  {session.ipAddress || copy.securityUnknown}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.securityCreatedAt}
                </p>
                <p className="mt-1 font-sans text-sm font-bold">
                  {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.securityExpiresAt}
                </p>
                <p className="mt-1 font-sans text-sm font-bold">
                  {new Date(session.expiresAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </DashboardPanel>
      ))}

      <ConfirmModal
        isOpen={confirmingSessionRevoke !== null}
        title={copy.securityRevokeSession}
        description={copy.securityRevokeSessionConfirm}
        confirmLabel={copy.securityRevokeSession}
        cancelLabel={copy.securityCancelLabel}
        onConfirm={() => {
          if (confirmingSessionRevoke) {
            const form = document.getElementById(
              `revoke-session-form-${confirmingSessionRevoke}`,
            ) as HTMLFormElement | null;
            form?.submit();
          }
          setConfirmingSessionRevoke(null);
        }}
        onCancel={() => setConfirmingSessionRevoke(null)}
        variant="destructive"
      />
    </div>
  );
}

export function DashboardSettingsSecurityActions({
  hasSettingsSecurityManageAny,
  sessions,
}: {
  hasSettingsSecurityManageAny: boolean;
  sessions: readonly DashboardSettingsSecuritySession[];
}) {
  const copy = useDashboardSettingsCopy();
  const [confirmingIntent, setConfirmingIntent] = useState<
    "revoke-other" | "revoke-all" | null
  >(null);

  const revokeOtherFormRef = useRef<HTMLFormElement>(null);
  const revokeAllFormRef = useRef<HTMLFormElement>(null);

  const hasOtherSessions = sessions.length > 1;

  if (!hasOtherSessions) {
    return (
      <DashboardPanel className="space-y-4">
        <div className="space-y-2">
          <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
            {copy.securityRevokeOtherSessionsTitle}
          </p>
          <h3 className="font-display text-3xl leading-none">
            {copy.securityRevokeOtherSessionsLabel}
          </h3>
          <p className="font-sans text-sm font-bold text-stone-600 dark:text-stone-400">
            Sistemde şu anda bekleyen toplu güvenlik eylemi bulunmuyor. Aktif olarak
            sadece sizin mevcut oturumunuz açık durumda.
          </p>
        </div>
      </DashboardPanel>
    );
  }

  return (
    <div className="space-y-6">
      {hasOtherSessions && (
        <DashboardPanel className="space-y-4">
          <div className="space-y-2">
            <p className="font-sans text-xs font-bold tracking-[0.18em] text-red-500 uppercase">
              {copy.securityRevokeOtherSessionsTitle}
            </p>
            <h3 className="font-display text-3xl leading-none">
              {copy.securityRevokeOtherSessionsLabel}
            </h3>
            <p className="text-muted-foreground font-sans text-sm font-bold">
              {copy.securityRevokeOtherSessionsDescription}
            </p>
          </div>
          <form
            ref={revokeOtherFormRef}
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmingIntent("revoke-other");
            }}
          >
            <input
              type="hidden"
              name={ACCOUNT_CONFIGURATION_FORM_FIELD.intent}
              value={ACCOUNT_CONFIGURATION_MUTATION_INTENT.revokeOtherSessions}
            />
            <Button
              type="submit"
              variant="destructive"
              className="w-full border-2 border-black font-sans font-bold"
            >
              {copy.securityRevokeOtherSessionsButton}
            </Button>
          </form>
        </DashboardPanel>
      )}

      {hasSettingsSecurityManageAny && hasOtherSessions && (
        <DashboardPanel className="space-y-4">
          <div className="space-y-2">
            <p className="font-sans text-xs font-bold tracking-[0.18em] text-red-600 uppercase dark:text-red-400">
              {copy.securityRevokeAllSessionsTitle}
            </p>
            <h3 className="font-display text-3xl leading-none">
              {copy.securityRevokeAllSessionsLabel}
            </h3>
            <p className="text-muted-foreground font-sans text-sm font-bold">
              {copy.securityRevokeAllSessionsDescription}
            </p>
          </div>
          <form
            ref={revokeAllFormRef}
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmingIntent("revoke-all");
            }}
          >
            <input
              type="hidden"
              name={ACCOUNT_CONFIGURATION_FORM_FIELD.intent}
              value={ACCOUNT_CONFIGURATION_MUTATION_INTENT.revokeAllSessions}
            />
            <Button
              type="submit"
              variant="destructive"
              className="w-full border-2 border-black font-sans font-bold"
            >
              {copy.securityRevokeAllSessionsButton}
            </Button>
          </form>
        </DashboardPanel>
      )}

      <ConfirmModal
        isOpen={confirmingIntent !== null}
        title={
          confirmingIntent === "revoke-other"
            ? copy.securityRevokeOtherSessionsLabel
            : copy.securityRevokeAllSessionsLabel
        }
        description={
          confirmingIntent === "revoke-other"
            ? copy.securityRevokeOtherSessionsConfirm
            : copy.securityRevokeAllSessionsConfirm
        }
        confirmLabel={
          confirmingIntent === "revoke-other"
            ? copy.securityRevokeOtherSessionsButton
            : copy.securityRevokeAllSessionsButton
        }
        cancelLabel={copy.securityCancelLabel}
        onConfirm={() => {
          if (confirmingIntent === "revoke-other") {
            revokeOtherFormRef.current?.submit();
          } else if (confirmingIntent === "revoke-all") {
            revokeAllFormRef.current?.submit();
          }
          setConfirmingIntent(null);
        }}
        onCancel={() => setConfirmingIntent(null)}
        variant="destructive"
      />
    </div>
  );
}
