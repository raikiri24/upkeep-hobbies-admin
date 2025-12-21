import React from 'react';
import { ShoppingCart, Plus, Minus, X, CreditCard } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils/currency';

interface SaleCartProps {
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  onCheckout: () => void;
  disabled: boolean;
}

const SaleCart: React.FC<SaleCartProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  subtotal,
  tax,
  total,
  onCheckout,
  disabled,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5" />
        Cart ({cart.length})
      </h2>

      {cart.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <ShoppingCart className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p>Cart is empty</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
            {cart.map((cartItem) => (
              <div key={cartItem.item.id} className="bg-slate-800 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{cartItem.item.name}</h4>
                    <p className="text-slate-400 text-xs">{cartItem.item.sku}</p>
                    <p className="text-indigo-400 font-medium">{formatCurrency(cartItem.item.price)}</p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(cartItem.item.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                      className="bg-slate-700 hover:bg-slate-600 text-white rounded p-1 transition-colors"
                      disabled={cartItem.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-white font-medium w-8 text-center">{cartItem.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                      className="bg-slate-700 hover:bg-slate-600 text-white rounded p-1 transition-colors"
                      disabled={cartItem.quantity >= cartItem.item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      ${formatCurrency(cartItem.item.price * cartItem.quantity)}
                    </p>
                    {cartItem.quantity > cartItem.item.stock && (
                      <p className="text-red-400 text-xs">Insufficient stock</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total</span>
              <span className="text-indigo-400 font-medium">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={disabled}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <CreditCard className="h-5 w-5" />
            Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default SaleCart;