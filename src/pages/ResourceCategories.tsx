
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Plus, Edit, Trash, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ResourceCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 分类列表
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 新建分类对话框
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const createMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string, description: string }) => {
      const { error } = await supabase.from("categories").insert({ name, description });
      if (error) throw error;
    },
    onSuccess: () => {
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "成功", description: "分类已创建", variant: "default" });
    },
    onError: err => {
      toast({ title: "创建失败", description: (err as Error).message, variant: "destructive" });
    }
  });

  // 删除分类
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "成功", description: "分类已删除", variant: "default" });
    },
    onError: err => {
      toast({ title: "删除失败", description: (err as Error).message, variant: "destructive" });
    }
  });

  // 编辑分类（基础实现，简单文本编辑）
  const [editing, setEditing] = useState<{ id: string, name: string, description: string } | null>(null);
  const editMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: string, name: string, description: string }) => {
      const { error } = await supabase.from("categories").update({ name, description }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "成功", description: "分类已更新", variant: "default" });
    },
    onError: err => {
      toast({ title: "更新失败", description: (err as Error).message, variant: "destructive" });
    }
  });

  return (
    <div className="w-full max-w-3xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">资源分类管理</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          新建分类
        </Button>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">分类名</TableHead>
              <TableHead className="w-64">描述</TableHead>
              <TableHead className="w-24 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin mr-1 inline" /> 加载中...
                </TableCell>
              </TableRow>
            ) : categories && categories.length > 0 ? (
              categories.map((cat: any) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.description}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button size="icon" variant="outline" onClick={() => setEditing(cat)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => setDeletingId(cat.id)}
                      disabled={deletingId === cat.id && deleteMutation.isPending}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // 占位符：无数据时展示一条静态
              <TableRow>
                <TableCell>课件</TableCell>
                <TableCell>各类课程相关资源</TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="text-xs mt-4 text-muted-foreground">（仅管理员可操作真实分类，普通用户只读）</div>
      </div>
      {/* 新建分类对话框 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建分类</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="分类名"
            className="mb-2"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <Input
            placeholder="描述"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
          />
          <DialogFooter>
            <Button
              onClick={() => createMutation.mutate({ name: newName, description: newDesc })}
              disabled={!newName || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "创建"}
            </Button>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={createMutation.isPending}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 删除确认 */}
      <Dialog open={!!deletingId} onOpenChange={open => { if (!open) setDeletingId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确定删除该分类？</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              variant="destructive"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "确认删除"}
            </Button>
            <Button variant="ghost" onClick={() => setDeletingId(null)} disabled={deleteMutation.isPending}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 编辑对话框 */}
      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="分类名"
            value={editing?.name ?? ""}
            className="mb-2"
            onChange={e => setEditing(editing ? { ...editing, name: e.target.value } : null)}
          />
          <Input
            placeholder="描述"
            value={editing?.description ?? ""}
            onChange={e => setEditing(editing ? { ...editing, description: e.target.value } : null)}
          />
          <DialogFooter>
            <Button
              onClick={() => editing && editMutation.mutate(editing)}
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "保存"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={editMutation.isPending}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
