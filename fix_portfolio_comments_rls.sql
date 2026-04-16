-- Fix Row Level Security (RLS) for portfolio_comments table
-- Ensure RLS is enabled
ALTER TABLE "public"."portfolio_comments" ENABLE ROW LEVEL SECURITY;

-- Drop existing if any
DROP POLICY IF EXISTS "Enable all access for all users" ON "public"."portfolio_comments";
DROP POLICY IF EXISTS "Enable update" ON "public"."portfolio_comments";
DROP POLICY IF EXISTS "Enable delete" ON "public"."portfolio_comments";
DROP POLICY IF EXISTS "Enable select" ON "public"."portfolio_comments";
DROP POLICY IF EXISTS "Enable insert" ON "public"."portfolio_comments";

-- Create Policies
-- Allow anyone to read comments
CREATE POLICY "Enable select for all" ON "public"."portfolio_comments" FOR SELECT USING (true);

-- Allow anyone to insert (public feedback)
-- In a real prod environment, you might want to add a captcha check via an edge function
CREATE POLICY "Enable insert for all" ON "public"."portfolio_comments" FOR INSERT WITH CHECK (true);

-- ONLY allow owner/authenticated users to update/delete (Security fix)
-- Note: Replace 'auth.uid() = ...' with actual admin check if using Supabase Auth
-- For now, we block public update/delete by using false or requiring authentication
CREATE POLICY "Restrict update to authenticated" ON "public"."portfolio_comments" FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Restrict delete to authenticated" ON "public"."portfolio_comments" FOR DELETE TO authenticated USING (true);
