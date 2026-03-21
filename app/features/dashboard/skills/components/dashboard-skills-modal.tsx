import { createElement, useState } from "react";
import { Plus } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardModal } from "~/components/dashboard/modal";
import { Button } from "~/components/ui/button";
import { FormError, TextField, TextareaField } from "~/components/ui/form-field";
import {
  getSkillIcon,
  getSkillIconOption,
  type SkillIconKey,
} from "~/features/skills/skill-icon.shared";
import {
  SKILL_FORM_FIELD,
  SKILL_MUTATION_INTENT,
} from "~/features/skills/skill.shared";
import { suggestSlugFromTitle } from "~/lib/slug";

import {
  DASHBOARD_SKILLS_COPY,
  DASHBOARD_SKILLS_FORM_COPY,
} from "../dashboard-skills.constants";
import {
  buildDashboardSkillsHref,
  type DashboardSkillsFormState,
} from "../dashboard-skills.shared";
import { DashboardSkillsIconPicker } from "./dashboard-skills-icon-picker";

interface DashboardSkillsModalProps {
  form: DashboardSkillsFormState;
}

interface DashboardSkillsModalFormProps extends DashboardSkillsModalProps {
  actionLabel: string;
  description: string;
  intent: (typeof SKILL_MUTATION_INTENT)[keyof typeof SKILL_MUTATION_INTENT];
  isEditMode: boolean;
  title: string;
}

function DashboardSkillsModalForm({
  actionLabel,
  description,
  form,
  intent,
  isEditMode,
  title,
}: DashboardSkillsModalFormProps) {
  const [name, setName] = useState(form.values.name);
  const [sortOrder, setSortOrder] = useState(form.values.sortOrder);
  const [summary, setSummary] = useState(form.values.summary);
  const [iconKey, setIconKey] = useState<SkillIconKey>(form.values.iconKey);
  const slugPreview = suggestSlugFromTitle(name);
  const selectedIconOption = getSkillIconOption(iconKey);

  return (
    <DashboardModal description={description} title={title} to="/dashboard/skills">
      <Form method="post" className="space-y-4">
        <input type="hidden" name={SKILL_FORM_FIELD.intent} value={intent} />
        {isEditMode && form.editingSkillId ? (
          <input
            type="hidden"
            name={SKILL_FORM_FIELD.skillId}
            value={form.editingSkillId}
          />
        ) : null}

        <TextField
          error={form.errors?.name}
          label={DASHBOARD_SKILLS_FORM_COPY.name.label}
          name={SKILL_FORM_FIELD.name}
          placeholder={DASHBOARD_SKILLS_FORM_COPY.name.placeholder}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <div className="grid gap-2 border-2 border-black bg-white p-4 dark:bg-stone-800">
          <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
            Generated Key
          </p>
          <p className="font-sans text-sm font-bold">
            {slugPreview.length > 0 ? slugPreview : "Awaiting valid skill name"}
          </p>
        </div>
        <TextField
          error={form.errors?.sortOrder}
          label={DASHBOARD_SKILLS_FORM_COPY.sortOrder.label}
          name={SKILL_FORM_FIELD.sortOrder}
          placeholder={DASHBOARD_SKILLS_FORM_COPY.sortOrder.placeholder}
          type="number"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.currentTarget.value)}
        />
        <TextareaField
          error={form.errors?.summary}
          label={DASHBOARD_SKILLS_FORM_COPY.summary.label}
          name={SKILL_FORM_FIELD.summary}
          placeholder={DASHBOARD_SKILLS_FORM_COPY.summary.placeholder}
          rows={4}
          value={summary}
          onChange={(event) => setSummary(event.currentTarget.value)}
        />
        <DashboardSkillsIconPicker
          error={form.errors?.iconKey}
          name={SKILL_FORM_FIELD.iconKey}
          value={iconKey}
          onChange={(event) => setIconKey(event.currentTarget.value as SkillIconKey)}
        />
        <div className="grid gap-3 border-2 border-black bg-white p-4 dark:bg-stone-800">
          <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
            Selected Icon
          </p>
          <div className="flex items-center gap-3">
            <div className="bg-primary flex size-12 items-center justify-center border-2 border-black text-black">
              {createElement(getSkillIcon(iconKey), {
                "aria-hidden": true,
                className: "size-5",
              })}
            </div>
            <div className="space-y-1">
              <p className="font-sans text-xs font-bold tracking-[0.14em] uppercase">
                {selectedIconOption.label}
              </p>
              <p className="font-sans text-xs">{selectedIconOption.description}</p>
            </div>
          </div>
        </div>

        <FormError message={form.errors?.form} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="secondary" className="tracking-[0.14em]">
            <Link to={buildDashboardSkillsHref()}>
              {DASHBOARD_SKILLS_FORM_COPY.cancelLabel}
            </Link>
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

export function DashboardSkillsModalView({ form }: DashboardSkillsModalProps) {
  if (!form.isOpen || !form.mode) {
    return null;
  }

  const isEditMode = form.mode === "edit";
  const modalVariant = isEditMode
    ? {
        actionLabel: DASHBOARD_SKILLS_COPY.editActionLabel,
        description: DASHBOARD_SKILLS_COPY.editDescription,
        intent: SKILL_MUTATION_INTENT.update,
        title: DASHBOARD_SKILLS_COPY.editTitle,
      }
    : {
        actionLabel: DASHBOARD_SKILLS_COPY.createActionLabel,
        description: DASHBOARD_SKILLS_COPY.createDescription,
        intent: SKILL_MUTATION_INTENT.create,
        title: DASHBOARD_SKILLS_COPY.createTitle,
      };

  return (
    <DashboardSkillsModalForm
      actionLabel={modalVariant.actionLabel}
      description={modalVariant.description}
      intent={modalVariant.intent}
      isEditMode={isEditMode}
      key={[
        form.values.iconKey,
        form.values.name,
        form.values.sortOrder,
        form.values.summary,
      ].join(":")}
      form={form}
      title={modalVariant.title}
    />
  );
}
