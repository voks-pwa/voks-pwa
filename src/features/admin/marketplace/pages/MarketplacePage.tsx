import { useState } from "react";
import {
  ShoppingBag,
  Package,
  Tags,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useAdminProducts, useAdminCategories, useAdminInventory } from "../hooks/useAdminMarketplace";

const TABS = [
  { key: "products", label: "Products", icon: ShoppingBag },
  { key: "inventory", label: "Inventory", icon: Package },
  { key: "categories", label: "Categories", icon: Tags },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">Marketplace</h1>

      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "products" && <ProductsTab />}
      {activeTab === "inventory" && <InventoryTab />}
      {activeTab === "categories" && <CategoriesTab />}
    </div>
  );
}

function ProductsTab() {
  const { query, create, update, remove } = useAdminProducts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string | boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_type: "DIGITAL",
    name: "",
    slug: "",
    price: 0,
    description: "",
  });

  const products = query.data ?? [];

  const startEdit = (product: (typeof products)[0]) => {
    setEditingId(product.id);
    setEditValues({
      name: product.name,
      price: String(product.price),
      is_active: product.is_active,
    });
  };

  const saveEdit = async (id: string) => {
    await update.mutateAsync({
      id,
      updates: {
        name: String(editValues.name ?? ""),
        price: Number(editValues.price ?? 0),
        is_active: Boolean(editValues.is_active),
      },
    });
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.slug) return;
    await create.mutateAsync({
      product_type: newProduct.product_type,
      name: newProduct.name,
      slug: newProduct.slug,
      price: newProduct.price,
      description: newProduct.description || undefined,
    });
    setNewProduct({ product_type: "DIGITAL", name: "", slug: "", price: 0, description: "" });
    setIsCreating(false);
  };

  if (query.isLoading) {
    return <div className="rounded-3xl bg-white p-8 text-center text-gray-400 shadow">Loading products...</div>;
  }

  return (
    <div className="rounded-3xl bg-white shadow">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-sm text-gray-500">{products.length} products</span>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {isCreating && (
        <div className="flex flex-wrap items-end gap-3 border-b px-6 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
            <select
              value={newProduct.product_type}
              onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="DIGITAL">Digital</option>
              <option value="PHYSICAL">Physical</option>
              <option value="VOUCHER">Voucher</option>
              <option value="SUBSCRIPTION">Subscription</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
            <input
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Product name"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Slug</label>
            <input
              value={newProduct.slug}
              onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
              placeholder="product-slug"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Price (VXP)</label>
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={create.isPending || !newProduct.name || !newProduct.slug}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {create.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Active</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No products yet
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t transition-colors hover:bg-slate-50">
                  <td className="p-4">
                    {editingId === product.id ? (
                      <input
                        value={String(editValues.name ?? "")}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.slug}</p>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{product.product_type}</td>
                  <td className="p-4 text-right">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={String(editValues.price ?? "0")}
                        onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm"
                      />
                    ) : (
                      <span className="font-mono text-sm font-medium">{product.price.toLocaleString()} VXP</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {editingId === product.id ? (
                      <input
                        type="checkbox"
                        checked={Boolean(editValues.is_active)}
                        onChange={(e) => setEditValues({ ...editValues, is_active: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    ) : (
                      <span className={`inline-block h-2 w-2 rounded-full ${product.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {editingId === product.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => saveEdit(product.id)}
                          disabled={update.isPending}
                          className="rounded-lg bg-green-50 p-1.5 text-green-600 hover:bg-green-100"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => startEdit(product)}
                          className="rounded-lg bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100"
                        >
                          <Pencil size={14} />
                        </button>
                        {!product.reward_id && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${product.name}"?`)) remove.mutate(product.id);
                            }}
                            disabled={remove.isPending}
                            className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryTab() {
  const { query, update } = useAdminInventory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string | boolean>>({});

  const inventory = query.data ?? [];

  const startEdit = (item: (typeof inventory)[0]) => {
    setEditingId(item.product_id);
    setEditValues({
      total_stock: String(item.total_stock),
      warning_stock: String(item.warning_stock),
      unlimited: item.unlimited,
    });
  };

  const saveEdit = async (productId: string) => {
    await update.mutateAsync({
      productId,
      updates: {
        total_stock: Number(editValues.total_stock ?? 0),
        warning_stock: Number(editValues.warning_stock ?? 0),
        unlimited: Boolean(editValues.unlimited),
      },
    });
    setEditingId(null);
  };

  if (query.isLoading) {
    return <div className="rounded-3xl bg-white p-8 text-center text-gray-400 shadow">Loading inventory...</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow">
      <div className="border-b px-6 py-4">
        <span className="text-sm text-gray-500">{inventory.length} products with inventory</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Reserved</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Available</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Warning</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Unlimited</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No inventory records
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="border-t transition-colors hover:bg-slate-50">
                  <td className="p-4 font-mono text-xs text-gray-500">{item.product_id.slice(0, 8)}...</td>
                  <td className="p-4 text-right">
                    {editingId === item.product_id ? (
                      <input
                        type="number"
                        value={String(editValues.total_stock ?? "0")}
                        onChange={(e) => setEditValues({ ...editValues, total_stock: e.target.value })}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm"
                        disabled={Boolean(editValues.unlimited)}
                      />
                    ) : (
                      <span className="font-mono text-sm">{item.unlimited ? "∞" : item.total_stock.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-mono text-sm text-gray-500">{item.reserved_stock.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <span className={`font-mono text-sm font-medium ${
                      !item.unlimited && (item.total_stock - item.reserved_stock) <= item.warning_stock
                        ? "text-red-600"
                        : "text-green-600"
                    }`}>
                      {item.unlimited ? "∞" : (item.total_stock - item.reserved_stock).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {editingId === item.product_id ? (
                      <input
                        type="number"
                        value={String(editValues.warning_stock ?? "0")}
                        onChange={(e) => setEditValues({ ...editValues, warning_stock: e.target.value })}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm"
                      />
                    ) : (
                      <span className="font-mono text-sm">{item.warning_stock}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {editingId === item.product_id ? (
                      <input
                        type="checkbox"
                        checked={Boolean(editValues.unlimited)}
                        onChange={(e) => setEditValues({ ...editValues, unlimited: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    ) : (
                      <span className={`text-sm ${item.unlimited ? "text-green-600" : "text-gray-400"}`}>
                        {item.unlimited ? "Yes" : "No"}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {editingId === item.product_id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => saveEdit(item.product_id)}
                          disabled={update.isPending}
                          className="rounded-lg bg-green-50 p-1.5 text-green-600 hover:bg-green-100"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-lg bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { query, create, update, remove } = useAdminCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string | boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "", sort_order: 0 });

  const categories = query.data ?? [];

  const startEdit = (cat: (typeof categories)[0]) => {
    setEditingId(cat.id);
    setEditValues({
      name: cat.name,
      sort_order: String(cat.sort_order),
      is_active: cat.is_active,
    });
  };

  const saveEdit = async (id: string) => {
    await update.mutateAsync({
      id,
      updates: {
        name: String(editValues.name ?? ""),
        sort_order: Number(editValues.sort_order ?? 0),
        is_active: Boolean(editValues.is_active),
      },
    });
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newCategory.name || !newCategory.slug) return;
    await create.mutateAsync({
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description || undefined,
      sort_order: newCategory.sort_order || undefined,
    });
    setNewCategory({ name: "", slug: "", description: "", sort_order: 0 });
    setIsCreating(false);
  };

  if (query.isLoading) {
    return <div className="rounded-3xl bg-white p-8 text-center text-gray-400 shadow">Loading categories...</div>;
  }

  return (
    <div className="rounded-3xl bg-white shadow">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-sm text-gray-500">{categories.length} categories</span>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {isCreating && (
        <div className="flex flex-wrap items-end gap-3 border-b px-6 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
            <input
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Category name"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Slug</label>
            <input
              value={newCategory.slug}
              onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              placeholder="category-slug"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Sort Order</label>
            <input
              type="number"
              value={newCategory.sort_order}
              onChange={(e) => setNewCategory({ ...newCategory, sort_order: Number(e.target.value) })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={create.isPending || !newCategory.name || !newCategory.slug}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {create.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Slug</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Order</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Active</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No categories yet
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-t transition-colors hover:bg-slate-50">
                  <td className="p-4">
                    {editingId === cat.id ? (
                      <input
                        value={String(editValues.name ?? "")}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{cat.slug}</td>
                  <td className="p-4 text-right">
                    {editingId === cat.id ? (
                      <input
                        type="number"
                        value={String(editValues.sort_order ?? "0")}
                        onChange={(e) => setEditValues({ ...editValues, sort_order: e.target.value })}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm"
                      />
                    ) : (
                      <span className="font-mono text-sm">{cat.sort_order}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {editingId === cat.id ? (
                      <input
                        type="checkbox"
                        checked={Boolean(editValues.is_active)}
                        onChange={(e) => setEditValues({ ...editValues, is_active: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    ) : (
                      <span className={`inline-block h-2 w-2 rounded-full ${cat.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {editingId === cat.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => saveEdit(cat.id)}
                          disabled={update.isPending}
                          className="rounded-lg bg-green-50 p-1.5 text-green-600 hover:bg-green-100"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="rounded-lg bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete category "${cat.name}"?`)) remove.mutate(cat.id);
                          }}
                          disabled={remove.isPending}
                          className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
