
import { Button } from "@/components/ui/button";
import { Users, Link2, Share2 } from "lucide-react";

export default function Collaborate() {
  const mockRooms = [
    { id: "r1", name: "课件同步编辑", members: ["Alice", "Bob"] },
    { id: "r2", name: "资源审核小组", members: ["Tom", "Eva", "Mike"] }
  ];
  return (
    <div className="w-full max-w-3xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">实时协作房间</h2>
        <Button size="sm">
          <Users className="w-4 h-4 mr-1" />
          新建协作房间
        </Button>
      </div>
      <div className="space-y-6">
        {mockRooms.map(room => (
          <div key={room.id} className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg">{room.name}</div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" title="共享链接">
                  <Link2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" title="邀请成员">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap text-sm text-muted-foreground">
              成员:
              {room.members.map(m => (
                <span className="px-2 py-0.5 rounded bg-secondary" key={m}>{m}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs mt-8 text-muted-foreground">（演示房间，后续将对接 Supabase Realtime，支持在线协作与成员管理）</div>
    </div>
  );
}
