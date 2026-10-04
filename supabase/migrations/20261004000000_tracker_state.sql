-- One row per user, holding their whole tracker as JSON (same shape the app used in
-- localStorage: {v, name, program, minor, conc, status, choice, classes, events, updated}).
create table public.tracker_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.tracker_state enable row level security;

-- A user can only ever see or touch the row whose user_id is their own.
create policy "select own tracker state"
  on public.tracker_state for select
  using (auth.uid() = user_id);

create policy "insert own tracker state"
  on public.tracker_state for insert
  with check (auth.uid() = user_id);

create policy "update own tracker state"
  on public.tracker_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own tracker state"
  on public.tracker_state for delete
  using (auth.uid() = user_id);
