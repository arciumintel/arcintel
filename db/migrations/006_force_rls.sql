-- Table owners bypass RLS by default; force policies for the app role too.
alter table organization force row level security;
alter table organization_member force row level security;
alter table program force row level security;
alter table program_hub_settings force row level security;
alter table curriculum force row level security;
alter table curriculum_version force row level security;
alter table track force row level security;
alter table lesson_version force row level security;
alter table quiz_version force row level security;
alter table program_enrollment force row level security;
alter table lesson_progress force row level security;
alter table quiz_attempt force row level security;
alter table platform_event force row level security;
