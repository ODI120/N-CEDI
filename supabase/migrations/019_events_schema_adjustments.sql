-- Migration 019: Adjust events schema to simplify fields and add gallery URLs

-- Drop unnecessary columns from public.events
ALTER TABLE public.events 
  DROP COLUMN IF EXISTS starts_at,
  DROP COLUMN IF EXISTS ends_at,
  DROP COLUMN IF EXISTS capacity,
  DROP COLUMN IF EXISTS registration_url,
  DROP COLUMN IF EXISTS is_virtual,
  DROP COLUMN IF EXISTS meeting_url,
  DROP COLUMN IF EXISTS event_type;

-- Add gallery_urls text[] column for storing image paths from the media bucket
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}'::text[] NOT NULL;

-- Drop the index idx_events_starts_at since the starts_at column is dropped
DROP INDEX IF EXISTS idx_events_starts_at;

-- Create index on created_at for optimal event list querying
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
