import React, { useEffect, useState, useMemo, FormEvent } from 'react';

interface PaginatorProps {
  pages: number; // Total number of pages
  currentPage: number; // Current active page
  onPageClick: (page: number) => void; // Callback to handle page changes
  maxVisiblePages?: number; // Optional: Max number of page buttons to show (default: 3)
}

export default function Paginator({
  pages,
  currentPage,
  onPageClick,
  maxVisiblePages = 3,
}: PaginatorProps): React.ReactElement {
  const [pagesToShow, setPagesToShow] = useState<number[]>([]);
  const [inputPage, setInputPage] = useState<string>(''); // State for input field

  // Validate props
  const totalPages = Math.max(1, Math.floor(pages)); // Ensure at least 1 page
  const activePage = Math.min(Math.max(1, currentPage), totalPages); // Clamp currentPage between 1 and totalPages

  // Calculate visible pages with ellipsis
  const calculatePages = useMemo(() => {
    const visiblePages: (number | string)[] = [];
    const half = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
    } else {
      let start = Math.max(1, activePage - half);
      let end = Math.min(totalPages, activePage + half);

      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) end = maxVisiblePages;
        else if (end === totalPages) start = totalPages - maxVisiblePages + 1;
      }

      for (let i = start; i <= end; i++) visiblePages.push(i);

      if (start > 2) {
        visiblePages.unshift('…');
        visiblePages.unshift(1);
      } else if (start === 2) {
        visiblePages.unshift(1);
      }

      if (end < totalPages - 1) {
        visiblePages.push('…');
        visiblePages.push(totalPages);
      } else if (end === totalPages - 1) {
        visiblePages.push(totalPages);
      }
    }

    return visiblePages;
  }, [totalPages, activePage, maxVisiblePages]);

  useEffect(() => {
    setPagesToShow(calculatePages.filter((p): p is number => typeof p === 'number'));
    setInputPage(activePage.toString()); // Sync input with current page
  }, [calculatePages, activePage]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers or empty string
    if (/^\d*$/.test(value)) {
      setInputPage(value);
    }
  };

  // Handle form submission or Enter key
  const handlePageJump = (e: FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageClick(pageNum);
    } else {
      // Reset to current page if invalid
      setInputPage(activePage.toString());
    }
  };

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl shadow-md transition-colors duration-200"
      aria-label="Pagination"
    >
      {/* First Page Button */}
      <button
        onClick={() => onPageClick(1)}
        disabled={activePage === 1}
        className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to first page"
      >
        First
      </button>

      {/* Previous Page Button */}
      <button
        onClick={() => onPageClick(activePage - 1)}
        disabled={activePage === 1}
        className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to previous page"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {calculatePages.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={page}
            onClick={() => onPageClick(page)}
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              page === activePage
                ? 'bg-orange-600 text-white shadow-inner'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-orange-200 dark:hover:bg-orange-800'
            }`}
            aria-label={`Go to page ${page}`}
            aria-current={page === activePage ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span
            key={`ellipsis-${index}`}
            className="h-10 w-10 flex items-center justify-center text-stone-600 dark:text-stone-400"
            aria-hidden="true"
          >
            {page}
          </span>
        )
      )}

      {/* Page Jump Input */}
      <form onSubmit={handlePageJump} className="flex items-center gap-2">
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handlePageJump(e)}
          className="h-10 w-16 px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          placeholder="Page"
          aria-label={`Enter page number (1-${totalPages})`}
        />
        <button
          type="submit"
          className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
          aria-label="Go to entered page"
        >
          Go
        </button>
      </form>

      {/* Next Page Button */}
      <button
        onClick={() => onPageClick(activePage + 1)}
        disabled={activePage === totalPages}
        className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to next page"
      >
        Next
      </button>

      {/* Last Page Button */}
      <button
        onClick={() => onPageClick(totalPages)}
        disabled={activePage === totalPages}
        className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to last page"
      >
        Last
      </button>
    </nav>
  );
}