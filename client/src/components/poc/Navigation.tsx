"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navigation = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link href="/poc" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-gray-900">GoCheckin</span>
            </Link>

            <div className="hidden md:ml-10 md:flex items-center space-x-4">
              <Link
                href="/poc"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/poc") &&
                  !isActive("/poc/profile") &&
                  !isActive("/poc/settings")
                    ? "text-blue-700 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Home
              </Link>
              <Link
                href="/poc/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/poc/profile")
                    ? "text-blue-700 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Account
              </Link>
              <Link
                href="/poc/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/poc/settings")
                    ? "text-blue-700 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Settings
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/poc"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/poc") &&
                !isActive("/poc/profile") &&
                !isActive("/poc/settings")
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/poc/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/poc/profile")
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
              onClick={toggleMenu}
            >
              Account
            </Link>
            <Link
              href="/poc/settings"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/poc/settings")
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}
              onClick={toggleMenu}
            >
              Settings
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              onClick={toggleMenu}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
