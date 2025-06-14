
-- 创建名称为 user-uploads 的公开 bucket
insert into storage.buckets (id, name, public)
values ('user-uploads', 'user-uploads', true)
on conflict (id) do nothing;

-- 给 bucket 配置开放的权限策略，允许所有对象对所有人公开可读
create policy "public read for user-uploads"
on storage.objects
for select
using (bucket_id = 'user-uploads');

-- 允许认证用户上传文件到 user-uploads bucket
create policy "authenticated write for user-uploads"
on storage.objects
for insert
with check (bucket_id = 'user-uploads' and auth.role() = 'authenticated');

-- 允许用户删除自己上传的文件
create policy "authenticated delete for user-uploads"
on storage.objects
for delete
using (bucket_id = 'user-uploads' and auth.uid() = owner);
