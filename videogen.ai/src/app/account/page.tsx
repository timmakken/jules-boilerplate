'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock user type for simplicity
interface MockUser {
  id: string; // This would be your internal user ID
  email: string;
  chargebeeCustomerId?: string; // Store Chargebee Customer ID here after subscription
}

export default function AccountPage() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // In a real app, the chargebeeCustomerId would be fetched from your backend
      // For this mock, let's assume it might be stored with the user, or we use a placeholder
      if (!parsedUser.chargebeeCustomerId) {
        // Placeholder: In a real scenario, you get this after the first subscription.
        // For testing, if user id is 'user_123', let's assume their CB id is also 'user_123'
        // THIS IS A MOCK. Replace with actual logic.
        parsedUser.chargebeeCustomerId = parsedUser.id;
      }
      setUser(parsedUser);
    } else {
      // If no user, redirect to login (or home)
      // router.push('/login'); // Assuming you have a login page, for now, navbar handles login
      // If using mock login on navbar, this page might show if accessed directly without "login"
      // For robustness, ensure user is set or handle appropriately.
    }
  }, [router]);

  const handleManageSubscription = async () => {
    if (!user || !user.chargebeeCustomerId) {
      setError('User not logged in or Chargebee Customer ID not found.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chargebee/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: user.chargebeeCustomerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }

      const data = await response.json();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      } else {
        throw new Error('Portal URL not found in response.');
      }
    } catch (err) {
      // @ts-ignore
      setError(err.message);
      // @ts-ignore
      console.error('Error creating portal session:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    // This will be briefly shown before redirect effect kicks in, or if user is null for other reasons
    // Or if user directly navigates here without "logging in" via navbar mock.
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
        <p className="text-xl">User not found.</p>
        <p className="text-gray-400">Please 'Login (Mock)' using the button in the navbar.</p>
        {/* Optionally, redirect or show a login button here too */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-bold text-blue-400 mb-8">Account Management</h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
          <p className="text-lg text-gray-300 mb-2">Email: {user.email}</p>
          {/* Display other user info if available */}
          {user.chargebeeCustomerId ? (
            <p className="text-sm text-gray-400 mb-6">Chargebee Customer ID: {user.chargebeeCustomerId}</p>
          ) : (
            <p className="text-sm text-yellow-400 mb-6">Subscribe to a plan to manage billing.</p>
          )}

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {user.chargebeeCustomerId ? ( // Only show button if CB ID exists
             <button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className={`w-full font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out
                            ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
                {isLoading ? 'Loading Portal...' : 'Manage Subscription / Billing'}
            </button>
          ) : (
            <p className="text-gray-400">Once you subscribe, you can manage your billing here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
