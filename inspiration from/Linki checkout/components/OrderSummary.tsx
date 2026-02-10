import React from 'react';
import { CheckCircle2, Star } from 'lucide-react';

export const OrderSummary: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Order Summary</h2>
      
      <div className="flex gap-4 mb-6">
        <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center text-3xl shrink-0">
          👀
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Ultimate LinkedIn Review</h3>
          <p className="text-sm text-gray-500 mt-1">Stand out to recruiters & VCs</p>
          <div className="flex items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
            <Star size={14} fill="currentColor" />
            <span>4.9</span>
            <span className="text-gray-400 font-normal">(120+ reviews)</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2.5 text-sm text-gray-600">
          <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
          <span>Profile rectifying tool access</span>
        </div>
        <div className="flex items-start gap-2.5 text-sm text-gray-600">
          <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
          <span>Headline & Bio optimization</span>
        </div>
        <div className="flex items-start gap-2.5 text-sm text-gray-600">
          <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
          <span>Reach analysis report</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-200 my-4 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900 font-medium">₹99.00</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900 font-medium">₹0.00</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold text-brand-blue">
          <span>Total</span>
          <span>₹99.00</span>
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 text-center">
         100% Money-back guarantee if not satisfied.
      </div>
    </div>
  );
};