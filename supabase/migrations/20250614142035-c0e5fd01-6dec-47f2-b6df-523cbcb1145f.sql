
-- ========== 1. 修改 collab_rooms RLS 策略，所有认证用户均可 SELECT/浏览房间 =============
DROP POLICY IF EXISTS "Room members can select their rooms" ON public.collab_rooms;

CREATE POLICY "All users can select rooms"
  ON public.collab_rooms
  FOR SELECT
  TO authenticated
  USING (true);

-- ========== 2. 其它相关策略无需更改，保持当前 insert/update/delete 防护 ===============
