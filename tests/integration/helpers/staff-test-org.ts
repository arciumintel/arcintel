import pg from "pg";

export const STAFF_TEST_ORG_SLUG = "staff-test-org";

export async function ensureStaffTestOrg(connectionString: string) {
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
      `insert into organization (slug, name, trust_level)
       values ($1, 'Staff Test Org', 'untrusted')
       on conflict (slug) do nothing`,
      [STAFF_TEST_ORG_SLUG],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}
