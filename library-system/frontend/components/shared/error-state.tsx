"use client";
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <MessageCircle className="h-8 w-8 text-destructive" aria-hidden />
      <p className="font-medium text-destructive">Đã xảy ra lỗi</p> 
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} aria-label="Thử lại">Thử lại</Button>
      ) : null}
    </div>
  );
}


