-- ============================================================
-- Mike & Irene's Travel Blog — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  display_name text not null,
  role        text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at  timestamptz default now()
);

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'viewer'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Posts ─────────────────────────────────────────────────────
create table public.posts (
  id              uuid default gen_random_uuid() primary key,
  slug            text unique not null,
  title           text not null,
  content         text not null,
  excerpt         text,
  location        text,
  cover_image_url text,
  author_id       uuid references public.profiles(id) on delete cascade not null,
  published       boolean not null default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index posts_created_at_idx on public.posts(created_at desc);
create index posts_published_idx  on public.posts(published);


-- ── Post images ───────────────────────────────────────────────
create table public.post_images (
  id            uuid default gen_random_uuid() primary key,
  post_id       uuid references public.posts(id) on delete cascade not null,
  image_url     text not null,
  caption       text,
  display_order integer not null default 0,
  created_at    timestamptz default now()
);

create index post_images_post_id_idx on public.post_images(post_id);


-- ── Comments ──────────────────────────────────────────────────
create table public.comments (
  id        uuid default gen_random_uuid() primary key,
  post_id   uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,  -- null = top-level
  content   text not null,
  created_at timestamptz default now()
);

create index comments_post_id_idx    on public.comments(post_id);
create index comments_parent_id_idx  on public.comments(parent_id);


-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.post_images enable row level security;
alter table public.comments    enable row level security;

-- Helper: check if the current user is an admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;


-- profiles policies
create policy "profiles_select_all"   on public.profiles for select using (true);
create policy "profiles_insert_own"   on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own"   on public.profiles for update using (id = auth.uid());

-- posts policies
create policy "posts_select_published" on public.posts for select using (published = true or public.is_admin());
create policy "posts_insert_admin"     on public.posts for insert with check (public.is_admin());
create policy "posts_update_admin"     on public.posts for update using (public.is_admin());
create policy "posts_delete_admin"     on public.posts for delete using (public.is_admin());

-- post_images policies
create policy "post_images_select_all"    on public.post_images for select using (true);
create policy "post_images_insert_admin"  on public.post_images for insert with check (public.is_admin());
create policy "post_images_delete_admin"  on public.post_images for delete using (public.is_admin());

-- comments policies
create policy "comments_select_all"   on public.comments for select using (true);
create policy "comments_insert_auth"  on public.comments for insert with check (auth.uid() is not null);
create policy "comments_delete_own_or_admin" on public.comments for delete
  using (author_id = auth.uid() or public.is_admin());


-- ── Storage bucket ────────────────────────────────────────────
-- Run this after creating the bucket in Supabase Storage UI:
--   Bucket name: post-images
--   Public: yes

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post_images_storage_select" on storage.objects
  for select using (bucket_id = 'post-images');

create policy "post_images_storage_insert" on storage.objects
  for insert with check (bucket_id = 'post-images' and public.is_admin());

create policy "post_images_storage_delete" on storage.objects
  for delete using (bucket_id = 'post-images' and public.is_admin());


-- ── Make yourself admin ───────────────────────────────────────
-- After registering with your email, run this query to make yourself admin:
--
--   update public.profiles set role = 'admin' where id = '<your-user-uuid>';
--
-- Find your UUID in Supabase Dashboard → Authentication → Users
