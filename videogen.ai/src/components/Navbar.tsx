'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Mock user type for simplicity
interface MockUser {
  id: string;
  email: string;
}

export default function Navbar() {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    // Check for mock user in localStorage
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = () => {
    // Simulate login
    const mockUser: MockUser = { id: 'user_123', email: 'user@example.com' };
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const handleLogout = () => {
    // Simulate logout
    localStorage.removeItem('mockUser');
    setUser(null);
    // Optionally, redirect to home or login page
    // window.location.href = '/';
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
          videogen.ai
        </Link>
        <div className="space-x-4 flex items-center">
          <Link href="/about" className="hover:text-gray-300">About</Link>
          <Link href="/pricing" className="hover:text-gray-300">Pricing</Link>
          <Link href="/contact" className="hover:text-gray-300">Contact</Link>
          {/* Add other links as needed */}
          {user ? (
            <>
              <span className="text-sm">Welcome, {user.email}!</span>
                  <Link href="/account" className="hover:text-gray-300">Account</Link> {/* ADD THIS LINE */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login (Mock)
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
