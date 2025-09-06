'use client';

import Logo from '@/components/ui/Logo';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  const footerLinks = [
    { label: 'Documentation', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'Discord', href: '#' },
    { label: 'GitHub', href: '#' },
  ];

  return (
    <footer className="py-12 sm:py-16 glass-3d-dark animate-background-shift">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Logo onNavigate={() => {}} />
          <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 mt-4 md:mt-0">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-400 hover:text-white transition-all duration-300 font-hind font-semibold hover-light text-sm sm:text-base"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 text-center font-hind animate-fade-in text-gray-400">
          <p className="text-sm sm:text-base">&copy; 2025 Maximus Finance. All rights reserved. Built for the Avalanche ecosystem.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;