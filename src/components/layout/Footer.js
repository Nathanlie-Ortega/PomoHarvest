import React from 'react';

const Footer = () => {
  // Current year for copyright
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="header-footer-bg shadow-inner py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} PomoHarvest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;