# Cloud Storage Setup (Supabase)

To enable cloud storage for your flashcards, follow these steps:

## 1. Create a Supabase Project
Go to [supabase.com](https://supabase.com) and create a new project.

## 2. SQL Schema
Run the following SQL in the **SQL Editor** of your Supabase dashboard:

```sql
-- Create table for flashcard progress
CREATE TABLE IF NOT EXISTS public.flashcard_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    char TEXT NOT NULL,
    bucket INTEGER NOT NULL DEFAULT 0,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure user can only have one progress record per character
    UNIQUE(user_id, char)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.flashcard_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (Simplified for kid-friendly usage)
-- In a real app, you would use auth.uid() here.
CREATE POLICY "Public access for default user" 
ON public.flashcard_progress 
FOR ALL 
USING (true) 
WITH CHECK (true);
```

## 3. Environment Variables
Create a `.env.local` file in the root of your project and add your Supabase credentials:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these in **Project Settings > API**.

## 4. Current Progress
- `localStorage` has been replaced with `@supabase/supabase-js`.
- The app now syncs character progress (bucket, last seen) to the cloud.
- `src/lib/supabase.ts` contains the client initialization.
- `src/hooks/useSpacedRepetition.ts` handles the cloud fetch/upsert logic.
