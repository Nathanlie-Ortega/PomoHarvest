import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Different navigation links based on authentication
  const navLinks = currentUser 
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Garden', path: '/garden' },
        { name: 'Leaderboard', path: '/leaderboard' }
      ]
    : [
        { name: 'Home', path: '/' }
      ];
  
  return (
    <header className="header-footer-bg shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo - Navigate to dashboard if logged in, home otherwise */}
          <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <img src="/assets/images/logo.svg" alt="PomoHarvest" className="h-8 w-8" />
            <span className="text-xl font-display font-bold text-green-600 dark:text-green-400">
              PomoHarvest
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-green-600 dark:text-green-400 hover:text-white hover:text-shadow-glow dark:hover:text-white'
                }`}
                style={{
                  textShadow: isActive(link.path) ? 'none' : undefined
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.path)) {
                    e.target.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.path)) {
                    e.target.style.textShadow = 'none';
                  }
                }}
              >
                {link.name}
              </Link>
            ))}
            
            {currentUser ? (
              <>
                <Link 
                  to="/settings" 
                  className={`text-sm font-medium transition-all duration-300 ${
                    isActive('/settings')
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-green-600 dark:text-green-400 hover:text-white'
                  }`}
                  onMouseEnter={(e) => {
                    if (!isActive('/settings')) {
                      e.target.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/settings')) {
                      e.target.style.textShadow = 'none';
                    }
                  }}
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="btn-outline text-sm hover:text-white transition-all duration-300"
                  onMouseEnter={(e) => {
                    e.target.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textShadow = 'none';
                  }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                Log In
              </Link>
            )}
            
            <ThemeToggle />
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="ml-2 p-2 rounded-md text-green-600 hover:text-white dark:text-green-400 dark:hover:text-white transition-all duration-300"
              onMouseEnter={(e) => {
                e.target.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.textShadow = 'none';
              }}
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2 py-1 text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-green-600 dark:text-green-400 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  onMouseEnter={(e) => {
                    if (!isActive(link.path)) {
                      e.target.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.path)) {
                      e.target.style.textShadow = 'none';
                    }
                  }}
                >
                  {link.name}
                </Link>
              ))}
              
              {currentUser ? (
                <>
                  <Link 
                    to="/settings" 
                    className={`px-2 py-1 text-sm font-medium transition-all duration-300 ${
                      isActive('/settings')
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-green-600 dark:text-green-400 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    onMouseEnter={(e) => {
                      if (!isActive('/settings')) {
                        e.target.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/settings')) {
                        e.target.style.textShadow = 'none';
                      }
                    }}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="px-2 py-1 text-sm font-medium text-green-600 dark:text-green-400 hover:text-white transition-all duration-300 text-left"
                    onMouseEnter={(e) => {
                      e.target.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textShadow = 'none';
                    }}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="px-2 py-1 text-sm font-medium text-green-600 dark:text-green-400 hover:text-white transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                  onMouseEnter={(e) => {
                    e.target.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textShadow = 'none';
                  }}
                >
                  Log In
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;