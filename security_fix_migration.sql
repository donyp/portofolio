-- ============================================================================
-- SECURITY FIX MIGRATION - Portfolio V5
-- Menutup RLS terbuka + menyediakan RPC aman untuk counter (views/likes/rating)
--
-- !! URUTAN EKSEKUSI YANG AMAN (penting) !!
--   1. Supabase Dashboard > Authentication > Users > "Add user"
--      Buat akun admin (email + password kuat).
--      Lalu: Authentication > Sign In / Providers > matikan
--      "Allow new users to sign up" (supaya tidak ada yang bisa daftar sendiri).
--   2. Deploy kode baru (auth login email/password sudah di kode).
--   3. Login ke /admin dengan akun baru, pastikan semua CRUD jalan.
--   4. Jalankan file ini di Supabase Dashboard > SQL Editor.
--   5. Tes ulang fitur publik (komentar, like, views, order) DAN admin CRUD.
--   6. (Opsional) Settings > API > rotasi anon key.
--
-- Catatan: script ini hanya menyentuh tabel yang disebutkan. Jika ada tabel
-- lain di project-mu, tambahkan sendiri dengan pola yang sama.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Tabel daftar admin (defense-in-depth: hanya akun terdaftar yang bisa tulis)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Tabel ini tidak boleh dibaca/ditulis siapa pun via API
CREATE POLICY "admin_users_no_api_access" ON public.admin_users
    FOR ALL USING (false) WITH CHECK (false);

-- Fungsi cek admin (SECURITY DEFINER, aman dari injeksi via API)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Hapus SEMUA policy lama yang terbuka di tabel-tabel ini
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record;
BEGIN
    FOR r IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
            'projects', 'blogs', 'certificates', 'tech_stacks',
            'site_settings', 'testimonials', 'services', 'experiences',
            'activity_logs', 'page_views', 'user_analytics', 'ratings_log',
            'comments', 'portfolio_comments', 'service_orders'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Aktifkan RLS di semua tabel
-- ---------------------------------------------------------------------------
ALTER TABLE public.projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_stacks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders     ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 4. Policy baru
-- Pola:
--   Konten  : SELECT publik, tulis hanya admin terdaftar (is_admin())
--   Analytics: SELECT hanya admin, insert publik dengan validasi
--   Komentar : SELECT + INSERT publik (validasi), UPDATE/DELETE hanya admin
--   Orders   : INSERT publik (validasi), SELECT/UPDATE/DELETE hanya admin
-- ---------------------------------------------------------------------------

-- ===== KONTEN (tulis hanya admin) =====
DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'projects', 'blogs', 'certificates', 'tech_stacks',
        'site_settings', 'testimonials', 'services', 'experiences'
    ]
    LOOP
        EXECUTE format('CREATE POLICY "content_select_public" ON public.%I FOR SELECT USING (true)', t);
        EXECUTE format('CREATE POLICY "content_insert_admin"  ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())', t);
        EXECUTE format('CREATE POLICY "content_update_admin"  ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
        EXECUTE format('CREATE POLICY "content_delete_admin"  ON public.%I FOR DELETE TO authenticated USING (public.is_admin())', t);
    END LOOP;
END $$;

-- ===== ANALYTICS =====
-- page_views: publik boleh insert (tracking), baca hanya admin
CREATE POLICY "page_views_select_admin" ON public.page_views FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "page_views_insert_public" ON public.page_views FOR INSERT WITH CHECK (
    char_length(coalesce(page_path, '')) BETWEEN 1 AND 500
    AND char_length(coalesce(visitor_id, '')) BETWEEN 1 AND 100
);

-- user_analytics: counter publik (tidak ada data sensitif)
CREATE POLICY "user_analytics_select_public" ON public.user_analytics FOR SELECT USING (true);
CREATE POLICY "user_analytics_insert_admin"  ON public.user_analytics FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "user_analytics_update_admin"  ON public.user_analytics FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ratings_log: publik boleh insert rating, baca hanya admin
CREATE POLICY "ratings_log_select_admin" ON public.ratings_log FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "ratings_log_insert_public" ON public.ratings_log FOR INSERT WITH CHECK (
    coalesce(rating, 0) >= 1 AND coalesce(rating, 0) <= 5
);

-- activity_logs: internal admin
CREATE POLICY "activity_logs_select_admin" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "activity_logs_insert_admin" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- ===== KOMENTAR BLOG =====
CREATE POLICY "comments_select_public" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_public" ON public.comments FOR INSERT WITH CHECK (
    char_length(coalesce(content, '')) BETWEEN 1 AND 2000
    AND char_length(coalesce(user_name, '')) BETWEEN 1 AND 60
);
CREATE POLICY "comments_update_admin" ON public.comments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "comments_delete_admin" ON public.comments FOR DELETE TO authenticated USING (public.is_admin());

-- ===== KOMENTAR PORTFOLIO =====
CREATE POLICY "pcomments_select_public" ON public.portfolio_comments FOR SELECT USING (true);
CREATE POLICY "pcomments_insert_public" ON public.portfolio_comments FOR INSERT WITH CHECK (
    coalesce(is_pinned, false) = false
    AND char_length(coalesce(content, '')) BETWEEN 1 AND 1000
    AND char_length(coalesce(user_name, '')) BETWEEN 1 AND 60
);
CREATE POLICY "pcomments_update_admin" ON public.portfolio_comments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "pcomments_delete_admin" ON public.portfolio_comments FOR DELETE TO authenticated USING (public.is_admin());

-- ===== SERVICE ORDERS (PII terlindungi) =====
CREATE POLICY "orders_insert_public" ON public.service_orders FOR INSERT WITH CHECK (
    char_length(coalesce(name, '')) BETWEEN 1 AND 80
    AND char_length(coalesce(contact, '')) BETWEEN 1 AND 100
    AND char_length(coalesce(message, '')) <= 1000
    AND coalesce(status, 'pending') = 'pending'
);
CREATE POLICY "orders_select_admin" ON public.service_orders FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "orders_update_admin" ON public.service_orders FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "orders_delete_admin" ON public.service_orders FOR DELETE TO authenticated USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. RPC aman untuk counter publik (views/likes/rating/click)
--    Parameter p_id pakai TEXT + cast di dalam supaya aman untuk kolom id
--    bertipe bigint maupun uuid (tidak perlu tahu tipe pastinya).
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_project_views(p_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.projects
    SET views = COALESCE(views, 0) + 1
    WHERE id::text = p_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_project_likes(p_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.projects
    SET likes = COALESCE(likes, 0) + 1
    WHERE id::text = p_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_blog_views(p_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.blogs
    SET views = COALESCE(views, 0) + 1
    WHERE id::text = p_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_blog_likes(p_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.blogs
    SET likes = COALESCE(likes, 0) + 1
    WHERE id::text = p_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_click_count(p_action text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.user_analytics
    SET click_count = COALESCE(click_count, 0) + 1
    WHERE action_type = p_action;
$$;

-- Rating: update aggregate + log rating secara atomik
CREATE OR REPLACE FUNCTION public.add_project_rating(p_id text, p_rating int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_rating < 1 OR p_rating > 5 THEN
        RAISE EXCEPTION 'rating harus 1-5';
    END IF;

    UPDATE public.projects
    SET total_ratings = COALESCE(total_ratings, 0) + 1,
        average_rating = ROUND(
            ((COALESCE(average_rating, 0) * COALESCE(total_ratings, 0)) + p_rating)
            / (COALESCE(total_ratings, 0) + 1.0),
            1
        )
    WHERE id::text = p_id;

    INSERT INTO public.ratings_log (project_id, rating, user_session_id)
    SELECT id, p_rating, 'anon'
    FROM public.projects
    WHERE id::text = p_id;
END;
$$;

-- RPC hanya boleh dieksekusi publik, tidak bisa dipanggil dengan hak definer
REVOKE ALL ON FUNCTION public.increment_project_views(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_project_likes(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_blog_views(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_blog_likes(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_click_count(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_project_rating(text, int) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.increment_project_views(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_project_likes(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_views(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_likes(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_click_count(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_project_rating(text, int) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. DAFTARKAN ADMIN
--    Ganti 'PASTE-ADMIN-USER-UUID-DI-SINI' dengan UUID akun admin yang
--    kamu buat di langkah 1 (lihat di Authentication > Users, kolom "User UID").
--    Jalankan baris di bawah SETELAH UUID diisi:
-- ---------------------------------------------------------------------------
-- INSERT INTO public.admin_users (id) VALUES ('PASTE-ADMIN-USER-UUID-DI-SINI')
-- ON CONFLICT (id) DO NOTHING;

COMMIT;
