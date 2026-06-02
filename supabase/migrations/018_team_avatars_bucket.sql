-- Create teams_avatars bucket for team member avatars

insert into storage.buckets (id, name, public)
values ('teams_avatars', 'teams_avatars', true)
on conflict (id) do nothing;

-- Public read access for team avatars
drop policy if exists "Public can read team avatars" on storage.objects;
create policy "Public can read team avatars"
  on storage.objects for select
  using (bucket_id = 'teams_avatars');

-- Authenticated users (editors/admins) can upload
drop policy if exists "Editors can upload team avatars" on storage.objects;
create policy "Editors can upload team avatars"
  on storage.objects for insert
  with check (bucket_id = 'teams_avatars' and public.is_admin());

-- Editors can update (replace) team avatars
drop policy if exists "Editors can update team avatars" on storage.objects;
create policy "Editors can update team avatars"
  on storage.objects for update
  using (bucket_id = 'teams_avatars' and public.is_admin());

-- Only admins can delete team avatars
drop policy if exists "Admins can delete team avatars" on storage.objects;
create policy "Admins can delete team avatars"
  on storage.objects for delete
  using (bucket_id = 'teams_avatars' and public.is_admin());
