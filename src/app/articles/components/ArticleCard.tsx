// components/ArticleCard.tsx
"use client";
import Link from "next/link";
import React, { useState } from "react";
import { PiPencil, PiTrash } from "react-icons/pi";

interface Article {
  _id: string;
  title: string;
  thumbnailUrl: string;
  status: string;
  isPublicallyAvailable: boolean;
  likes: number;
  views: number;
  publishedAt?: string;
}

interface ArticleCardProps {
  article: Article;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onEdit, 
  onDelete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(article._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-stone-200 dark:border-stone-700">
      <div className="relative h-48">
        <img
          src={article.thumbnailUrl || "/default-thumbnail.jpg"}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-thumbnail.jpg";
          }}
        />
        <div className="absolute top-0 w-full">
          <span className={`absolute top-2 left-4 p-2 rounded text-xs font-medium ${
            article.isPublicallyAvailable
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          }`}>
            {article.isPublicallyAvailable ? "Public" : "Private"}
          </span>
          <span className={`absolute top-2 right-2 p-2 rounded text-xs font-medium ${
            article.status === "published"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}>
            {article.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="w-full flex justify-between">
          <Link href={`/articles/${article._id}`} className="text-lg hover:underline font-semibold text-stone-800 dark:text-stone-200 mb-2 line-clamp-2">
            {article.title}
          </Link>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onEdit(article._id)}
              className="p-2 text-orange-600 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
              aria-label="Edit article"
            >
              <PiPencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-orange-600 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
              aria-label="Delete article"
            >
              <PiTrash size={14} />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-stone-500 dark:text-stone-400 mb-3">
          <span>
            {new Date(article.publishedAt || Date.now()).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              {article.likes}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.views}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};