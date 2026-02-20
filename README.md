# Smart Bookmark App

A bookmark manager built using Next.js (App Router) and Supabase.  
Users sign in with Google OAuth, save private bookmarks, and see changes update in real time.

## Live Demo

- **Production URL**: https://smart-bookmark-app-sandy-phi.vercel.app  
- **Auth**: Google OAuth only (no email/password). You can sign in with any Google account.

## How it meets the assignment requirements

1. **Sign up and log in using Google**
   - Implemented with `supabase.auth.signInWithOAuth({ provider: 'google' })`.
   - Uses the hosted Supabase Auth UI flow and stores the session client‑side.
2. **Add a bookmark (URL + title)**
   - Simple form with validation; on submit it inserts into the `bookmarks` table and updates UI optimistically.
3. **Bookmarks are private to each user**
   - All queries filter by `user_id = session.user.id`.
   - Supabase Row Level Security policies (RLS) ensure users can only see and modify their own rows.
4. **Real‑time updates without page refresh**
   - A Supabase realtime channel subscribes to `postgres_changes` on the `bookmarks` table.
   - When a bookmark is inserted/deleted in another tab, the list refetches automatically.
5. **Users can delete their own bookmarks**
   - Each bookmark row has a Delete button which removes the row in Supabase and from local state.
6. **Deployed on Vercel**
   - Production deployment lives at the URL above and is wired to the Supabase project.

## Features

- ✅ Google OAuth authentication (no email/password)
- ✅ Add bookmarks with URL and title
- ✅ Private bookmarks (users can only see their own bookmarks)
- ✅ Real-time updates across multiple tabs
- ✅ Delete bookmarks
- ✅ Responsive UI with Tailwind CSS

## Tech Stack

- **Next.js 16.1.6** (App Router)
- **Supabase** (Auth, Database, Realtime)
- **Tailwind CSS** (Styling)
- **TypeScript**

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Environment Variables

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

### Step 1: Set Environment Variables

Before deploying, make sure to add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Step 2: Configure Supabase Redirect URLs

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Set **Site URL** to your deployed Vercel URL, for example:  
   `https://your-vercel-app.vercel.app`
4. Under **Redirect URLs**, add at least:
   - `https://your-vercel-app.vercel.app`
   - `http://localhost:3000` (for local development)

### Step 3: Deploy

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and deploy

**Important:** 
- Make sure environment variables are set before deploying, otherwise the build will fail.
- Make sure Supabase redirect URLs are configured, otherwise OAuth login will redirect to localhost and fail.

## Problems Encountered and Solutions

### 1. Page Refresh on Adding Bookmarks
**Problem:** When adding a bookmark, the page would refresh instead of updating the UI smoothly.

**Solution:** 
- Wrapped the form inputs in a `<form>` element with `onSubmit` handler
- Added `e.preventDefault()` to prevent default form submission
- Implemented optimistic UI updates by immediately adding the bookmark to state after successful insert

### 2. TypeScript JSX Parsing Error
**Problem:** Got error "Operator '<' cannot be applied to types 'boolean' and 'RegExp'" because the component file was `.ts` instead of `.tsx`.

**Solution:** Renamed `bookmark-app.ts` to `bookmark-app.tsx` to properly handle JSX syntax.

### 3. Bookmarks Not Filtered by User
**Problem:** Initially, all users could see all bookmarks, violating the privacy requirement.

**Solution:** 
- Added `.eq('user_id', user.id)` filter to the `fetchBookmarks()` query
- Added user-specific filter to the realtime subscription: `filter: \`user_id=eq.${user.id}\``

### 4. Google OAuth Auto-Login Issue
**Problem:** After logout, signing in again would automatically use the same Google account without showing account selection.

**Solution:** Added `prompt: 'select_account'` to the OAuth options to force Google to show the account picker every time.

### 5. Realtime Updates Not Working Properly
**Problem:** Realtime subscription was listening to all bookmark changes, not just the current user's.

**Solution:** Added user-specific filter to the realtime subscription so it only listens to changes for the logged-in user's bookmarks.

### 6. OAuth Redirect to Localhost After Deployment
**Problem:** After deploying to Vercel, clicking "Sign in with Google" initially redirected to localhost instead of the Vercel URL, causing "ERR_CONNECTION_REFUSED" error.

**Solution:** 
- Simplified the auth flow to rely on Supabase's built‑in client handling (`detectSessionInUrl`)
- Updated OAuth sign-in to use `redirectTo: origin` so the user returns to the same domain
- Correctly configured **Site URL** and **Redirect URLs** in Supabase to point at the Vercel deployment (and localhost for dev)

## Database Setup

Make sure your Supabase `bookmarks` table has the following structure:

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `url` (text)
- `title` (text)
- `created_at` (timestamp)

Also ensure:
- Row Level Security (RLS) policies are enabled
- Realtime is enabled for the bookmarks table
- Users can only read/insert/delete their own bookmarks
