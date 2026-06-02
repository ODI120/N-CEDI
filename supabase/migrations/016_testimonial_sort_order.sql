-- Add sort order support to testimonials for admin ordering and homepage display
alter table if exists testimonials add column if not exists sort_order integer default 0 not null;
