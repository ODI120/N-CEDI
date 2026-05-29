-- Remove cohort-like fields from programs: duration_weeks and level
alter table public.programs
  drop column if exists duration_weeks,
  drop column if exists level;

-- If you later want to reintroduce program difficulty or duration, consider adding tags or metadata instead of fixed columns.
