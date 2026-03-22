import { and, asc, eq, ne } from "drizzle-orm";

import type { AppDb } from "../../../db";
import { skills } from "../../../db/schema";
import type { SkillIconKey } from "~/domain/skills/icons";
import { suggestSlugFromTitle } from "~/lib/slug";

import type { SkillSubmission } from "./skill-form.server";

export interface PublicSkill {
  iconKey: SkillIconKey;
  name: string;
  sortOrder: number;
  summary: string;
}

export interface SkillOverview {
  createdAtLabel: string;
  iconKey: SkillIconKey;
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  summary: string;
}

function formatSkillDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildSkillPersistenceValues(submission: SkillSubmission) {
  return {
    iconKey: submission.iconKey,
    name: submission.name,
    sortOrder: submission.sortOrder,
    slug: suggestSlugFromTitle(submission.name),
    summary: submission.summary,
  };
}

const SKILLS_ORDER_BY = [
  asc(skills.sortOrder),
  asc(skills.name),
  asc(skills.createdAt),
] as const;

function mapPublicSkill(skill: {
  iconKey: string;
  name: string;
  sortOrder: number;
  summary: string;
}): PublicSkill {
  return {
    iconKey: skill.iconKey as SkillIconKey,
    name: skill.name,
    sortOrder: skill.sortOrder,
    summary: skill.summary,
  };
}

export async function listPublicSkills(db: AppDb): Promise<PublicSkill[]> {
  const result = await db
    .select({
      iconKey: skills.iconKey,
      name: skills.name,
      sortOrder: skills.sortOrder,
      summary: skills.summary,
    })
    .from(skills)
    .orderBy(...SKILLS_ORDER_BY);

  return result.map(mapPublicSkill);
}

export async function listSkills(db: AppDb): Promise<SkillOverview[]> {
  const result = await db
    .select({
      createdAt: skills.createdAt,
      iconKey: skills.iconKey,
      id: skills.id,
      name: skills.name,
      sortOrder: skills.sortOrder,
      slug: skills.slug,
      summary: skills.summary,
    })
    .from(skills)
    .orderBy(...SKILLS_ORDER_BY);

  return result.map((skill) => ({
    createdAtLabel: formatSkillDate(skill.createdAt),
    id: skill.id,
    slug: skill.slug,
    ...mapPublicSkill(skill),
  }));
}

export async function isSkillSlugTaken(
  db: AppDb,
  slug: string,
  excludedSkillId?: string,
) {
  const [skill] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(
      excludedSkillId
        ? and(eq(skills.slug, slug), ne(skills.id, excludedSkillId))
        : eq(skills.slug, slug),
    )
    .limit(1);

  return Boolean(skill);
}

export async function createSkill(db: AppDb, submission: SkillSubmission) {
  await db.insert(skills).values(buildSkillPersistenceValues(submission));
}

export async function updateSkill(
  db: AppDb,
  skillId: string,
  submission: SkillSubmission,
) {
  await db
    .update(skills)
    .set({
      ...buildSkillPersistenceValues(submission),
      updatedAt: new Date(),
    })
    .where(eq(skills.id, skillId));
}

export async function deleteSkill(db: AppDb, skillId: string) {
  await db.delete(skills).where(eq(skills.id, skillId));
}
