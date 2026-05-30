-- Ensure categories.category_type exists (fixes PostgREST 400 on gallery filters)

alter table public.categories
  add column if not exists category_type text;

update public.categories
set category_type = case
  when slug in ('labs', 'projects', 'events') then 'gallery'
  when category_type is null or category_type = '' then 'program'
  else category_type
end
where category_type is null or category_type = '';

alter table public.categories
  alter column category_type set default 'program';

alter table public.categories
  alter column category_type set not null;

do $$
begin
  alter table public.categories
    add constraint categories_category_type_check
    check (category_type in ('blog', 'gallery', 'event', 'program'));
exception
  when duplicate_object then null;
end $$;
