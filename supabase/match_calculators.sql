create or replace function public.match_calculators (
  query_embedding vector(1536),
  match_count int default 5,
  filter_category text default null
)
returns table (
  id bigint,
  calculator_name text,
  category text,
  main_description text,
  input_items text,
  output_items text,
  recommended_users text,
  content_topics text,
  page_path text,
  source text,
  similarity double precision
)
language sql
stable
as $$
  select
    c.id,
    c.calculator_name,
    c.category,
    c.main_description,
    c.input_items,
    c.output_items,
    c.recommended_users,
    c.content_topics,
    c.page_path,
    c.source,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.calculators c
  where filter_category is null or c.category = filter_category
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
