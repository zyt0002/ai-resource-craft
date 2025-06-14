
-- 1. 新建平台配置表
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. 启用 RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 3. 允许管理员和教师/认证用户 select
CREATE POLICY "Everyone can view platform settings"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. 仅管理员可 insert/update
CREATE POLICY "Only admin can insert platform settings"
  ON public.platform_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admin can update platform settings"
  ON public.platform_settings
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

