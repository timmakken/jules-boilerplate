'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react'; // Import useSession and signIn

// It's good practice to define a more specific type for your session user
// if you add custom properties like chargebeeCustomerId via callbacks.
interface ExtendedUser {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  chargebeeCustomerId?: string | null; // Added this
}

interface ExtendedSession {
  user?: ExtendedUser;
  // accessToken?: string | null; // if you pass accessToken
  // id_token?: string | null; // if you pass id_token
  // id?: string | null; // This might be where token.id (user.id from DB) is stored
}

export default function AccountPage() {
  // Type assertion for session.data to include our ExtendedSession
  const { data, status } = useSession();
  const session = data as ExtendedSession | null; // Explicitly type the session data

  const router = useRouter();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state to hold chargebeeCustomerId, fetched or from session
  const [chargebeeId, setChargebeeId] = useState<string | null>(null);


  useEffect(() => {
    if (status === 'unauthenticated') {
      // signIn(); // Or redirect to a custom login page: router.push('/auth/signin');
      router.push('/');
    }

    if (status === 'authenticated' && session?.user) {
      // Option 1: chargebeeCustomerId is directly on session.user (added via callbacks)
      if (session.user.chargebeeCustomerId) {
        setChargebeeId(session.user.chargebeeCustomerId);
      } else {
        // Option 2: Fetch chargebeeCustomerId from your backend if not on session
        // This is a placeholder for that logic.
        // You would typically make an API call to your backend:
        // fetch(`/api/user/${session.user.id}/subscription-details`)
        //   .then(res => res.json())
        //   .then(data => { if (data.chargebeeCustomerId) setChargebeeId(data.chargebeeCustomerId); })
        //   .catch(err => console.error("Failed to fetch subscription details", err));

        // For demonstration, if not on session, we'll indicate it's not found yet.
        // In a real app, you'd implement one of the above.
        // The MOCK `cb_${session.user.id}` is removed as it's not a real ID.
        console.log("Chargebee Customer ID not found on session. User needs to subscribe or it needs to be fetched.");
      }
    }

  }, [status, router, session]);

  const handleManageSubscription = async () => {
    if (!chargebeeId) {
      setError('Chargebee Customer ID not found for this user. Please subscribe to a plan, or ensure your subscription is linked.');
      return;
    }

    setIsLoadingPortal(true);
    setError(null);

    try {
      const response = await fetch('/api/chargebee/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: chargebeeId }),
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
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating portal session:', err.message);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center"><p>Loading session...</p></div>;
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
            <p className="text-xl">Please log in to view your account.</p>
            <button onClick={() => signIn()} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Login
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-bold text-blue-400 mb-8">Account Management</h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
          <p className="text-lg text-gray-300 mb-2">Email: {session.user.email}</p>
          {session.user.name && <p className="text-md text-gray-400 mb-2">Name: {session.user.name}</p>}
          {/* <p className="text-sm text-gray-500 mb-6">User ID (from session): {session.user.id}</p> */}

          <p className="text-sm text-gray-400 mb-6">
            Subscription Status: {chargebeeId ? `Linked (ID: ${chargebeeId})` : "Not yet subscribed or ID not found."}
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {chargebeeId ? (
            <button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                className={`w-full font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out
                            ${isLoadingPortal ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
                {isLoadingPortal ? 'Loading Portal...' : 'Manage Subscription / Billing'}
            </button>
          ) : (
            <p className="text-gray-400">
              To manage your subscription, please ensure you have an active plan.
              If you recently subscribed, your Chargebee Customer ID might still be syncing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
