-- Drop table if it exists
DROP TABLE IF EXISTS "public"."comments";

-- Create comments table
CREATE TABLE "public"."comments" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blog_id INT8 NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Self-referencing for replies
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public access since authorization is handled by App Passcode)
CREATE POLICY "Enable public read access" ON "public"."comments" FOR SELECT USING (true);
CREATE POLICY "Enable public insert access" ON "public"."comments" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public delete access" ON "public"."comments" FOR DELETE USING (true);
CREATE POLICY "Enable public update access" ON "public"."comments" FOR UPDATE USING (true);
