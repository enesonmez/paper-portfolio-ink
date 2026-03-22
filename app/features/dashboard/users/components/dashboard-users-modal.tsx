import { Plus } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardModal } from "~/components/dashboard/modal";
import { Button } from "~/components/ui/button";
import {
  FormError,
  SelectField,
  TextField,
  TextareaField,
} from "~/components/ui/form-field";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";
import { USER_FORM_FIELD, USER_MUTATION_INTENT } from "~/features/users/user.shared";

import { useDashboardUsersCopy } from "../dashboard-users.constants";
import {
  buildDashboardUsersHref,
  type DashboardUsersFormState,
  useDashboardUserRoleOptions,
} from "../dashboard-users.shared";

interface DashboardUsersModalProps {
  form: DashboardUsersFormState;
}

export function DashboardUsersModalView({ form }: DashboardUsersModalProps) {
  const to = useLocalizedPath();
  const { copy, formCopy } = useDashboardUsersCopy();
  const roleOptions = useDashboardUserRoleOptions();

  if (!form.isOpen || !form.mode) {
    return null;
  }

  const actionLabel =
    form.mode === "edit" ? copy.editActionLabel : copy.createActionLabel;
  const title = form.mode === "edit" ? copy.editTitle : copy.createTitle;
  const description =
    form.mode === "edit" ? copy.editDescription : copy.createDescription;

  return (
    <DashboardModal
      description={description}
      title={title}
      to={to(buildDashboardUsersHref())}
    >
      <Form method="post" className="space-y-4">
        <input
          type="hidden"
          name={USER_FORM_FIELD.intent}
          value={
            form.mode === "edit"
              ? USER_MUTATION_INTENT.update
              : USER_MUTATION_INTENT.create
          }
        />
        {form.mode === "edit" && form.editingUserId ? (
          <input
            type="hidden"
            name={USER_FORM_FIELD.userId}
            value={form.editingUserId}
          />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            defaultValue={form.values.displayName}
            error={form.errors?.displayName}
            label={formCopy.displayName.label}
            name={USER_FORM_FIELD.displayName}
            placeholder={formCopy.displayName.placeholder}
          />
          <TextField
            defaultValue={form.values.email}
            error={form.errors?.email}
            label={formCopy.email.label}
            name={USER_FORM_FIELD.email}
            placeholder={formCopy.email.placeholder}
            type="email"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="space-y-2">
            <TextField
              defaultValue={form.values.password}
              error={form.errors?.password}
              label={formCopy.password.label}
              name={USER_FORM_FIELD.password}
              placeholder={formCopy.password.placeholder}
              type="password"
            />
            {form.mode === "edit" ? (
              <p className="text-muted-foreground font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
                {formCopy.password.editHint}
              </p>
            ) : null}
          </div>
          <SelectField
            defaultValue={form.values.role}
            error={form.errors?.role}
            label={formCopy.role.label}
            name={USER_FORM_FIELD.role}
            options={roleOptions}
          />
        </div>

        <label className="flex items-center gap-3 font-sans text-xs font-bold tracking-[0.16em] uppercase">
          <input
            type="checkbox"
            name={USER_FORM_FIELD.isActive}
            defaultChecked={form.values.isActive}
            className="size-4 border-2 border-black"
          />
          {formCopy.statusLabel}
        </label>

        <TextField
          defaultValue={form.values.avatarUrl}
          error={form.errors?.avatarUrl}
          label={formCopy.avatarUrl.label}
          name={USER_FORM_FIELD.avatarUrl}
          placeholder={formCopy.avatarUrl.placeholder}
        />
        <TextareaField
          defaultValue={form.values.bio}
          error={form.errors?.bio}
          label={formCopy.bio.label}
          name={USER_FORM_FIELD.bio}
          placeholder={formCopy.bio.placeholder}
          rows={5}
        />

        <FormError message={form.errors?.form} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="secondary" className="tracking-[0.14em]">
            <Link to={to(buildDashboardUsersHref())}>{formCopy.cancelLabel}</Link>
          </Button>
          <Button
            type="submit"
            className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Plus className="size-4" aria-hidden="true" />
            {actionLabel}
          </Button>
        </div>
      </Form>
    </DashboardModal>
  );
}
