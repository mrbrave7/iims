// app/article-creation/page.tsx
"use client";
import React, { useState, useCallback, useEffect } from "react";
import { PiPlus } from "react-icons/pi";
import { usePopupContext } from "../Context/ToastProvider";
import { CreateArticle } from "./components/CreateArticle";
import { UpdateArticle } from "./components/UpdateArticle";
import { ArticleCard } from "./components/ArticleCard";

export default function ArticleCreationPage() {
  const { Popup } = usePopupContext();
  const toast = Popup();
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<string | null>(null);

  const fetchAllArticles = useCallback(async () => {
    setIsLoadingArticles(true);
    try {
      const response = await fetch("/api/articles?page=1&limit=10");
      if (!response.ok) throw new Error("Failed to fetch articles");
      const { data } = await response.json();
      setArticles(data);
    } catch (error) {
      toast.error("Failed to fetch articles");
      console.error("Fetch articles error:", error);
    } finally {
      setIsLoadingArticles(false);
    }
  }, []);

  const handleDeleteArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete article");

      toast.success("Article deleted successfully");
      fetchAllArticles();
    } catch (error) {
      toast.error("Failed to delete article");
      console.error("Delete article error:", error);
    }
  };

  useEffect(() => {
    fetchAllArticles();
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-800 p-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-stone-700 dark:text-stone-200">
            Article Dashboard
          </h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="py-3 px-6 bg-orange-500 text-white rounded-lg hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
          >
            <PiPlus size={20} /> Create New Article
          </button>
        </div>

        {isLoadingArticles ? (
          <div className="bg-stone-100 py-16">
            <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold text-stone-800 mb-8">More like this</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                    <div className="h-48 bg-stone-200 animate-pulse"></div>
                    <div className="p-6">
                      <div className="h-5 bg-stone-200 rounded-full animate-pulse mb-3 w-3/4"></div>
                      <div className="h-4 bg-stone-200 rounded-full animate-pulse mb-4 w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-stone-200 rounded-full animate-pulse w-full"></div>
                        <div className="h-3 bg-stone-200 rounded-full animate-pulse w-5/6"></div>
                        <div className="h-3 bg-stone-200 rounded-full animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500 dark:text-stone-400 text-lg">
              No articles found. Create your first article!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                onEdit={() => setArticleToEdit(article._id)}
                onDelete={handleDeleteArticle}
              />
            ))}
          </div>
        )}
      </div>

      {
        showCreateForm && (
          <CreateArticle
            onSuccess={() => {
              setShowCreateForm(false);
              fetchAllArticles();
            }}
          />
        )
      }

      {
        articleToEdit && (
          <UpdateArticle
            articleId={articleToEdit}
            onSuccess={() => {
              setArticleToEdit(null);
              fetchAllArticles();
            }}
            onClose={() => setArticleToEdit(null)}
          />
        )
      }
    </div >
  );
}