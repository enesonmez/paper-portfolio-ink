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

export const SKILL_ICON_OPTIONS: readonly SkillIconOption[] = [
  {
    description: "Distributed systems, edge services, and platform delivery.",
    icon: Cloud,
    label: "Cloud",
    value: SKILL_ICON.cloud,
  },
  {
    description: "Database design, query workflows, and storage layers.",
    icon: Database,
    label: "Database",
    value: SKILL_ICON.database,
  },
  {
    description: "Typed frontend and backend implementation details.",
    icon: Code2,
    label: "Code",
    value: SKILL_ICON.code,
  },
  {
    description: "Architecture stitching, orchestration, and flow modeling.",
    icon: Workflow,
    label: "Workflow",
    value: SKILL_ICON.workflow,
  },
  {
    description: "System hardening, trust boundaries, and access control.",
    icon: ShieldCheck,
    label: "Security",
    value: SKILL_ICON.shield,
  },
  {
    description: "Deployment pipelines, launch readiness, and product momentum.",
    icon: Rocket,
    label: "Launch",
    value: SKILL_ICON.rocket,
  },
  {
    description: "Composable UI systems and reusable surface primitives.",
    icon: Layers3,
    label: "Interface",
    value: SKILL_ICON.layers,
  },
  {
    description: "Content systems, editorial tooling, and writing workflows.",
    icon: PenTool,
    label: "Editorial",
    value: SKILL_ICON.pen,
  },
  {
    description: "Infrastructure modules, platform parts, and shared building blocks.",
    icon: Blocks,
    label: "Modules",
    value: SKILL_ICON.blocks,
  },
  {
    description: "Operations, runtime maintenance, and practical engineering work.",
    icon: Wrench,
    label: "Operations",
    value: SKILL_ICON.wrench,
  },
  {
    description: "Public-facing systems, reach, and globally accessible experiences.",
    icon: Globe,
    label: "Web",
    value: SKILL_ICON.globe,
  },
] as const;

export function isSkillIconKey(value: string): value is SkillIconKey {
  return SKILL_ICON_OPTIONS.some((option) => option.value === value);
}

export function getSkillIconOption(value: SkillIconKey) {
  return (
    SKILL_ICON_OPTIONS.find((option) => option.value === value) ?? SKILL_ICON_OPTIONS[0]
  );
}

export function getSkillIcon(value: string) {
  const iconValue = isSkillIconKey(value) ? value : SKILL_DEFAULT_ICON;

  return getSkillIconOption(iconValue).icon;
}
