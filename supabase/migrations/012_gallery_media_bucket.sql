-- Gallery item images bucket (public gallery page + homepage slider)

insert into storage.buckets (id, name, public)
values ('gallery_media', 'gallery_media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read gallery_media" on storage.objects;
create policy "Public read gallery_media"
  on storage.objects for select
  using (bucket_id = 'gallery_media');

drop policy if exists "Admins upload gallery_media" on storage.objects;
create policy "Admins upload gallery_media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery_media' and public.is_admin('editor'));

drop policy if exists "Admins update gallery_media" on storage.objects;
create policy "Admins update gallery_media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery_media' and public.is_admin('editor'))
  with check (bucket_id = 'gallery_media' and public.is_admin('editor'));

drop policy if exists "Admins delete gallery_media" on storage.objects;
create policy "Admins delete gallery_media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery_media' and public.is_admin('admin'));
