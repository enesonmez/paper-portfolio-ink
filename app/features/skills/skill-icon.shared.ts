import {
  Blocks,
  Cloud,
  Code2,
  Database,
  Globe,
  Layers3,
  PenTool,
  Rocket,
  ShieldCheck,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

type ValueOf<T> = T[keyof T];

export const SKILL_ICON = {
  blocks: "blocks",
  cloud: "cloud",
  code: "code",
  database: "database",
  globe: "globe",
  layers: "layers",
  pen: "pen",
  rocket: "rocket",
  shield: "shield",
  workflow: "workflow",
  wrench: "wrench",
} as const;

export type SkillIconKey = ValueOf<typeof SKILL_ICON>;

export interface SkillIconOption {
  description: string;
  icon: LucideIcon;
  label: string;
  value: SkillIconKey;
}

export const SKILL_DEFAULT_ICON = SKILL_ICON.workflow;

export function buildSkillIconOptions(t: I18nTranslator): readonly SkillIconOption[] {
  return [
    {
      description: t("skillIcon.cloud.description"),
      icon: Cloud,
      label: t("skillIcon.cloud.label"),
      value: SKILL_ICON.cloud,
    },
    {
      description: t("skillIcon.database.description"),
      icon: Database,
      label: t("skillIcon.database.label"),
      value: SKILL_ICON.database,
    },
    {
      description: t("skillIcon.code.description"),
      icon: Code2,
      label: t("skillIcon.code.label"),
      value: SKILL_ICON.code,
    },
    {
      description: t("skillIcon.workflow.description"),
      icon: Workflow,
      label: t("skillIcon.workflow.label"),
      value: SKILL_ICON.workflow,
    },
    {
      description: t("skillIcon.shield.description"),
      icon: ShieldCheck,
      label: t("skillIcon.shield.label"),
      value: SKILL_ICON.shield,
    },
    {
      description: t("skillIcon.rocket.description"),
      icon: Rocket,
      label: t("skillIcon.rocket.label"),
      value: SKILL_ICON.rocket,
    },
    {
      description: t("skillIcon.layers.description"),
      icon: Layers3,
      label: t("skillIcon.layers.label"),
      value: SKILL_ICON.layers,
    },
    {
      description: t("skillIcon.pen.description"),
      icon: PenTool,
      label: t("skillIcon.pen.label"),
      value: SKILL_ICON.pen,
    },
    {
      description: t("skillIcon.blocks.description"),
      icon: Blocks,
      label: t("skillIcon.blocks.label"),
      value: SKILL_ICON.blocks,
    },
    {
      description: t("skillIcon.wrench.description"),
      icon: Wrench,
      label: t("skillIcon.wrench.label"),
      value: SKILL_ICON.wrench,
    },
    {
      description: t("skillIcon.globe.description"),
      icon: Globe,
      label: t("skillIcon.globe.label"),
      value: SKILL_ICON.globe,
    },
  ] as const;
}

export function useSkillIconOptions() {
  const t = useT();

  return buildSkillIconOptions(t);
}

export function isSkillIconKey(value: string): value is SkillIconKey {
  return Object.values(SKILL_ICON).some((option) => option === value);
}

export function getSkillIconOption(value: SkillIconKey) {
  const options = buildSkillIconOptions((key) => key);

  return options.find((option) => option.value === value) ?? options[0];
}

export function getSkillIcon(value: string) {
  const iconValue = isSkillIconKey(value) ? value : SKILL_DEFAULT_ICON;

  return getSkillIconOption(iconValue).icon;
}
