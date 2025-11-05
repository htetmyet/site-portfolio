import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onNavigate: (href: string | null) => void;
  companyName: string;
  logoUrl?: string | null;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, companyName, logoUrl }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Products', href: '#products' },
    { name: 'Blog', href: '#blog' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      onNavigate(href);
      setIsMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onNavigate(null);
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-surface/80 backdrop-blur-lg shadow-md border-b border-white/20' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" onClick={handleLogoClick} className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${companyName} logo`}
              className="h-10 w-auto max-w-[160px] object-contain drop-shadow-sm"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary/80 to-brand-accent/70 text-white font-bold shadow-lg">
              {companyName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
            {companyName}
          </span>
        </a>
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="relative group text-brand-text-dark font-semibold transition-colors duration-300">
              <span>{link.name}</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </a>
          ))}
        </nav>
        <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-brand-text-dark focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                </svg>
            </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-brand-surface/90 backdrop-blur-lg">
          <nav className="flex flex-col items-center space-y-4 py-4">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-brand-text-dark font-semibold hover:text-brand-primary transition-colors duration-300">
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
