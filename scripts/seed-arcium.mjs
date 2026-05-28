import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import fs from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

await loadEnvFile(path.join(repoRoot, ".env"), false);
await loadEnvFile(path.join(repoRoot, ".env.local"), true);

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is not set.");
}

const force = process.argv.includes("--force");
const { Client } = pg;
const client = new Client({ connectionString });
await client.connect();

try {
  await client.query("begin");
  await client.query(
    `SELECT set_config('app.current_user_id', '', true),
            set_config('app.current_org_ids', '', true),
            set_config('app.is_staff', 'true', true)`,
  );

  const orgSlug = "arcium";
  const programSlug = "arcium";

  let orgId = (
    await client.query(`select id from organization where slug = $1`, [orgSlug])
  ).rows[0]?.id;

  if (!orgId) {
    orgId = (
      await client.query(
        `insert into organization (slug, name, trust_level)
         values ($1, $2, 'untrusted')
         returning id`,
        [orgSlug, "Arcium"],
      )
    ).rows[0].id;
    console.log("Created organization arcium");
  } else {
    console.log("Organization arcium already exists");
  }

  let programId = (
    await client.query(
      `select id from program where organization_id = $1 and slug = $2`,
      [orgId, programSlug],
    )
  ).rows[0]?.id;

  if (!programId) {
    programId = (
      await client.query(
        `insert into program (organization_id, slug, title, tagline, hub_status, featured_rank)
         values ($1, $2, $3, $4, 'listed', 1)
         returning id`,
        [
          orgId,
          programSlug,
          "Arcium Fundamentals",
          "Learn the foundations of the Arcium ecosystem.",
        ],
      )
    ).rows[0].id;
    console.log("Created program arcium");
  } else if (force) {
    await client.query(
      `update program
       set title = $3, tagline = $4, hub_status = 'listed', featured_rank = 1
       where id = $1`,
      [
        programId,
        programSlug,
        "Arcium Fundamentals",
        "Learn the foundations of the Arcium ecosystem.",
      ],
    );
  }

  let curriculumId = (
    await client.query(`select id from curriculum where program_id = $1`, [
      programId,
    ])
  ).rows[0]?.id;

  if (!curriculumId) {
    curriculumId = (
      await client.query(
        `insert into curriculum (program_id, draft_status)
         values ($1, 'approved')
         returning id`,
        [programId],
      )
    ).rows[0].id;
  }

  let versionId = (
    await client.query(
      `select id from curriculum_version where curriculum_id = $1 and version_number = 1`,
      [curriculumId],
    )
  ).rows[0]?.id;

  if (!versionId) {
    versionId = (
      await client.query(
        `insert into curriculum_version (curriculum_id, version_number, status, published_at)
         values ($1, 1, 'published', now())
         returning id`,
        [curriculumId],
      )
    ).rows[0].id;
    console.log("Created curriculum_version v1");
  }

  await client.query(
    `update program set active_published_version_id = $2 where id = $1`,
    [programId, versionId],
  );

  let trackId = (
    await client.query(
      `select id from track where curriculum_version_id = $1 and slug = 'getting-started'`,
      [versionId],
    )
  ).rows[0]?.id;

  if (!trackId) {
    trackId = (
      await client.query(
        `insert into track (curriculum_version_id, position, slug, title)
         values ($1, 1, 'getting-started', $2::jsonb)
         returning id`,
        [versionId, JSON.stringify({ en: "Getting Started" })],
      )
    ).rows[0].id;
  }

  const lessonBlocks = [
    {
      type: "heading",
      level: 2,
      text: { en: "Welcome to Arcium" },
    },
    {
      type: "paragraph",
      text: {
        en: "Arcium is a decentralized confidential computing network. This lesson introduces the core ideas you need before diving deeper.",
      },
    },
    {
      type: "callout",
      variant: "note",
      text: {
        en: "Published content in Arcademy is versioned and immutable once live.",
      },
    },
  ];

  const quizQuestions = [
    {
      id: "q1",
      type: "true_false",
      prompt: "Arcademy stores published lesson content in Postgres.",
      points: 1,
      correctAnswer: "true",
    },
  ];

  const scoringConfig = {
    passThreshold: 70,
    masteryThreshold: 90,
    maxAttempts: 3,
    cooldownSeconds: 0,
  };

  let quizVersionId = (
    await client.query(
      `select qv.id
       from lesson_version lv
       join quiz_version qv on qv.id = lv.quiz_version_id
       where lv.track_id = $1 and lv.slug = 'welcome'`,
      [trackId],
    )
  ).rows[0]?.id;

  if (!quizVersionId) {
    quizVersionId = (
      await client.query(
        `insert into quiz_version (questions, scoring_config)
         values ($1::jsonb, $2::jsonb)
         returning id`,
        [JSON.stringify(quizQuestions), JSON.stringify(scoringConfig)],
      )
    ).rows[0].id;
  } else if (force) {
    await client.query(
      `update quiz_version
       set questions = $2::jsonb, scoring_config = $3::jsonb
       where id = $1`,
      [
        quizVersionId,
        JSON.stringify(quizQuestions),
        JSON.stringify(scoringConfig),
      ],
    );
  }

  const existingLesson = (
    await client.query(
      `select id from lesson_version where track_id = $1 and slug = 'welcome'`,
      [trackId],
    )
  ).rows[0]?.id;

  if (!existingLesson) {
    await client.query(
      `insert into lesson_version (track_id, position, slug, title, blocks, quiz_version_id)
       values ($1, 1, 'welcome', $2::jsonb, $3::jsonb, $4)`,
      [
        trackId,
        JSON.stringify({ en: "Welcome" }),
        JSON.stringify(lessonBlocks),
        quizVersionId,
      ],
    );
    console.log("Created lesson welcome");
  } else if (force) {
    await client.query(
      `update lesson_version
       set title = $3::jsonb, blocks = $4::jsonb, quiz_version_id = $5
       where id = $1`,
      [
        existingLesson,
        trackId,
        JSON.stringify({ en: "Welcome" }),
        JSON.stringify(lessonBlocks),
        quizVersionId,
      ],
    );
  }

  await client.query(
    `insert into program_hub_settings (program_id)
     values ($1)
     on conflict (program_id) do nothing`,
    [programId],
  );

  await client.query("commit");
  console.log("Arcium seed complete.");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}

async function loadEnvFile(filePath, override = false) {
  try {
    const contents = await fs.readFile(filePath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const rawValue = trimmed.slice(index + 1).trim();
      if (!key) continue;
      if (!override && process.env[key]) continue;
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Ignore missing env files.
  }
}
