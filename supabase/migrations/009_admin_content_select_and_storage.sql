-- Admin read access for content tables (drafts + unpublished rows)
-- Without these policies, inserts succeed but admin UI cannot list or edit drafts.

drop policy if exists "Admins can read all programs" on public.programs;
create policy "Admins can read all programs"
  on public.programs for select
  using (public.is_admin('viewer'));

drop policy if exists "Admins can read all events" on public.events;
create policy "Admins can read all events"
  on public.events for select
  using (public.is_admin('viewer'));

drop policy if exists "Admins can read all posts" on public.posts;
create policy "Admins can read all posts"
  on public.posts for select
  using (public.is_admin('viewer'));

drop policy if exists "Admins can read all gallery items" on public.gallery_items;
create policy "Admins can read all gallery items"
  on public.gallery_items for select
  using (public.is_admin('viewer'));

drop policy if exists "Admins can read all testimonials" on public.testimonials;
create policy "Admins can read all testimonials"
  on public.testimonials for select
  using (public.is_admin('viewer'));

drop policy if exists "Admins can read all projects" on public.projects;
create policy "Admins can read all projects"
  on public.projects for select
  using (public.is_admin('viewer'));

drop policy if exists "Admins can read all partners" on public.partners;
create policy "Admins can read all partners"
  on public.partners for select
  using (public.is_admin('viewer'));

drop policy if exists "Admins can read all team members" on public.team_members;
create policy "Admins can read all team members"
  on public.team_members for select
  using (public.is_admin('viewer'));

drop policy if exists "Admins can read all site stats" on public.site_stats;
create policy "Admins can read all site stats"
  on public.site_stats for select
  using (public.is_admin('viewer'));

-- Media storage bucket + policies for program cover/gallery uploads
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read media bucket" on storage.objects;
create policy "Public read media bucket"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Admins upload media" on storage.objects;
create policy "Admins upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin('editor'));

drop policy if exists "Admins update media" on storage.objects;
create policy "Admins update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin('editor'))
  with check (bucket_id = 'media' and public.is_admin('editor'));

drop policy if exists "Admins delete media" on storage.objects;
create policy "Admins delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin('admin'));
