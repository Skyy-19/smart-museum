create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text,
  description text,
  category text,
  period text,
  origin text,
  material text,
  condition text,
  image_url text,
  views int default 0,
  created_at timestamptz default now()
);

create table if not exists quiz (
  id uuid primary key default gen_random_uuid(),
  item_slug text not null,
  question text not null,
  options text[] not null,
  correct_answer text not null,
  created_at timestamptz default now()
);

create table if not exists user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  item_slug text,
  activity_type text,
  score int,
  created_at timestamptz default now()
);

create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  item_slug text,
  created_at timestamptz default now()
);
