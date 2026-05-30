-- Partner logo uploads (public site + homepage section)

insert into storage.buckets (id, name, public)
values ('site_assets', 'site_assets', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read site_assets" on storage.objects;
create policy "Public read site_assets"
  on storage.objects for select
  using (bucket_id = 'site_assets');

drop policy if exists "Admins upload site_assets" on storage.objects;
create policy "Admins upload site_assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site_assets' and public.is_admin('editor'));

drop policy if exists "Admins update site_assets" on storage.objects;
create policy "Admins update site_assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site_assets' and public.is_admin('editor'))
  with check (bucket_id = 'site_assets' and public.is_admin('editor'));

drop policy if exists "Admins delete site_assets" on storage.objects;
create policy "Admins delete site_assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site_assets' and public.is_admin('admin'));
