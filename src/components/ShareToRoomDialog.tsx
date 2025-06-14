import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function ShareToRoomDialog({
  open,
  onOpenChange,
  resourceId,
  onShared,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  resourceId: string;
  onShared?: () => void;
}) {
  const { profile } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);

  // 拉取我的所有协作房间（我是成员或房主）
  const { data: myRooms, isLoading } = useQuery({
    queryKey: ["my-collab-rooms", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      // 取参与的房间
      const { data: member, error: memErr } = await supabase
        .from("collab_room_members")
        .select("room_id")
        .eq("user_id", profile.id);

      const roomIds: string[] = [...new Set(member?.map((m: any) => m.room_id) ?? [])];
      // 取本人是房主的房间
      const { data: owner, error: ownErr } = await supabase
        .from("collab_rooms")
        .select("id")
        .eq("owner_id", profile.id);

      const combinedRoomIds = Array.from(new Set([
        ...roomIds,
        ...(owner?.map((r: any) => r.id) ?? []),
      ]));
      if (combinedRoomIds.length === 0) return [];
      // 拉房间详情
      const { data: rooms, error } = await supabase
        .from("collab_rooms")
        .select("*")
        .in("id", combinedRoomIds);

      if (error || memErr || ownErr) throw error || memErr || ownErr;
      return rooms || [];
    },
    enabled: !!profile?.id && open,
  });

  const { mutate: shareResource, isPending: isSharing } = useMutation({
    mutationFn: async () => {
      if (!roomId || !resourceId || !profile?.id) return false;
      const { error } = await supabase.from("collab_room_resources").insert({
        room_id: roomId,
        resource_id: resourceId,
        shared_by: profile.id,
      });
      if (error) {
        throw new Error(error.message);
      }
      return true;
    },
    onSuccess: () => {
      toast({ title: "资源已共享到协作房间!", description: "该资源已可在协作房间中访问。" });
      onOpenChange(false);
      setRoomId(null);
      onShared?.();
    },
    onError: (err: any) => {
      toast({ title: "共享失败", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>选择房间共享资源</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Select
            value={roomId ?? ""}
            onValueChange={setRoomId}
            disabled={isLoading || isSharing}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "加载中..." : "请选择房间"} />
            </SelectTrigger>
            <SelectContent>
              {myRooms && myRooms.length > 0 ? (
                myRooms.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  暂无协作房间
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSharing}>取消</Button>
          <Button onClick={() => shareResource()} disabled={!roomId || isSharing}>
            {isSharing ? "正在共享..." : "确认共享"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
