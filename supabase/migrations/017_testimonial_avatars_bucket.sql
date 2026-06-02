-- Testimonial avatar images bucket with admin-only upload policies
insert into storage.buckets (id, name, public)
  values ('testimonial_avatars', 'Testimonial Avatars', true)
  on conflict do nothing;

-- Public read testimonial avatars
drop policy if exists "Public read testimonial avatars" on storage.objects;
create policy "Public read testimonial avatars"
  on storage.objects for select
  using (bucket_id = 'testimonial_avatars');

-- Admins can upload avatars
drop policy if exists "Admins can upload testimonial avatars" on storage.objects;
create policy "Admins can upload testimonial avatars"
  on storage.objects for insert
  with check (bucket_id = 'testimonial_avatars' and public.is_admin('editor'));

-- Admins can update/replace avatars
drop policy if exists "Admins can update testimonial avatars" on storage.objects;
create policy "Admins can update testimonial avatars"
  on storage.objects for update
  using (bucket_id = 'testimonial_avatars' and public.is_admin('editor'))
  with check (bucket_id = 'testimonial_avatars' and public.is_admin('editor'));

-- Admins can delete avatars
drop policy if exists "Admins can delete testimonial avatars" on storage.objects;
create policy "Admins can delete testimonial avatars"
  on storage.objects for delete
  using (bucket_id = 'testimonial_avatars' and public.is_admin('admin'));
