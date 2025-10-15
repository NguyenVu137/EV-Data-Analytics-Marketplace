import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Button from './common/Button';
import ThemeToggle from './common/ThemeToggle';
import useResponsive from '../hooks/useResponsive';

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [isOpen, setIsOpen] = React.useState(false);
  
  let userEmail = null;
  if (isLoggedIn) {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        userEmail = decoded.email || decoded.name || decoded.sub;
      }
    } catch (e) { }
  }

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Khám phá Dataset', href: '/datasets' },
    { name: 'API Access', href: '/api-access' },
    { name: 'Analytics', href: '/analytics' },
    isLoggedIn ? { name: 'Dashboard', href: '/dashboard' } : null,
  ].filter(Boolean);

  const userNavigation = [
    { name: 'Hồ sơ', href: '/profile' },
    { name: 'Giao dịch', href: '/transactions' },
    { name: 'API Keys', href: '/api-keys' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                EV Data
              </Link>
            </div>

            {/* Desktop navigation */}
            {!isMobile && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                      ${location.pathname === item.href
                        ? 'border-primary-500 text-secondary-900 dark:text-white'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-white'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* User section - Desktop */}
          {!isMobile && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isLoggedIn ? (
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <Link to="/chat" className="text-secondary-500 hover:text-secondary-700">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {userEmail?.[0].toUpperCase()}
                          </span>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-secondary-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {userNavigation.map((item) => (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-200 dark:hover:bg-secondary-700"
                              >
                                {item.name}
                              </Link>
                            ))}
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-200 dark:hover:bg-secondary-700"
                            >
                              Đăng xuất
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button variant="ghost">Đăng nhập</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Đăng ký</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium
                  ${location.pathname === item.href
                    ? 'border-primary-500 text-primary-700 bg-primary-50'
                    : 'border-transparent text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300 hover:text-secondary-800'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {isLoggedIn ? (
            <div className="pt-4 pb-3 border-t border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-medium">
                      {userEmail?.[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-secondary-800 dark:text-white">
                    {userEmail}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-base font-medium text-secondary-500 hover:text-secondary-800 hover:bg-secondary-100 dark:text-secondary-200 dark:hover:bg-secondary-700"
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-secondary-500 hover:text-secondary-800 hover:bg-secondary-100 dark:text-secondary-200 dark:hover:bg-secondary-700"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-secondary-200 dark:border-secondary-700">
              <div className="space-y-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-base font-medium text-secondary-500 hover:text-secondary-800 hover:bg-secondary-100"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-secondary-100"
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
