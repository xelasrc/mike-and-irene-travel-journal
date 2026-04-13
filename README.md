# Mike & Irene's Great Adventure

A private family travel blog for Mike and Irene's 1.5-month holiday. Friends and family can read posts and leave threaded comments. Built with Next.js 15, Supabase, and Tailwind CSS, deployed on Vercel.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database + Auth | Supabase (PostgreSQL + Auth + Storage) |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel |

## Features

- Daily posts with photos (cover image + full gallery with lightbox)
- Threaded comments with reply chains
- Email/password authentication
- Admin dashboard for Mike & Irene to write, edit, publish, and delete posts
- Mobile-friendly warm travel journal design
- No search engine indexing (private family blog)

---

## Setup guide

### 1. Clone and install

```bash
git clone <your-repo-url>
cd mw-iw-blog
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Once created, go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon / public key**

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your Supabase URL and anon key.

### 4. Run the database schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open `supabase/schema.sql` from this repo
3. Paste the entire contents and click **Run**

This creates all tables, RLS policies, the storage bucket, and the trigger that auto-creates user profiles on signup.

### 5. Make yourself an admin

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/register` and create an account for Mike (use his real email)
3. In Supabase Dashboard → **Authentication → Users**, copy Mike's user UUID
4. Go to **SQL Editor** and run:
   ```sql
   update public.profiles set role = 'admin' where id = '<mike-uuid>';
   ```
5. Do the same for Irene if she wants to post too

Mike can now access `/admin` to write posts.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push this repo to GitHub (public or private)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. In the project settings, add these **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

Vercel auto-deploys on every push to `main`.

---

## How Mike posts

1. Go to `<your-site>/admin` and sign in
2. Click **New post**
3. Fill in the title, location, write the day's update
4. Upload photos (first photo becomes the cover)
5. Click **Publish post** — it goes live immediately
6. Or click **Save as draft** to finish later

---

## Project structure

```
app/
├── page.tsx                    # Home — public post feed
├── posts/[slug]/page.tsx       # Individual post + comments
├── login/page.tsx              # Sign in
├── register/page.tsx           # Create account
├── admin/
│   ├── page.tsx                # Admin dashboard
│   └── posts/
│       ├── new/page.tsx        # Write new post
│       └── [id]/edit/page.tsx  # Edit existing post
├── actions/
│   ├── posts.ts                # Server actions — CRUD posts
│   └── comments.ts             # Server actions — comments
└── api/auth/callback/route.ts  # Supabase email confirmation callback

components/
├── Navbar.tsx          # Sticky nav with auth state
├── PostCard.tsx        # Post card for the feed
├── PhotoGallery.tsx    # Photo grid with lightbox
├── CommentThread.tsx   # Threaded comments + reply forms
└── PostEditor.tsx      # Admin post editor with photo upload

lib/
├── types.ts            # TypeScript interfaces
├── utils.ts            # Helpers (cn, formatDate, buildCommentTree, …)
└── supabase/
    ├── client.ts       # Browser Supabase client
    └── server.ts       # Server Supabase client

supabase/
└── schema.sql          # Full DB schema — run once in Supabase SQL editor
```
