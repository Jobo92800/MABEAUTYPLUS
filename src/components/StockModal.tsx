import React from 'react';
import { X, Package } from 'lucide-react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StockModal: React.FC<StockModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ height: '85vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-pink-500" />
            <span className="font-semibold text-gray-800 text-lg">Gestion des stocks</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src="https://gestion-stock-mb.netlify.app/"
            title="Gestion des stocks"
            className="w-full h-full border-none"
            allow="clipboard-write"
          />
        </div>
      </div>
    </div>
  );
};

export default StockModal;
