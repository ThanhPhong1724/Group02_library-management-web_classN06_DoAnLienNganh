"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  showItemCount?: boolean;
  className?: string;
  scrollToTop?: boolean;
}

export function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = "mục",
  showItemCount = true,
  className,
  scrollToTop = true,
}: AppPaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= (itemsPerPage || 10))) {
    // If totalPages is 1 and all items fit in 1 page, don't display pagination controls unless item count is desired
    if (!showItemCount || !totalItems) return null;
  }

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    if (scrollToTop && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers with ellipses
  const getPageNumbers = (): (number | "ellipsis-left" | "ellipsis-right")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [];

    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("ellipsis-right");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("ellipsis-left");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis-left");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("ellipsis-right");
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  // Calculate range displayed (e.g. 1 - 20)
  let startItem = 1;
  let endItem = totalItems || 0;
  if (totalItems !== undefined && itemsPerPage !== undefined) {
    startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    endItem = Math.min(currentPage * itemsPerPage, totalItems);
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full select-none",
        className
      )}
    >
      {/* Item summary counter */}
      {showItemCount && totalItems !== undefined ? (
        <div className="text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
          Hiển thị{" "}
          <span className="font-semibold text-foreground">
            {totalItems > 0 ? startItem : 0}
          </span>{" "}
          -{" "}
          <span className="font-semibold text-foreground">{endItem}</span> trong{" "}
          <span className="font-semibold text-foreground">{totalItems}</span>{" "}
          {itemName}{" "}
          <span className="hidden md:inline">
            (Trang {currentPage}/{totalPages || 1})
          </span>
        </div>
      ) : (
        <div className="order-2 sm:order-1 text-sm text-muted-foreground">
          Trang {currentPage} / {totalPages || 1}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav
          role="navigation"
          aria-label="Phân trang"
          className="order-1 sm:order-2 flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center"
        >
          {/* Previous Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-9 px-2.5 sm:px-3 text-sm flex items-center gap-1 font-medium transition-all"
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Trước</span>
          </Button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === "ellipsis-left" || p === "ellipsis-right") {
                return (
                  <span
                    key={`${p}-${idx}`}
                    className="flex h-9 w-8 items-center justify-center text-muted-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <Button
                  key={p}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(p)}
                  className={cn(
                    "h-9 w-9 p-0 text-sm font-semibold transition-all",
                    isCurrent
                      ? "shadow-sm pointer-events-none"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {p}
                </Button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-9 px-2.5 sm:px-3 text-sm flex items-center gap-1 font-medium transition-all"
            aria-label="Trang sau"
          >
            <span className="hidden sm:inline">Sau</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
