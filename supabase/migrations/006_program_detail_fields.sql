-- Add program detail fields for dynamic public program pages
alter table public.programs
  add column if not exists outcomes text[] default '{}'::text[] not null,
  add column if not exists requirements text,
  add column if not exists overview text,
  add column if not exists lab_experience text;

-- Ensure new fields are included in public read policy automatically through existing program policies.
