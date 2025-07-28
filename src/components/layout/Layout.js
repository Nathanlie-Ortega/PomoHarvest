import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* CHANGED: Headers and footers always use dark theme */}
      <div className="header-footer-bg">
        <Header />
      </div>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <div className="header-footer-bg">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;