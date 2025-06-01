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

interface SubscriptionInfo {
  status: string;
  message: string;
  subscription?: {
    id: string;
    planId: string;
    status: string;
    currentTermStart: string;
    currentTermEnd: string;
    createdAt: string;
    updatedAt: string;
    customerEmail: string;
  };
}

export default function AccountPage() {
  // Type assertion for session.data to include our ExtendedSession
  const { data, status } = useSession();
  const session = data as ExtendedSession | null; // Explicitly type the session data

  const router = useRouter();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalApiDisabled, setPortalApiDisabled] = useState(false);
  const [supportEmail, setSupportEmail] = useState<string>('support@videogen.ai');

  // Local state to hold chargebeeCustomerId, fetched or from session
  const [chargebeeId, setChargebeeId] = useState<string | null>(null);
  
  // State for subscription info
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  // Function to fetch subscription status
  const fetchSubscriptionStatus = async () => {
    if (status !== 'authenticated' || !session?.user) return;
    
    setIsLoadingSubscription(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chargebee/subscription');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch subscription status');
      }
      
      const data = await response.json();
      setSubscriptionInfo(data);
      
      // If we have an active subscription, we can use the subscription ID as the chargebeeId
      if (data.subscription?.id) {
        setChargebeeId(data.subscription.id);
      }
    } catch (err: any) {
      console.error('Error fetching subscription status:', err.message);
      setError(`Failed to fetch subscription status: ${err.message}`);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }

    if (status === 'authenticated' && session?.user) {
      // Option 1: chargebeeCustomerId is directly on session.user (added via callbacks)
      if (session.user.chargebeeCustomerId) {
        setChargebeeId(session.user.chargebeeCustomerId);
      }
      
      // Fetch subscription status regardless of whether we have a chargebeeId
      fetchSubscriptionStatus();
    }

  }, [status, router, session]);

  const handleManageSubscription = async () => {
    if (!chargebeeId && !subscriptionInfo?.subscription?.id) {
      setError('Chargebee Customer ID not found for this user. Please subscribe to a plan, or ensure your subscription is linked.');
      return;
    }

    setIsLoadingPortal(true);
    setError(null);
    setPortalApiDisabled(false);

    try {
      const response = await fetch('/api/chargebee/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          customerId: chargebeeId || session?.user?.id || '',
          subscriptionId: subscriptionInfo?.subscription?.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for specific error code for portal API being disabled
        if (data.errorCode === 'PORTAL_API_DISABLED') {
          setPortalApiDisabled(true);
          if (data.supportEmail) {
            setSupportEmail(data.supportEmail);
          }
          throw new Error(data.error || 'Portal access via API is disabled');
        } else {
          throw new Error(data.error || 'Failed to create portal session');
        }
      }

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

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (status === 'loading' || isLoadingSubscription) {
    return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center"><p>Loading...</p></div>;
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

          <div className="mt-6 mb-6 p-4 bg-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-300 mb-3">Subscription Status</h2>
            
            {subscriptionInfo ? (
              <div>
                <p className="text-md text-white mb-2">
                  Status: <span className={`font-semibold ${
                    subscriptionInfo.status === 'active' ? 'text-green-400' : 
                    subscriptionInfo.status === 'in_trial' ? 'text-yellow-400' : 
                    'text-gray-400'
                  }`}>
                    {subscriptionInfo.message}
                  </span>
                </p>
                
                {subscriptionInfo.subscription && (
                  <div className="mt-4 text-left">
                    <p className="text-sm text-gray-300">Plan ID: <span className="text-blue-300">{subscriptionInfo.subscription.planId}</span></p>
                    <p className="text-sm text-gray-300">Subscription ID: <span className="text-blue-300">{subscriptionInfo.subscription.id}</span></p>
                    <p className="text-sm text-gray-300">Current Term: <span className="text-blue-300">
                      {formatDate(subscriptionInfo.subscription.currentTermStart)} to {formatDate(subscriptionInfo.subscription.currentTermEnd)}
                    </span></p>
                    <p className="text-sm text-gray-300">Created: <span className="text-blue-300">{formatDate(subscriptionInfo.subscription.createdAt)}</span></p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">
                {error ? error : "Not yet subscribed or subscription information not found."}
              </p>
            )}
          </div>

          {error && !portalApiDisabled && <p className="text-red-500 mb-4">{error}</p>}

          {portalApiDisabled ? (
            <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-amber-400 font-semibold mb-2">Portal Access Unavailable</h3>
              <p className="text-gray-300 mb-3">
                The customer portal cannot be accessed via our API due to Chargebee account settings. 
                This is a configuration issue that needs to be enabled by the account administrator.
              </p>
              <p className="text-gray-300 mb-3">
                To manage your subscription, please contact our support team:
              </p>
              <a 
                href={`mailto:${supportEmail}?subject=Subscription Management Request&body=Hello, I would like to manage my subscription. My account email is ${session.user.email} and my subscription ID is ${subscriptionInfo?.subscription?.id || 'not available'}.`} 
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {supportEmail}
              </a>
            </div>
          ) : (
            (subscriptionInfo?.subscription?.id || chargebeeId) ? (
              <button
                  onClick={handleManageSubscription}
                  disabled={isLoadingPortal}
                  className={`w-full font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out
                              ${isLoadingPortal ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                  {isLoadingPortal ? 'Loading Portal...' : 'Manage Subscription / Billing'}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  To manage your subscription, please ensure you have an active plan.
                  If you recently subscribed, your subscription information might still be syncing.
                </p>
                <a 
                  href="/pricing" 
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out"
                >
                  View Pricing Plans
                </a>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
