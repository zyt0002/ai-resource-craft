
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Plus, Edit, Trash } from "lucide-react";

export default function ResourceCategories() {
  // mock data for placeholder
  const mockCategories = [
    { id: "1", name: "课件", description: "各类课程相关资源" },
    { id: "2", name: "图片", description: "课件配图" },
    { id: "3", name: "视频", description: "教学演示、复习资料" }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">资源分类管理</h2>
        <Button size="sm">
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
            {mockCategories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button size="icon" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive">
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-xs mt-4 text-muted-foreground">（演示数据，后续实现 Supabase 对接与增删改查）</div>
      </div>
    </div>
  );
}
