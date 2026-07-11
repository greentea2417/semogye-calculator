-- Enable vector search
create extension if not exists vector;

create table if not exists public.calculators (
  id bigserial primary key,
  calculator_name text not null,
  category text not null,
  main_description text not null,
  input_items text not null,
  output_items text not null,
  recommended_users text not null,
  content_topics text not null,
  page_path text not null,
  source text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calculators_category_idx on public.calculators (category);
create unique index if not exists calculators_page_path_idx on public.calculators (page_path);
create index if not exists calculators_embedding_idx on public.calculators using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists calculators_touch_updated_at on public.calculators;
create trigger calculators_touch_updated_at
before update on public.calculators
for each row execute function public.touch_updated_at();
