import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Users, ArrowLeft, Package } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isStockPage = location.pathname.includes('/stock');

  const centerMatch = location.pathname.match(/\/centers\/([^/]+)/);
  const centerId = centerMatch ? centerMatch[1] : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {!isStockPage && (
        <nav className="bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {!isHome && (
                  <Link to="/" className="flex items-center text-sm font-medium transition-colors duration-200" style={{ color: 'var(--ink-soft)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
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
                    className="flex items-center text-sm font-medium transition-colors duration-200"
                    style={{ color: 'var(--ink-soft)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
                  >
                    <Users className="h-4 w-4 mr-1.5" />
                    Clients
                  </Link>
                )}
                {!isHome && centerId && (
                  <Link
                    to={`/centers/${centerId}/stock`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    style={{ backgroundColor: 'var(--secondary-soft)', color: 'var(--secondary)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EDACDE')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--secondary-soft)')}
                  >
                    <Package className="h-4 w-4" />
                    Stock
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className={!isStockPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
