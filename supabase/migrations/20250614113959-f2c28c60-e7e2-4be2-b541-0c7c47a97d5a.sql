
-- 创建资源分类表
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建资源类型枚举
CREATE TYPE public.resource_type AS ENUM ('courseware', 'video', 'image', 'audio', 'document');

-- 创建资源状态枚举
CREATE TYPE public.resource_status AS ENUM ('draft', 'published', 'archived');

-- 创建用户角色枚举
CREATE TYPE public.user_role AS ENUM ('admin', 'teacher', 'student');

-- 创建用户配置表
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'teacher',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建教学资源表
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  type resource_type NOT NULL,
  status resource_status DEFAULT 'draft',
  category_id UUID REFERENCES public.categories(id),
  file_path TEXT,
  file_size INTEGER,
  file_type TEXT,
  thumbnail_url TEXT,
  download_count INTEGER DEFAULT 0,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建资源标签表
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建资源标签关联表
CREATE TABLE public.resource_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(resource_id, tag_id)
);

-- 创建AI生成历史表
CREATE TABLE public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  generation_type TEXT NOT NULL,
  result_data JSONB,
  resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 启用行级安全策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- profiles表RLS策略
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 资源RLS策略
CREATE POLICY "Users can view published resources" ON public.resources
  FOR SELECT USING (status = 'published' OR owner_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their own resources" ON public.resources
  FOR ALL USING (owner_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- 分类RLS策略（所有用户可读，只有管理员可写）
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage categories" ON public.categories
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 标签RLS策略
CREATE POLICY "Anyone can view tags" ON public.tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create tags" ON public.tags
  FOR INSERT TO authenticated WITH CHECK (true);

-- 资源标签关联RLS策略
CREATE POLICY "Users can view resource tags" ON public.resource_tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Resource owners can manage tags" ON public.resource_tags
  FOR ALL USING (
    resource_id IN (
      SELECT id FROM public.resources 
      WHERE owner_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- AI生成历史RLS策略
CREATE POLICY "Users can view their own AI generations" ON public.ai_generations
  FOR SELECT USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create AI generations" ON public.ai_generations
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- 用户配置文件自动创建触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 插入默认分类数据
INSERT INTO public.categories (name, description) VALUES
  ('计算机科学', '编程、算法、数据结构等计算机相关内容'),
  ('数学', '代数、几何、微积分等数学学科内容'),
  ('物理', '力学、电磁学、热力学等物理学科内容'),
  ('化学', '有机化学、无机化学、分析化学等'),
  ('生物', '细胞生物学、分子生物学、生态学等'),
  ('语言文学', '语文、英语、文学作品分析等'),
  ('历史', '中国历史、世界历史、历史事件分析等'),
  ('地理', '自然地理、人文地理、地图学等');

-- 插入默认标签数据
INSERT INTO public.tags (name, color) VALUES
  ('基础概念', '#3B82F6'),
  ('高级话题', '#8B5CF6'),
  ('实践项目', '#10B981'),
  ('考试重点', '#F59E0B'),
  ('互动演示', '#EF4444'),
  ('视频教程', '#6366F1'),
  ('图表解析', '#14B8A6'),
  ('课堂练习', '#84CC16');

-- 创建存储桶用于文件存储
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('resources', 'resources', true),
  ('avatars', 'avatars', true),
  ('thumbnails', 'thumbnails', true);

-- 创建存储策略
CREATE POLICY "Anyone can view public files" ON storage.objects
  FOR SELECT USING (bucket_id IN ('resources', 'avatars', 'thumbnails'));

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('resources', 'avatars', 'thumbnails'));

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
