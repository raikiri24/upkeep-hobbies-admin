import React, { useState, useMemo } from "react";
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from "../hooks";
import { Item, ItemFormData } from "../types";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Package,
  AlertCircle,
  Loader2,
  Save,
  X,
  ImageIcon,
} from "lucide-react";
import { SafeImage } from "./SafeImage";
import { DialogService } from "../services/dialogService";
import {
  formatCurrency,
  getCurrencySymbol,
  formatCurrencyPlain,
} from "../utils/currency";
import { VirtualScroll } from "../hooks/useVirtualScroll";

const ITEM_HEIGHT = 120; // Increased for mobile cards
const CONTAINER_HEIGHT = 600;

const InventoryOptimized: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const pageSize = 50; // Larger page size for virtual scrolling

  // Form State
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    sku: "",
    category: "Beyblade",
    price: 0,
    stock: 0,
    description: "",
    status: "active",
    imageUrl: "",
  });

  // Categories State
  const [availableCategories, setAvailableCategories] = useState([
    "Beyblade",
    "Unmatched",
    "Supplies",
    "Tools",
    "Magic the Gathering",
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const {
    data: paginatedItems,
    isLoading,
    error,
  } = useItems(currentPage, pageSize, {
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
  });

  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem();
  const deleteItemMutation = useDeleteItem();

  // Memoize categories for filter dropdown
  const categories = useMemo(() => {
    if (!paginatedItems?.data) return [];
    const uniqueCategories = Array.from(
      new Set(paginatedItems.data.map((item) => item.category))
    );
    return uniqueCategories.sort();
  }, [paginatedItems?.data]);

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        sku: item.sku,
        category: item.category,
        price: item.price,
        stock: item.stock,
        description: item.description,
        status: item.status,
        imageUrl: item.imageUrl || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        sku: "",
        category: "RC Vehicles",
        price: 0,
        stock: 0,
        description: "",
        status: "active",
        imageUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          updates: formData,
        });
      } else {
        await createItemMutation.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Operation failed", error);
      DialogService.error("Operation failed. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await DialogService.confirm(
      "Are you sure you want to delete this item?"
    );
    if (result.isConfirmed) {
      try {
        await deleteItemMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete", error);
        DialogService.error("Failed to delete item.");
      }
    }
  };

  const renderItem = (item: Item, index: number) => (
    <div
      key={item.id}
      className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors group"
    >
      {/* Mobile Card Layout */}
      <div className="sm:hidden p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const icon = document.createElement("div");
                    icon.innerHTML =
                      '<svg class="text-slate-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                    parent.appendChild(icon);
                  }
                }}
                onLoad={() => {
                  // Image loaded successfully
                }}
              />
            ) : (
              <ImageIcon className="text-slate-600 w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-200 truncate text-sm">
              {item.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">{item.sku}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {item.category}
              </span>
              {item.stock <= 5 && (
                <div className="flex items-center gap-1 text-amber-500">
                  <AlertCircle size={10} /> Low
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleOpenModal(item)}
              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex justify-between items-center bg-slate-800/50 rounded p-2">
            <span className="text-slate-500">Stock</span>
            <span
              className={`font-mono font-medium ${item.stock === 0 ? "text-red-400" : item.stock <= 5 ? "text-amber-400" : "text-slate-300"}`}
            >
              {item.stock}
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-800/50 rounded p-2">
            <span className="text-slate-500">Price</span>
            <span className="font-mono font-medium text-slate-300">
              {formatCurrencyPlain(item.price)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-800/50 rounded p-2">
            <span className="text-slate-500">Status</span>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border
              ${
                item.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : item.status === "draft"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-slate-700 text-slate-400 border-slate-600"
              }`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Table Row */}
      <div className="hidden sm:flex items-center gap-4 p-4">
        <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
          <SafeImage
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full"
            fallbackClassName="w-5 h-5"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-200 truncate">{item.name}</div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="font-mono">{item.sku}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs">
              {item.category}
            </span>
            {item.stock <= 5 && (
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <AlertCircle size={12} /> Low Stock
              </div>
            )}
          </div>
        </div>

        <div className="text-sm font-mono text-center w-16">
          <span
            className={
              item.stock === 0
                ? "text-red-400"
                : item.stock <= 5
                  ? "text-amber-400"
                  : "text-slate-300"
            }
          >
            {item.stock}
          </span>
        </div>

        <div className="text-slate-300 font-mono text-sm w-20 text-right">
          {formatCurrencyPlain(item.price)}
        </div>

        <div className="w-24">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${
              item.status === "active"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : item.status === "draft"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-slate-700 text-slate-400 border-slate-600"
            }`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-2 w-20 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleOpenModal(item)}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-red-400 text-center p-8">
          Failed to load inventory. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-wide">
            Inventory Management
          </h2>
          <p className="text-slate-400 text-sm">
            {paginatedItems?.total || 0} total items • Page {currentPage} of{" "}
            {paginatedItems?.totalPages || 0}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Virtual Scrolled Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Table Header - Hidden on mobile */}
        <div className="bg-slate-800/50 border-b border-slate-700 p-4 hidden sm:block">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div className="w-12">Image</div>
            <div className="flex-1">Item Name</div>
            <div className="w-16 text-center">Stock</div>
            <div className="w-20 text-right">Price</div>
            <div className="w-24">Status</div>
            <div className="w-32 text-right">Actions</div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-slate-500 mt-2">Loading inventory...</p>
          </div>
        ) : paginatedItems?.data && paginatedItems.data.length > 0 ? (
          <VirtualScroll
            items={paginatedItems.data}
            itemHeight={ITEM_HEIGHT}
            containerHeight={CONTAINER_HEIGHT}
            renderItem={renderItem}
            className="h-[400px] sm:h-[600px]"
          />
        ) : (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No items found</p>
            <p className="text-slate-600 text-sm">
              Try adjusting your search or add a new item.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginatedItems && paginatedItems.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-400 text-center">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, paginatedItems.total)} of{" "}
            {paginatedItems.total} items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from(
              { length: Math.min(5, paginatedItems.totalPages) },
              (_, i) => {
                const pageNum = i + 1;
                if (paginatedItems.totalPages <= 5) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        currentPage === pageNum
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              }
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(paginatedItems.totalPages, prev + 1)
                )
              }
              disabled={currentPage === paginatedItems.totalPages}
              className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal (existing implementation) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-xl font-display font-bold text-white">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Item Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. UX-15"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    SKU
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                    placeholder="e.g. RC-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Category
                  </label>
                  <div className="space-y-2">
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                    >
                      {availableCategories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(!showAddCategory)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add new category
                    </button>
                    {showAddCategory && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category name"
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCategory.trim()) {
                              setAvailableCategories([
                                ...availableCategories,
                                newCategory.trim(),
                              ]);
                              setFormData({
                                ...formData,
                                category: newCategory.trim(),
                              });
                              setNewCategory("");
                              setShowAddCategory(false);
                            }
                          }}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewCategory("");
                            setShowAddCategory(false);
                          }}
                          className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Price ({getCurrencySymbol()})
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Stock
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">
                  Image URL
                </label>
                <div className="flex gap-4">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="w-11 h-11 shrink-0 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center">
                    {formData.imageUrl ? (
                      <SafeImage
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full"
                      />
                    ) : (
                      <ImageIcon className="text-slate-600 w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="Item details..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createItemMutation.isPending || updateItemMutation.isPending
                  }
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Save size={18} />
                  {editingItem ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryOptimized;
