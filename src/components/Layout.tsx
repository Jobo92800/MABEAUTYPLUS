import React, { useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { Users, ArrowLeft, Package } from 'lucide-react';
import StockModal from './StockModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { centerId } = useParams();
  const isHome = location.pathname === '/';
  const [showStock, setShowStock] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {!isHome && (
                <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Changer de centre
                </Link>
              )}
            </div>
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src="https://i.ibb.co/9wZ2zds/logo.png"
                  alt="MAbeautyplus"
                  className="h-24 mix-blend-multiply"
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {!isHome && centerId && (
                <Link
                  to={`/centers/${centerId}/clients`}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Clients
                </Link>
              )}
              <button
                onClick={() => setShowStock(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 font-medium text-sm transition-colors"
              >
                <Package className="h-4 w-4" />
                Stock
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <StockModal isOpen={showStock} onClose={() => setShowStock(false)} />
    </div>
  );
};

export default Layout;