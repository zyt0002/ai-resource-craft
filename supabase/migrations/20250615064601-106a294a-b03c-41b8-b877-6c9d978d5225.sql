
-- 首先检查并创建中文文本搜索配置（如果不存在则使用simple）
DO $$
BEGIN
    -- 尝试创建简化的中文搜索配置
    IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'chinese_simple') THEN
        -- 如果没有中文配置，创建一个基于simple的配置
        CREATE TEXT SEARCH CONFIGURATION chinese_simple (COPY = simple);
    END IF;
EXCEPTION
    WHEN others THEN
        -- 如果创建失败，忽略错误，后面会使用simple配置
        NULL;
END $$;

-- 创建知识库文章表（使用适当的文本搜索配置）
CREATE TABLE public.knowledge_base_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  category TEXT,
  source_type TEXT DEFAULT 'manual', -- manual, file_upload, web_crawl
  source_url TEXT,
  file_path TEXT,
  file_type TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active', -- active, archived, draft
  view_count INTEGER DEFAULT 0,
  -- 全文检索相关字段（使用simple配置以确保兼容性）
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'C')
  ) STORED
);

-- 创建全文检索索引
CREATE INDEX idx_knowledge_base_search ON public.knowledge_base_articles USING gin(search_vector);

-- 创建其他常用索引
CREATE INDEX idx_knowledge_base_created_by ON public.knowledge_base_articles(created_by);
CREATE INDEX idx_knowledge_base_status ON public.knowledge_base_articles(status);
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base_articles(category);
CREATE INDEX idx_knowledge_base_created_at ON public.knowledge_base_articles(created_at DESC);

-- 启用行级安全策略
ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 所有用户可以查看active状态的文章
CREATE POLICY "Anyone can view active articles" 
  ON public.knowledge_base_articles 
  FOR SELECT 
  USING (status = 'active');

-- 创建RLS策略 - 用户可以管理自己创建的文章
CREATE POLICY "Users can manage their own articles" 
  ON public.knowledge_base_articles 
  FOR ALL 
  USING (auth.uid() = created_by);

-- 创建RLS策略 - 管理员可以管理所有文章
CREATE POLICY "Admins can manage all articles" 
  ON public.knowledge_base_articles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 创建触发器来自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_base_articles_updated_at 
  BEFORE UPDATE ON public.knowledge_base_articles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
