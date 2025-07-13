import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}

          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#97D5D0]">
                <span className="text-lg font-bold text-white">U</span>
              </div>
              <span className="font-roboto text-xl font-bold text-[#000011]">
                Bean
              </span>
              <span className="hidden text-sm text-gray-500 sm:block">
                Coffee House and Roastery
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-8 md:flex">
            <a
              href="#home"
              className="font-medium text-gray-700 transition-colors hover:text-[#97D5D0]"
            >
              HOME
            </a>
            <a
              href="#menu"
              className="font-medium text-gray-700 transition-colors hover:text-[#97D5D0]"
            >
              MENU
            </a>
            <a
              href="#about"
              className="font-medium text-gray-700 transition-colors hover:text-[#97D5D0]"
            >
              ABOUT US
            </a>
            <a
              href="#contact"
              className="font-medium text-gray-700 transition-colors hover:text-[#97D5D0]"
            >
              CONTACT
            </a>
          </nav>

          {/* Language switcher and mobile menu */}
          <div className="flex items-center space-x-4">
            <button className="font-medium text-gray-700 transition-colors hover:text-[#97D5D0]">
              MN
            </button>

            {/* Mobile menu button */}
            <button
              className="p-2 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              <a
                href="#home"
                className="font-medium text-gray-700 transition-colors hover:text-[#97D5D0]"
              >
                HOME
              </a>
              <a
                href="#menu"
                className="font-medium text-gray-700 transition-colors hover:text-[#97D5D0]"
              >
                MENU
              </a>
              <a
                href="#about"
                className="font-medium text-gray-700 transition-colors hover:text-[#97D5D0]"
              >
                ABOUT US
              </a>
              <a
                href="#contact"
                className="font-medium text-gray-700 transition-colors hover:text-[#97D5D0]"
              >
                CONTACT
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
