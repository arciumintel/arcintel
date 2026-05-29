import pg from "pg";

export const ISOLATION_USERS = {
  userA: "user-a",
  userB: "user-b",
  partnerMember: "partner-b-member",
} as const;

export const ISOLATION_ORG_SLUG = "partner-b-isolation";
export const ISOLATION_PROGRAM_SLUG = "partner-b-isolation";

export type IsolationFixtureIds = {
  lessonVersionId: string;
  partnerOrgId: string;
  partnerProgramId: string;
  draftCurriculumVersionId: string;
  draftLessonVersionId: string;
  arciumCurriculumVersionId: string;
};

export async function seedIsolationFixtures(
  connectionString: string,
): Promise<IsolationFixtureIds> {
  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    await client.query("begin");
    await client.query(
      `SELECT set_config('app.is_staff', 'true', true),
              set_config('app.current_user_id', '', true),
              set_config('app.current_org_ids', '', true)`,
    );

    await client.query(
      `insert into "user" ("id", "name", "email", "emailVerified", "username", "role")
       values
         ($1, 'User A', 'user-a@test.local', true, 'user-a', 'user'),
         ($2, 'User B', 'user-b@test.local', true, 'user-b', 'user'),
         ($3, 'Partner B Member', 'partner-b-member@test.local', true, 'partner-b-member', 'user')
       on conflict ("id") do nothing`,
      [
        ISOLATION_USERS.userA,
        ISOLATION_USERS.userB,
        ISOLATION_USERS.partnerMember,
      ],
    );

    const arciumLesson = await client.query<{ id: string; curriculum_version_id: string }>(
      `select lv.id,
              p.active_published_version_id as curriculum_version_id
       from lesson_version lv
       join track t on t.id = lv.track_id
       join program p on p.active_published_version_id = t.curriculum_version_id
       where p.slug = 'arcium' and lv.slug = 'welcome'
       limit 1`,
    );
    const lessonVersionId = arciumLesson.rows[0]?.id;
    const arciumCurriculumVersionId = arciumLesson.rows[0]?.curriculum_version_id;
    if (!lessonVersionId || !arciumCurriculumVersionId) {
      throw new Error("Run npm run db:seed-arcium before integration tests");
    }

    let partnerOrgId = (
      await client.query<{ id: string }>(
        `select id from organization where slug = $1`,
        [ISOLATION_ORG_SLUG],
      )
    ).rows[0]?.id;

    if (!partnerOrgId) {
      partnerOrgId = (
        await client.query<{ id: string }>(
          `insert into organization (slug, name, trust_level)
           values ($1, 'Partner B Isolation', 'untrusted')
           returning id`,
          [ISOLATION_ORG_SLUG],
        )
      ).rows[0].id;
    }

    let partnerProgramId = (
      await client.query<{ id: string }>(
        `select id from program where organization_id = $1 and slug = $2`,
        [partnerOrgId, ISOLATION_PROGRAM_SLUG],
      )
    ).rows[0]?.id;

    if (!partnerProgramId) {
      partnerProgramId = (
        await client.query<{ id: string }>(
          `insert into program (organization_id, slug, title, tagline, hub_status)
           values ($1, $2, 'Partner B Internal', 'Draft-only isolation fixture', 'internal')
           returning id`,
          [partnerOrgId, ISOLATION_PROGRAM_SLUG],
        )
      ).rows[0].id;
    }

    await client.query(
      `insert into organization_member (organization_id, user_id, role)
       values ($1, $2, 'author')
       on conflict (organization_id, user_id) do nothing`,
      [partnerOrgId, ISOLATION_USERS.partnerMember],
    );

    let partnerCurriculumId = (
      await client.query<{ id: string }>(
        `select id from curriculum where program_id = $1`,
        [partnerProgramId],
      )
    ).rows[0]?.id;

    if (!partnerCurriculumId) {
      partnerCurriculumId = (
        await client.query<{ id: string }>(
          `insert into curriculum (program_id, draft_status)
           values ($1, 'draft')
           returning id`,
          [partnerProgramId],
        )
      ).rows[0].id;
    }

    let draftCurriculumVersionId = (
      await client.query<{ id: string }>(
        `select id from curriculum_version
         where curriculum_id = $1 and version_number = 1`,
        [partnerCurriculumId],
      )
    ).rows[0]?.id;

    if (!draftCurriculumVersionId) {
      draftCurriculumVersionId = (
        await client.query<{ id: string }>(
          `insert into curriculum_version (curriculum_id, version_number, status)
           values ($1, 1, 'published')
           returning id`,
          [partnerCurriculumId],
        )
      ).rows[0].id;
    }

    let draftTrackId = (
      await client.query<{ id: string }>(
        `select id from track
         where curriculum_version_id = $1 and slug = 'draft-track'`,
        [draftCurriculumVersionId],
      )
    ).rows[0]?.id;

    if (!draftTrackId) {
      draftTrackId = (
        await client.query<{ id: string }>(
          `insert into track (curriculum_version_id, position, slug, title)
           values ($1, 1, 'draft-track', '{"en":"Draft track"}'::jsonb)
           returning id`,
          [draftCurriculumVersionId],
        )
      ).rows[0].id;
    }

    let draftLessonVersionId = (
      await client.query<{ id: string }>(
        `select id from lesson_version where track_id = $1 and slug = 'draft-lesson'`,
        [draftTrackId],
      )
    ).rows[0]?.id;

    if (!draftLessonVersionId) {
      draftLessonVersionId = (
        await client.query<{ id: string }>(
          `insert into lesson_version (track_id, position, slug, title, blocks)
           values ($1, 1, 'draft-lesson', '{"en":"Draft lesson"}'::jsonb, $2::jsonb)
           returning id`,
          [
            draftTrackId,
            JSON.stringify([
              {
                type: "paragraph",
                text: { en: "Partner B draft content — must not leak cross-tenant." },
              },
            ]),
          ],
        )
      ).rows[0].id;
    }

    await client.query(
      `insert into lesson_progress (user_id, lesson_version_id, started_at)
       values ($1, $2, now())
       on conflict (user_id, lesson_version_id) do nothing`,
      [ISOLATION_USERS.userB, lessonVersionId],
    );

    await client.query(
      `insert into program_enrollment (user_id, program_id, curriculum_version_id)
       select $1, p.id, p.active_published_version_id
       from program p
       where p.slug = 'arcium'
         and p.active_published_version_id is not null
       on conflict (user_id, program_id) do nothing`,
      [ISOLATION_USERS.userB],
    );

    await client.query(
      `delete from lesson_progress
       where user_id = $1 and lesson_version_id = $2`,
      [ISOLATION_USERS.userA, lessonVersionId],
    );

    await client.query("commit");

    return {
      lessonVersionId,
      partnerOrgId,
      partnerProgramId,
      draftCurriculumVersionId,
      draftLessonVersionId,
      arciumCurriculumVersionId,
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}
