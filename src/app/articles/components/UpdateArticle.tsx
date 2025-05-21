// components/UpdateArticle.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/Context/AdminProvider";
import { usePopupContext } from "@/app/Context/ToastProvider";
import { ArticleForm } from "./ArticleForm";


interface UpdateArticleProps {
  articleId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const UpdateArticle: React.FC<UpdateArticleProps> = ({ 
  articleId, 
  onSuccess, 
  onClose 
}) => {
  const { admin } = useAdminContext();
  const { Popup } = usePopupContext();
  const toast = Popup();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}`);
        if (!response.ok) throw new Error("Failed to fetch article");
        const data = await response.json();
        setInitialData({
          title: data.title,
          thumbnailUrl: data.thumbnailUrl,
          keywords: data.tags || [],
          metaDescription: data.meta?.description || "",
          visibility: data.isPublicallyAvailable ? "public" : "private",
          content: data.content,
        });
      } catch (error) {
        toast.error("Failed to load article");
        console.error("Fetch article error:", error);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleSubmit = async (data: {
    title: string;
    thumbnailUrl: string;
    content: string;
    visibility: "public" | "private";
    meta: {
      keywords: string[];
      description: string;
    };
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          admiId: admin?.profile_details,
        }),
      });

      if (!response.ok) throw new Error("Failed to update article");

      toast.success("Article updated successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update article");
      console.error("Update article error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <ArticleForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onClose={onClose}
      isSubmitting={isSubmitting}
      isEditing={true}
    />
  );
};