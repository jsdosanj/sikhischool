import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

// ── Auth.js identity tables (standard Drizzle-SQLite adapter shape). Auth.js owns
// "is this email verified/authenticated"; parentAccounts/teacherAccounts (below) own
// the app-specific profile + role data, linked by email after sign-in. ──

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

// ── Grade-banded academic content (Math/ELA/Science/Social Studies/Punjabi/Sikhi/Life Skills/Digital Literacy) ──

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level").notNull(), // e.g. "K", "1".."12"
  gradeBand: text("grade_band").notNull(), // "K-2" | "3-5" | "6-8" | "9-12"
  title: text("title").notNull(),
  description: text("description"),
  waStandardRefs: text("wa_standard_refs", { mode: "json" }).$type<string[]>().notNull().default([]),
  shellAssignment: text("shell_assignment").notNull(), // "little-sparks" | "rising-school" | "sikhi-school-studio"
});

export const units = sqliteTable("units", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => courses.id),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  weekOfYear: integer("week_of_year"),
  standardTags: text("standard_tags", { mode: "json" }).$type<{ code: string; version?: string; c3Dimension?: string }[]>().notNull().default([]),
  unitTestId: text("unit_test_id"),
  badgeId: text("badge_id").references(() => badges.id),
});

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  unitId: text("unit_id").notNull().references(() => units.id),
  order: integer("order").notNull(),
  dayOfWeek: integer("day_of_week"),
  title: text("title").notNull(),
  gradeLevel: text("grade_level").notNull(),
  subject: text("subject").notNull(),
  standardTags: text("standard_tags", { mode: "json" }).$type<{ code: string; version?: string; c3Dimension?: string }[]>().notNull().default([]),
  contentBlocks: text("content_blocks", { mode: "json" }).$type<{ type: "video" | "text" | "interactive" | "image" | "audio"; ref: string }[]>().notNull().default([]),
  activityRefs: text("activity_refs", { mode: "json" }).$type<{ type: "game" | "exercise"; componentKey: string; config?: Record<string, unknown> }[]>().notNull().default([]),
  masteryQuizId: text("mastery_quiz_id"),
  masteryPointsFamiliar: integer("mastery_points_familiar").notNull().default(50),
  masteryPointsProficient: integer("mastery_points_proficient").notNull().default(80),
  masteryPointsMastered: integer("mastery_points_mastered").notNull().default(100),
  aiGenerated: integer("ai_generated", { mode: "boolean" }).notNull().default(false),
  aiReviewStatus: text("ai_review_status").notNull().default("pending"), // pending | human-reviewed | scholar-reviewed
  citations: text("citations", { mode: "json" }).$type<string[]>().notNull().default([]),
  enrichmentLinks: text("enrichment_links", { mode: "json" }).$type<{ label: string; url: string; source: "sikhi.io" | "sikhiuni" | "external" }[]>().notNull().default([]),
});

// Always-free, always-present: the artifact that makes a lesson actually teachable.
export const teacherGuides = sqliteTable("teacher_guides", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").notNull().references(() => lessons.id),
  objectives: text("objectives", { mode: "json" }).$type<string[]>().notNull().default([]),
  materialsNeeded: text("materials_needed", { mode: "json" }).$type<string[]>().notNull().default([]),
  facilitationScript: text("facilitation_script").notNull(),
  differentiationTips: text("differentiation_tips", { mode: "json" }).$type<string[]>().notNull().default([]),
  estimatedMinutes: integer("estimated_minutes"),
  answerKey: text("answer_key"),
  standardsRationale: text("standards_rationale"),
});

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  level: text("level").notNull(), // "lesson" | "unit" | "course"
  questions: text("questions", { mode: "json" }).$type<{ q: string; options: string[]; answer: number }[]>().notNull().default([]),
  masteryWeight: integer("mastery_weight").notNull().default(1),
});

export const worksheets = sqliteTable("worksheets", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").references(() => lessons.id),
  scriptureSectionId: text("scripture_section_id").references(() => scriptureSections.id),
  title: text("title").notNull(),
  pdfAssetRef: text("pdf_asset_ref"), // R2 key, if pre-rendered
  generationTemplateKey: text("generation_template_key"), // react-pdf template, if generated on demand
});

export const pacingGuides = sqliteTable("pacing_guides", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => courses.id),
  weekByWeekSequence: text("week_by_week_sequence", { mode: "json" }).$type<{ week: number; unitId: string; summary: string }[]>().notNull().default([]),
});

// ── Santhya Path (migrated Gurbani-reading pathway, formerly sikhi.io's "Sikhi School") ──
// Stage-based skill progression, deliberately NOT grade-banded — see CLAUDE.md.

export const scriptureStages = sqliteTable("scripture_stages", {
  id: text("id").primaryKey(),
  order: integer("order").notNull(), // 1-7
  title: text("title").notNull(),
  description: text("description"),
  recommendedGradeBand: text("recommended_grade_band"), // soft guidance only, never a gate
});

export const scriptureSections = sqliteTable("scripture_sections", {
  id: text("id").primaryKey(),
  stageId: text("stage_id").notNull().references(() => scriptureStages.id),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  gurmukhiTitle: text("gurmukhi_title"),
  description: text("description"),
  // Vishraam-marked Gurbani source text — NOT migrated yet (see scripts/migrate-santhya-path.ts);
  // null until the GURBANI_DB corpus pull happens. Format: "sikh-archive:GURBANI_DB:<code>".
  textRef: text("text_ref"),
  externalReader: text("external_reader", { mode: "json" }).$type<{ href: string; label: string } | null>(),
  // R2-mirrored from gurmatveechar.com (sikh-archive's own choice — see the migration
  // script's header comment). A section can have zero, one, or many tracks (SGGS alone
  // has 1,428 — one per ang), so this is a list, not a single ref.
  audioTracks: text("audio_tracks", { mode: "json" }).$type<{ title: string; sourceUrl: string; r2Key: string }[]>().notNull().default([]),
  audioNote: text("audio_note"),
  padchedLarivaarSupport: integer("padched_larivaar_support", { mode: "boolean" }).notNull().default(false),
  glossaryRefs: text("glossary_refs", { mode: "json" }).$type<string[]>().notNull().default([]),
  masteryQuizId: text("mastery_quiz_id"),
});

export const gurbaniGlossary = sqliteTable("gurbani_glossary", {
  id: text("id").primaryKey(),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  sectionRefs: text("section_refs", { mode: "json" }).$type<string[]>().notNull().default([]),
});

export const punjabiDictionary = sqliteTable("punjabi_dictionary", {
  id: text("id").primaryKey(),
  word: text("word").notNull(),
  translation: text("translation").notNull(),
  partOfSpeech: text("part_of_speech"),
  exampleSentence: text("example_sentence"),
  audioRef: text("audio_ref"),
});

// ── Gamification ──

export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  tier: text("tier").notNull(), // seed | sprout | bloom | sunrise | chardi-kala
  iconRef: text("icon_ref"),
  criteria: text("criteria"),
});

export const studentProgress = sqliteTable("student_progress", {
  id: text("id").primaryKey(),
  childProfileId: text("child_profile_id").notNull().references(() => childProfiles.id),
  nodeId: text("node_id").notNull(), // Lesson.id | ScriptureSection.id
  status: text("status").notNull().default("not-started"), // not-started | in-progress | passed
  masteryPoints: integer("mastery_points").notNull().default(0),
  lastPracticedAt: integer("last_practiced_at", { mode: "timestamp" }),
  decayScheduledAt: integer("decay_scheduled_at", { mode: "timestamp" }),
});

// ── Accounts & roles (COPPA-conscious: ParentAccount is the only directly-authenticating
// under-13-household identity; ChildProfile carries no PII — see CLAUDE.md) ──

export const parentAccounts = sqliteTable("parent_accounts", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const childProfiles = sqliteTable("child_profiles", {
  id: text("id").primaryKey(),
  parentAccountId: text("parent_account_id").notNull().references(() => parentAccounts.id),
  displayName: text("display_name").notNull(),
  gradeLevel: text("grade_level").notNull(),
  avatarConfig: text("avatar_config", { mode: "json" }).$type<Record<string, unknown>>(),
});

export const teacherAccounts = sqliteTable("teacher_accounts", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const classroomLicenses = sqliteTable("classroom_licenses", {
  id: text("id").primaryKey(),
  teacherAccountId: text("teacher_account_id").notNull().references(() => teacherAccounts.id),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Ported from sikhiuni's course_teachers pattern: scopes a teacher's gradebook
// view to their assigned grade/classroom, prevents IDOR across classrooms.
export const sikhiSchoolTeachers = sqliteTable("sikhi_school_teachers", {
  id: text("id").primaryKey(),
  teacherAccountId: text("teacher_account_id").notNull().references(() => teacherAccounts.id),
  classroomLicenseId: text("classroom_license_id").notNull().references(() => classroomLicenses.id),
  gradeLevel: text("grade_level"),
});

// Ported from sikhiuni's grade_overrides pattern: effective grade = override ?? auto-score.
export const gradeOverrides = sqliteTable("grade_overrides", {
  id: text("id").primaryKey(),
  childProfileId: text("child_profile_id").notNull().references(() => childProfiles.id),
  nodeId: text("node_id").notNull(),
  overrideScore: integer("override_score"),
  setByTeacherAccountId: text("set_by_teacher_account_id").references(() => teacherAccounts.id),
  setAt: integer("set_at", { mode: "timestamp" }),
});

// Ported from sikhiuni's announcements pattern: admin/teacher -> students, per-classroom.
export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  classroomLicenseId: text("classroom_license_id").references(() => classroomLicenses.id),
  authorTeacherAccountId: text("author_teacher_account_id").references(() => teacherAccounts.id),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Ported from sikhiuni's events pattern: append-only audit log, best-effort (never throws).
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  actorType: text("actor_type").notNull(), // parent | child | teacher | admin
  actorId: text("actor_id"),
  action: text("action").notNull(),
  detail: text("detail", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ── Graduation/transfer pathway: Sikhi School -> sikhiuni (request -> teacher-approve -> admin-activate) ──

export const transferRequests = sqliteTable("transfer_requests", {
  id: text("id").primaryKey(),
  accountType: text("account_type").notNull(), // student | teacher
  accountId: text("account_id").notNull(), // childProfiles.id | teacherAccounts.id
  targetEmail: text("target_email").notNull(), // required at request time — ChildProfile has none
  status: text("status").notNull().default("pending_teacher"), // pending_teacher | pending_admin | approved | activated | rejected
  requestedAt: integer("requested_at", { mode: "timestamp" }).notNull(),
  teacherApproverId: text("teacher_approver_id").references(() => teacherAccounts.id),
  teacherApprovedAt: integer("teacher_approved_at", { mode: "timestamp" }),
  adminActivatorId: text("admin_activator_id"),
  activatedAt: integer("activated_at", { mode: "timestamp" }),
});
