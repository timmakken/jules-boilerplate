'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Function to check if a link is active
  const isActive = (path: string) => pathname === path;

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md text-gray-800' : 'bg-primary text-neutral-lightest'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center">
              <span className={`text-2xl font-extrabold tracking-tight ${scrolled ? 'text-primary' : 'text-white'} transition-colors duration-300`}>
                videogen<span className="text-secondary">.ai</span>
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 -my-2 md:hidden">
            <button
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${scrolled ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'text-neutral-lightest hover:text-white hover:bg-primary-dark'} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary transition-colors duration-300`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded="false"
            >
              <span className="sr-only">Open menu</span>
              {/* Hamburger icon */}
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/about" 
              className={`text-base font-medium ${isActive('/about') 
                ? (scrolled ? 'text-secondary' : 'text-white font-bold') 
                : (scrolled ? 'text-gray-700 hover:text-secondary' : 'text-neutral-lightest hover:text-white')} 
                transition-colors duration-300 pb-1 ${isActive('/about') ? 'border-b-2 border-secondary' : ''}`}
            >
              About
            </Link>
            <Link 
              href="/pricing" 
              className={`text-base font-medium ${isActive('/pricing') 
                ? (scrolled ? 'text-secondary' : 'text-white font-bold') 
                : (scrolled ? 'text-gray-700 hover:text-secondary' : 'text-neutral-lightest hover:text-white')} 
                transition-colors duration-300 pb-1 ${isActive('/pricing') ? 'border-b-2 border-secondary' : ''}`}
            >
              Pricing
            </Link>
            <Link 
              href="/contact" 
              className={`text-base font-medium ${isActive('/contact') 
                ? (scrolled ? 'text-secondary' : 'text-white font-bold') 
                : (scrolled ? 'text-gray-700 hover:text-secondary' : 'text-neutral-lightest hover:text-white')} 
                transition-colors duration-300 pb-1 ${isActive('/contact') ? 'border-b-2 border-secondary' : ''}`}
            >
              Contact
            </Link>
            {status === 'authenticated' && (
              <Link 
                href="/generate" 
                className={`text-base font-medium ${isActive('/generate') 
                  ? (scrolled ? 'text-secondary' : 'text-white font-bold') 
                  : (scrolled ? 'text-gray-700 hover:text-secondary' : 'text-neutral-lightest hover:text-white')} 
                  transition-colors duration-300 pb-1 ${isActive('/generate') ? 'border-b-2 border-secondary' : ''}`}
              >
                Generate
              </Link>
            )}
            {status === 'authenticated' && (
              <Link
                href="/generate-unified"
                className={`text-base font-medium ${isActive('/generate-unified')
                  ? (scrolled ? 'text-secondary' : 'text-white font-bold')
                  : (scrolled ? 'text-gray-700 hover:text-secondary' : 'text-neutral-lightest hover:text-white')}
                  transition-colors duration-300 pb-1 ${isActive('/generate-unified') ? 'border-b-2 border-secondary' : ''}`}
              >
                Unified Generate
              </Link>
            )}
          </nav>

          {/* Desktop right section - Auth buttons */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
            {status === 'loading' && (
              <div className="animate-pulse flex space-x-2 items-center">
                <div className="h-2 w-16 bg-gray-300 rounded"></div>
              </div>
            )}

            {status === 'authenticated' && session?.user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center space-x-2 ${scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-neutral-lightest hover:text-white'} transition-colors duration-300 focus:outline-none`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${scrolled ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                    {session.user.name ? session.user.name.charAt(0).toUpperCase() : (session.user.email ? session.user.email.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {session.user.name || session.user.email || 'User'}
                  </span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Profile dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <Link 
                      href="/account" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {status === 'unauthenticated' && (
              <>
                <button
                  onClick={() => signIn()}
                  className={`whitespace-nowrap text-base font-medium ${scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-neutral-lightest hover:text-white'} transition-colors duration-300`}
                >
                  Sign in
                </button>
                <Link
                  href="/signup"
                  className={`ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium ${scrolled ? 'bg-secondary hover:bg-secondary-dark text-white' : 'bg-white hover:bg-gray-100 text-primary'} transition-colors duration-300`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on mobile menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute inset-x-0 top-full transform transition-all duration-300 ease-in-out`}>
        <div className={`px-2 pt-2 pb-3 space-y-1 shadow-lg ${scrolled ? 'bg-white' : 'bg-primary-dark'}`}>
          <Link 
            href="/about" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/about') 
              ? (scrolled ? 'bg-gray-100 text-secondary' : 'bg-primary-darker text-white') 
              : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-secondary' : 'text-neutral-lightest hover:bg-primary-darker hover:text-white')} transition-colors duration-300`}
          >
            About
          </Link>
          <Link 
            href="/pricing" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/pricing') 
              ? (scrolled ? 'bg-gray-100 text-secondary' : 'bg-primary-darker text-white') 
              : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-secondary' : 'text-neutral-lightest hover:bg-primary-darker hover:text-white')} transition-colors duration-300`}
          >
            Pricing
          </Link>
          <Link 
            href="/contact" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/contact') 
              ? (scrolled ? 'bg-gray-100 text-secondary' : 'bg-primary-darker text-white') 
              : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-secondary' : 'text-neutral-lightest hover:bg-primary-darker hover:text-white')} transition-colors duration-300`}
          >
            Contact
          </Link>
          {status === 'authenticated' && (
            <Link 
              href="/generate" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/generate') 
                ? (scrolled ? 'bg-gray-100 text-secondary' : 'bg-primary-darker text-white') 
                : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-secondary' : 'text-neutral-lightest hover:bg-primary-darker hover:text-white')} transition-colors duration-300`}
            >
              Generate
            </Link>
          )}
            {status === 'authenticated' && (
              <Link
                href="/generate-unified"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/generate-unified')
                  ? (scrolled ? 'bg-gray-100 text-secondary' : 'bg-primary-darker text-white')
                  : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-secondary' : 'text-neutral-lightest hover:bg-primary-darker hover:text-white')} transition-colors duration-300`}
              >
                Unified Generate
              </Link>
            )}
        </div>
        
        {/* Mobile menu auth section */}
        <div className={`pt-4 pb-3 border-t ${scrolled ? 'border-gray-200 bg-white' : 'border-primary-darker bg-primary-dark'}`}>
          {status === 'loading' && (
            <div className="animate-pulse flex px-5 py-3">
              <div className="h-2 w-20 bg-gray-300 rounded"></div>
            </div>
          )}

          {status === 'authenticated' && session?.user && (
            <div>
              <div className="flex items-center px-5">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${scrolled ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : (session.user.email ? session.user.email.charAt(0).toUpperCase() : 'U')}
                </div>
                <div className="ml-3">
                  <div className={`text-base font-medium ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                    {session.user.name || 'User'}
                  </div>
                  <div className={`text-sm font-medium ${scrolled ? 'text-gray-500' : 'text-neutral-lightest'}`}>
                    {session.user.email || ''}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Link 
                  href="/account" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' : 'text-neutral-lightest hover:bg-primary-darker hover:text-white'} transition-colors duration-300`}
                >
                  Account Settings
                </Link>
                <Link 
                  href="/dashboard" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' : 'text-neutral-lightest hover:bg-primary-darker hover:text-white'} transition-colors duration-300`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-red-600 hover:bg-gray-100' : 'text-red-400 hover:bg-primary-darker hover:text-red-300'} transition-colors duration-300`}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          {status === 'unauthenticated' && (
            <div className="px-5 py-3 space-y-2">
              <button
                onClick={() => signIn()}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' : 'text-neutral-lightest hover:bg-primary-darker hover:text-white'} transition-colors duration-300`}
              >
                Sign in
              </button>
              <Link
                href="/signup"
                className={`block w-full text-center px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'bg-secondary hover:bg-secondary-dark text-white' : 'bg-white hover:bg-gray-100 text-primary'} transition-colors duration-300`}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
