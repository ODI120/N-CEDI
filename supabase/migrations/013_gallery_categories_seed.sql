-- Default gallery filter categories (public /gallery page tabs)

insert into public.categories (name, slug, category_type)
values
  ('Labs & Facilities', 'labs', 'gallery'),
  ('Student Projects', 'projects', 'gallery'),
  ('Exhibitions & Events', 'events', 'gallery')
on conflict (slug) do update
  set category_type = excluded.category_type,
      name = excluded.name;
