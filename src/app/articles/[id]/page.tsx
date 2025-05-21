"use client";
import { usePopupContext } from "@/app/Context/ToastProvider";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { PiPencilSimpleLine, PiTrash, PiWarning } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { useAdminContext } from "@/app/Context/AdminProvider";
const ArticleForm = dynamic(
  () => import("../components/ArticleForm").then((mod) => mod.ArticleForm),
  {
    loading: () => (
      <div className="fixed inset-0 bg-stone-900/75 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-stone-700">Loading editor...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

interface Article {
    _id: string;
    title: string;
    thumbnailUrl: string;
    content: string;
    publishedAt: string;
    views: number;
    tags: string[];
    meta: {
        description: string;
        keywords: string[];
    };
    createdBy: string;
}

interface Profile {
    ShortBio: string;
    adminId: string;
    avatarUrl: string;
    fullName: string;
    id: string;
    _id: string;
    specialization: string[];
    role: string;
}

interface SessionUser {
    id: string;
    role: string;
}

export default function Page({ params }: { params: { id: string } }): React.ReactElement {
    const { id } = params;
    const { Popup } = usePopupContext();
    const toast = Popup();
    const { admin } = useAdminContext();
    const router = useRouter();
    
    const [article, setArticle] = useState<Article | null>(null);
    const [author, setAuthor] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = admin as SessionUser | undefined;
    const isAdmin = currentUser?.role === "super_instructor";
    const isAuthor = currentUser?.id === article?.createdBy;

    const getArticle = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/articles/${id}`, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch article");
            }
            const { article } = await response.json();
            setArticle(article);
        } catch (error) {
            console.error(error);
            setError("Unable to load the article. Please try again.");
            toast.error("Failed To Get Article");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const getAuthor = useCallback(async (createdBy: string) => {
        try {
            const response = await fetch(`/api/admin/profile/${createdBy}`, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch author");
            }
            const { profile } = await response.json();
            setAuthor(profile);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load author details");
        }
    }, []);

    const handleDeleteArticle = async () => {
        if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
            return;
        }

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/articles/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to delete article");
            }

            toast.success("Article deleted successfully");
            router.push("/articles");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete article");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateArticle = async (formData: {
        title: string;
        thumbnailUrl: string;
        content: string;
        visibility: "public" | "private";
        meta: {
            keywords: string[];
            description: string;
        };
    }) => {
        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/articles/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update article");
            }
            router.refresh()
            setShowEditForm(false);
            toast.success("Article updated successfully");
        } catch (error) {
            console.error(error);
            setError("Failed to update article. Please try again.");
            toast.error("Failed to update article");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        getArticle();
    }, []);

    useEffect(() => {
        if (article?.createdBy) {
            getAuthor(article.createdBy);
        }
    }, [article]);

    const formatPublishedDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50">
                <div className="relative h-96 bg-stone-200 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-stone-900/20"></div>
                </div>
                <div className="max-w-4xl mx-auto px-6 py-16">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 bg-stone-200 rounded-full w-3/4 mx-auto"></div>
                        <div className="space-y-4 w-5/6 mx-auto">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 bg-stone-200 rounded-full" style={{ width: `${100 - i * 15}%` }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
                <div className="text-center p-10 bg-white rounded-2xl shadow-2xl max-w-md border border-stone-200">
                    <h2 className="text-3xl font-bold text-stone-800 mb-4">Oops, Something Went Wrong</h2>
                    <p className="text-stone-600 mb-6">{error || "The requested article could not be loaded."}</p>
                    <button
                        onClick={getArticle}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Edit Form Modal */}
            {showEditForm && (
                <ArticleForm
                    initialData={{
                        title: article.title,
                        thumbnailUrl: article.thumbnailUrl,
                        keywords: article.meta.keywords,
                        metaDescription: article.meta.description,
                        visibility: "public", // Adjust based on your API data
                        content: article.content
                    }}
                    onSubmit={handleUpdateArticle}
                    onClose={() => setShowEditForm(false)}
                    isSubmitting={isSubmitting}
                    isEditing={true}
                />
            )}

            {/* Hero Section */}
            <div className="relative h-[480px] w-full overflow-hidden">
                {article.thumbnailUrl && (
                    <Image
                        src={article.thumbnailUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent"></div>
                
                {/* Admin Controls */}
                {(isAdmin || isAuthor) && (
                    <div className="absolute bottom-8 right-8 flex gap-2 z-10">
                        <button
                            onClick={() => setShowEditForm(true)}
                            className="p-2 cursor-pointer bg-white/90 hover:bg-white text-stone-800 rounded-full shadow-md transition-all"
                            aria-label="Edit article"
                        >
                            <PiPencilSimpleLine size={20} />
                        </button>
                        <button
                            onClick={handleDeleteArticle}
                            disabled={isDeleting}
                            className="p-2 cursor-pointer bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-all disabled:opacity-50"
                            aria-label="Delete article"
                        >
                            {isDeleting ? (
                                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></span>
                            ) : (
                                <PiTrash size={20} />
                            )}
                        </button>
                    </div>
                )}

                <div className="relative container mx-auto px-6 h-full flex flex-col justify-end pb-16">
                    <div className="max-w-3xl">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {article.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-orange-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm hover:bg-orange-600 transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                            {article.title}
                        </h1>
                        <p className="text-lg text-stone-200 mb-6">{article.meta.description}</p>
                        <div className="flex items-center gap-4 text-stone-300 text-sm">
                            <span>{formatPublishedDate(article.publishedAt)}</span>
                            <span className="w-1 h-1 bg-stone-400 rounded-full"></span>
                            <span>{article.views} views</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Article Content */}
                    <div className="lg:w-2/3">
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3 space-y-8">
                        {/* Author Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Written by</h3>
                            {author ? (
                                <div className="flex items-start gap-4">
                                    {author.avatarUrl ? (
                                        <Image
                                            src={author.avatarUrl}
                                            alt={author.fullName}
                                            width={64}
                                            height={64}
                                            className="rounded-full h-14 w-14 object-cover border-2 border-orange-100"
                                        />
                                    ) : (
                                        <div className="h-14 w-14 bg-orange-100 rounded-full flex items-center justify-center">
                                            <span className="text-orange-600 font-medium text-lg">
                                                {author.fullName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-bold text-stone-800">{author.fullName}</h4>
                                        <p className="text-sm text-stone-600 mt-1">{author.ShortBio || "No bio available"}</p>
                                        {author.specialization?.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {author.specialization.map((spec) => (
                                                    <span key={spec} className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-full">
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-stone-500 text-sm">Author information not available</p>
                            )}
                        </div>

                        {/* Article Tags */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Article Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {article.tags.map((tag) => (
                                    <a
                                        key={tag}
                                        href="#"
                                        className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full transition-colors"
                                    >
                                        {tag}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Share Options */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Share this article</h3>
                            <div className="flex gap-3">
                                {['Twitter', 'LinkedIn', 'Facebook', 'Copy'].map((platform) => (
                                    <button
                                        key={platform}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 text-sm font-medium transition-colors"
                                    >
                                        <span>{platform}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Articles (Placeholder) */}
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
        </div>
    );
}