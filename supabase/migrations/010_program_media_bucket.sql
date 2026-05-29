-- Program images bucket (cover + gallery). Other buckets are managed in the Supabase dashboard.

insert into storage.buckets (id, name, public)
values ('program_media', 'program_media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read program_media" on storage.objects;
create policy "Public read program_media"
  on storage.objects for select
  using (bucket_id = 'program_media');

drop policy if exists "Admins upload program_media" on storage.objects;
create policy "Admins upload program_media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'program_media' and public.is_admin('editor'));

drop policy if exists "Admins update program_media" on storage.objects;
create policy "Admins update program_media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'program_media' and public.is_admin('editor'))
  with check (bucket_id = 'program_media' and public.is_admin('editor'));

drop policy if exists "Admins delete program_media" on storage.objects;
create policy "Admins delete program_media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'program_media' and public.is_admin('admin'));
