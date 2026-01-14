-- =====================================================
-- Supabase Manual Restore Script  
-- Resume Guru Database Schema
-- =====================================================
--
-- Instructions:
-- 1. Create a new Supabase project
-- 2. Go to SQL Editor in your Supabase Dashboard
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" to execute
-- 5. Wait for completion (should take ~10 seconds)
--
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'premium');

-- =====================================================
-- PUBLIC TABLES
-- =====================================================

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    memory_data jsonb,
    status text DEFAULT 'active'::text,
    resume_html text,
    progress_data jsonb,
    ui_options jsonb,
    PRIMARY KEY (id),
    CONSTRAINT status_values CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'completed'::text, 'expired'::text])))
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    session_id text NOT NULL,
    content text NOT NULL,
    sender character varying(10) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    PRIMARY KEY (id),
    CONSTRAINT chat_messages_sender_check CHECK (((sender)::text = ANY (ARRAY[('ai'::character varying)::text, ('user'::character varying)::text])))
);

-- Downloads table
CREATE TABLE IF NOT EXISTS public.downloads (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    resume_name text,
    format text DEFAULT 'pdf'::text,
    resume_html text,
    PRIMARY KEY (id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier public.subscription_tier DEFAULT 'free'::public.subscription_tier,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone,
    stripe_subscription_id text,
    stripe_customer_id text,
    PRIMARY KEY (id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON public.chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" 
    ON public.chat_sessions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions" 
    ON public.chat_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" 
    ON public.chat_sessions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" 
    ON public.chat_sessions FOR DELETE 
    USING (auth.uid() = user_id);

-- Chat messages policies (anyone can read messages from their sessions)
CREATE POLICY "Users can view messages from own sessions" 
    ON public.chat_messages FOR SELECT 
    USING (
        session_id IN (
            SELECT session_id FROM public.chat_sessions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to own sessions" 
    ON public.chat_messages FOR INSERT 
    WITH CHECK (
        session_id IN (
            SELECT session_id FROM public.chat_sessions 
            WHERE user_id = auth.uid()
        )
    );

-- Downloads policies
CREATE POLICY "Users can view own downloads" 
    ON public.downloads FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own downloads" 
    ON public.downloads FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" 
    ON public.subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" 
    ON public.subscriptions FOR UPDATE 
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Create default free subscription
    INSERT INTO public.subscriptions (user_id, tier, active)
    VALUES (NEW.id, 'free', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check download limits
CREATE OR REPLACE FUNCTION public.check_download_limit(user_id uuid)
RETURNS boolean AS $$
DECLARE
    user_tier public.subscription_tier;
    download_count integer;
BEGIN
    -- Get user's subscription tier
    SELECT tier INTO user_tier
    FROM public.subscriptions
    WHERE subscriptions.user_id = check_download_limit.user_id
    AND active = true
    LIMIT 1;
    
    -- If no subscription found, default to free
    IF user_tier IS NULL THEN
        user_tier := 'free';
    END IF;
    
    -- Count downloads in last 30 days
    SELECT COUNT(*) INTO download_count
    FROM public.downloads
    WHERE downloads.user_id = check_download_limit.user_id
    AND created_at > NOW() - INTERVAL '30 days';
    
    -- Check limits based on tier
    CASE user_tier
        WHEN 'free' THEN
            RETURN download_count < 5;
        WHEN 'pro' THEN
            RETURN download_count < 50;
        WHEN 'premium' THEN
            RETURN true; -- unlimited
        ELSE
            RETURN download_count < 5;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining downloads
CREATE OR REPLACE FUNCTION public.get_remaining_downloads(user_id uuid)
RETURNS integer AS $$
DECLARE
    user_tier public.subscription_tier;
    download_count integer;
    max_downloads integer;
BEGIN
    -- Get user's subscription tier
    SELECT tier INTO user_tier
    FROM public.subscriptions
    WHERE subscriptions.user_id = get_remaining_downloads.user_id
    AND active = true
    LIMIT 1;
    
    -- If no subscription found, default to free
    IF user_tier IS NULL THEN
        user_tier := 'free';
    END IF;
    
    -- Count downloads in last 30 days
    SELECT COUNT(*) INTO download_count
    FROM public.downloads
    WHERE downloads.user_id = get_remaining_downloads.user_id
    AND created_at > NOW() - INTERVAL '30 days';
    
    -- Set max based on tier
    CASE user_tier
        WHEN 'free' THEN
            max_downloads := 5;
        WHEN 'pro' THEN
            max_downloads := 50;
        WHEN 'premium' THEN
            RETURN -1; -- unlimited
        ELSE
            max_downloads := 5;
    END CASE;
    
    RETURN GREATEST(0, max_downloads - download_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant access to service role (for admin operations)
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- COMPLETION
-- =====================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database restoration completed successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your .env files with new Supabase credentials';
    RAISE NOTICE '2. Test authentication by creating a new account';
    RAISE NOTICE '3. Verify all features work correctly';
END $$;
