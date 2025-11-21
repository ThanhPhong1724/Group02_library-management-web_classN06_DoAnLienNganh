"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaginationBar } from "@/components/shared/pagination";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { DefaultLayout } from "@/components/layout/default-layout";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";

interface Publisher {
  id: number;
  name: string;
  address?: string | null;
  website?: string | null;
  note?: string | null;
}

const PAGE_SIZE = 10;

const fetchPublishers = async (page: number, limit: number): Promise<{ items: Publisher[]; total: number }> => {
  const res = await fetch(`/api/publishers`);
  if (!res.ok) throw new Error("Không thể tải danh sách nhà xuất bản");
  const data = await res.json();
  if (Array.isArray(data)) {
    // Phân trang phía client
    const total = data.length;
    const items = data.slice((page - 1) * limit, page * limit);
    return { items, total };
  } else if (data.items && typeof data.total === 'number') {
    return { items: data.items, total: data.total };
  } else {
    throw new Error("Dữ liệu trả về không hợp lệ");
  }
};

const createPublisher = async (publisher: Omit<Publisher, "id">) => {
  const res = await fetch("/api/publishers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(publisher),
  });
  if (!res.ok) throw new Error("Không thể tạo nhà xuất bản");
  return res.json();
};

const updatePublisher = async (id: number, publisher: Partial<Publisher>) => {
  const res = await fetch(`/api/publishers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(publisher),
  });
  if (!res.ok) throw new Error("Không thể cập nhật nhà xuất bản");
  return res.json();
};

const deletePublisher = async (id: number) => {
  const res = await fetch(`/api/publishers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Không thể xóa nhà xuất bản");
};

export default function AdminPublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editPublisher, setEditPublisher] = useState<Publisher | null>(null);
  const [form, setForm] = useState<Omit<Publisher, "id">>({ name: "", address: "", website: "", note: "" });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublishers(page, 12);
      if (page === 1) {
        setPublishers(data.items);
      } else {
        setPublishers(prev => [...prev, ...data.items]);
      }
      setTotal(data.total);
    } catch (e) {
      setError((e as Error).message);
      setPublishers([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublishers(page, 12);
        if (page === 1) {
          setPublishers(data.items);
        } else {
          setPublishers(prev => [...prev, ...data.items]);
        }
        setTotal(data.total);
      } catch (e) {
        setError((e as Error).message);
        setPublishers([]);
        setTotal(0);
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [page]);

  const handleOpenCreate = () => {
    setEditPublisher(null);
    setForm({ name: "", address: "", website: "", note: "" });
    setShowDialog(true);
  };

  const handleOpenEdit = (pub: Publisher) => {
    setEditPublisher(pub);
    setForm({ name: pub.name, address: pub.address || "", website: pub.website || "", note: pub.note || "" });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editPublisher) {
        await updatePublisher(editPublisher.id, form);
        toast.success("Cập nhật thành công");
      } else {
        await createPublisher(form);
        toast.success("Tạo mới thành công");
      }
      setShowDialog(false);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
      await deletePublisher(id);
      toast.success("Đã xóa");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <DefaultLayout showSidebar={true}>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quản lý Nhà xuất bản</CardTitle>
            </div>
            <Button onClick={handleOpenCreate} size="sm">
              <Plus className="w-4 h-4 mr-2" /> Thêm mới
            </Button>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-600 font-semibold p-4">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishers.map((pub) => (
                    <TableRow key={pub.id}>
                      <TableCell>{pub.id}</TableCell>
                      <TableCell>{pub.name}</TableCell>
                      <TableCell>{pub.address}</TableCell>
                      <TableCell>{pub.website ? <a href={pub.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{pub.website}</a> : ""}</TableCell>
                      <TableCell>{pub.note}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(pub)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(pub.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* Pagination */}
            {!loading && publishers.length < total && (
              <div className="flex justify-end mt-6">
                <Button onClick={() => setPage(prev => prev + 1)}>
                  Xem thêm
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editPublisher ? "Sửa nhà xuất bản" : "Thêm nhà xuất bản"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Tên nhà xuất bản"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <Input
                placeholder="Địa chỉ"
                value={form.address || ""}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />
              <Input
                placeholder="Website"
                value={form.website || ""}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              />
              <Input
                placeholder="Ghi chú"
                value={form.note || ""}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}><X className="w-4 h-4 mr-2" /> Hủy</Button>
                <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Lưu</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DefaultLayout>
  );
}
