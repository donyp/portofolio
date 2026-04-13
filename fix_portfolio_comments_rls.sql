-- Fix Row Level Security (RLS) for portfolio_comments table
-- Ensure RLS is enabled
ALTER TABLE "public"."portfolio_comments" ENABLE ROW LEVEL SECURITY;

-- Drop existing if any
DROP POLICY IF EXISTS "Enable all access for all users" ON "public"."portfolio_comments";

-- Create Policies (Same as service_orders for consistency)
CREATE POLICY "Enable all access for all users" ON "public"."portfolio_comments" 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Explicitly allow Update and Delete
DROP POLICY IF EXISTS "Enable update" ON "public"."portfolio_comments";
DROP POLICY IF EXISTS "Enable delete" ON "public"."portfolio_comments";

CREATE POLICY "Enable update" ON "public"."portfolio_comments" FOR UPDATE USING (true);
CREATE POLICY "Enable delete" ON "public"."portfolio_comments" FOR DELETE USING (true);
CREATE POLICY "Enable select" ON "public"."portfolio_comments" FOR SELECT USING (true);
CREATE POLICY "Enable insert" ON "public"."portfolio_comments" FOR INSERT WITH CHECK (true);
