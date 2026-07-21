import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useKnowledgeArticles, useCreateKnowledgeArticle, useUpdateKnowledgeArticle, useDeleteKnowledgeArticle } from "@/features/knowledge";
import type { KnowledgeArticle } from "@/features/knowledge";

const CATEGORIES = ["general", "getting-started", "faq", "guide", "support"];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: articles, isLoading } = useKnowledgeArticles();
  const createArticle = useCreateKnowledgeArticle();
  const updateArticle = useUpdateKnowledgeArticle();
  const deleteArticle = useDeleteKnowledgeArticle();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    category: "general",
    tags: "",
    published: false,
  });

  const filtered = articles?.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setForm({ title: "", slug: "", content: "", category: "general", tags: "", published: false });
    setEditingArticle(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingArticle) {
      await updateArticle.mutateAsync({
        id: editingArticle.id,
        updates: { ...form, tags },
      });
    } else {
      await createArticle.mutateAsync({ ...form, tags });
    }
    resetForm();
  };

  const handleEdit = (article: KnowledgeArticle) => {
    setForm({
      title: article.title,
      slug: article.slug,
      content: article.content,
      category: article.category,
      tags: article.tags.join(", "),
      published: article.published,
    });
    setEditingArticle(article);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this article?")) {
      await deleteArticle.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Knowledge Base</h1>
        <button
          onClick={() => { resetForm(); setIsCreating(true); }}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Plus size={16} />
          New Article
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-gray-400"
        />
      </div>

      {isCreating && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">
            {editingArticle ? "Edit Article" : "New Article"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingArticle ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
                  placeholder="Article title"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
                  placeholder="article-slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
                rows={8}
                placeholder="Article content in markdown..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="published" className="text-sm font-medium">Published</label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!form.title || !form.slug}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {editingArticle ? "Update" : "Create"}
              </button>
              <button
                onClick={resetForm}
                className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-400">Loading...</div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            {searchQuery ? "No articles match your search" : "No articles yet. Create your first article."}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-500">
                <th className="pb-3 pl-6 pr-4 pt-3">Title</th>
                <th className="pb-3 pr-4 pt-3">Category</th>
                <th className="pb-3 pr-4 pt-3">Tags</th>
                <th className="pb-3 pr-4 pt-3">Status</th>
                <th className="pb-3 pr-6 pt-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article) => (
                <tr key={article.id} className="border-b last:border-0">
                  <td className="py-3 pl-6 pr-4 font-medium">{article.title}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs">{article.category}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <span key={tag} className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      article.published ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {article.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 pr-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="rounded-lg bg-gray-100 p-1.5 hover:bg-gray-200"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
