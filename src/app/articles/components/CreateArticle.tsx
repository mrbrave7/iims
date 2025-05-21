// components/CreateArticle.tsx
"use client";
import React, { useState } from "react";
import { ArticleForm } from "./ArticleForm";
import { useAdminContext } from "@/app/Context/AdminProvider";
import { usePopupContext } from "@/app/Context/ToastProvider";

export const CreateArticle: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { admin } = useAdminContext();
  const { Popup } = usePopupContext();
  const toast = Popup();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await fetch("/api/articles", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          admiId: admin?.profile_details,
        }),
      });

      if (!response.ok) throw new Error("Failed to create article");

      toast.success("Article created successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to create article");
      console.error("Create article error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleForm
      onSubmit={handleSubmit}
      onClose={() => onSuccess()}
      isSubmitting={isSubmitting}
    />
  );
};