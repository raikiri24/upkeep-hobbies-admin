import React, { useState, useEffect, useCallback } from 'react';
import { apiService, useUpdateItem } from '../hooks';
import { Item, ItemFormData } from '../types';
import { Plus, Trash2, Edit2, Search, Package, AlertCircle, Loader2, Save, X, ImageIcon, ShoppingCart } from 'lucide-react';
import { DialogService } from '../services/dialogService';
import { formatCurrency, getCurrencySymbol, formatCurrencyPlain } from '../utils/currency';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const deleteItemMutation = useDeleteItem();
  
  // Form State
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    sku: '',
    category: 'RC Vehicles',
    price: 0,
    stock: 0,
    description: '',
    status: 'active',
    imageUrl: ''
  });

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getItems();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string) => {
    const result = await DialogService.confirm('Are you sure you want to delete this item?');
    if (result.isConfirmed) {
      try {
        await deleteItemMutation.mutateAsync(id);
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error("Failed to delete", error);
        DialogService.error('Failed to delete item.');
      }
    }
  };

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
        imageUrl: item.imageUrl || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        sku: '',
        category: 'RC Vehicles',
        price: 0,
        stock: 0,
        description: '',
        status: 'active',
        imageUrl: ''
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
        const updated = await apiService.updateItem(editingItem.id, formData);
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      } else {
        const created = await apiService.createItem(formData);
        setItems(prev => [...prev, created]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Operation failed", error);
      DialogService.error('Operation failed. Please try again.');
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">Inventory Management</h2>
          <p className="text-slate-400 text-sm">Manage shop items, stock levels, and pricing.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95 w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search items by name, SKU, or category..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600"
        />
      </div>

      {/* Mobile-First Grid Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-slate-500 mt-2">Loading inventory...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No items found</p>
            <p className="text-slate-600 text-sm">Try adjusting your search or add a new item.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredItems.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                {/* Mobile Card Layout */}
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-600 w-6 h-6" />
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-200 truncate">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 text-sm font-mono">{item.sku}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                            ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              item.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                              'bg-slate-700 text-slate-400 border-slate-600'}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-semibold text-slate-200">{formatCurrencyPlain(item.price)}</div>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-3 mt-3 text-sm">
                      <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs whitespace-nowrap">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`font-mono ${item.stock === 0 ? 'text-red-400' : item.stock <= 5 ? 'text-amber-400' : 'text-slate-300'}`}>
                          Stock: {item.stock}
                        </span>
                        {item.stock <= 5 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Low
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Low Stock Alert */}
                    {item.stock <= 5 && (
                      <div className="flex items-center gap-1 text-xs text-amber-500 mt-2">
                        <AlertCircle size={12} /> Low Stock Warning
                      </div>
                    )}

                    {/* Action Buttons - Always visible on mobile */}
                    <div className="flex items-center gap-2 mt-3">
                      {item.status === 'active' && item.stock > 0 && (
                        <button 
                          onClick={() => {
                            window.location.hash = 'pos';
                          }}
                          className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Sell in POS"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      )}
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
              </div>
            ))}
          </div>
        )}

        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block border-t border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="p-4 w-20 text-xs font-semibold text-slate-400 uppercase tracking-wider">Image</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Item Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">SKU</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-slate-600 w-6 h-6" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{item.name}</div>
                      {item.stock <= 5 && (
                        <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                          <AlertCircle size={12} /> Low Stock
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-sm font-mono">{item.sku}</td>
                    <td className="p-4 text-slate-400 text-sm">
                      <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs whitespace-nowrap">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono ${item.stock === 0 ? 'text-red-400' : item.stock <= 5 ? 'text-amber-400' : 'text-slate-300'}`}>
                          {item.stock}
                        </span>
                        {item.stock <= 5 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{formatCurrencyPlain(item.price)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          item.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.status === 'active' && item.stock > 0 && (
                          <button 
                            onClick={() => {
                              window.location.hash = 'pos';
                            }}
                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Sell in POS"
                          >
                            <ShoppingCart size={16} />
                          </button>
                        )}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto sm:my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-xl font-display font-bold text-white">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4">
              {/* Item Name - Full width on mobile */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Item Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Thunderbolt RC"
                />
              </div>

              {/* Two columns on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">SKU</label>
                  <input
                    required
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                    placeholder="e.g. RC-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
                  >
                    <option>RC Vehicles</option>
                    <option>Drones</option>
                    <option>Model Kits</option>
                    <option>Supplies</option>
                    <option>Tools</option>
                    <option>Beyblade</option>
                    <option>Unmatched</option>
                    <option>Magic: The Gathering</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Price ({getCurrencySymbol()})</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Stock</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                  />
                </div>
              </div>

              {/* Status and Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center">
                       {formData.imageUrl ? (
                         <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <ImageIcon className="text-slate-600 w-4 h-4 sm:w-5 sm:h-5" />
                       )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - Full width */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder="Item details..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all w-full sm:w-auto order-1 sm:order-2"
                >
                  <Save size={18} />
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;