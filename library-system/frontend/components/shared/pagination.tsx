"use client";
import React from 'react';
import { Button } from '@/components/ui/button';

type PaginationProps = {
  page: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

export function PaginationBar({ page, onPrev, onNext, className }: PaginationProps) {
  return (
    <div className={`flex items-center justify-between text-xs text-muted-foreground ${className ?? ''}`.trim()}>
      <div>Trang {page}</div>
      <div className="space-x-1">
        <Button variant="outline" size="sm" onClick={onPrev} aria-label="Trang trước">Trước</Button>
        <Button variant="outline" size="sm" onClick={onNext} aria-label="Trang sau">Sau</Button>
      </div>
    </div>
  );
}


