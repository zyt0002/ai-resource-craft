
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// 示例静态房间和课件
const STATIC_ROOMS = [
  {
    id: "static-1",
    name: "语文扩展课示例",
    resources: [
      {
        id: "s1-1",
        title: "古诗文课程讲义.md",
        type: "document",
        url: "https://static.lovable-cdn.com/s1-demo-1.md",
        owner: "张老师"
      },
      {
        id: "s1-2",
        title: "春江花月夜讲解.pdf",
        type: "document",
        url: "https://static.lovable-cdn.com/s1-demo-2.pdf",
        owner: "张老师"
      },
    ]
  },
  {
    id: "static-2",
    name: "数学思维提升（示例）",
    resources: [
      {
        id: "s2-1",
        title: "趣味几何.pptx",
        type: "document",
        url: "https://static.lovable-cdn.com/s2-demo-1.pptx",
        owner: "王老师"
      },
      {
        id: "s2-2",
        title: "分数运算法宝.docx",
        type: "document",
        url: "https://static.lovable-cdn.com/s2-demo-2.docx",
        owner: "王老师"
      }
    ]
  }
];

export default function CollabRoomList() {
  const { profile } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [useStatic, setUseStatic] = useState(false);

  // 查询所有房间，当前登录用户均可见
  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ["collab-allrooms"],
    queryFn: async () => {
      // 获取所有房间
      const { data: allRooms, error } = await supabase
        .from("collab_rooms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
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
    enabled: !!selected && !!profile?.id && !useStatic, // 静态模式不调接口
  });

  // 打开页面时，根据是否有真实房间决定用静态模式
  useEffect(() => {
    if (!loadingRooms && (!rooms || rooms.length === 0)) {
      setUseStatic(true);
      setSelected(STATIC_ROOMS[0].id); // 用静态第一个
    } else if (rooms && rooms.length > 0) {
      setUseStatic(false);
      if (!selected || STATIC_ROOMS.some(r => r.id === selected)) {
        setSelected(rooms[0].id);
      }
    }
    // eslint-disable-next-line
  }, [loadingRooms, rooms]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {loadingRooms ? (
          <Loader2 className="animate-spin" />
        ) : useStatic ? (
          STATIC_ROOMS.map((r: any) => (
            <button
              key={r.id}
              className={`px-4 py-2 rounded border ${selected === r.id ? "bg-primary text-white" : "bg-accent"}`}
              onClick={() => setSelected(r.id)}
            >
              {r.name}
            </button>
          ))
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
          <span className="text-gray-400">暂无协作房间</span>
        )}
      </div>

      {selected && useStatic ? (
        <div>
          <div className="font-semibold mb-2">房间共享的资源：</div>
          {(() => {
            const room = STATIC_ROOMS.find(r => r.id === selected);
            if (!room || !room.resources || !room.resources.length) {
              return <div className="text-muted-foreground py-6">当前房间暂无共享资源</div>;
            }
            return (
              <div className="grid md:grid-cols-2 gap-4">
                {room.resources.map((r: any) => (
                  <Card key={r.id}>
                    <CardHeader>
                      <CardTitle>{r.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>类型: {r.type}</div>
                      <div>共享人: {r.owner}</div>
                      <div>
                        <a
                          href={r.url}
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
            );
          })()}
        </div>
      ) : selected ? (
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
      ) : null}
    </div>
  );
}
