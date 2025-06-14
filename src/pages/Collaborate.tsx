import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import CollabRoomList from "@/components/CollabRoomList";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function Collaborate() {
  const { profile } = useAuth();
  const [creating, setCreating] = useState(false);
  const [roomName, setRoomName] = useState("");

  async function handleCreateRoom() {
    if (!roomName.trim()) {
      toast({ title: "请输入房间名称" });
      return;
    }
    setCreating(true);
    const { data, error } = await supabase.from("collab_rooms").insert({
      name: roomName,
      owner_id: profile?.id,
    }).select();
    setCreating(false);
    if (error) {
      toast({ title: "房间创建失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "创建成功", description: "新协作房间已创建" });
      setRoomName("");
      // 自动加入创建者为成员
      if (data && data[0]) {
        await supabase.from("collab_room_members").insert({
          room_id: data[0].id,
          user_id: profile?.id,
        });
      }
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">实时协作房间</h2>
        <div className="flex items-center gap-2">
          <input
            className="border rounded-md px-3 py-1 mr-2"
            type="text"
            placeholder="新协作房间名"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            disabled={creating}
            style={{ minWidth: 120 }}
          />
          <Button size="sm" onClick={handleCreateRoom} disabled={creating || !profile?.id}>
            <Plus className="w-4 h-4 mr-1" />
            创建房间
          </Button>
        </div>
      </div>
      <CollabRoomList />
      <div className="text-xs mt-8 text-muted-foreground">（支持所有用户，您可以新建协作房间，或将资源共享到房间。）</div>
    </div>
  );
}
