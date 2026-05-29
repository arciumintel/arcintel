-- Performance indexes, hub slug uniqueness, and published-snapshot immutability.
-- Draft workspace curriculum_version rows (not active_published_version_id) stay mutable.

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_program_active_version
  on program(active_published_version_id)
  where active_published_version_id is not null;

create index if not exists idx_lesson_version_quiz
  on lesson_version(quiz_version_id)
  where quiz_version_id is not null;

create index if not exists idx_platform_event_org
  on platform_event(organization_id)
  where organization_id is not null;

create index if not exists idx_curriculum_version_curriculum_number
  on curriculum_version(curriculum_id, version_number desc);

create index if not exists idx_program_org_updated
  on program(organization_id, updated_at desc);

create index if not exists idx_program_slug
  on program(slug);

-- Hub routes resolve program by slug without org segment; listed/featured slugs must be unique.
create unique index if not exists idx_program_slug_hub_public
  on program(slug)
  where hub_status in ('listed', 'featured');

drop index if exists idx_program_hub_status;

create index if not exists idx_program_hub_status
  on program (featured_rank nulls last, title)
  where hub_status in ('listed', 'featured')
    and active_published_version_id is not null;

create index if not exists session_expires_at_idx on "session" ("expiresAt");

-- ---------------------------------------------------------------------------
-- Immutability helpers (draft workspace versions remain editable)
-- ---------------------------------------------------------------------------

create or replace function app_curriculum_version_is_mutable(cv_id uuid)
returns boolean language sql stable as $$
  select not exists (
    select 1 from program p where p.active_published_version_id = cv_id
  )
  and not exists (
    select 1
    from curriculum_version cv
    where cv.id = cv_id
      and cv.status in ('superseded', 'archived')
  );
$$;

create or replace function prevent_locked_curriculum_version_mutation()
returns trigger language plpgsql as $$
begin
  -- Publish flow may supersede the previously active snapshot.
  if tg_op = 'UPDATE'
     and old.status = 'published'
     and new.status in ('superseded', 'archived')
     and new.id = old.id
     and new.curriculum_id = old.curriculum_id
     and new.version_number = old.version_number
  then
    return new;
  end if;

  if not app_curriculum_version_is_mutable(old.id) then
    raise exception 'Curriculum version % is immutable', old.id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function prevent_locked_track_mutation()
returns trigger language plpgsql as $$
declare
  cv_id uuid;
begin
  cv_id := coalesce(new.curriculum_version_id, old.curriculum_version_id);

  if not app_curriculum_version_is_mutable(cv_id) then
    raise exception 'Track rows under immutable curriculum versions cannot change';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function prevent_locked_lesson_version_mutation()
returns trigger language plpgsql as $$
declare
  cv_id uuid;
begin
  select t.curriculum_version_id
    into cv_id
  from track t
  where t.id = coalesce(new.track_id, old.track_id);

  if not app_curriculum_version_is_mutable(cv_id) then
    raise exception 'Lesson version rows under immutable curriculum versions cannot change';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function prevent_locked_quiz_version_mutation()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1
    from lesson_version lv
    join track t on t.id = lv.track_id
    where lv.quiz_version_id = old.id
      and not app_curriculum_version_is_mutable(t.curriculum_version_id)
  ) then
    raise exception 'Quiz version rows referenced by immutable curriculum cannot change';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists curriculum_version_immutability on curriculum_version;
create trigger curriculum_version_immutability
  before update or delete on curriculum_version
  for each row execute function prevent_locked_curriculum_version_mutation();

drop trigger if exists track_immutability on track;
create trigger track_immutability
  before update or delete on track
  for each row execute function prevent_locked_track_mutation();

drop trigger if exists lesson_version_immutability on lesson_version;
create trigger lesson_version_immutability
  before update or delete on lesson_version
  for each row execute function prevent_locked_lesson_version_mutation();

drop trigger if exists quiz_version_immutability on quiz_version;
create trigger quiz_version_immutability
  before update or delete on quiz_version
  for each row execute function prevent_locked_quiz_version_mutation();

drop function if exists prevent_published_mutation();
