-- Initial N-CEDI Schema Migration
-- Enables uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. categories Table
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  category_type text not null check (category_type in ('blog', 'gallery', 'event', 'program')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. team_members Table
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  bio text,
  avatar_url text,
  email text,
  linkedin_url text,
  display_order integer default 0 not null,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. programs Table
create table if not exists programs (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text not null,
  overview text,
  lab_experience text,
  requirements text,
  body jsonb, -- rich text block array
  outcomes text[] default '{}'::text[] not null,
  duration_weeks integer default 12 not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  is_featured boolean default false not null,
  is_published boolean default true not null,
  cover_image_url text not null,
  gallery_urls text[] default '{}'::text[] not null,
  meta_title text,
  meta_description text,
  category_id uuid references categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. events Table
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  description text not null,
  body jsonb, -- rich text block array
  event_type text not null check (event_type in ('workshop', 'seminar', 'exhibition', 'competition', 'open_day')),
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone,
  location text,
  is_virtual boolean default false not null,
  meeting_url text,
  cover_image_url text not null,
  capacity integer,
  registration_url text,
  is_published boolean default true not null,
  meta_title text,
  meta_description text,
  category_id uuid references categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. posts Table
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  body jsonb, -- rich text block array
  author_id uuid references team_members(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  cover_image_url text not null,
  read_time_minutes integer default 5 not null,
  is_featured boolean default false not null,
  is_published boolean default true not null,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null,
  meta_title text,
  meta_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. testimonials Table
create table if not exists testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  organization text,
  quote text not null,
  avatar_url text,
  program_id uuid references programs(id) on delete set null,
  rating integer default 5 not null check (rating >= 1 and rating <= 5),
  is_featured boolean default false not null,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. projects Table
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  description text not null,
  student_name text not null,
  program_id uuid references programs(id) on delete cascade not null,
  media_urls text[] default '{}'::text[] not null,
  tags text[] default '{}'::text[] not null,
  year integer not null,
  is_featured boolean default false not null,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. partners Table
create table if not exists partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website_url text,
  logo_url text not null,
  tier text not null check (tier in ('platinum', 'gold', 'silver', 'community')),
  is_active boolean default true not null,
  display_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. gallery_items Table
create table if not exists gallery_items (
  id uuid primary key default uuid_generate_v4(),
  title text,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  alt_text text,
  category_id uuid references categories(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  program_id uuid references programs(id) on delete set null,
  is_published boolean default true not null,
  display_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. inquiries Table
create table if not exists inquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  type text not null check (type in ('general', 'partnership', 'enrollment', 'media')),
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies Setup (Row Level Security)
alter table categories enable row level security;
alter table team_members enable row level security;
alter table programs enable row level security;
alter table events enable row level security;
alter table posts enable row level security;
alter table testimonials enable row level security;
alter table projects enable row level security;
alter table partners enable row level security;
alter table gallery_items enable row level security;
alter table inquiries enable row level security;

-- Public Read access policies for published items
create policy "Allow public read access on categories" on categories for select using (true);
create policy "Allow public read access on published team members" on team_members for select using (is_published = true);
create policy "Allow public read access on published programs" on programs for select using (is_published = true);
create policy "Allow public read access on published events" on events for select using (is_published = true);
create policy "Allow public read access on published posts" on posts for select using (is_published = true);
create policy "Allow public read access on published testimonials" on testimonials for select using (is_published = true);
create policy "Allow public read access on published projects" on projects for select using (is_published = true);
create policy "Allow public read access on active partners" on partners for select using (is_active = true);
create policy "Allow public read access on published gallery items" on gallery_items for select using (is_published = true);

-- Inquiries write access (anyone can submit an inquiry)
create policy "Allow anyone to insert inquiries" on inquiries for insert with check (true);

-- Indexes for performance
create index idx_categories_type on categories(category_type);
create index idx_programs_slug on programs(slug);
create index idx_events_slug on events(slug);
create index idx_posts_slug on posts(slug);
create index idx_projects_slug on projects(slug);
create index idx_team_display_order on team_members(display_order);
create index idx_partners_display_order on partners(display_order);
create index idx_gallery_display_order on gallery_items(display_order);
create index idx_posts_published_at on posts(published_at desc);
create index idx_events_starts_at on events(starts_at desc);
