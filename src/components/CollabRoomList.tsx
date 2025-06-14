
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function CollabRoomList() {
  const { profile } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);

  // 查询本人关联的房间
  const { data: rooms, isLoading: loadingRooms, refetch } = useQuery({
    queryKey: ["collab-myrooms", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      // 本人是 owner 的房间
      const { data: ownRooms } = await supabase
        .from("collab_rooms")
        .select("*")
        .eq("owner_id", profile.id);

      // 本人为成员的房间
      const { data: memberships } = await supabase
        .from("collab_room_members")
        .select("room_id")
        .eq("user_id", profile.id);

      const memberRoomIds: string[] = [
        ...(memberships?.map((m: any) => m.room_id) ?? []),
      ];

      // 合并本人房间和成员房间
      const allRoomIds = Array.from(
        new Set([...(ownRooms?.map((r: any) => r.id) ?? []), ...memberRoomIds])
      );
      if (allRoomIds.length === 0) return [];

      const { data: allRooms } = await supabase
        .from("collab_rooms")
        .select("*")
        .in("id", allRoomIds);

      return allRooms ?? [];
    },
    enabled: !!profile?.id,
  });

  // 查询选中房间的共享资源
  const { data: sharedResources, isLoading: loadingRes } = useQuery({
    queryKey: ["collab-shared-resources", selected],
    queryFn: async () => {
      if (!selected) return [];
      const { data, error } = await supabase
        .from("collab_room_resources")
        .select("*, resources(*, owner_id)")
        .eq("room_id", selected);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selected,
  });

  useEffect(() => {
    if (!selected && rooms && rooms.length > 0) {
      setSelected(rooms[0].id); // 默认选第一个房间
    }
  }, [rooms, selected]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {loadingRooms ? (
          <Loader2 className="animate-spin" />
        ) : rooms && rooms.length > 0 ? (
          rooms.map((r: any) => (
            <button
              key={r.id}
              className={`px-4 py-2 rounded border ${selected === r.id ? "bg-primary text-white" : "bg-accent"}`}
              onClick={() => setSelected(r.id)}
            >
              {r.name}
            </button>
          ))
        ) : (
          <span className="text-gray-400">暂无我的协作房间</span>
        )}
      </div>
      {selected && (
        <div>
          <div className="font-semibold mb-2">房间共享的资源：</div>
          {loadingRes ? (
            <Loader2 className="animate-spin" />
          ) : sharedResources && sharedResources.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {sharedResources.map((r: any) => (
                <Card key={r.id}>
                  <CardHeader>
                    <CardTitle>{r.resources?.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>类型: {r.resources?.type}</div>
                    <div>共享人: {r.shared_by}</div>
                    <div>
                      <a
                        href={r.resources?.file_path || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        打开资源
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-6">当前房间暂无共享资源</div>
          )}
        </div>
      )}
    </div>
  );
}
