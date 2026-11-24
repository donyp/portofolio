-- Fix Row Level Security (RLS) for service_orders table
-- Ensure RLS is enabled
ALTER TABLE "public"."service_orders" ENABLE ROW LEVEL SECURITY;

-- Allow public access (handled by App Passcode) for all operations
-- NOTE: In a strictly private app, you might want to use Supabase Auth,
-- but since this app uses its own passcode system, we'll keep it consistent with other tables.

-- Drop existing if any
DROP POLICY IF EXISTS "Enable all access for all users" ON "public"."service_orders";

-- Create Policies
CREATE POLICY "Enable all access for all users" ON "public"."service_orders" 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Explicitly allow Update and Delete if the 'ALL' policy is not enough for some environments
-- (This is more of a safety measure)
DROP POLICY IF EXISTS "Enable update" ON "public"."service_orders";
DROP POLICY IF EXISTS "Enable delete" ON "public"."service_orders";

CREATE POLICY "Enable update" ON "public"."service_orders" FOR UPDATE USING (true);
CREATE POLICY "Enable delete" ON "public"."service_orders" FOR DELETE USING (true);
CREATE POLICY "Enable select" ON "public"."service_orders" FOR SELECT USING (true);
CREATE POLICY "Enable insert" ON "public"."service_orders" FOR INSERT WITH CHECK (true);
