'use client';

import Logo from '@/components/ui/Logo';

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  const footerLinks = [
    { label: 'Documentation', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'Discord', href: '#' },
    { label: 'GitHub', href: '#' },
  ];

  return (
    <footer className={`py-12 border-t ${
      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Logo onNavigate={() => {}} />
          <div className="flex space-x-6 mt-4 md:mt-0">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                } transition-colors duration-200 font-space-grotesk`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className={`mt-8 pt-8 border-t text-center font-space-grotesk ${
          isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
        }`}>
          <p>&copy; 2025 Maximus Finance. All rights reserved. Built for the Avalanche ecosystem.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;