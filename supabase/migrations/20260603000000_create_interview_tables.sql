create extension if not exists "pgcrypto";

create type public.interview_session_status as enum (
  'draft',
  'active',
  'completed',
  'archived'
);

create type public.interview_message_role as enum (
  'ai',
  'expert',
  'system'
);

create type public.extracted_pattern_category as enum (
  'hidden_anxiety',
  'first_question',
  'followup_question',
  'decision_point',
  'talk_example',
  'ng_expression',
  'next_action',
  'experience_rule',
  'other'
);

create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  theme text not null,
  status public.interview_session_status not null default 'draft',
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  role public.interview_message_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.extracted_patterns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  category public.extracted_pattern_category not null default 'other',
  customer_phrase text,
  hidden_anxiety text,
  first_question text,
  followup_questions text[] not null default '{}',
  decision_points text[] not null default '{}',
  talk_example text,
  ng_phrases text[] not null default '{}',
  next_action text,
  confidence_score numeric(3, 2) check (
    confidence_score is null
    or (
      confidence_score >= 0
      and confidence_score <= 1
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pattern_feedback (
  id uuid primary key default gen_random_uuid(),
  pattern_id uuid not null references public.extracted_patterns(id) on delete cascade,
  rating integer check (
    rating is null
    or (
      rating >= 1
      and rating <= 5
    )
  ),
  feedback_text text,
  is_usable boolean,
  created_at timestamptz not null default now()
);

create index interview_messages_session_id_created_at_idx
  on public.interview_messages(session_id, created_at);

create index extracted_patterns_session_id_created_at_idx
  on public.extracted_patterns(session_id, created_at);

create index pattern_feedback_pattern_id_created_at_idx
  on public.pattern_feedback(pattern_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_interview_sessions_updated_at
before update on public.interview_sessions
for each row
execute function public.set_updated_at();

create trigger set_extracted_patterns_updated_at
before update on public.extracted_patterns
for each row
execute function public.set_updated_at();

alter table public.interview_sessions enable row level security;
alter table public.interview_messages enable row level security;
alter table public.extracted_patterns enable row level security;
alter table public.pattern_feedback enable row level security;
