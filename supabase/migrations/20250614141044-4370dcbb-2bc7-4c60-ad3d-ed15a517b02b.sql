
-- 1. 协作房间表（Collaborate Rooms）
CREATE TABLE public.collab_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- 2. 协作房间成员表
CREATE TABLE public.collab_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.collab_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now()
);

-- 3. 资源共享至房间（多对多关联表）
CREATE TABLE public.collab_room_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.collab_rooms(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES profiles(id),
  shared_at timestamp with time zone DEFAULT now()
);

-- 行级安全：只允许参与房间的成员访问房间内容
ALTER TABLE public.collab_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collab_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collab_room_resources ENABLE ROW LEVEL SECURITY;

-- 可见性：加入房间的成员可以看到对应房间/资源
CREATE POLICY "Room members can select their rooms"
  ON public.collab_rooms
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.collab_room_members m WHERE m.room_id = collab_rooms.id AND m.user_id = auth.uid()
  ) OR owner_id = auth.uid());

CREATE POLICY "Room members can select their room memberships"
  ON public.collab_room_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Room members can select shared resources"
  ON public.collab_room_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collab_room_members m WHERE m.room_id = collab_room_resources.room_id AND m.user_id = auth.uid()
    )
  );

-- 房主或成员可添加/移除自己的协作记录
CREATE POLICY "Room members can insert collab_room_members"
  ON public.collab_room_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Room owner can share resources"
  ON public.collab_room_resources
  FOR INSERT
  WITH CHECK (
    shared_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.collab_room_members m WHERE m.room_id = collab_room_resources.room_id AND m.user_id = auth.uid()
    )
  );

