import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Users, X } from 'lucide-react';
import { Item, CartItem, Customer, SaleFormData } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import SaleCart from './SaleCart';
import CustomerSearch from './CustomerSearch';
import PaymentProcessor from './PaymentProcessor';
import { DialogService } from '../services/dialogService';
import { formatCurrency } from '../utils/currency';

interface PosTerminalProps {}

const PosTerminal: React.FC<PosTerminalProps> = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingSale, setProcessingSale] = useState(false);

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await apiService.getItems();
      setItems(data.filter(item => item.status === 'active' && item.stock > 0));
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: Item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
      if (existingItem) {
        if (existingItem.quantity < item.stock) {
          return prevCart.map(cartItem =>
            cartItem.item.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        } else {
          DialogService.warning('Insufficient stock available');
          return prevCart;
        }
      }
      return [...prevCart, { item, quantity: 1 }];
    });
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    setCart(prevCart => {
      const cartItem = prevCart.find(item => item.item.id === itemId);
      if (cartItem) {
        if (quantity <= 0) {
          return prevCart.filter(item => item.item.id !== itemId);
        } else if (quantity <= cartItem.item.stock) {
          return prevCart.map(item =>
            item.item.id === itemId ? { ...item, quantity } : item
          );
        } else {
          DialogService.warning('Insufficient stock available');
          return prevCart;
        }
      }
      return prevCart;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, cartItem) => 
      sum + (cartItem.item.price * cartItem.quantity), 0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const completeSale = async (paymentMethod: 'cash' | 'card' | 'digital') => {
    if (!user || cart.length === 0) return;

    setProcessingSale(true);
    try {
      const saleData: SaleFormData = {
        items: cart.map(cartItem => ({
          itemId: cartItem.item.id,
          itemName: cartItem.item.name,
          sku: cartItem.item.sku,
          quantity: cartItem.quantity,
          price: cartItem.item.price,
          discount: cartItem.discount || 0,
          subtotal: cartItem.item.price * cartItem.quantity * (1 - (cartItem.discount || 0) / 100),
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod,
        paymentStatus: 'pending',
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        staffId: user.id,
      };

      await apiService.createSale(saleData, user.name);
      
      // Reset state
      setCart([]);
      setSelectedCustomer(null);
      setShowPayment(false);
      
      // Reload items to update stock
      await loadItems();
      
      DialogService.success('Sale completed successfully!');
    } catch (error) {
      console.error('Failed to complete sale:', error);
      DialogService.error('Failed to complete sale. Please try again.');
    } finally {
      setProcessingSale(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Point of Sale</h1>
          <p className="text-slate-400">Process sales and manage transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </h2>
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-indigo-500 transition-colors"
                      onClick={() => addToCart(item)}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-24 object-cover rounded mb-3"
                        />
                      )}
                      <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">{item.name}</h3>
                      <p className="text-slate-400 text-xs mb-2">{item.sku}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-indigo-400">{formatCurrency(item.price)}</span>
                        <span className="text-xs text-slate-400">Stock: {item.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart and Customer Section */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer
              </h2>
              {selectedCustomer ? (
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-white">{selectedCustomer.name}</h3>
                      {selectedCustomer.email && <p className="text-slate-400 text-sm">{selectedCustomer.email}</p>}
                      {selectedCustomer.phone && <p className="text-slate-400 text-sm">{selectedCustomer.phone}</p>}
                      <div className="mt-2 text-xs text-slate-500">
                        <p>Total Purchases: {formatCurrency(selectedCustomer.totalPurchases)}</p>
                        <p>Visits: {selectedCustomer.visits}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomerSearch(true)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Customer
                </button>
              )}
            </div>

            {/* Cart */}
            <SaleCart
              cart={cart}
              onUpdateQuantity={updateCartItemQuantity}
              onRemoveItem={removeFromCart}
              subtotal={calculateSubtotal()}
              tax={calculateTax()}
              total={calculateTotal()}
              onCheckout={() => setShowPayment(true)}
              disabled={cart.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Customer Search Modal */}
      {showCustomerSearch && (
        <CustomerSearch
          onClose={() => setShowCustomerSearch(false)}
          onSelectCustomer={setSelectedCustomer}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentProcessor
          total={calculateTotal()}
          onClose={() => setShowPayment(false)}
          onPaymentComplete={completeSale}
          processing={processingSale}
        />
      )}
    </div>
  );
};

export default PosTerminal;