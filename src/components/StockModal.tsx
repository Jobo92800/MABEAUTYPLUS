import React from 'react';
import { X, Package, ExternalLink } from 'lucide-react';

const STOCK_URL = 'https://gestion-stock-mb.netlify.app/';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StockModal: React.FC<StockModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOpen = () => {
    window.open(STOCK_URL, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
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
        <div className="px-6 py-8 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-pink-500" />
          </div>
          <div>
            <p className="text-gray-700 font-medium mb-1">Application de gestion des stocks</p>
            <p className="text-gray-500 text-sm">Cliquez sur le bouton ci-dessous pour ouvrir l'application dans un nouvel onglet.</p>
          </div>
          <button
            onClick={handleOpen}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir la gestion des stocks
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockModal;
